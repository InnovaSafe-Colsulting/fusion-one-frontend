export interface AlertType {
  type: string;
  label: string;
  severity: 'critical' | 'warning' | 'info';
}
