import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Branch } from '../models/branch.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private api = inject(ApiService);

  getActiveBranches(): Observable<Branch[]> {
    return this.api.get<Branch[]>('branches/active').pipe(
      catchError(() => of([]))
    );
  }
}
