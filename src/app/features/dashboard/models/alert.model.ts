export interface Alert {
  id: number;
  type: string;
  label: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  created_at: string;
}

export interface AlertsResponse {
  total: number;
  data: Alert[];
}
