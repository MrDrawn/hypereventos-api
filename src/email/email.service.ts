import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

import { Resend } from 'resend';

import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async queueEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ) {
    await this.emailQueue.add('send-email', {
      to,
      subject,
      template,
      context,
    });
  }

  async sendEmail(to: string, subject: string, template: string, context: any) {
    const templatePath = path.join(
      __dirname,
      '..',
      '/views/mails',
      template + '.hbs',
    );

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateSource);

    const html = compiledTemplate(context);

    await this.resend.emails.send({
      from: 'HyperEventos <no-reply@hypereventos.com>',
      to,
      subject,
      html,
    });
  }
}
