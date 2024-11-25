import axios from 'axios';

export default class HylexPayProvider {
  public static instance: HylexPayProvider;

  private apiKey: string;
  private secretKey: string;
  private isProduction: boolean;

  private constructor() {
    this.apiKey = process.env.HYLEXPAY_API_KEY as string;
    this.secretKey = process.env.HYLEXPAY_SECRET_KEY as string;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  public static getInstance(): HylexPayProvider {
    if (!HylexPayProvider.instance) {
      HylexPayProvider.instance = new HylexPayProvider();
    }

    return HylexPayProvider.instance;
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
      ? 'https://api.hylexpay.com/v1'
      : 'https://api.hylexpay.com/v1';

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${url}/payment`,
      headers: {
        'x-api-key': this.apiKey,
        'x-secret-key': this.secretKey,
      },
      data: {
        amount: Number(amount.toFixed(2)),
        description: 'Pagamento de pix',
        postbackUrl: 'https://api.vivadesorteoficial.com/notification/hylexpay',
        customer: {
          name: client.name || 'Fulano de Tal',
          document: client.document || '11111111111',
          email: client.email || 'example@gmail.com',
          phone: client.phone || '11999999999',
        },
      },
    };

    try {
      const {
        data: { transactionId, pix, response },
      } = await axios(config);

      return { idTransaction: transactionId, paymentCode: pix.code, response };
    } catch (error: any) {
      console.log(error.response.data);
    }

    return {
      idTransaction: '',
      paymentCode: '',
      response: '',
      error: 'Ocorreu um erro ao gerar o pagamento.',
    };
  }
}
