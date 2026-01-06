import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';

import { ConversionRecord } from '../models/currency.models';

interface HistoryDb extends DBSchema {
  conversions: {
    key: string;
    value: ConversionRecord;
  };
}

@Injectable({ providedIn: 'root' })
export class HistoryStorageService {
  private readonly dbName = 'currency-converter';
  private readonly storeName = 'conversions';
  private readonly fallbackKey = 'conversionHistory';
  private dbPromise: Promise<IDBPDatabase<HistoryDb>> | null = null;

  async getAll(): Promise<ConversionRecord[]> {
    const db = await this.openDb();
    if (!db) {
      return this.readLocal();
    }

    try {
      return await db.getAll(this.storeName);
    } catch {
      return this.readLocal();
    }
  }

  async add(record: ConversionRecord): Promise<void> {
    const db = await this.openDb();
    if (!db) {
      this.addLocal(record);
      return;
    }

    try {
      await db.put(this.storeName, record);
    } catch {
      this.addLocal(record);
    }
  }

  private async openDb(): Promise<IDBPDatabase<HistoryDb> | null> {
    if (typeof indexedDB === 'undefined') {
      return null;
    }

    if (!this.dbPromise) {
      const storeName = this.storeName;
      this.dbPromise = openDB<HistoryDb>(this.dbName, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        },
      });
    }

    try {
      return await this.dbPromise;
    } catch {
      return null;
    }
  }

  private readLocal(): ConversionRecord[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(this.fallbackKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private addLocal(record: ConversionRecord): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const current = this.readLocal();
    current.unshift(record);
    localStorage.setItem(this.fallbackKey, JSON.stringify(current));
  }
}
