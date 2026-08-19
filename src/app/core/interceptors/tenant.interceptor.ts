import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';
import { environment } from '../../../../environments/environment';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = inject(TenantService).getTenantId();

  const cloned = req.clone({
    setHeaders: {
      [environment.tenantHeader]: tenantId ?? '',
    },
  });

  return next(cloned);
};
