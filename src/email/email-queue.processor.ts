import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { EmailService } from './email.service';

@Processor('email')
export class EmailQueueProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-email':
        const { to, subject, template, context } = job.data;

        try {
          await this.emailService.sendEmail(to, subject, template, context);

          console.log(`Email sent to ${to}`);
        } catch (error) {
          console.error(`Failed to send email to ${to}`, error);

          throw error;
        }
        break;
      default:
        console.error('Unknown job name:', job.name);
    }
  }
}
