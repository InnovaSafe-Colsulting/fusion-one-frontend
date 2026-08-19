import { Component, inject, signal, viewChildren, ElementRef } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalService } from '../../../shared/components/modal/modal.service';

@Component({
  selector: 'app-verify-mfa',
  standalone: true,
  imports: [],
  templateUrl: './verify-mfa.component.html',
  styleUrl: './verify-mfa.component.scss',
})
export class VerifyMfaComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);

  digits = signal<string[]>(['', '', '', '', '', '']);
  verifying = signal(false);
  verified = signal(false);

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 1);
    input.value = value;

    const updated = [...this.digits()];
    updated[index] = value;
    this.digits.set(updated);

    if (value && index < 5) {
      const next = input.parentElement?.querySelectorAll('input')[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      const prev = (event.target as HTMLInputElement)
        .parentElement?.querySelectorAll('input')[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  onBlur(): void {
    const code = this.digits().join('');
    if (code.length < 6) return;
    this.verify(code);
  }

  private verify(code: string): void {
    this.verifying.set(true);
    this.authService.verifyMfa(code).subscribe({
      next: () => {
        this.verifying.set(false);
        this.verified.set(true);
        this.modalService.open({ title: '¡Verificación exitosa!', size: 'sm' });
      },
      error: () => {
        this.verifying.set(false);
        this.toastService.error('Código incorrecto. Intenta de nuevo.');
        this.digits.set(['', '', '', '', '', '']);
      },
    });
  }
}
