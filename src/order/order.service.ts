import { HttpException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateOrderDto } from './dto';

import HylexPayProvider from 'src/gateway/hylexpay-provider';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new HttpException('Order not found', 404);
    }

    return order;
  }

  async create({ name, email, document, cep, phone, amount }: CreateOrderDto) {
    const hylexPay = HylexPayProvider.getInstance();

    const { idTransaction, paymentCode } = await hylexPay.createPixPayment({
      amount,
      client: {
        name,
        email,
        document,
        phone,
      },
    });

    const reference = idTransaction;

    const order = await this.prismaService.order.create({
      data: {
        amount,
        reference,
        client: JSON.stringify({
          name,
          email,
          document,
          cep,
          phone,
        }),
        pix: paymentCode,
        status: 'PENDING',
      },
    });

    return order;
  }
}
