export interface Tenant {
  id: number;
  name: string;
  commercial_name: string;
  legal_name: string;
  email: string;
  phone: string;
  address: string;
  neighboarhood: string;
  city_id: number;
  logo: string | null;
  status: number;
  timezone: string;
}

export interface CompanyUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cellphone: string;
  is_active: boolean;
  last_login_at: string;
}

export interface CompanyResponse {
  tenant: Tenant;
  user: CompanyUser;
}
