export interface RecentActivityItem {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  user: string;
  ip_address: string | null;
  elapsed: string;
  created_at: string;
}

export interface RecentActivityResponse {
  total: number;
  data: RecentActivityItem[];
}
