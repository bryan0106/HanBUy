"use client";

import { useState, useEffect, useCallback } from "react";
import { walletService } from "@/services/walletService";
import type { Wallet, WalletTransaction } from "@/types/wallet";
import { handleApiError } from "@/utils/errorHandler";

export function useWallet(userId?: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setWallet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const walletData = await walletService.getWallet(userId);
      setWallet(walletData);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message || "Failed to load wallet");
      // If wallet doesn't exist yet, that's okay - it will be created on first transaction
      if (apiError.status !== 404) {
        console.error("Error fetching wallet:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchTransactions = useCallback(async (params?: { page?: number; limit?: number }) => {
    if (!userId) return;

    try {
      const result = await walletService.getWalletTransactions(userId, params);
      setTransactions(result.data);
      return result;
    } catch (err) {
      console.error("Error fetching wallet transactions:", err);
      throw err;
    }
  }, [userId]);

  const addTransaction = useCallback(async (
    type: 'credit' | 'debit',
    amount: number,
    description: string,
    referenceType?: 'order' | 'payment' | 'refund' | 'adjustment',
    referenceId?: string
  ) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const transaction = await walletService.addTransaction(userId, {
        type,
        amount,
        description,
        reference_type: referenceType,
        reference_id: referenceId,
      });
      
      // Refresh wallet balance after transaction
      await fetchWallet();
      
      return transaction;
    } catch (err) {
      console.error("Error adding wallet transaction:", err);
      throw err;
    }
  }, [userId, fetchWallet]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    wallet,
    balance: wallet?.balance || 0,
    currency: wallet?.currency || 'PHP',
    transactions,
    loading,
    error,
    refetch: fetchWallet,
    fetchTransactions,
    addTransaction,
  };
}
