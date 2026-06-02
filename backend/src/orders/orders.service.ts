import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  async create(
    userId: string,
    data: {
      addressId: string;
      paymentMethod: PaymentMethod;
      notes?: string;
    },
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart?.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: data.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    const deliveryFee = await this.calculateDeliveryFee(address.deliveryZone);

    let subtotal = 0;
    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }
      subtotal +=
        Number(item.product.discountPrice ?? item.product.price) *
        item.quantity;
    }

    const total = subtotal + deliveryFee;
    const orderNumber = `RM-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId,
          subtotal,
          deliveryFee,
          total,
          status:
            data.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
              ? OrderStatus.PROCESSING
              : OrderStatus.PAYMENT_PENDING,
          notes: data.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.discountPrice ?? item.product.price,
              quantity: item.quantity,
              condition: item.product.condition,
            })),
          },
          payment: {
            create: {
              method: data.paymentMethod,
              amount: total,
              status:
                data.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                  ? PaymentStatus.PENDING
                  : PaymentStatus.PENDING,
            },
          },
        },
        include: { items: true, payment: true, address: true },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.deliveryEvent.create({
        data: {
          orderId: created.id,
          status: 'ORDER_PLACED',
          description: 'Your order has been placed successfully',
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.ORDER,
          title: 'Order placed',
          message: `Order ${orderNumber} has been placed.`,
          data: { orderId: created.id },
        },
      });

      return created;
    });

    if (data.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY) {
      const paymentResult = await this.payments.initiatePayment(
        order.id,
        data.paymentMethod,
      );
      return { order, payment: paymentResult };
    }

    return { order };
  }

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: { include: { images: true } } } },
        payment: true,
        deliveryEvents: { orderBy: { occurredAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
        address: true,
        deliveryEvents: { orderBy: { occurredAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus, tracking?: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingCode: tracking,
      },
    });
  }

  private async calculateDeliveryFee(zoneCode?: string | null) {
    if (!zoneCode) return 15;
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { code: zoneCode },
    });
    return zone ? Number(zone.baseFee) : 15;
  }
}
