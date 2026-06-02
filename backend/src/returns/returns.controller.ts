import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReturnStatus, UserRole } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReturnsService } from './returns.service';

@ApiTags('returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private returns: ReturnsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; reason: string },
  ) {
    return this.returns.create(userId, body.orderId, body.reason);
  }

  @Get()
  findMine(@CurrentUser('id') userId: string) {
    return this.returns.findUserReturns(userId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  findAll() {
    return this.returns.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: ReturnStatus;
      adminNotes?: string;
      refundAmount?: number;
    },
  ) {
    return this.returns.updateStatus(
      id,
      body.status,
      body.adminNotes,
      body.refundAmount,
    );
  }
}
