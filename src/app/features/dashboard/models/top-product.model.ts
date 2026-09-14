export interface TopProduct {
  product_id: number;
  product: string;
  quantity: number;
  total_sales: number;
}

export interface TopProductsResponse {
  date: string;
  data: TopProduct[];
}
