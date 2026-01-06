import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { ConvertQueryDto } from './dto/convert-query.dto';
import {
  ConversionResult,
  CurrencySummary,
  FreeCurrencyCurrenciesResponse,
  FreeCurrencyHistoricalResponse,
  FreeCurrencyLatestResponse,
} from './currency.types';

type RatePayload = FreeCurrencyLatestResponse | FreeCurrencyHistoricalResponse;

@Injectable()
export class CurrencyService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.getOrThrow<string>('FREE_CURRENCY_API_KEY');
    this.baseUrl =
      this.config.get<string>('FREE_CURRENCY_API_BASE_URL') ??
      'https://api.freecurrencyapi.com/v1';
  }

  async getCurrencies(): Promise<CurrencySummary[]> {
    const payload = await this.request<FreeCurrencyCurrenciesResponse>(
      'currencies',
      {},
    );

    return Object.values(payload.data)
      .map((currency) => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  async convert(query: ConvertQueryDto): Promise<ConversionResult> {
    const date = query.date?.trim();
    if (date) {
      this.assertNotFutureDate(date);
    }

    const endpoint = date ? 'historical' : 'latest';
    const payload = await this.request<RatePayload>(endpoint, {
      base_currency: query.from,
      currencies: query.to,
      ...(date ? { date } : {}),
    });

    const { rate, dateUsed } = this.extractRate(payload, query.to, date);

    if (rate === undefined) {
      throw new BadGatewayException('Rate unavailable for the selected date.');
    }

    return {
      from: query.from,
      to: query.to,
      amount: query.amount,
      rate,
      converted: this.round(query.amount * rate),
      dateUsed,
    };
  }

  private async request<T>(
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}/${path}`;

    try {
      const response = await firstValueFrom(
        this.http.get<T>(url, {
          params,
          headers: {
            apikey: this.apiKey,
          },
        }),
      );

      return response.data;
    } catch (error) {
      const response = (
        error as { response?: { status?: number; data?: { message?: string } } }
      ).response;
      const status = response?.status;
      const apiMessage =
        typeof response?.data?.message === 'string'
          ? response.data.message
          : undefined;

      if (status === 429) {
        throw new HttpException(
          apiMessage ?? 'API quota exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (status && status >= 400 && status < 500) {
        throw new BadRequestException(
          apiMessage ?? 'Invalid request to currency API.',
        );
      }

      if (apiMessage) {
        throw new BadGatewayException(apiMessage);
      }

      throw new BadGatewayException('Failed to fetch data from currency API.');
    }
  }

  private extractRate(
    payload: RatePayload,
    to: string,
    date?: string,
  ): { rate?: number; dateUsed: string } {
    const data = payload.data as Record<string, number | Record<string, number>>;

    if (date) {
      const datedRates = data[date];
      if (
        typeof datedRates === 'object' &&
        datedRates &&
        typeof datedRates[to] === 'number'
      ) {
        return { rate: datedRates[to], dateUsed: date };
      }
    }

    if (!date) {
      const rate = data[to];
      if (typeof rate === 'number') {
        return { rate, dateUsed: this.todayIso() };
      }
    }

    const [firstDate] = Object.keys(data);
    const firstEntry = firstDate ? data[firstDate] : undefined;
    if (
      firstDate &&
      typeof firstEntry === 'object' &&
      firstEntry &&
      typeof firstEntry[to] === 'number'
    ) {
      return { rate: firstEntry[to], dateUsed: firstDate };
    }

    return { rate: undefined, dateUsed: date ?? this.todayIso() };
  }

  private assertNotFutureDate(date: string): void {
    const [year, month, day] = date.split('-').map(Number);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      throw new BadRequestException('Invalid date format.');
    }

    const candidate = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(candidate.getTime()) ||
      candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() !== month - 1 ||
      candidate.getUTCDate() !== day
    ) {
      throw new BadRequestException('Invalid date format.');
    }

    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    if (candidate > today) {
      throw new BadRequestException('Date cannot be in the future.');
    }
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private round(value: number): number {
    return Number(value.toFixed(6));
  }
}
