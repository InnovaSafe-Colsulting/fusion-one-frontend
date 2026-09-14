import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { City } from '../models/city.model';

@Injectable({ providedIn: 'root' })
export class CityService {
  private api = inject(ApiService);

  getCities(): Observable<City[]> {
    return this.api.get<City[]>('cities').pipe(
      catchError(() => of([]))
    );
  }
}
