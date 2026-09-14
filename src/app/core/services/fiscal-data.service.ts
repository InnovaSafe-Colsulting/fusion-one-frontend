import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { FiscalData } from '../models/fiscal-data.model';

@Injectable({ providedIn: 'root' })
export class FiscalDataService {
  private api = inject(ApiService);

  getFiscalData(): Observable<FiscalData | null> {
    return this.api.get<FiscalData>('administration/fiscal-data').pipe(
      catchError(() => of(null))
    );
  }

  updateFiscalData(body: Partial<FiscalData>): Observable<FiscalData> {
    return this.api.put<FiscalData>('administration/fiscal-data', body);
  }

  deleteFiscalData(): Observable<void> {
    return this.api.delete<void>('administration/fiscal-data');
  }
}
