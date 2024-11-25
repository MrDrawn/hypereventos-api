import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

import { OrderService } from './order.service';

import { CreateOrderDto } from './dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.orderService.findById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() orderData: CreateOrderDto) {
    return await this.orderService.create({
      ...orderData,
    });
  }
}
