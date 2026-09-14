import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthModalService } from './auth-modal.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
})
export class AuthModalComponent {
  authModal = inject(AuthModalService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() { return this.forgotForm.get('email'); }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.authModal.close();
    }
  }

  onForgotSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    console.log('[ForgotPassword] Enviando email:', this.email?.value);
    this.authService.forgotPassword(this.email?.value ?? '').subscribe({
      next: (res) => {
        console.log('[ForgotPassword] Respuesta exitosa:', res);
        this.loading.set(false);
        this.authModal.close();
        this.toastService.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
      },
      error: (err) => {
        console.error('[ForgotPassword] Error:', err);
        this.loading.set(false);
        this.authModal.close();
        this.toastService.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
      },
    });
  }
}
