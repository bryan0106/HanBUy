import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_type: 'onhand' | 'preorder' | 'kr_website';
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
  preorder_release_date?: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  subtotal: number;
  isf: number;
  lsf: number;
  shipping_fee: number;
  solo_shipping_fee?: number | null;
  shared_shipping_fee?: number | null;
  total: number;
  currency: 'PHP' | 'KRW';
  status: string;
  payment_status: string;
  payment_type: 'full' | 'downpayment' | 'balance' | 'installment';
  payment_method?: any;
  downpayment_amount?: number | null;
  balance?: number | null;
  qr_code?: string;
  box_type_preference: 'solo' | 'shared';
  shipping_address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  fulfillment_status?: string;
  box_id?: string;
  ph_courier_tracking_number?: string;
  ph_courier_name?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  order_items: OrderItem[];
}

export interface GetOrdersParams {
  user_id?: string;
  status?: string;
  payment_status?: string;
  page?: number;
  limit?: number;
}

export interface GetOrdersResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetOrderResponse {
  success: boolean;
  data: Order;
}

export interface CreateOrderRequest {
  user_id: string;
  order_number: string;
  subtotal: number;
  isf: number;
  lsf: number;
  shipping_fee: number;
  solo_shipping_fee?: number;
  shared_shipping_fee?: number;
  total: number;
  currency: 'PHP' | 'KRW';
  status: string;
  payment_status: string;
  payment_type: 'full' | 'downpayment';
  payment_method?: {
    type: 'qr_code' | 'bank_transfer' | 'online';
    bank: 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA';
  };
  downpayment_amount?: number | null;
  balance?: number | null;
  qr_code?: string;
  box_type_preference: 'solo' | 'shared';
  shipping_address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
  };
  order_items: Array<{
    product_id: string;
    product_name: string;
    product_type: 'onhand' | 'preorder' | 'kr_website';
    quantity: number;
    unit_price: number;
    total: number;
    image_url?: string;
    preorder_release_date?: string | null;
  }>;
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export const orderService = {
  /**
   * Get orders with optional filters
   */
  async getOrders(params?: GetOrdersParams): Promise<GetOrdersResponse> {
    try {
      const response = await apiClient.get<GetOrdersResponse>('/orders', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get<GetOrderResponse>(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<CreateOrderResponse>('/orders', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update order status (Admin only)
   */
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await apiClient.patch<UpdateOrderStatusResponse>(`/orders/${id}/status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
