import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { resetPasswordGuard } from './core/guards/reset-password.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'mfa-email',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/mfa-email/mfa-email.component').then(m => m.MfaEmailComponent),
      },
      {
        path: 'verify-mfa',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/verify-mfa/verify-mfa.component').then(m => m.VerifyMfaComponent),
      },
      {
        path: 'reset-password',
        canActivate: [resetPasswordGuard],
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'administration/company/general',
        loadComponent: () =>
          import('./features/administration/company/company.component').then(m => m.CompanyComponent),
      },
      {
        path: 'administration/fiscal-data',
        loadComponent: () =>
          import('./features/administration/fiscal-data/fiscal-data.component').then(m => m.FiscalDataComponent),
      },
      {
        path: 'configuration/settings',
        loadComponent: () =>
          import('./features/configuration/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'configuration',
        redirectTo: 'configuration/settings',
        pathMatch: 'full',
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
