import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface GenerateQRCodeRequest {
  order_id: string;
  amount: number;
  payment_method: {
    type: 'qr_code' | 'bank_transfer' | 'online';
    bank: 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA';
  };
}

export interface GenerateQRCodeResponse {
  success: boolean;
  data: {
    qr_code: string;
    qr_image_url?: string;
    amount: number;
    payment_method: string;
    expires_at?: string;
  };
}

export interface ConfirmPaymentRequest {
  order_id: string;
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
    status: 'pending' | 'verified' | 'rejected';
    verified_at?: string;
    wallet_credit?: number; // Amount credited to wallet if payment exceeds order total
  };
  message?: string;
}

export interface PaymentStatus {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: any;
  status: 'pending' | 'verified' | 'rejected';
  verified: boolean;
  verified_at?: string;
  created_at: string;
}

export interface GetPaymentResponse {
  success: boolean;
  data: PaymentStatus;
}

export const paymentService = {
  /**
   * Generate QR code for payment
   */
  async generateQRCode(data: GenerateQRCodeRequest): Promise<GenerateQRCodeResponse['data']> {
    try {
      const response = await apiClient.post<GenerateQRCodeResponse>('/payments/qr-code', data);
      return response.data.data;
    } catch (error) {
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
};
