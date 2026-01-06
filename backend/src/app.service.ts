import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
