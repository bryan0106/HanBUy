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
  reference_type?: 'order' | 'payment' | 'refund' | 'adjustment' | 'load_money' | 'shipping_payment';
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
  reference_type?: 'order' | 'payment' | 'refund' | 'adjustment' | 'load_money' | 'shipping_payment';
  reference_id?: string;
}

export interface LoadMoneyRequest {
  user_id: string;
  amount: number;
  payment_method: 'qr_code' | 'bank_transfer';
  bank?: 'GCASH' | 'MAYA' | 'BPI' | 'BDO' | 'GOTYME';
  description?: string;
}

export interface LoadMoneyResponse {
  success: boolean;
  data: {
    payment_id: string;
    qr_code?: string;
    expires_at?: string;
    amount: number;
    currency: string;
    message: string;
  };
}

export interface LoadMoneyDirectRequest {
  user_id: string;
  amount: number;
  payment_id: string;
  payment_method: 'qr_code' | 'bank_transfer';
  bank?: 'GCASH' | 'MAYA' | 'BPI' | 'BDO' | 'GOTYME';
  proof_of_payment?: string;
  description?: string;
}

export interface LoadMoneyDirectResponse {
  success: boolean;
  data: {
    wallet_transaction: WalletTransaction;
    wallet: Wallet;
    message: string;
  };
}


