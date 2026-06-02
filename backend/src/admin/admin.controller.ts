import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderStatus, UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.getDashboardStats();
  }

  @Get('orders')
  orders(@Query('status') status?: OrderStatus) {
    return this.admin.findAllOrders(status);
  }

  @Patch('orders/:id/status')
  updateOrder(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    return this.admin.updateOrderStatus(id, body.status);
  }

  @Get('inventory')
  inventory() {
    return this.admin.getInventory();
  }
}
