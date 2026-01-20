import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface GenerateQRCodeRequest {
  order_id: string;
  amount: number;
  payment_method: {
    type: 'qr_code' | 'bank_transfer' | 'online';
    bank: 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA';
  };
  payment_type: 'item_only' | 'full_payment' | 'shipping' | 'cod';
  use_wallet?: boolean;
  wallet_amount?: number;
}

export interface GenerateQRCodeResponse {
  success: boolean;
  data: {
    qr_code: string; // Base64 image data URL
    qr_code_data?: string; // QR code data for scanning
    amount: number;
    payment_method: {
      type: string;
      bank: string;
    };
    payment_id: string;
    expires_at: string; // ISO string
  };
  message?: string;
  error?: string;
}

export interface ConfirmPaymentRequest {
  order_id: string;
  payment_id: string;
  amount: number;
  payment_method: {
    type: 'qr_code' | 'bank_transfer' | 'online';
    bank: 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA';
  };
  payment_proof: File;
  use_wallet?: boolean;
  wallet_amount?: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  data: {
    payment_id: string;
    order_id: string;
    amount: number;
    status: 'pending' | 'processing' | 'verified' | 'rejected' | 'failed';
    verified: boolean;
    wallet_credit?: number; // Amount credited to wallet if payment exceeds order total
  };
  message?: string;
}

export interface PaymentStatus {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  payment_method: any;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'failed' | 'refunded';
  verified: boolean;
  verified_at?: string;
  proof_of_payment_url?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface GetPaymentResponse {
  success: boolean;
  data: PaymentStatus;
}

export interface BankType {
  id: string;
  name: string;
  type: 'qr_code' | 'bank_transfer' | 'online';
  icon?: string;
  description?: string;
  color?: string;
}

export interface GetBankTypesResponse {
  success: boolean;
  data: BankType[];
}

export const paymentService = {
  /**
   * Get available payment banks/types
   * Endpoint: GET /api/payments/bank-type
   */
  async getBankTypes(): Promise<BankType[]> {
    try {
      const response = await apiClient.get<GetBankTypesResponse>('/payments/bank-type');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      // Fallback to default banks if API fails
      return [
        { id: 'GCASH', name: 'GCash', type: 'qr_code', icon: 'gcash', description: 'Pay via GCash QR code' },
        { id: 'MAYA', name: 'Maya', type: 'qr_code', icon: 'maya', description: 'Pay via Maya QR code' },
        { id: 'BPI', name: 'BPI', type: 'qr_code', icon: 'bpi', description: 'Pay via BPI QR code' },
        { id: 'BDO', name: 'BDO', type: 'qr_code', icon: 'bdo', description: 'Pay via BDO QR code' },
        { id: 'GOTYME', name: 'GoTyme', type: 'qr_code', icon: 'gotyme', description: 'Pay via GoTyme QR code' },
      ];
    } catch (error) {
      console.error('Error fetching bank types:', error);
      // Return default banks on error
      return [
        { id: 'GCASH', name: 'GCash', type: 'qr_code', icon: 'gcash', description: 'Pay via GCash QR code' },
        { id: 'MAYA', name: 'Maya', type: 'qr_code', icon: 'maya', description: 'Pay via Maya QR code' },
        { id: 'BPI', name: 'BPI', type: 'qr_code', icon: 'bpi', description: 'Pay via BPI QR code' },
        { id: 'BDO', name: 'BDO', type: 'qr_code', icon: 'bdo', description: 'Pay via BDO QR code' },
        { id: 'GOTYME', name: 'GoTyme', type: 'qr_code', icon: 'gotyme', description: 'Pay via GoTyme QR code' },
      ];
    }
  },

  /**
   * Generate QR code for payment
   * Endpoint: POST /api/payments/qr-code
   */
  async generateQRCode(data: GenerateQRCodeRequest): Promise<GenerateQRCodeResponse['data']> {
    try {
      console.log('📤 POST /payments/qr-code request:', data);
      const response = await apiClient.post<GenerateQRCodeResponse>('/payments/qr-code', data);
      console.log('📥 POST /payments/qr-code raw response:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.success) {
        console.error('❌ API response indicates failure:', response.data);
        throw new Error(response.data?.message || response.data?.error || 'Failed to generate QR code');
      }
      
      if (!response.data.data) {
        console.error('❌ API response missing data field:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.data.data.qr_code) {
        console.error('❌ API response missing qr_code field:', response.data.data);
        throw new Error('QR code not found in response');
      }
      
      console.log('✅ QR code response validated:', {
        hasQrCode: !!response.data.data.qr_code,
        qrCodeType: typeof response.data.data.qr_code,
        qrCodePreview: response.data.data.qr_code?.substring(0, 50) + '...',
        paymentId: response.data.data.payment_id,
      });
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Payment service error:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Confirm payment with proof (multipart/form-data)
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse['data']> {
    try {
      const formData = new FormData();
      formData.append('order_id', data.order_id);
      formData.append('payment_id', data.payment_id);
      formData.append('amount', data.amount.toString());
      formData.append('payment_method', JSON.stringify(data.payment_method));
      formData.append('payment_proof', data.payment_proof);
      
      if (data.use_wallet !== undefined) {
        formData.append('use_wallet', data.use_wallet.toString());
      }
      if (data.wallet_amount !== undefined) {
        formData.append('wallet_amount', data.wallet_amount.toString());
      }

      const response = await apiClient.post<ConfirmPaymentResponse>(
        '/payments/confirm',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get payment status by ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await apiClient.get<GetPaymentResponse>(`/payments/${paymentId}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get payment by ID (alias for getPaymentStatus)
   */
  async getPayment(paymentId: string): Promise<PaymentStatus> {
    return this.getPaymentStatus(paymentId);
  },

  // ========== ADMIN API METHODS ==========

  /**
   * Get all payments (Admin only)
   * Uses /api/admin/payments endpoint
   */
  async getAdminPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_type?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      order_id: string;
      order_number: string;
      amount: number;
      status: 'pending' | 'verified' | 'rejected' | 'failed';
      proof_of_payment?: string;
      payment_method: any;
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      order_total: number;
      order_subtotal: number;
      order_payment_status: string;
      order_status: string;
      created_at: string;
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
      }>('/admin/payments', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single payment details (Admin only)
   */
  async getAdminPaymentById(id: string): Promise<{
    id: string;
    order_id: string;
    order_number: string;
    amount: number;
    status: 'pending' | 'verified' | 'rejected' | 'failed';
    proof_of_payment?: string;
    payment_method: any;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    order_total: number;
    order_subtotal: number;
    shipping_fee: number;
    order_payment_status: string;
    order_status: string;
    storage_status?: string;
    shipping_address: any;
    payment_history?: any[];
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any;
      }>(`/admin/payments/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update payment status (Admin only - Verify/Reject)
   */
  async updateAdminPaymentStatus(id: string, data: {
    status: 'verified' | 'rejected' | 'failed';
    admin_notes?: string;
    rejection_reason?: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        message: string;
      }>(`/admin/payments/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
