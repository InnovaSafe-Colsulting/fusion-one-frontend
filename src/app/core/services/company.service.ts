import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CompanyResponse, Tenant } from '../models/company.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private api = inject(ApiService);

  getCompany(): Observable<CompanyResponse | null> {
    return this.api.get<CompanyResponse>('administration/company').pipe(
      catchError(() => of(null))
    );
  }

  updateCompany(body: Partial<Tenant>): Observable<Tenant> {
    return this.api.put<Tenant>('administration/company', body);
  }

  uploadLogo(file: File): Observable<{ logo: string }> {
    const form = new FormData();
    form.append('logo', file);
    return this.api.postForm<{ logo: string }>('administration/company/logo', form);
  }

  deleteLogo(): Observable<void> {
    return this.api.delete<void>('administration/company/logo');
  }
}
