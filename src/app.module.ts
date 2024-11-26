import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { EventModule } from './event/event.module';
import { CheckoutModule } from './checkout/checkout.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [PrismaModule, EventModule, CheckoutModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
