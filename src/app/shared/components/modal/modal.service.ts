import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  isOpen = signal(false);
  config = signal<ModalConfig>({ title: '', size: 'md' });

  open(config: ModalConfig): void {
    this.config.set(config);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
