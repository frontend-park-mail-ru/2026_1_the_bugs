import { apiService } from './apiClass';
import { authService } from './auth';

interface SupportOrderRaw {
  id: number | string;
  category_name?: string;
  catergory_name?: string;
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
  category_name: order.category_name ?? order.catergory_name ?? '',
  status: order.status ?? '',
  created_at: order.created_at ?? '',
});

export async function getSupportOrders(): Promise<SupportOrder[]> {
  return await authService.WithRefresh(async () => {
    const token = apiService.getToken();
    const response: SupportOrdersResponse = await apiService.get(
      '/supports/orders',
      {},
      {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    );

    const orders = Array.isArray(response?.orders) ? response.orders : [];
    return orders.map(normalizeOrder);
  });
}

