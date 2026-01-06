import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericOnly]',
  standalone: true,
})
export class NumericOnlyDirective {
  private readonly allowedControlKeys = new Set([
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
  ]);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.allowedControlKeys.has(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const isDigit = /^\d$/.test(event.key);
    const isDot = event.key === '.';

    if (!isDigit && !isDot) {
      event.preventDefault();
      return;
    }

    if (isDot) {
      const target = event.target as HTMLInputElement | null;
      if (target?.value.includes('.')) {
        event.preventDefault();
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!/^\d*\.?\d*$/.test(text)) {
      event.preventDefault();
    }
  }
}
