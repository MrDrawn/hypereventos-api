import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async hylexPay(hylexPayData: {
    transactionId: string;
    type: string;
    status: string;
  }) {
    const { transactionId, status } = hylexPayData;

    if (status !== 'APPROVED') {
      throw new HttpException(
        'Não aceitamos transações com status diferente de PAID.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        reference: transactionId,
      },
    });

    if (!transaction) {
      throw new HttpException(
        'Transação não encontrada.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (transaction.status === 'APPROVED') {
      throw new HttpException('Transação já aprovada.', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: transaction.userId,
      },
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado.', HttpStatus.NOT_FOUND);
    }

    await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'APPROVED',
      },
    });

    const itemsArray: {
      id: string;
      type: string;
      lot: number;
      price: number;
      quantity: number;
      itemTotal: number;
    }[] = JSON.parse(transaction.items);

    itemsArray.forEach(async (item) => {
      for (let i = 0; i < item.quantity; i++) {
        const ticket = await this.prismaService.ticket.findFirst({
          where: {
            id: item.id,
          },
          include: {
            event: true,
          },
        });

        if (!ticket) {
          throw new HttpException(
            'Ingresso não encontrado.',
            HttpStatus.NOT_FOUND,
          );
        }

        const userTicket = await this.prismaService.userTicket.create({
          data: {
            userId: transaction.userId,
            ticketId: item.id,
          },
        });

        await this.emailService.sendTicketEmail(
          user.email,
          user.name,
          userTicket.id,
          ticket.event.name,
          ticket.name,
        );
      }

      await this.prismaService.ticket.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    });

    return {
      message: 'Pagamento aprovado com sucesso.',
    };
  }
}
