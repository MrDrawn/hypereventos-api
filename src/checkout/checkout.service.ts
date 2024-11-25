import { HttpException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto';
import { User } from '@prisma/client';
import HylexPayProvider from 'src/gateway/hylexpay-provider';

@Injectable()
export class CheckoutService {
  constructor(private readonly prismaService: PrismaService) {}

  async checkout({ name, surname, email, phone, items }: CheckoutDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    let user: User;

    if (!userExists) {
      user = await this.prismaService.user.create({
        data: {
          name: name + ' ' + surname,
          email,
          phone,
          password: 'hyper',
          role: 'CLIENT',
        },
      });
    } else {
      user = userExists;
    }

    const itemsArray: {
      id: string;
      type: string;
      lot: number;
      price: number;
      quantity: number;
      itemTotal: number;
    }[] = items;

    for await (const item of itemsArray) {
      if (item.quantity <= 0) {
        throw new HttpException('A quantidade não é valída', 400);
      }

      const ticket = await this.prismaService.ticket.findUnique({
        where: {
          id: item.id,
        },
      });

      if (!ticket) {
        throw new HttpException('Ingresso não encontrado', 404);
      }

      if (ticket.quantity < item.quantity) {
        throw new HttpException('Ingresso sem estoque', 400);
      }
    }

    const total = itemsArray.reduce((acc, item) => acc + item.itemTotal, 0);

    const hylexPay = HylexPayProvider.getInstance();

    const { idTransaction, paymentCode } = await hylexPay.createPixPayment({
      amount: total,
      client: {
        name: user.name,
        email: user.email,
        document: '13655896760',
        phone: user.phone,
      },
    });

    const transaction = await this.prismaService.transaction.create({
      data: {
        amount: itemsArray.reduce((acc, item) => acc + item.itemTotal, 0),
        paymentMethod: 'PIX',
        reference: idTransaction,
        status: 'PENDING',
        items: JSON.stringify(itemsArray),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      transaction,
      paymentCode,
    };
  }
}
