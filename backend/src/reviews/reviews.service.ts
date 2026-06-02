import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    productId: string,
    data: { rating: number; title?: string; comment?: string },
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException('You already reviewed this product');

    const delivered = await this.prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['DELIVERED', 'COMPLETED'] },
        items: { some: { productId } },
      },
    });

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerified: !!delivered,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
