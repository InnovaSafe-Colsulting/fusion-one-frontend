import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-mfa-email',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mfa-email.component.html',
  styleUrl: './mfa-email.component.scss',
})
export class MfaEmailComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    contact: ['', [Validators.required, Validators.email]],
  });

  get contact() { return this.form.get('contact'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService.sendMfaEmail(this.contact?.value ?? '').subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/verify-mfa'], {
          state: { email: this.contact?.value }
        });
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('No se pudo enviar el código. Intenta de nuevo.');
      },
    });
  }
}
