import { Controller, Get, Query } from '@nestjs/common';

import { ConvertQueryDto } from './dto/convert-query.dto';
import { CurrencyService } from './currency.service';
import { ConversionResult, CurrencySummary } from './currency.types';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('currencies')
  getCurrencies(): Promise<CurrencySummary[]> {
    return this.currencyService.getCurrencies();
  }

  @Get('convert')
  convert(@Query() query: ConvertQueryDto): Promise<ConversionResult> {
    return this.currencyService.convert(query);
  }
}
