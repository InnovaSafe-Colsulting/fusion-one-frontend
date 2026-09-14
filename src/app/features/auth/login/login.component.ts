import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthModalService } from '../components/auth-modal/auth-modal.service';
import { AuthModalComponent } from '../components/auth-modal/auth-modal.component';

const REMEMBER_KEY = 'rememberedCredentials';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, AuthModalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  authModal = inject(AuthModalService);

  showPassword = signal(false);
  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get remember() { return this.form.get('remember'); }

  ngOnInit(): void {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      const { email, password } = JSON.parse(saved);
      this.form.patchValue({ email, password, remember: true });
    }

    this.form.valueChanges.subscribe(values => {
      if (values.remember) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          email: values.email,
          password: values.password,
        }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const payload = {
      email: this.email?.value ?? '',
      password: this.password?.value ?? '',
    };
    console.log('[Login] Enviando payload:', payload);
    this.authService.login(payload).subscribe({
      next: (res) => {
        console.log('[Login] Respuesta exitosa:', res);
        this.loading.set(false);
        if (!this.remember?.value) {
          localStorage.removeItem(REMEMBER_KEY);
        }
        if (res.requiresMfa) {
          this.router.navigate(['/auth/verify-mfa'], {
            state: { email: payload.email }
          });
        }
      },
      error: (err) => {
        console.error('[Login] Error:', err);
        this.loading.set(false);
        this.toastService.error('Credenciales incorrectas. Intenta de nuevo.');
      },
    });
  }
}
