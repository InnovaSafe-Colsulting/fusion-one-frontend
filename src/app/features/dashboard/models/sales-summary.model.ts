export interface SalesSummary {
  today_sales: number;
  yesterday_sales: number;
  trend_percentage: number;
  trend: 'up' | 'down' | 'neutral';
}
