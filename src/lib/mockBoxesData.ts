// Mock Boxes Data for testing
import type { Box, AvailableSharedBox, GetBoxesParams } from "@/services/boxService";

// Re-export types for convenience
export type { AvailableSharedBox, Box, GetBoxesParams };

// Store boxes data in memory (simulating database)
const mockBoxesStore: Record<string, Box[]> = {};

// Initialize mock boxes for test users
export const initializeMockBoxes = (userId: string) => {
  if (!mockBoxesStore[userId]) {
    mockBoxesStore[userId] = [
      {
        id: `box-${userId}-1`,
        user_id: userId,
        box_number: `BOX-2024-${String(Date.now()).slice(-6)}`,
        box_type: "solo",
        status: "in_warehouse",
        items: [
          {
            id: `item-${userId}-1-1`,
            box_id: `box-${userId}-1`,
            name: "COSRX Advanced Snail 96 Mucin Power Essence",
            quantity: 2,
            price: 1050.00,
            currency: "PHP",
            weight: 0.3,
            dimensions: { length: 10, width: 5, height: 15 },
            image_url: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
            created_at: new Date().toISOString(),
          },
        ],
        current_location: "Korea Warehouse",
        tracking_history: [
          {
            id: `track-${userId}-1-1`,
            box_id: `box-${userId}-1`,
            status: "in_warehouse",
            location: "Korea Warehouse",
            description: "Box created and items added",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `box-${userId}-2`,
        user_id: userId,
        box_number: `BOX-2024-${String(Date.now() - 86400000).slice(-6)}`,
        box_type: "shared",
        status: "in_transit",
        items: [
          {
            id: `item-${userId}-2-1`,
            box_id: `box-${userId}-2`,
            name: "Beauty of Joseon Relief Sun: Rice + Probiotics",
            quantity: 1,
            price: 756.00,
            currency: "PHP",
            weight: 0.2,
            dimensions: { length: 8, width: 4, height: 12 },
            image_url: "https://tse3.mm.bing.net/th/id/OIP._2Hg_yZs7nF3_uMRIuW99AHaHa?pid=Api&P=0&h=220",
            created_at: new Date().toISOString(),
          },
        ],
        current_location: "In Transit to Manila",
        tracking_history: [
          {
            id: `track-${userId}-2-1`,
            box_id: `box-${userId}-2`,
            status: "in_warehouse",
            location: "Korea Warehouse",
            description: "Box created",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: `track-${userId}-2-2`,
            box_id: `box-${userId}-2`,
            status: "in_transit",
            location: "In Transit to Manila",
            description: "Box shipped from Korea",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
};

export const mockBoxService = {
  getBoxes: (params?: GetBoxesParams): Promise<{ success: boolean; data: Box[]; pagination?: any }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = "user-test-customer-1"; // Default test user
        initializeMockBoxes(userId);
        let boxes = Object.values(mockBoxesStore).flat();

        // Filter by status if provided
        if (params?.status) {
          boxes = boxes.filter((b) => b.status === params.status);
        }

        resolve({
          success: true,
          data: boxes,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: boxes.length,
            totalPages: Math.ceil(boxes.length / (params?.limit || 10)),
          },
        });
      }, 200);
    });
  },

  getBoxById: (id: string): Promise<Box> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const allBoxes = Object.values(mockBoxesStore).flat();
        const box = allBoxes.find((b) => b.id === id);
        if (box) {
          resolve(box);
        } else {
          reject(new Error("Box not found"));
        }
      }, 200);
    });
  },

  getAvailableSharedBoxes: (): Promise<AvailableSharedBox[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allBoxes = Object.values(mockBoxesStore).flat();
        const sharedBoxes = allBoxes
          .filter((b) => b.box_type === "shared" && b.status === "in_warehouse")
          .map((b) => ({
            ...b,
            current_weight: 2.5,
            current_volume: 0.1,
            max_weight: 15,
            max_volume: 0.3,
            participant_count: 1,
            max_participants: 5,
            is_full: false,
            available_space: {
              weight: 12.5,
              volume: 0.2,
            },
            tracking_id: `TRK-${b.box_number}`,
          })) as AvailableSharedBox[];
        resolve(sharedBoxes);
      }, 200);
    });
  },

  getAvailableSoloBoxes: (userId: string): Promise<AvailableSharedBox[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        initializeMockBoxes(userId);
        const userBoxes = mockBoxesStore[userId] || [];
        const soloBoxes = userBoxes
          .filter((b) => b.box_type === "solo" && b.status === "in_warehouse")
          .map((b) => ({
            ...b,
            current_weight: 1.5,
            current_volume: 0.05,
            max_weight: 30,
            max_volume: 0.6,
            participant_count: 1,
            max_participants: 1,
            is_full: false,
            available_space: {
              weight: 28.5,
              volume: 0.55,
            },
            tracking_id: `TRK-${b.box_number}`,
          })) as AvailableSharedBox[];
        resolve(soloBoxes);
      }, 200);
    });
  },

  createBox: (data: any): Promise<Box> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = data.user_id || "user-test-customer-1";
        initializeMockBoxes(userId);
        const newBox: Box = {
          id: `box-${userId}-${Date.now()}`,
          user_id: userId,
          box_number: `BOX-2024-${String(Date.now()).slice(-6)}`,
          box_type: data.box_type,
          status: "in_warehouse",
          items: data.items.map((item: any, index: number) => ({
            id: `item-${userId}-${Date.now()}-${index}`,
            box_id: `box-${userId}-${Date.now()}`,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency,
            weight: item.weight,
            dimensions: item.dimensions,
            image_url: item.image_url,
            sku: item.sku,
            created_at: new Date().toISOString(),
          })),
          current_location: "Korea Warehouse",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (!mockBoxesStore[userId]) {
          mockBoxesStore[userId] = [];
        }
        mockBoxesStore[userId].push(newBox);
        resolve(newBox);
      }, 200);
    });
  },

  createDefaultSharedBox: (): Promise<Box> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBox: Box = {
          id: `box-shared-${Date.now()}`,
          user_id: "admin",
          box_number: `BOX-SHARED-${String(Date.now()).slice(-6)}`,
          box_type: "shared",
          status: "in_warehouse",
          items: [],
          current_location: "Korea Warehouse",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        resolve(newBox);
      }, 200);
    });
  },
};
