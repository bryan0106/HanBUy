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
  payment_type: 'full' | 'downpayment' | 'balance' | 'installment' | 'item_only' | 'shipping' | 'cod' | 'full_payment';
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
  // 3-Way Payment System
  storage_status?: 'pending' | 'in_storage' | 'shipping_requested' | 'shipped' | 'delivered';
  shipping_requested_at?: string;
  shipping_payment_status?: 'pending' | 'paid' | 'cod_pending' | 'cod_paid';
  cod_amount?: number | null;
  wallet_credit?: number | null;
  // Preorder workflow
  preorder_status?: 'pending_approval' | 'approved' | 'processing' | 'received' | 'in_storage';
  preorder_approved_at?: string;
  preorder_processing_at?: string;
  preorder_received_at?: string;
  // Box selection
  box_size?: 'small' | 'medium' | 'large';
  selected_courier_id?: string | null; // For shared boxes - courier selection
  use_cod?: boolean | null; // For shared boxes - COD option
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipping_paid_at?: string;
  cod_paid_at?: string;
  order_items: OrderItem[];
  payment_history?: Array<{
    payment_type: string;
    amount: number;
    currency: string;
    payment_method?: any;
    created_at: string;
    verified?: boolean;
    installment_number?: number;
  }>;
  installment_plan?: {
    total_installments: number;
    installment_amount: number;
    frequency: 'monthly' | 'weekly' | 'biweekly';
  } | null;
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
  payment_type: 'full' | 'downpayment' | 'item_only' | 'shipping' | 'cod' | 'full_payment';
  payment_method?: {
    type: 'qr_code' | 'bank_transfer' | 'online';
    bank: 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA';
  };
  downpayment_amount?: number | null;
  balance?: number | null;
  qr_code?: string;
  box_type_preference: 'solo' | 'shared';
  box_size?: 'small' | 'medium' | 'large';
  shared_box_id?: string | null;
  shipping_address: {
    street: string;
    city: string;
    province: string;
    zipCode: string;
    country: string;
    region?: string;
  };
  storage_status?: 'pending' | 'shipping_requested';
  shipping_payment_status?: 'paid';
  shipping_requested_at?: string;
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
  customer_message?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
  message?: string;
  error?: string;
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
      console.log('🔗 Fetching orders from API:', '/orders', params);
      const response = await apiClient.get<GetOrdersResponse>('/orders', { params });
      console.log('✅ Orders fetched successfully from API');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching orders from API:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Get single order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    try {
      console.log('🔗 Fetching order from API:', `/orders/${id}`);
      const response = await apiClient.get<GetOrderResponse>(`/orders/${id}`);
      console.log('✅ Order fetched successfully from API');
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching order from API:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      console.log('🔗 Creating order via API:', '/orders', data);
      const response = await apiClient.post<CreateOrderResponse>('/orders', data);
      console.log('✅ Order created successfully:', response.data);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || response.data?.error || 'Failed to create order');
      }
      
      if (!response.data.data) {
        throw new Error('Invalid response format from server');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      console.error('❌ Request data:', data);
      if (error?.response?.data) {
        console.error('❌ API Error Response:', error.response.data);
      }
      
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

  /**
   * Request shipping for stored items
   * Customer requests shipping and pays shipping fee
   * For solo boxes: courier is selected here (direct delivery)
   * For shared boxes: courier is selected later (3rd payment)
   */
  async requestShipping(orderId: string, data: {
    box_type: 'solo' | 'shared';
    solo_box_id?: string;
    shared_box_id?: string;
    box_size?: 'small' | 'medium' | 'large';
    shipping_address: {
      street: string;
      city: string;
      province: string;
      zipCode: string;
      country: string;
    };
    courier_id?: string; // For solo boxes - direct delivery courier
  }): Promise<Order> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Order }>(`/orders/${orderId}/request-shipping`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Select courier for shared box shipping (3rd payment)
   * Customer chooses delivery company and payment method (COD or prepaid)
   */
  async selectCourierForSharedBox(orderId: string, data: {
    courier_id: string;
    use_cod?: boolean; // If true, customer will pay COD
    cod_amount?: number; // COD amount
  }): Promise<Order> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Order }>(`/orders/${orderId}/select-courier`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get customer's stored items (items paid but not yet shipped)
   */
  async getStoredItems(userId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<GetOrdersResponse>('/orders/stored', {
        params: { user_id: userId },
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Confirm local shipping payment for an order
   * Customer pays for local shipping from Manila office to their address
   */
  async confirmLocalShippingPayment(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Order }>(`/orders/${orderId}/confirm-local-shipping`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========== ADMIN API METHODS ==========

  /**
   * Get all orders (Admin only)
   * Uses /api/admin/orders endpoint which includes customer info
   */
  async getAdminOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    storage_status?: string;
    order_type?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      order_number: string;
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      status: string;
      payment_status: string;
      storage_status?: string;
      fulfillment_status?: string;
      preorder_status?: string | null;
      total: number;
      subtotal: number;
      shipping_fee: number;
      item_count: number;
      created_at: string;
      shipping_address: any;
      order_items?: any[];
      payment_history?: any[];
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
        pagination: any;
      }>('/admin/orders', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single order details (Admin only)
   * Uses /api/admin/orders/:id endpoint which includes customer info
   */
  async getAdminOrderById(id: string): Promise<{
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    status: string;
    payment_status: string;
    storage_status?: string;
    fulfillment_status?: string;
    preorder_status?: string | null;
    total: number;
    subtotal: number;
    shipping_fee: number;
    shipping_address: any;
    order_items: any[];
    payment_history?: any[];
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any;
      }>(`/admin/orders/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update order status (Admin only)
   */
  async updateAdminOrderStatus(id: string, data: {
    status: string;
    admin_notes?: string;
  }): Promise<Order> {
    try {
      const response = await apiClient.patch<UpdateOrderStatusResponse>(`/admin/orders/${id}/status`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update order payment status (Admin only - Payment Verification)
   */
  async updateAdminOrderPaymentStatus(id: string, data: {
    payment_status: 'paid' | 'partial' | 'failed';
    admin_notes?: string;
    rejection_reason?: string;
    downpayment_paid?: number;
  }): Promise<Order> {
    try {
      const response = await apiClient.patch<UpdateOrderStatusResponse>(`/admin/orders/${id}/payment-status`, data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
