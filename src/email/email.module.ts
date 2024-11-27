import { Global, Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bullmq';

import { EmailService } from './email.service';

import { EmailQueueProcessor } from './email-queue.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailService, EmailQueueProcessor],
  exports: [EmailService],
})
export class EmailModule {}
