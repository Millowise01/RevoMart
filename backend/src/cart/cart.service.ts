import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } },
              },
            },
          },
        },
      });
    }
    return this.withTotals(cart);
  }

  async addItem(userId: string, productId: string, quantity = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await this.ensureCart(userId);
    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    } else {
      await this.prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId },
        data: { quantity },
      });
    }
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return this.getCart(userId);
  }

  async clear(userId: string) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }

  private async ensureCart(userId: string) {
    return (
      (await this.prisma.cart.findUnique({ where: { userId } })) ??
      this.prisma.cart.create({ data: { userId } })
    );
  }

  private withTotals(cart: {
    items: Array<{
      quantity: number;
      product: { price: unknown; discountPrice: unknown };
    }>;
  }) {
    const subtotal = cart.items.reduce((sum, item) => {
      const price = Number(
        item.product.discountPrice ?? item.product.price,
      );
      return sum + price * item.quantity;
    }, 0);
    return { ...cart, subtotal, itemCount: cart.items.length };
  }
}
