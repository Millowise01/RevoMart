import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStock,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.count({
        where: { status: { in: ['PENDING', 'PAID', 'PROCESSING'] } },
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          stockQuantity: { lte: 5 },
        },
      }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    const salesByCondition = await this.prisma.orderItem.groupBy({
      by: ['condition'],
      _sum: { quantity: true },
      _count: true,
    });

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total ?? 0),
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts: lowStock,
      recentOrders,
      salesByCondition,
    };
  }

  findAllOrders(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        items: true,
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  getInventory() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stockQuantity: true,
        lowStockThreshold: true,
        condition: true,
        isActive: true,
        price: true,
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }
}
