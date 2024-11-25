import axios from 'axios';

import { randomUUID } from 'crypto';

import { addDays, format } from 'date-fns';

export default class SuitPayProvider {
  public static instance: SuitPayProvider;

  private clientId: string;
  private secretKey: string;
  private isProduction: boolean;

  private constructor() {
    this.clientId = process.env.SUITPAY_CLIENT_ID as string;
    this.secretKey = process.env.SUITPAY_CLIENT_SECRET as string;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  public static getInstance(): SuitPayProvider {
    if (!SuitPayProvider.instance) {
      SuitPayProvider.instance = new SuitPayProvider();
    }

    return SuitPayProvider.instance;
  }

  public async createPixPayment({
    amount,
    client,
  }: {
    amount: number;
    client: {
      name: string;
      email: string;
      document: string;
      phone: string;
    };
  }) {
    const url = this.isProduction
      ? 'https://ws.suitpay.app'
      : 'https://sandbox.ws.suitpay.app';

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${url}/api/v1/gateway/request-qrcode`,
      headers: {
        ci: this.clientId,
        cs: this.secretKey,
      },
      data: {
        requestNumber: randomUUID(),
        dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        amount: amount.toFixed(2),
        postbackUrl: 'https://api.pagtsafe.com/notification/suitpay',
        client: {
          name: client.name || 'Fulano de Tal',
          document: client.document || '11111111111',
          email: client.email || 'example@gmail.com',
        },
      },
    };

    try {
      const {
        data: { idTransaction, paymentCode, response },
      } = await axios(config);

      return { idTransaction, paymentCode, response };
    } catch (error: any) {
      console.log(error);
    }

    return {
      idTransaction: '',
      paymentCode: '',
      response: '',
      error: 'Ocorreu um erro ao gerar o pagamento.',
    };
  }
}
