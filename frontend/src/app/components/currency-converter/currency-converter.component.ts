import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { firstValueFrom } from 'rxjs';

import {
  ConversionResult,
  CurrencySummary,
} from '../../models/currency.models';
import { NumericOnlyDirective } from '../../directives/numeric-only.directive';
import { ConversionHistoryService } from '../../services/conversion-history.service';
import { CurrencyService } from '../../services/currency.service';

type ConverterForm = FormGroup<{
  amount: FormControl<number>;
  from: FormControl<string>;
  to: FormControl<string>;
  date: FormControl<Date | null>;
}>;

const maxDecimalPlaces =
  (max: number) =>
  (control: AbstractControl<number>): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return null;
    }

    const [, decimals] = value.toString().split('.');
    if (decimals && decimals.length > max) {
      return { maxDecimals: { max, actual: decimals.length } };
    }

    return null;
  };

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    NumericOnlyDirective,
  ],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss',
})
export class CurrencyConverterComponent implements OnInit {
  readonly currencies = signal<CurrencySummary[]>([]);
  readonly loadingCurrencies = signal(true);
  readonly converting = signal(false);
  readonly result = signal<ConversionResult | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly maxDate = new Date();

  readonly form: ConverterForm;

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly historyService: ConversionHistoryService,
  ) {
    this.form = new FormGroup({
      amount: new FormControl(1, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0.01),
          maxDecimalPlaces(6),
        ],
      }),
      from: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      to: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      date: new FormControl<Date | null>(null),
    });
  }

  ngOnInit(): void {
    void this.loadCurrencies();
  }

  async onConvert(): Promise<void> {
    if (this.form.invalid || this.converting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.result.set(null);
    this.converting.set(true);

    const { amount, from, to, date } = this.form.getRawValue();
    const dateSelected = date ? this.formatDate(date) : undefined;

    try {
      const conversion = await firstValueFrom(
        this.currencyService.convert({
          amount,
          from,
          to,
          date: dateSelected,
        }),
      );
      this.result.set(conversion);
      const record = this.historyService.createRecord(
        conversion,
        dateSelected,
      );
      await this.historyService.add(record);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.converting.set(false);
    }
  }

  trackByCode(_: number, currency: CurrencySummary): string {
    return currency.code;
  }

  private async loadCurrencies(): Promise<void> {
    this.loadingCurrencies.set(true);
    this.errorMessage.set(null);
    this.form.controls.from.disable();
    this.form.controls.to.disable();

    try {
      const currencies = await firstValueFrom(this.currencyService.getCurrencies());
      this.currencies.set(currencies);
      this.applyDefaultCurrencies(currencies);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.loadingCurrencies.set(false);
      this.form.controls.from.enable();
      this.form.controls.to.enable();
    }
  }

  private applyDefaultCurrencies(currencies: CurrencySummary[]): void {
    if (!currencies.length) {
      return;
    }

    const codes = currencies.map((currency) => currency.code);
    const fromControl = this.form.controls.from;
    const toControl = this.form.controls.to;

    if (!fromControl.value) {
      fromControl.setValue(codes.includes('USD') ? 'USD' : currencies[0].code);
    }

    if (!toControl.value) {
      const fallback = currencies[1]?.code ?? currencies[0].code;
      toControl.setValue(codes.includes('EUR') ? 'EUR' : fallback);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage =
        typeof error.error?.message === 'string' ? error.error.message : null;
      return apiMessage ?? 'Unable to fetch currency data. Please try again.';
    }

    return 'Unable to fetch currency data. Please try again.';
  }
}
