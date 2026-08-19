import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  isOpen = signal(false);
  config = signal<ConfirmConfig>({ title: '', message: '' });

  private resolveFn!: (value: boolean) => void;

  confirm(config: ConfirmConfig): Promise<boolean> {
    this.config.set(config);
    this.isOpen.set(true);
    return new Promise(resolve => (this.resolveFn = resolve));
  }

  accept(): void {
    this.isOpen.set(false);
    this.resolveFn(true);
  }

  cancel(): void {
    this.isOpen.set(false);
    this.resolveFn(false);
  }
}
