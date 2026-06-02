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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addresses: AddressesService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.addresses.findAll(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.addresses.create(userId, body as never);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.addresses.update(userId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.addresses.remove(userId, id);
  }
}
