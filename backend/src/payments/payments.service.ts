import { Injectable, NotFoundException } from '@nestjs/common';
import {
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiatePayment(orderId: string, method: PaymentMethod) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const providerRef = `REV-${orderId.slice(-8)}-${Date.now()}`;

    if (method === PaymentMethod.MOBILE_MONEY) {
      return {
        status: 'pending',
        providerRef,
        checkoutUrl: null,
        instructions:
          'Approve the Mobile Money prompt on your phone to complete payment.',
        provider: 'mobile_money',
      };
    }

    if (method === PaymentMethod.CARD) {
      return {
        status: 'pending',
        providerRef,
        checkoutUrl: `/api/v1/payments/card/checkout/${payment.id}`,
        provider: 'card',
      };
    }

    return { status: 'pending', providerRef, provider: method };
  }

  async confirmPayment(
    orderId: string,
    providerRef: string,
    success = true,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (!success) {
      await this.prisma.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.FAILED, providerRef },
      });
      return { success: false };
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.COMPLETED,
          providerRef,
          paidAt: new Date(),
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      }),
    ]);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (order) {
      await this.prisma.notification.create({
        data: {
          userId: order.userId,
          type: NotificationType.PAYMENT,
          title: 'Payment confirmed',
          message: `Payment for order ${order.orderNumber} was successful.`,
          data: { orderId },
        },
      });
    }

    return { success: true };
  }

  async processRefund(orderId: string, amount: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.REFUNDED },
    });

    return {
      status: 'refund_initiated',
      method: payment.method,
      amount,
      message:
        payment.method === PaymentMethod.MOBILE_MONEY
          ? 'Refund will be sent to your Mobile Money wallet within 3-5 business days.'
          : 'Refund is being processed.',
    };
  }
}
