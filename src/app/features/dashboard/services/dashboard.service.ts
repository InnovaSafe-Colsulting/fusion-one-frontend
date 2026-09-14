import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { SalesSummary } from '../models/sales-summary.model';
import { CashSummary } from '../models/cash-summary.model';
import { TablesSummary } from '../models/tables-summary.model';
import { KitchenSummary } from '../models/kitchen-summary.model';
import { KitchenOrder } from '../models/kitchen-order.model';
import { SalesByHour } from '../models/sales-by-hour.model';
import { TopProduct, TopProductsResponse } from '../models/top-product.model';
import { Alert, AlertsResponse } from '../models/alert.model';
import { AlertType } from '../models/alert-type.model';
import { CriticalInventoryItem, CriticalInventoryResponse } from '../models/critical-inventory.model';
import { RecentActivityItem, RecentActivityResponse } from '../models/recent-activity.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const KITCHEN_FALLBACK: KitchenSummary = {
  total: 0,
  by_status: [
    { status: 'Pendiente',      count: 0 },
    { status: 'En preparación', count: 0 },
    { status: 'Listo',          count: 0 },
    { status: 'Entregado',      count: 0 },
  ]
};

const HOURS_FALLBACK: SalesByHour[] = Array.from({ length: 24 }, (_, i) => ({ hour: i, total: 0 }));

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getSalesSummary(): Observable<SalesSummary> {
    return this.api.get<SalesSummary>('dashboard/sales-summary').pipe(
      catchError(() => of({ today_sales: 0, yesterday_sales: 0, trend_percentage: 0, trend: 'neutral' as const }))
    );
  }

  getCashSummary(): Observable<CashSummary | null> {
    return this.api.get<CashSummary | null>('dashboard/cash-summary').pipe(
      catchError(() => of(null))
    );
  }

  getTablesSummary(): Observable<TablesSummary> {
    return this.api.get<TablesSummary>('dashboard/tables-summary', { branch_id: 1 }).pipe(
      catchError(() => of({ occupied: 0, total: 0 }))
    );
  }

  getKitchenSummary(): Observable<KitchenSummary> {
    return this.api.get<KitchenSummary>('dashboard/kitchen-summary', { branch_id: 1 }).pipe(
      catchError(() => of(KITCHEN_FALLBACK))
    );
  }

  getKitchenOrders(): Observable<KitchenOrder[]> {
    return this.api.get<KitchenOrder[]>('dashboard/kitchen-orders', { branch_id: 1 }).pipe(
      catchError(() => of([]))
    );
  }

  getSalesByHour(date: string): Observable<SalesByHour[]> {
    return this.api.get<SalesByHour[]>('dashboard/sales-by-hour', { date }).pipe(
      catchError(() => of(HOURS_FALLBACK))
    );
  }

  getTopProducts(date: string): Observable<TopProduct[]> {
    return this.api.get<TopProductsResponse>('dashboard/top-products', { branch_id: 1, date, limit: 5 }).pipe(
      map((res: TopProductsResponse) => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getAlerts(limit: number): Observable<AlertsResponse> {
    return this.api.get<AlertsResponse>('dashboard/alerts', { branch_id: 1, limit }).pipe(
      catchError(() => of({ total: 0, data: [] }))
    );
  }

  getAlertTypes(): Observable<AlertType[]> {
    return this.api.get<AlertType[]>('alerts/types').pipe(
      catchError(() => of([]))
    );
  }

  getCriticalInventory(): Observable<CriticalInventoryResponse> {
    return this.api.get<CriticalInventoryResponse>('dashboard/critical-inventory', { branch_id: 1 }).pipe(
      catchError(() => of({ total: 0, data: [] }))
    );
  }

  getRecentActivity(limit: number): Observable<RecentActivityResponse> {
    return this.api.get<RecentActivityResponse>('dashboard/recent-activity', { branch_id: 1, limit }).pipe(
      catchError(() => of({ total: 0, data: [] }))
    );
  }
}
