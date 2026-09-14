export interface KitchenOrderItem {
  product: string;
  quantity: number;
  notes: string | null;
}

export interface KitchenOrder {
  kitchen_order_id: number;
  order_number: number;
  table: string;
  status: string;
  elapsed_minutes: number;
  items: KitchenOrderItem[];
}
