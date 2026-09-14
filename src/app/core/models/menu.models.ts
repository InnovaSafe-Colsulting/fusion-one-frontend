export interface MenuItemChild {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sub_parent_id: number | null;
  sub_identifier: string | null;
  children: MenuItemChild[];
}

export interface MenuItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  parent_id: number | null;
  sub_parent_id: number | null;
  sub_identifier: string | null;
  children: MenuItemChild[];
}
