import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'mfa-email',
        loadComponent: () =>
          import('./features/auth/mfa-email/mfa-email.component').then(m => m.MfaEmailComponent),
      },
      {
        path: 'verify-mfa',
        loadComponent: () =>
          import('./features/auth/verify-mfa/verify-mfa.component').then(m => m.VerifyMfaComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
