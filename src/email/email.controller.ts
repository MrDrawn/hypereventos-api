import * as QRCode from 'qrcode';

import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { EmailService } from './email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('emails')
export class EmailController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('test')
  async sendTest() {
    const userTickets = await this.prismaService.userTicket.findMany({
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
        user: true,
      },
    });

    for await (const userTicket of userTickets) {
      const { id, user, ticket } = userTicket;

      await this.emailService.sendTicketEmail(
        user.email,
        user.name,
        id,
        ticket.event.name,
        ticket.name,
      );

      console.log(`Sending email to ${user.email}`);
    }

    return { message: 'All emails sending' };
  }

  @HttpCode(HttpStatus.OK)
  @Get('test2')
  async sendTest2() {
    await this.emailService.sendTicketEmail(
      'anninha.machado04@gmail.com',
      'Ana Clara Machado',
      'fdc3a78b-61b1-4b95-a814-4a31d1fbb1a5',
      'Eletro Funk Led',
      '1 INGRESSO FEMININO',
    );

    return { message: 'All emails sending' };
  }
}
