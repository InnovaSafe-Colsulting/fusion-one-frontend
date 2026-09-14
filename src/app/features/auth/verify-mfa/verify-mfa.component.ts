import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-verify-mfa',
  standalone: true,
  imports: [],
  templateUrl: './verify-mfa.component.html',
  styleUrl: './verify-mfa.component.scss',
})
export class VerifyMfaComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  digits = signal<string[]>(['', '', '', '', '', '']);
  verifying = signal(false);
  verified = signal(false);
  countdown = signal(60);
  resending = signal(false);
  attempts = signal(0);

  private email = (this.router.getCurrentNavigation()?.extras.state as any)?.['email'] ?? '';
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startCountdown();
    if (this.email) {
      console.log('[VerifyMFA] Enviando código a:', this.email);
      this.authService.sendMfaEmail(this.email).subscribe({
        next: (res) => {
          console.log('[VerifyMFA] Código enviado exitosamente:', res);
          this.toastService.success('Código enviado a tu correo.');
        },
        error: (err) => {
          console.error('[VerifyMFA] Error al enviar código:', err);
          this.toastService.error('No se pudo enviar el código.');
        },
      });
    } else {
      console.warn('[VerifyMFA] No hay email disponible en el estado');
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startCountdown(): void {
    this.countdown.set(60);
    this.timer = setInterval(() => {
      this.countdown.update(v => {
        if (v <= 1) { this.clearTimer(); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

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

  resendCode(): void {
    if (this.countdown() > 0 || !this.email) return;
    this.resending.set(true);
    this.authService.sendMfaEmail(this.email).subscribe({
      next: () => {
        this.resending.set(false);
        this.digits.set(['', '', '', '', '', '']);
        this.toastService.success('Código reenviado a tu correo.');
        this.startCountdown();
      },
      error: () => {
        this.resending.set(false);
        this.toastService.error('No se pudo reenviar el código.');
      },
    });
  }

  private verify(code: string): void {
    this.verifying.set(true);
    this.authService.verifyMfa(code).subscribe({
      next: () => {
        this.verifying.set(false);
        this.verified.set(true);
        this.clearTimer();
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: () => {
        this.verifying.set(false);
        this.attempts.update(v => v + 1);
        this.digits.set(['', '', '', '', '', '']);

        if (this.attempts() >= 3) {
          this.toastService.error('Demasiados intentos fallidos. Vuelve a iniciar sesión.');
          this.clearTimer();
          this.router.navigate(['/auth/login']);
        } else {
          this.toastService.error(`Código incorrecto. Intentos restantes: ${3 - this.attempts()}`);
        }
      },
    });
  }
}
