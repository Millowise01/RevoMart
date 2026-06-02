import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  getZones() {
    return this.prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async addTrackingEvent(
    orderId: string,
    status: string,
    description: string,
    location?: string,
  ) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: this.mapStatus(status),
        ...(status === 'SHIPPED' && {
          trackingCode: `TRK-${orderId.slice(-8).toUpperCase()}`,
        }),
      },
    });

    await this.prisma.deliveryEvent.create({
      data: { orderId, status, description, location },
    });

    return order;
  }

  getTracking(orderId: string) {
    return this.prisma.deliveryEvent.findMany({
      where: { orderId },
      orderBy: { occurredAt: 'asc' },
    });
  }

  private mapStatus(status: string): OrderStatus {
    const map: Record<string, OrderStatus> = {
      PROCESSING: OrderStatus.PROCESSING,
      SHIPPED: OrderStatus.SHIPPED,
      OUT_FOR_DELIVERY: OrderStatus.OUT_FOR_DELIVERY,
      DELIVERED: OrderStatus.DELIVERED,
    };
    return map[status] ?? OrderStatus.PROCESSING;
  }
}
