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

    const order = await this.prismaService.order.findFirst({
      where: {
        reference: transactionId,
      },
    });

    if (!order) {
      throw new HttpException(
        'A ordem não foi encontrada.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prismaService.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'PAID',
      },
    });

    return {
      message: 'Pagamento aprovado com sucesso.',
    };
  }

  async suitPayData(suitPayData: {
    idTransaction: string;
    typeTransaction: string;
    statusTransaction: string;
  }) {
    const { idTransaction, statusTransaction } = suitPayData;

    if (statusTransaction !== 'PAID_OUT' && statusTransaction !== 'CANCELED') {
      throw new HttpException(
        'Não aceitamos transações com status diferente de PAID_OUT ou CANCELED.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = await this.prismaService.order.findFirst({
      where: {
        reference: idTransaction,
      },
    });

    if (!order) {
      throw new HttpException(
        'A ordem não foi encontrada.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prismaService.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'PAID',
      },
    });

    return {
      message: 'Pagamento aprovado com sucesso.',
    };
  }
}
