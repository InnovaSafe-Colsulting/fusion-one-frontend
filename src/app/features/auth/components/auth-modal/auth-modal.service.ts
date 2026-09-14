import { Injectable, signal } from '@angular/core';

export type AuthModalType = 'forgot-password';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  isOpen = signal(false);
  type = signal<AuthModalType>('forgot-password');

  open(type: AuthModalType): void {
    this.type.set(type);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
