import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  async create(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: { in: ['DELIVERED', 'COMPLETED'] },
      },
    });
    if (!order) {
      throw new BadRequestException(
        'Order not found or not eligible for return',
      );
    }

    const existing = await this.prisma.returnRequest.findFirst({
      where: { orderId, status: { notIn: ['REJECTED', 'CLOSED', 'REFUNDED'] } },
    });
    if (existing) {
      throw new BadRequestException('Return request already exists');
    }

    return this.prisma.returnRequest.create({
      data: { orderId, userId, reason },
      include: { order: { select: { orderNumber: true, total: true } } },
    });
  }

  findUserReturns(userId: string) {
    return this.prisma.returnRequest.findMany({
      where: { userId },
      include: { order: { select: { orderNumber: true, total: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: ReturnStatus,
    adminNotes?: string,
    refundAmount?: number,
  ) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!request) throw new NotFoundException();

    const updated = await this.prisma.returnRequest.update({
      where: { id },
      data: { status, adminNotes, refundAmount },
    });

    if (status === ReturnStatus.REFUNDED && refundAmount) {
      await this.payments.processRefund(request.orderId, Number(refundAmount));
      await this.prisma.order.update({
        where: { id: request.orderId },
        data: { status: 'REFUNDED' },
      });
    }

    return updated;
  }

  findAll() {
    return this.prisma.returnRequest.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        order: { select: { orderNumber: true, total: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
