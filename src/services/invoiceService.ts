import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface Invoice {
  id: string;
  user_id: string;
  box_id?: string;
  invoice_number: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping_fee: number;
  customs_fee?: number;
  total: number;
  currency: 'PHP' | 'KRW';
  status: 'pending' | 'paid' | 'unpaid' | 'overdue';
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface GetInvoicesParams {
  status?: 'pending' | 'paid' | 'unpaid' | 'overdue';
  box_id?: string;
  page?: number;
  limit?: number;
}

export interface GetInvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetInvoiceResponse {
  success: boolean;
  data: Invoice;
}

export interface CreateInvoiceRequest {
  user_id: string;
  box_id?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  shipping_fee: number;
  customs_fee?: number;
  total: number;
  currency: 'PHP' | 'KRW';
  due_date: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  data: Invoice;
  message?: string;
}

export interface UpdateInvoiceStatusRequest {
  status: 'pending' | 'paid' | 'unpaid' | 'overdue';
}

export interface UpdateInvoiceStatusResponse {
  success: boolean;
  data: Invoice;
  message?: string;
}

export const invoiceService = {
  /**
   * Get user invoices with optional filters
   */
  async getInvoices(params?: GetInvoicesParams): Promise<GetInvoicesResponse> {
    try {
      const response = await apiClient.get<GetInvoicesResponse>('/invoices', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    try {
      const response = await apiClient.get<GetInvoiceResponse>(`/invoices/${id}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Download invoice PDF
   */
  async downloadInvoicePDF(id: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create invoice (Admin only)
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    try {
      const response = await apiClient.post<CreateInvoiceResponse>('/invoices', data);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(id: string, status: 'pending' | 'paid' | 'unpaid' | 'overdue'): Promise<Invoice> {
    try {
      const response = await apiClient.patch<UpdateInvoiceStatusResponse>(
        `/invoices/${id}/status`,
        { status }
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
