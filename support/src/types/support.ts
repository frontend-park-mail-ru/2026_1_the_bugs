// я конечно хз как там выглядит на бэке но если че покручу потом

export type SupportOrderStatus = 'sent' | 'in_progress' | 'finished';

export interface SupportOrderPhoto {
  img_url: string;
  order: number;
}

export interface SupportOrder {
  id: number;
  category_name: string;
  status: SupportOrderStatus;
  created_at: string;
}

export interface SupportOrderFull extends SupportOrder {
  user_id: number;
  description: string;
  updated_at: string;
  photos: SupportOrderPhoto[];
}

export interface SupportOrdersResponse {
  orders: SupportOrder[];
  len: number;
}
