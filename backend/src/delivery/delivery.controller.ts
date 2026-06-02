import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { DeliveryService } from './delivery.service';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private delivery: DeliveryService) {}

  @Get('zones')
  getZones() {
    return this.delivery.getZones();
  }

  @Get('track/:orderId')
  getTracking(@Param('orderId') orderId: string) {
    return this.delivery.getTracking(orderId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:orderId')
  addEvent(
    @Param('orderId') orderId: string,
    @Body() body: { status: string; description: string; location?: string },
  ) {
    return this.delivery.addTrackingEvent(
      orderId,
      body.status,
      body.description,
      body.location,
    );
  }
}
