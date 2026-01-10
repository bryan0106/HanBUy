// Mock Orders and Cart Data for testing
import type { CartItem } from "@/services/cartService";
import type { Order } from "@/services/orderService";

// Store cart data in memory (simulating database)
const mockCartStore: Record<string, CartItem[]> = {};

// Store orders data in memory (simulating database)
const mockOrdersStore: Record<string, Order[]> = {};

// Initialize mock cart for test users
export const initializeMockCart = (userId: string) => {
  if (!mockCartStore[userId]) {
    mockCartStore[userId] = [
      {
        id: `cart-${userId}-1`,
        user_id: userId,
        product_id: "550e8400-e29b-41d4-a716-446655440010",
        product_name: "COSRX Advanced Snail 96 Mucin Power Essence",
        product_type: "onhand",
        quantity: 2,
        price: 1050.00, // PHP (converted from KRW)
        image_url: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
        box_type_preference: "solo",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product: {
          id: "550e8400-e29b-41d4-a716-446655440010",
          name: "COSRX Advanced Snail 96 Mucin Power Essence",
          price: 25000,
          currency: "KRW",
          images: ["https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2"],
          stock: 50,
        },
      },
      {
        id: `cart-${userId}-2`,
        user_id: userId,
        product_id: "550e8400-e29b-41d4-a716-446655440011",
        product_name: "Beauty of Joseon Relief Sun: Rice + Probiotics",
        product_type: "onhand",
        quantity: 1,
        price: 756.00, // PHP
        image_url: "https://tse3.mm.bing.net/th/id/OIP._2Hg_yZs7nF3_uMRIuW99AHaHa?pid=Api&P=0&h=220",
        box_type_preference: "shared",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product: {
          id: "550e8400-e29b-41d4-a716-446655440011",
          name: "Beauty of Joseon Relief Sun: Rice + Probiotics",
          price: 18000,
          currency: "KRW",
          images: ["https://tse3.mm.bing.net/th/id/OIP._2Hg_yZs7nF3_uMRIuW99AHaHa?pid=Api&P=0&h=220"],
          stock: 75,
        },
      },
    ];
  }
};

// Initialize mock orders for test users
export const initializeMockOrders = (userId: string) => {
  if (!mockOrdersStore[userId]) {
    mockOrdersStore[userId] = [
      {
        id: `order-${userId}-1`,
        user_id: userId,
        order_number: `ORD-2024-${String(Date.now()).slice(-6)}`,
        subtotal: 2100.00,
        isf: 300.00,
        lsf: 200.00,
        shipping_fee: 500.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 2600.00,
        currency: "PHP",
        status: "pending",
        payment_status: "pending",
        payment_type: "full",
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-1-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440010",
            product_name: "COSRX Advanced Snail 96 Mucin Power Essence",
            product_type: "onhand",
            quantity: 2,
            unit_price: 1050.00,
            total: 2100.00,
            image_url: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
          },
        ],
      },
      {
        id: `order-${userId}-2`,
        user_id: userId,
        order_number: `ORD-2024-${String(Date.now() - 86400000).slice(-6)}`,
        subtotal: 1875.00,
        isf: 300.00,
        lsf: 150.00,
        shipping_fee: 450.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 2325.00,
        currency: "PHP",
        status: "confirmed",
        payment_status: "paid",
        payment_type: "full",
        box_type_preference: "shared",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-2-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440016",
            product_name: "Korean Street Style Oversized Hoodie",
            product_type: "onhand",
            quantity: 1,
            unit_price: 1875.00,
            total: 1875.00,
            image_url: "https://i.pinimg.com/originals/ee/b9/d8/eeb9d8d27abf85a6dc37522ea5a8fba8.jpg",
          },
        ],
      },
      {
        id: `order-${userId}-3`,
        user_id: userId,
        order_number: "ORD-2024-424780",
        subtotal: 2520.00,
        isf: 300.00,
        lsf: 200.00,
        shipping_fee: 500.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 3020.00,
        currency: "PHP",
        status: "received_at_manila",
        payment_status: "paid",
        payment_type: "full",
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        box_id: `box-${userId}-3`,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-3-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440012",
            product_name: "Laneige Water Bank Hyaluronic Cream",
            product_type: "onhand",
            quantity: 2,
            unit_price: 1260.00,
            total: 2520.00,
            image_url: "https://image-optimizer-th.production.sephora-asia.net/images/product_images/zoom_1_Product_8809803572255-Laneige-Water-Bank-Blue-Hyaluronic-Cream-Moisturizer-50ml_6b1e0066b28e5faf9de7d801a9f753e077b9eeea_1702890332.png",
          },
        ],
      },
      {
        id: `order-${userId}-4`,
        user_id: userId,
        order_number: "ORD-2024-512890",
        subtotal: 504.00,
        isf: 300.00,
        lsf: 150.00,
        shipping_fee: 450.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 954.00,
        currency: "PHP",
        status: "shipped",
        payment_status: "paid",
        payment_type: "full",
        box_type_preference: "shared",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        ph_courier_tracking_number: "JNT1234567890",
        ph_courier_name: "J&T Express",
        box_id: `box-${userId}-4`,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-4-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440011",
            product_name: "Beauty of Joseon Relief Sun: Rice + Probiotics",
            product_type: "onhand",
            quantity: 1,
            unit_price: 504.00,
            total: 504.00,
            image_url: "https://tse3.mm.bing.net/th/id/OIP._2Hg_yZs7nF3_uMRIuW99AHaHa?pid=Api&P=0&h=220",
          },
        ],
      },
      {
        id: `order-${userId}-5`,
        user_id: userId,
        order_number: `ORD-2024-${String(Date.now() - 345600000).slice(-6)}`,
        subtotal: 630.00,
        isf: 300.00,
        lsf: 200.00,
        shipping_fee: 500.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 1130.00,
        currency: "PHP",
        status: "delivered",
        payment_status: "paid",
        payment_type: "full",
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        ph_courier_tracking_number: "LBC9876543210",
        ph_courier_name: "LBC Express",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-5-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440013",
            product_name: "Samyang Buldak Hot Chicken Ramen (5 Pack)",
            product_type: "onhand",
            quantity: 1,
            unit_price: 630.00,
            total: 630.00,
            image_url: "https://usfoodz.eu/cdn/shop/products/Samyang-Buldak-Hot-Chicken-Flavor-Ramen-_700g_1200x1200.jpg?v=1673455183",
          },
        ],
      },
      {
        id: `order-${userId}-6`,
        user_id: userId,
        order_number: `ORD-2024-${String(Date.now() - 432000000).slice(-6)}`,
        subtotal: 3150.00,
        isf: 300.00,
        lsf: 200.00,
        shipping_fee: 500.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 3650.00,
        currency: "PHP",
        status: "processing",
        payment_status: "partial",
        payment_type: "downpayment",
        downpayment_amount: 1825.00,
        balance: 1825.00,
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-6-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440012",
            product_name: "Laneige Water Bank Hyaluronic Cream",
            product_type: "onhand",
            quantity: 2,
            unit_price: 1260.00,
            total: 2520.00,
            image_url: "https://image-optimizer-th.production.sephora-asia.net/images/product_images/zoom_1_Product_8809803572255-Laneige-Water-Bank-Blue-Hyaluronic-Cream-Moisturizer-50ml_6b1e0066b28e5faf9de7d801a9f753e077b9eeea_1702890332.png",
          },
          {
            id: `item-${userId}-6-2`,
            product_id: "550e8400-e29b-41d4-a716-446655440017",
            product_name: "K-Beauty Inspired Face Mask Set (10pcs)",
            product_type: "onhand",
            quantity: 1,
            unit_price: 630.00,
            total: 630.00,
            image_url: "https://m.media-amazon.com/images/I/817cEM5iOlL._SL1500_.jpg",
          },
        ],
        payment_history: [
          {
            payment_type: "downpayment",
            amount: 1825.00,
            currency: "PHP",
            payment_method: {
              type: "qr_code",
              bank: "GCASH",
            },
            created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            verified: true,
          },
        ],
      },
      {
        id: `order-${userId}-7`,
        user_id: userId,
        order_number: "ORD-2024-623451",
        subtotal: 1260.00,
        isf: 300.00,
        lsf: 150.00,
        shipping_fee: 450.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 1710.00,
        currency: "PHP",
        status: "received_at_manila",
        payment_status: "paid",
        payment_type: "full",
        box_type_preference: "shared",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        box_id: `box-${userId}-7`,
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-7-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440012",
            product_name: "Laneige Water Bank Hyaluronic Cream",
            product_type: "onhand",
            quantity: 1,
            unit_price: 1260.00,
            total: 1260.00,
            image_url: "https://image-optimizer-th.production.sephora-asia.net/images/product_images/zoom_1_Product_8809803572255-Laneige-Water-Bank-Blue-Hyaluronic-Cream-Moisturizer-50ml_6b1e0066b28e5faf9de7d801a9f753e077b9eeea_1702890332.png",
          },
        ],
      },
      {
        id: `order-${userId}-8`,
        user_id: userId,
        order_number: "ORD-2024-789012",
        subtotal: 3150.00,
        isf: 300.00,
        lsf: 200.00,
        shipping_fee: 500.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 3650.00,
        currency: "PHP",
        status: "shipped",
        payment_status: "paid",
        payment_type: "full",
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        ph_courier_tracking_number: "LBC9876543211",
        ph_courier_name: "LBC Express",
        box_id: `box-${userId}-8`,
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-8-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440010",
            product_name: "COSRX Advanced Snail 96 Mucin Power Essence",
            product_type: "onhand",
            quantity: 3,
            unit_price: 1050.00,
            total: 3150.00,
            image_url: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
          },
        ],
      },
    ];
  }
};

export const mockCartService = {
  getCartItems: (userId: string): Promise<CartItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        initializeMockCart(userId);
        resolve(mockCartStore[userId] || []);
      }, 200);
    });
  },

  addToCart: (data: {
    user_id: string;
    product_id: string;
    quantity: number;
    box_type_preference?: 'solo' | 'shared';
  }): Promise<CartItem> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        initializeMockCart(data.user_id);
        const newItem: CartItem = {
          id: `cart-${data.user_id}-${Date.now()}`,
          user_id: data.user_id,
          product_id: data.product_id,
          quantity: data.quantity,
          box_type_preference: data.box_type_preference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockCartStore[data.user_id].push(newItem);
        resolve(newItem);
      }, 200);
    });
  },

  updateCartItem: (cartItemId: string, quantity: number): Promise<CartItem> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const userId in mockCartStore) {
          const item = mockCartStore[userId].find(i => i.id === cartItemId);
          if (item) {
            item.quantity = quantity;
            item.updated_at = new Date().toISOString();
            resolve(item);
            return;
          }
        }
        reject(new Error("Cart item not found"));
      }, 200);
    });
  },

  removeCartItem: (cartItemId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        for (const userId in mockCartStore) {
          const index = mockCartStore[userId].findIndex(i => i.id === cartItemId);
          if (index !== -1) {
            mockCartStore[userId].splice(index, 1);
            resolve();
            return;
          }
        }
        resolve();
      }, 200);
    });
  },
};

export const mockOrderService = {
  getOrders: (params?: { user_id?: string; status?: string; payment_status?: string }): Promise<{ success: boolean; data: Order[]; pagination?: any }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = params?.user_id || "user-test-customer-1";
        initializeMockOrders(userId);
        let orders = mockOrdersStore[userId] || [];

        // Filter by status if provided
        if (params?.status) {
          orders = orders.filter(o => o.status === params.status);
        }

        // Filter by payment_status if provided
        if (params?.payment_status) {
          orders = orders.filter(o => o.payment_status === params.payment_status);
        }

        resolve({
          success: true,
          data: orders,
          pagination: {
            page: 1,
            limit: 50,
            total: orders.length,
            totalPages: 1,
          },
        });
      }, 300);
    });
  },

  getOrderById: (orderId: string): Promise<Order> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const userId in mockOrdersStore) {
          const order = mockOrdersStore[userId].find(o => o.id === orderId);
          if (order) {
            resolve(order);
            return;
          }
        }
        reject(new Error("Order not found"));
      }, 200);
    });
  },

  createOrder: (data: any): Promise<Order> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = data.user_id;
        initializeMockOrders(userId);
        
        const newOrder: Order = {
          ...data,
          id: `order-${userId}-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Set initial storage status based on product types
        const hasPreorder = newOrder.order_items?.some(item => item.product_type === 'preorder');
        if (hasPreorder) {
          newOrder.preorder_status = 'pending_approval';
          newOrder.storage_status = 'pending';
        } else {
          newOrder.storage_status = 'pending'; // Will be 'in_storage' after payment
        }
        
        mockOrdersStore[userId].unshift(newOrder);
        resolve(newOrder);
      }, 300);
    });
  },

  requestShipping: (orderId: string, data: {
    box_type: 'solo' | 'shared';
    solo_box_id?: string;
    shared_box_id?: string;
    box_size?: 'small' | 'medium' | 'large';
    shipping_address: any;
    courier_id?: string;
  }): Promise<Order> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const userId in mockOrdersStore) {
          const order = mockOrdersStore[userId].find(o => o.id === orderId);
          if (order) {
            order.storage_status = 'shipping_requested';
            order.shipping_requested_at = new Date().toISOString();
            order.box_type_preference = data.box_type;
            if (data.box_size) order.box_size = data.box_size;
            if (data.courier_id && data.box_type === 'solo') {
              order.selected_courier_id = data.courier_id;
            }
            if (data.shared_box_id) order.box_id = data.shared_box_id;
            if (data.solo_box_id) order.box_id = data.solo_box_id;
            order.updated_at = new Date().toISOString();
            resolve(order);
            return;
          }
        }
        reject(new Error("Order not found"));
      }, 300);
    });
  },

  selectCourierForSharedBox: (orderId: string, data: {
    courier_id: string;
    use_cod?: boolean;
    cod_amount?: number;
  }): Promise<Order> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const userId in mockOrdersStore) {
          const order = mockOrdersStore[userId].find(o => o.id === orderId);
          if (order) {
            order.selected_courier_id = data.courier_id;
            if (data.use_cod) {
              order.use_cod = true;
              order.cod_amount = data.cod_amount || 0;
              order.shipping_payment_status = 'cod_pending';
            } else {
              order.use_cod = false;
              order.shipping_payment_status = 'pending';
            }
            order.updated_at = new Date().toISOString();
            resolve(order);
            return;
          }
        }
        reject(new Error("Order not found"));
      }, 300);
    });
  },
};
