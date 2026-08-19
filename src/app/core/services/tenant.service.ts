import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private tenantId: string | null = null;

  setTenantId(id: string): void {
    this.tenantId = id;
    localStorage.setItem('tenantId', id);
  }

  getTenantId(): string | null {
    return this.tenantId ?? localStorage.getItem('tenantId');
  }

  clear(): void {
    this.tenantId = null;
    localStorage.removeItem('tenantId');
  }
}
