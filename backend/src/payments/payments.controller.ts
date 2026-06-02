import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

class ConfirmPaymentDto {
  @IsString()
  providerRef: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean = true;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('confirm/:orderId')
  confirm(@Param('orderId') orderId: string, @Body() dto: ConfirmPaymentDto) {
    return this.payments.confirmPayment(
      orderId,
      dto.providerRef,
      dto.success ?? true,
    );
  }

  @Post('webhook/mobile-money')
  webhook(@Body() body: { orderId: string; providerRef: string; status: string }) {
    return this.payments.confirmPayment(
      body.orderId,
      body.providerRef,
      body.status === 'SUCCESS',
    );
  }
}
