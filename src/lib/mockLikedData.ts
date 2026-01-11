// Mock Liked Items Data for testing
import type { LikedItem, GetLikedItemsParams } from "@/services/likedService";

// Store liked items data in memory (simulating database)
const mockLikedStore: Record<string, LikedItem[]> = {};

// Initialize mock liked items for test users
export const initializeMockLiked = (userId: string) => {
  if (!mockLikedStore[userId]) {
    mockLikedStore[userId] = [
      {
        id: `liked-${userId}-1`,
        user_id: userId,
        product_id: "550e8400-e29b-41d4-a716-446655440010",
        product: {
          id: "550e8400-e29b-41d4-a716-446655440010",
          name: "COSRX Advanced Snail 96 Mucin Power Essence",
          price: 25000,
          currency: "KRW",
          images: [
            "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
          ],
          stock: 50,
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `liked-${userId}-2`,
        user_id: userId,
        product_id: "550e8400-e29b-41d4-a716-446655440011",
        product: {
          id: "550e8400-e29b-41d4-a716-446655440011",
          name: "Beauty of Joseon Relief Sun: Rice + Probiotics",
          price: 18000,
          currency: "KRW",
          images: [
            "https://tse3.mm.bing.net/th/id/OIP._2Hg_yZs7nF3_uMRIuW99AHaHa?pid=Api&P=0&h=220",
          ],
          stock: 75,
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `liked-${userId}-3`,
        user_id: userId,
        product_id: "550e8400-e29b-41d4-a716-446655440012",
        product: {
          id: "550e8400-e29b-41d4-a716-446655440012",
          name: "Laneige Water Bank Hyaluronic Cream",
          price: 30000,
          currency: "KRW",
          images: [
            "https://image-optimizer-th.production.sephora-asia.net/images/product_images/zoom_1_Product_8809803572255-Laneige-Water-Bank-Blue-Hyaluronic-Cream-Moisturizer-50ml_6b1e0066b28e5faf9de7d801a9f753e077b9eeea_1702890332.png",
          ],
          stock: 30,
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
};

// Helper to get current user ID from localStorage
const getCurrentUserId = (): string => {
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("hanbuy_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || "user-test-customer-1";
      }
    } catch {
      // Ignore parse errors
    }
  }
  return "user-test-customer-1"; // Default test user
};

export const mockLikedService = {
  getLikedItems: (params?: GetLikedItemsParams): Promise<{
    success: boolean;
    data: LikedItem[];
    pagination?: any;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = getCurrentUserId();
        initializeMockLiked(userId);
        const likedItems = mockLikedStore[userId] || [];

        resolve({
          success: true,
          data: likedItems,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: likedItems.length,
            totalPages: Math.ceil(likedItems.length / (params?.limit || 10)),
          },
        });
      }, 200);
    });
  },

  addToLiked: (productId: string, userId?: string): Promise<LikedItem> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const testUserId = userId || getCurrentUserId();
        initializeMockLiked(testUserId);

        // Check if already liked
        const existing = mockLikedStore[testUserId].find(
          (item) => item.product_id === productId
        );
        if (existing) {
          resolve(existing);
          return;
        }

        // Create new liked item (you might want to fetch product details from productService)
        const newLikedItem: LikedItem = {
          id: `liked-${testUserId}-${Date.now()}`,
          user_id: testUserId,
          product_id: productId,
          created_at: new Date().toISOString(),
        };
        mockLikedStore[testUserId].push(newLikedItem);
        resolve(newLikedItem);
      }, 200);
    });
  },

  removeFromLiked: (productId: string, userId?: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const testUserId = userId || getCurrentUserId();
        if (mockLikedStore[testUserId]) {
          const index = mockLikedStore[testUserId].findIndex(
            (item) => item.product_id === productId
          );
          if (index !== -1) {
            mockLikedStore[testUserId].splice(index, 1);
          }
        }
        resolve();
      }, 200);
    });
  },
};
