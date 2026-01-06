export interface FreeCurrencyCurrenciesResponse {
  data: Record<
    string,
    {
      code: string;
      name: string;
      symbol?: string;
    }
  >;
}

export interface FreeCurrencyLatestResponse {
  data: Record<string, number>;
}

export interface FreeCurrencyHistoricalResponse {
  data: Record<string, Record<string, number>>;
}

export interface CurrencySummary {
  code: string;
  name: string;
  symbol?: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted: number;
  dateUsed: string;
}
