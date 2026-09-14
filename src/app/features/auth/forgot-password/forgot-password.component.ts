import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() { return this.form.get('email'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService.forgotPassword(this.email?.value ?? '').subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
