import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(
    userId: string,
    data: {
      label?: string;
      fullName: string;
      phone: string;
      street: string;
      city: string;
      region: string;
      postalCode?: string;
      country?: string;
      deliveryZone?: string;
      isDefault?: boolean;
    },
  ) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({ data: { ...data, userId } });
  }

  async update(userId: string, id: string, data: Record<string, unknown>) {
    await this.ensure(userId, id);
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.ensure(userId, id);
    return this.prisma.address.delete({ where: { id } });
  }

  private async ensure(userId: string, id: string) {
    const a = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!a) throw new NotFoundException('Address not found');
    return a;
  }
}
