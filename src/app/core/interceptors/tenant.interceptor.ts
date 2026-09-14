import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';
import { environment } from '../../../../environments/environment';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = inject(TenantService).getTenantId();

  if (!tenantId) return next(req);

  return next(req.clone({
    setHeaders: { [environment.tenantHeader]: tenantId },
  }));
};
