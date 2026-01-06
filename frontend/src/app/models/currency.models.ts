export interface CurrencySummary {
  code: string;
  name: string;
  symbol?: string;
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
  date?: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted: number;
  dateUsed: string;
}

export interface ConversionRecord extends ConversionResult {
  id: string;
  dateSelected?: string;
  timestamp: string;
}
