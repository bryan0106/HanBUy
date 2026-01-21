// Mock Wallet Data for testing
import type { Wallet, WalletTransaction } from "@/types/wallet";

// Store wallet data in memory (simulating database)
const mockWalletStore: Record<string, Wallet> = {};
const mockTransactionStore: Record<string, WalletTransaction[]> = {};

// Initialize mock wallets for test users
export const initializeMockWallets = () => {
  const testUserIds = ["user-test-customer-1", "user-test-customer-2", "user-test-customer-3"];
  
  testUserIds.forEach((userId) => {
    const testBalance = userId === "user-test-customer-1" ? 100.00 : userId === "user-test-customer-2" ? 500.00 : 2500.00;
    
    if (!mockWalletStore[userId]) {
      mockWalletStore[userId] = {
        id: `wallet-${userId}`,
        user_id: userId,
        balance: testBalance,
        currency: "PHP",
        created_at: new Date("2024-01-01").toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // Always ensure customer1 has 100 balance
      if (userId === "user-test-customer-1") {
        mockWalletStore[userId].balance = 100.00;
        mockWalletStore[userId].updated_at = new Date().toISOString();
      }
    }
    
    if (!mockTransactionStore[userId]) {
      mockTransactionStore[userId] = [
        {
          id: `trans-${userId}-1`,
          wallet_id: `wallet-${userId}`,
          user_id: userId,
          type: "credit",
          amount: userId === "user-test-customer-1" ? 100.00 : userId === "user-test-customer-2" ? 1000.00 : 3000.00,
          currency: "PHP",
          description: "Excess payment credited to wallet",
          reference_type: "payment",
          reference_id: `order-${userId}-1`,
          created_at: new Date("2024-01-15").toISOString(),
        },
        {
          id: `trans-${userId}-2`,
          wallet_id: `wallet-${userId}`,
          user_id: userId,
          type: "debit",
          amount: 500.00,
          currency: "PHP",
          description: "Used wallet balance for order payment",
          reference_type: "order",
          reference_id: `order-${userId}-2`,
          created_at: new Date("2024-01-20").toISOString(),
        },
      ];
    }
  });
};

// Initialize on import
initializeMockWallets();

export const mockWalletService = {
  getWallet: (userId: string): Promise<Wallet> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Ensure wallet is initialized for test users
        if (["user-test-customer-1", "user-test-customer-2", "user-test-customer-3"].includes(userId)) {
          if (!mockWalletStore[userId]) {
            initializeMockWallets();
          } else {
            // Always ensure customer1 has 100 balance
            if (userId === "user-test-customer-1") {
              mockWalletStore[userId].balance = 100.00;
              mockWalletStore[userId].updated_at = new Date().toISOString();
            } else {
              // Ensure other test users have correct balance
              const testBalance = userId === "user-test-customer-2" ? 500.00 : 2500.00;
              if (mockWalletStore[userId].balance !== testBalance) {
                mockWalletStore[userId].balance = testBalance;
                mockWalletStore[userId].updated_at = new Date().toISOString();
              }
            }
          }
        }
        
        if (mockWalletStore[userId]) {
          resolve({ ...mockWalletStore[userId] });
        } else {
          // For other users, create a new wallet with 0 balance
          const newWallet: Wallet = {
            id: `wallet-${userId}`,
            user_id: userId,
            balance: 0,
            currency: "PHP",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          mockWalletStore[userId] = newWallet;
          resolve(newWallet);
        }
      }, 200);
    });
  },

  getWalletTransactions: (userId: string, params?: { page?: number; limit?: number }): Promise<{ data: WalletTransaction[]; pagination?: any }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactions = mockTransactionStore[userId] || [];
        const page = params?.page || 1;
        const limit = params?.limit || 50;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedTransactions = transactions.slice(start, end);
        
        resolve({
          data: paginatedTransactions,
          pagination: {
            page,
            limit,
            total: transactions.length,
            totalPages: Math.ceil(transactions.length / limit),
          },
        });
      }, 200);
    });
  },

  addTransaction: (userId: string, transaction: {
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    reference_type?: 'order' | 'payment' | 'refund' | 'adjustment' | 'load_money' | 'shipping_payment';
    reference_id?: string;
  }): Promise<WalletTransaction> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!mockWalletStore[userId]) {
          mockWalletStore[userId] = {
            id: `wallet-${userId}`,
            user_id: userId,
            balance: 0,
            currency: "PHP",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        const wallet = mockWalletStore[userId];
        if (transaction.type === "credit") {
          wallet.balance += transaction.amount;
        } else {
          if (wallet.balance < transaction.amount) {
            reject(new Error("Insufficient wallet balance"));
            return;
          }
          wallet.balance -= transaction.amount;
        }
        wallet.updated_at = new Date().toISOString();

        const newTransaction: WalletTransaction = {
          id: `trans-${userId}-${Date.now()}`,
          wallet_id: wallet.id,
          user_id: userId,
          type: transaction.type,
          amount: transaction.amount,
          currency: wallet.currency,
          description: transaction.description,
          reference_type: transaction.reference_type,
          reference_id: transaction.reference_id,
          created_at: new Date().toISOString(),
        };

        if (!mockTransactionStore[userId]) {
          mockTransactionStore[userId] = [];
        }
        mockTransactionStore[userId].unshift(newTransaction);

        resolve(newTransaction);
      }, 200);
    });
  },
};
