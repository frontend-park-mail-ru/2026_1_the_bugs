import { apiService } from './apiClass';
import { authService } from './auth';

export interface MyPromotionItem {
  ends_at: string;
  poster_id: number;
  promotion_id: number;
  status: string;
}

interface MyPromotionsResponse {
  lenght?: number;
  promotions?: MyPromotionItem[];
}

export async function getMyPromotions(): Promise<MyPromotionsResponse> {
  return await authService.WithRefresh(async () => {
    const token = apiService.getToken();
    return await apiService.get('/promotions/me', {}, {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  });
}

