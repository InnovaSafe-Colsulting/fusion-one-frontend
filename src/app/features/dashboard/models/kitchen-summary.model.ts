export interface KitchenStatusItem {
  status: string;
  count: number;
}

export interface KitchenSummary {
  total: number;
  by_status: KitchenStatusItem[];
}
