import { Injectable, signal } from '@angular/core';

import {
  ConversionRecord,
  ConversionResult,
} from '../models/currency.models';
import { HistoryStorageService } from './history-storage.service';

@Injectable({ providedIn: 'root' })
export class ConversionHistoryService {
  private readonly recordsSignal = signal<ConversionRecord[]>([]);
  private readonly loadingSignal = signal(true);

  readonly records = this.recordsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private readonly storage: HistoryStorageService) {}

  async init(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      const records = await this.storage.getAll();
      const sorted = [...records].sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp),
      );
      this.recordsSignal.set(sorted);
    } catch {
      this.recordsSignal.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async add(record: ConversionRecord): Promise<void> {
    await this.storage.add(record);
    this.recordsSignal.update((records) => [record, ...records]);
  }

  createRecord(
    result: ConversionResult,
    dateSelected?: string | null,
  ): ConversionRecord {
    return {
      ...result,
      id: this.createId(),
      dateSelected: dateSelected ?? undefined,
      timestamp: new Date().toISOString(),
    };
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `conv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
