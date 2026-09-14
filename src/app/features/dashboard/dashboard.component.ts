import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from './services/dashboard.service';
import { SalesSummary } from './models/sales-summary.model';
import { CashSummary } from './models/cash-summary.model';
import { TablesSummary } from './models/tables-summary.model';
import { KitchenSummary } from './models/kitchen-summary.model';
import { KitchenOrder } from './models/kitchen-order.model';
import { SalesByHour } from './models/sales-by-hour.model';
import { TopProduct } from './models/top-product.model';
import { Alert } from './models/alert.model';
import { AlertType } from './models/alert-type.model';
import { CriticalInventoryItem } from './models/critical-inventory.model';
import { RecentActivityItem } from './models/recent-activity.model';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexXAxis, ApexDataLabels, ApexTooltip, ApexPlotOptions, ApexYAxis } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, FormsModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  salesSummary             = signal<SalesSummary>({ today_sales: 0, yesterday_sales: 0, trend_percentage: 0, trend: 'neutral' });
  cashSummary              = signal<CashSummary | null>(null);
  tablesSummary            = signal<TablesSummary>({ occupied: 0, total: 0 });
  kitchenSummary           = signal<KitchenSummary>({ total: 0, by_status: [] });
  kitchenOrders            = signal<KitchenOrder[]>([]);
  salesByHour              = signal<SalesByHour[]>(Array.from({ length: 24 }, (_, i) => ({ hour: i, total: 0 })));
  topProducts              = signal<TopProduct[]>([]);
  alerts                   = signal<Alert[]>([]);
  alertTypes               = signal<AlertType[]>([]);
  criticalInventory        = signal<CriticalInventoryItem[]>([]);
  recentActivity           = signal<RecentActivityItem[]>([]);
  selectedDate             = signal<string>(this.todayStr());
  selectedOrder            = signal<KitchenOrder | null>(null);
  showAllAlerts            = signal(false);
  showAllInventory         = signal(false);

  alertsPreview            = computed(() => this.alertTypes().slice(0, 3));
  criticalInventoryPreview = computed(() => this.criticalInventory().slice(0, 10));

  chartOptions = computed(() => {
    const data = this.salesByHour();
    return {
      series: [{ name: 'Ventas', data: data.map(h => h.total) }],
      chart: { type: 'bar', height: 260, background: 'transparent', toolbar: { show: false } } as ApexChart,
      colors: ['#8B1A1A'],
      plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } } as ApexPlotOptions,
      dataLabels: { enabled: false } as ApexDataLabels,
      xaxis: {
        categories: data.map(h => `${String(h.hour).padStart(2, '0')}:00`),
        labels: {
          style: { colors: '#AAAAAA', fontSize: '11px' },
          rotate: -45,
          rotateAlways: true,
          formatter: (val: string) => parseInt(val) % 3 === 0 ? val : '',
        },
        tickAmount: 8,
      } as ApexXAxis,
      yaxis: { labels: { style: { colors: '#AAAAAA', fontSize: '11px' }, formatter: (v: number) => v === 0 ? '' : `$${(v / 1000).toFixed(0)}k` } } as ApexYAxis,
      tooltip: { theme: 'dark' } as ApexTooltip,
      grid: { borderColor: '#333333' },
    };
  });

  daysOfMonth = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    return Array.from({ length: today }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        value: this.formatDate(d),
        label: i + 1 === today ? 'Hoy' : `${i + 1} ${d.toLocaleString('es', { month: 'short' })}`,
      };
    }).reverse();
  });

  ngOnInit(): void {
    this.dashboardService.getSalesSummary().subscribe(data => this.salesSummary.set(data));
    this.dashboardService.getCashSummary().subscribe(data => this.cashSummary.set(data));
    this.dashboardService.getTablesSummary().subscribe(data => this.tablesSummary.set(data));
    this.dashboardService.getKitchenSummary().subscribe(data => this.kitchenSummary.set(data));
    this.dashboardService.getKitchenOrders().subscribe(data => this.kitchenOrders.set(data));
    this.dashboardService.getAlerts(3).subscribe(res => this.alerts.set(res.data));
    this.dashboardService.getAlertTypes().subscribe(data => this.alertTypes.set(data));
    this.dashboardService.getCriticalInventory().subscribe(res => this.criticalInventory.set(res.data));
    this.dashboardService.getRecentActivity(5).subscribe(res => this.recentActivity.set(res.data));
    this.loadSalesByHour(this.selectedDate());
    this.loadTopProducts(this.selectedDate());
  }

  onDateChange(date: string): void {
    this.selectedDate.set(date);
    this.loadSalesByHour(date);
    this.loadTopProducts(date);
  }

  openOrder(order: KitchenOrder): void  { this.selectedOrder.set(order); }
  closeOrder(): void                     { this.selectedOrder.set(null); }
  openAlerts(): void                     { this.showAllAlerts.set(true); }
  closeAlerts(): void                    { this.showAllAlerts.set(false); }
  openInventory(): void                  { this.showAllInventory.set(true); }
  closeInventory(): void                 { this.showAllInventory.set(false); }

  formatItems(order: KitchenOrder): string {
    return order.items
      .map(i => `${i.quantity}x ${i.product}${i.notes ? ` (${i.notes})` : ''}`)
      .join(', ');
  }

  getAlertIcon(severity: string): string {
    if (severity === 'critical') return '⚠';
    if (severity === 'warning')  return '🕐';
    return '🔔';
  }

  getAlertColor(severity: string): string {
    if (severity === 'critical') return 'error';
    if (severity === 'warning')  return 'warning';
    return 'primary';
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      create: '🛒', update: '🔄', delete: '🗑️', login: '🔑', logout: '🚪'
    };
    return icons[action] ?? '📋';
  }

  getActivityTitle(item: RecentActivityItem): string {
    const actions: Record<string, string> = {
      create: 'creado', update: 'actualizado', delete: 'eliminado', login: 'acceso', logout: 'salida'
    };
    return `${item.entity_type} ${actions[item.action] ?? item.action}`;
  }

  get trendLabel(): string {
    const t = this.salesSummary().trend_percentage;
    return (t >= 0 ? '+' : '') + t.toFixed(1) + '%';
  }

  get cashAmount(): number {
    return Math.round(this.cashSummary()?.current_amount ?? 0);
  }

  get tablesLabel(): string {
    const { occupied, total } = this.tablesSummary();
    if (occupied > total) return 'Error: mesas ocupadas superan el total';
    return `${occupied}/${total}`;
  }

  get occupancyPct(): number {
    const { occupied, total } = this.tablesSummary();
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
  }

  private loadSalesByHour(date: string): void {
    this.dashboardService.getSalesByHour(date).subscribe(data => this.salesByHour.set(data));
  }

  private loadTopProducts(date: string): void {
    this.dashboardService.getTopProducts(date).subscribe(data => this.topProducts.set(data));
  }

  private todayStr(): string { return this.formatDate(new Date()); }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  configTabs = ['General', 'Módulos y permisos', 'Parámetros del sistema', 'Integraciones', 'Notificaciones', 'Seguridad', 'Respaldos', 'Logs del sistema'];
}
