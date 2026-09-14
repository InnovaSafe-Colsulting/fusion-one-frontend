import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { MenuItem } from '../models/menu.models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private api = inject(ApiService);

  getMenu(): Observable<MenuItem[]> {
    return this.api.get<MenuItem[]>('modules/menu').pipe(
      map(res => Array.isArray(res) ? res : [])
    );
  }
}
