import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import type { Wallet, WalletTransaction, GetWalletResponse, GetWalletTransactionsResponse, WalletTransactionRequest } from '@/types/wallet';

export const walletService = {
  /**
   * Get user's wallet balance
   */
  async getWallet(userId: string): Promise<Wallet> {
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
};

