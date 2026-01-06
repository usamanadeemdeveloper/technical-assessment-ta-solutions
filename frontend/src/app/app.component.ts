import { Component, OnInit } from '@angular/core';

import { ConversionHistoryComponent } from './components/conversion-history/conversion-history.component';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { ConversionHistoryService } from './services/conversion-history.service';

@Component({
  selector: 'app-root',
  imports: [CurrencyConverterComponent, ConversionHistoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private readonly historyService: ConversionHistoryService) {}

  ngOnInit(): void {
    void this.historyService.init();
  }
}
