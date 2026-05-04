import { apiService } from './apiClass.ts';
import { authService } from './auth.ts';

interface SupportOrderRaw {
  id: number | string;
  category_name?: string;
  status?: string;
  created_at?: string;
}

interface SupportOrderByIDRaw {
  id: number | string;
  category_name?: string;
  status?: string;
  created_at?: string;
}

interface SupportOrdersResponse {
  orders?: SupportOrderRaw[];
}

export interface SupportOrder {
  id: number | string;
  category_name: string;
  status: string;
  created_at: string;
}

const normalizeOrder = (order: SupportOrderRaw): SupportOrder => ({
  id: order.id,
  category_name: order.category_name ?? '',
  status: order.status ?? '',
  created_at: order.created_at ?? '',
});

export async function getSupportOrders(): Promise<SupportOrder[]> {
  return await authService.WithRefresh(async () => {
    const token = apiService.getToken();
    const response: SupportOrdersResponse = await apiService.get(
      '/support/orders',
      {},
      {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    );

    const orders = Array.isArray(response?.order) ? response.order : [];
    return orders.map(normalizeOrder);
  });
}

export async function getSupportOrder(id: number): Promise<SupportOrder[]> {
  return await authService.WithRefresh(async () => {
    const token = apiService.getToken();
    const response: SupportOrdersResponse = await apiService.get(
        `/support/orders/${id}`,
        {},
        {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
    );

    const orders = Array.isArray(response?.order) ? response.order : [];
    return orders.map(normalizeOrder);
  });
}

