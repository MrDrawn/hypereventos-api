import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findTicketById(id: string) {
    const ticket = await this.prismaService.userTicket.findUnique({
      where: {
        id,
      },
      include: {
        ticket: true,
        user: true,
      },
    });

    if (!ticket) {
      throw new HttpException(
        'O bilhete não foi encontrado.',
        HttpStatus.NOT_FOUND,
      );
    }

    return ticket;
  }

  async validateTicketById(id: string) {
    const ticket = await this.prismaService.userTicket.findUnique({
      where: {
        id,
      },
      include: {
        ticket: true,
        user: true,
      },
    });

    if (!ticket) {
      throw new HttpException(
        'O bilhete não foi encontrado.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (ticket.used) {
      throw new HttpException(
        'O bilhete já foi validado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.userTicket.update({
      where: {
        id,
      },
      data: {
        used: true,
      },
    });

    return ticket;
  }
}
