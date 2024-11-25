import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'HyperEventos API',
      version: '1.0.0',
    };
  }
}
