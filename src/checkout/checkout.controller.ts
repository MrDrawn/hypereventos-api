import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CheckoutService } from './checkout.service';

import { CheckoutDto } from './dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async checkout(@Body() checkoutData: CheckoutDto) {
    return await this.checkoutService.checkout({ ...checkoutData });
  }
}
