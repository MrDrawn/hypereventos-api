import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'API',
      version: '1.0.0',
    };
  }
}
