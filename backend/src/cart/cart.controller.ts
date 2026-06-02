import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

class AddCartItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

class UpdateCartItemDto {
  @IsInt()
  @Min(0)
  quantity: number;
}

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  get(@CurrentUser('id') userId: string) {
    return this.cart.getCart(userId);
  }

  @Post('items')
  add(@CurrentUser('id') userId: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(userId, dto.productId, dto.quantity ?? 1);
  }

  @Patch('items/:productId')
  update(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  remove(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cart.removeItem(userId, productId);
  }

  @Delete()
  clear(@CurrentUser('id') userId: string) {
    return this.cart.clear(userId);
  }
}
