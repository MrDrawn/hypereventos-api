import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/hylexpay')
  async hylexpay(
    @Body()
    hylexPayData: any,
  ) {
    console.log(hylexPayData);

    return await this.notificationService.hylexPay(hylexPayData);
  }
}
