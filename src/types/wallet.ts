// Wallet types for customer balance management

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: 'PHP' | 'KRW';
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: 'PHP' | 'KRW';
  description: string;
  reference_type?: 'order' | 'payment' | 'refund' | 'adjustment';
  reference_id?: string;
  created_at: string;
}

export interface GetWalletResponse {
  success: boolean;
  data: Wallet;
}

export interface GetWalletTransactionsResponse {
  success: boolean;
  data: WalletTransaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletTransactionRequest {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_type?: 'order' | 'payment' | 'refund' | 'adjustment';
  reference_id?: string;
}


