import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 2,
    }),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule {}
