export interface CriticalInventoryItem {
  product_id: number;
  product: string;
  quantity: number;
  min_stock: number;
  warehouse: string;
  is_critical: boolean;
}

export interface CriticalInventoryResponse {
  total: number;
  data: CriticalInventoryItem[];
}
