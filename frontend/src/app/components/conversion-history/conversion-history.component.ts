import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConversionRecord } from '../../models/currency.models';
import { ConversionHistoryService } from '../../services/conversion-history.service';

@Component({
  selector: 'app-conversion-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './conversion-history.component.html',
  styleUrl: './conversion-history.component.scss',
})
export class ConversionHistoryComponent {
  readonly records;
  readonly loading;

  constructor(private readonly historyService: ConversionHistoryService) {
    this.records = this.historyService.records;
    this.loading = this.historyService.loading;
  }

  trackById(_: number, record: ConversionRecord): string {
    return record.id;
  }
}
