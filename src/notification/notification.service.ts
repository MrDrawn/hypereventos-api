import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

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

    await this.prismaService.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'APPROVED',
      },
    });

    const itemsArray = JSON.parse(transaction.items);

    for await (const item of itemsArray) {
      for (let i = 0; i < item.quantity; i++) {
        await this.prismaService.userTicket.create({
          data: {
            userId: transaction.userId,
            ticketId: item.id,
          },
        });
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
    }

    return {
      message: 'Pagamento aprovado com sucesso.',
    };
  }
}
