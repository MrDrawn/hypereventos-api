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

    return {
      message: 'Pagamento aprovado com sucesso.',
    };
  }
}
