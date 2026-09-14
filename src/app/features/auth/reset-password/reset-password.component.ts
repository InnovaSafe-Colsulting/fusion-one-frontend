import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ?? '';
  const errors: ValidationErrors = {};
  if (value.length < 8 || value.length > 12) errors['length'] = true;
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
  if (!/[a-z]/.test(value)) errors['lowercase'] = true;
  if (!/[0-9]/.test(value)) errors['number'] = true;
  if (!/[^A-Za-z0-9]/.test(value)) errors['special'] = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  return password === confirmation ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

  private token = '';
  private email = '';
  emailDisplay = '';

  form = this.fb.group({
    password: ['', [Validators.required, passwordStrengthValidator]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  get password() { return this.form.get('password'); }
  get passwordConfirmation() { return this.form.get('password_confirmation'); }
  get mismatch() { return this.form.hasError('passwordMismatch') && this.passwordConfirmation?.touched; }

  rules = [
    { key: 'length',    label: 'Entre 8 y 12 caracteres' },
    { key: 'uppercase', label: 'Al menos 1 mayúscula' },
    { key: 'lowercase', label: 'Al menos 1 minúscula' },
    { key: 'number',    label: 'Al menos 1 número' },
    { key: 'special',   label: 'Al menos 1 carácter especial' },
  ];

  ruleValid(key: string): boolean {
    return !this.password?.errors?.[key];
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.emailDisplay = this.email;

    if (!this.token || !this.email) {
      this.toastService.error('Enlace inválido o expirado.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      password: this.password?.value ?? '',
      password_confirmation: this.passwordConfirmation?.value ?? '',
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Contraseña actualizada correctamente.');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('El enlace es inválido o ha expirado.');
      },
    });
  }
}
