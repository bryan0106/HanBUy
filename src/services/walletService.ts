import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import { shouldUseMockData } from '@/utils/env';
import { mockWalletService } from '@/lib/mockWalletData';
import type { 
  Wallet, 
  WalletTransaction, 
  GetWalletResponse, 
  GetWalletTransactionsResponse, 
  WalletTransactionRequest,
  LoadMoneyRequest,
  LoadMoneyResponse,
  LoadMoneyDirectRequest,
  LoadMoneyDirectResponse
} from '@/types/wallet';

export const walletService = {
  /**
   * Get user's wallet balance
   */
  async getWallet(userId: string): Promise<Wallet> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockWalletService.getWallet(userId);
    }

    try {
      const response = await apiClient.get<GetWalletResponse>(`/wallet`, {
        params: { user_id: userId },
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(userId: string, params?: { page?: number; limit?: number }): Promise<{ data: WalletTransaction[]; pagination?: any }> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockWalletService.getWalletTransactions(userId, params);
    }

    try {
      const response = await apiClient.get<GetWalletTransactionsResponse>(`/wallet/transactions`, {
        params: { user_id: userId, ...params },
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Add transaction to wallet (credit/debit)
   */
  async addTransaction(userId: string, transaction: WalletTransactionRequest): Promise<WalletTransaction> {
    // Use mock data for testing
    if (shouldUseMockData()) {
      return mockWalletService.addTransaction(userId, transaction);
    }

    try {
      const response = await apiClient.post<{ success: boolean; data: WalletTransaction }>(`/wallet/transactions`, {
        user_id: userId,
        ...transaction,
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Load money into wallet via QR code (generate QR code for payment)
   */
  async loadMoney(request: LoadMoneyRequest): Promise<LoadMoneyResponse['data']> {
    try {
      const response = await apiClient.post<LoadMoneyResponse>('/wallet/load-money', request);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Load money directly (after payment has been made)
   * Use this when customer has already paid and wants to credit wallet with proof of payment
   */
  async loadMoneyDirect(request: LoadMoneyDirectRequest): Promise<LoadMoneyDirectResponse['data']> {
    try {
      const response = await apiClient.post<LoadMoneyDirectResponse>('/wallet/load-money/direct', request);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};


