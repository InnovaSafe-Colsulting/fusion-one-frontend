import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { TenantService } from '../services/tenant.service';
import {
  AuthResponse,
  LoginRequest,
  LoginResponse,
  VerifyMfaRequest,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'accessToken';
  private readonly TEMP_TOKEN_KEY = 'tempToken';

  isAuthenticated = signal(this.hasValidToken());

  login(data: LoginRequest) {
    return this.api.post<LoginResponse>('auth/login', data).pipe(
      tap(res => {
        localStorage.setItem(this.TEMP_TOKEN_KEY, res.tempToken);
      })
    );
  }

  verifyMfa(code: string) {
    const tempToken = localStorage.getItem(this.TEMP_TOKEN_KEY) ?? '';
    const body: VerifyMfaRequest = { code, tempToken };

    return this.api.post<AuthResponse>('auth/verify-mfa', body).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.removeItem(this.TEMP_TOKEN_KEY);
        this.tenantService.setTenantId(res.tenantId);
        this.isAuthenticated.set(true);
      })
    );
  }

  sendMfaEmail(email: string) {
    return this.api.post<void>('auth/mfa/send', { email });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TEMP_TOKEN_KEY);
    this.tenantService.clear();
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
