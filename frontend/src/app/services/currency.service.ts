import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ConversionRequest,
  ConversionResult,
  CurrencySummary,
} from '../models/currency.models';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getCurrencies(): Observable<CurrencySummary[]> {
    return this.http.get<CurrencySummary[]>(this.buildUrl('currencies'));
  }

  convert(request: ConversionRequest): Observable<ConversionResult> {
    let params = new HttpParams()
      .set('from', request.from)
      .set('to', request.to)
      .set('amount', request.amount.toString());

    if (request.date) {
      params = params.set('date', request.date);
    }

    return this.http.get<ConversionResult>(this.buildUrl('convert'), { params });
  }

  private buildUrl(path: string): string {
    if (!this.baseUrl) {
      return `/${path}`;
    }

    return `${this.baseUrl.replace(/\/$/, '')}/${path}`;
  }
}
