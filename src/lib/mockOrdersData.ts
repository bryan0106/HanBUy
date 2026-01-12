// Mock Orders and Cart Data for testing
import type { CartItem } from "@/services/cartService";
import type { Order } from "@/services/orderService";

// Store cart data in memory (simulating database)
const mockCartStore: Record<string, CartItem[]> = {};

// Store orders data in memory (simulating database)
const mockOrdersStore: Record<string, Order[]> = {};

// Export function to get all orders from all users (for admin view)
export const getAllMockOrders = (): Order[] => {
  // Initialize orders for all known test users
  const testUserIds = ["user-test-customer-1", "user-test-customer-2", "user-test-customer-3"];
  testUserIds.forEach(userId => {
    initializeMockOrders(userId);
  });
  
  // Flatten all orders from all users using .map
  const allOrders: Order[] = [];
  Object.keys(mockOrdersStore).forEach(userId => {
    const userOrders = mockOrdersStore[userId] || [];
    allOrders.push(...userOrders);
  });
  
  return allOrders;
};

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
      // ============================================
      // ONHAND PRODUCTS - Various Scenarios
      // ============================================
      
      // Order 1: Onhand - Pending Payment
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
        payment_type: "full_payment",
        box_type_preference: "solo",
        storage_status: "pending",
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
      // Order 2: Onhand - Paid, In Storage (3-way payment - items only)
      {
        id: `order-${userId}-2`,
        user_id: userId,
        order_number: `ORD-2024-${String(Date.now() - 86400000).slice(-6)}`,
        subtotal: 1875.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 1875.00,
        currency: "PHP",
        status: "confirmed",
        payment_status: "paid",
        payment_type: "item_only",
        box_type_preference: "shared",
        storage_status: "in_storage",
        shipping_payment_status: "pending",
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
      // Order 3: Onhand - Received at Manila (Ready to request shipping)
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
        payment_type: "full_payment",
        box_type_preference: "solo",
        storage_status: "in_storage",
        shipping_payment_status: "paid",
        box_id: `box-${userId}-3`,
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
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
      // Order 4: Onhand - Shipped (with tracking)
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
        payment_type: "full_payment",
        box_type_preference: "shared",
        storage_status: "shipped",
        shipping_payment_status: "paid",
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
        shipping_requested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
      // Order 5: Onhand - Delivered
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
        payment_type: "full_payment",
        box_type_preference: "solo",
        storage_status: "delivered",
        shipping_payment_status: "paid",
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
      
      // ============================================
      // PREORDER PRODUCTS - Various Scenarios
      // ============================================
      
      // Order 6: Preorder - Pending Approval (Deposit Paid)
      {
        id: `order-${userId}-6`,
        user_id: userId,
        order_number: `ORD-2024-PRE-001`,
        subtotal: 1470.00, // 35000 KRW * 0.042 = 1470 PHP
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 735.00, // 50% deposit only
        currency: "PHP",
        status: "pending",
        payment_status: "paid",
        payment_type: "item_only",
        box_type_preference: "solo",
        storage_status: "pending",
        preorder_status: "pending_approval",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-6-1`,
            product_id: "preorder-bts-v-1",
            product_name: "V (BTS) [TYPE 非] (Photobook + POSTER SET)",
            product_type: "preorder",
            quantity: 1,
            unit_price: 1470.00,
            total: 1470.00,
            image_url: "https://www.ktown4u.com/goods_files/SH0164/event_images/043957/EV43956132.default.2.png",
            preorder_release_date: "2026-01-19T00:00:00.000Z",
          },
        ],
        payment_history: [
          {
            payment_type: "item_only",
            amount: 735.00,
            currency: "PHP",
            payment_method: {
              type: "qr_code",
              bank: "GCASH",
            },
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            verified: true,
          },
        ],
      },
      
      // Order 7: Preorder - Approved, Processing (Balance Pending)
      {
        id: `order-${userId}-7`,
        user_id: userId,
        order_number: `ORD-2024-PRE-002`,
        subtotal: 1495.20, // 35600 KRW * 0.042 = 1495.20 PHP
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 747.60, // 50% deposit
        currency: "PHP",
        status: "processing",
        payment_status: "partial",
        payment_type: "item_only",
        box_type_preference: "shared",
        storage_status: "pending",
        preorder_status: "approved",
        preorder_approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        balance: 747.60,
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-7-1`,
            product_id: "preorder-zerobaseone-1",
            product_name: "ZEROBASEONE Special Limited Album [RE-FLOW]",
            product_type: "preorder",
            quantity: 1,
            unit_price: 1495.20,
            total: 1495.20,
            image_url: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/zerobaseone/641c7fe3-a3fb-4854-89a2-bca98cf973b9/a1f46549-3c58-419f-82a7-91ce06da03c4/ori.jpg",
            preorder_release_date: "2026-02-26T00:00:00.000Z",
          },
        ],
        payment_history: [
          {
            payment_type: "item_only",
            amount: 747.60,
            currency: "PHP",
            payment_method: {
              type: "qr_code",
              bank: "MAYA",
            },
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            verified: true,
          },
        ],
      },
      
      // Order 8: Preorder - Received, In Storage (Balance Payment Due)
      {
        id: `order-${userId}-8`,
        user_id: userId,
        order_number: `ORD-2024-PRE-003`,
        subtotal: 840.00, // 20000 KRW * 0.042 = 840 PHP
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 420.00, // 50% deposit paid
        currency: "PHP",
        status: "received_at_manila",
        payment_status: "partial",
        payment_type: "item_only",
        box_type_preference: "solo",
        storage_status: "in_storage",
        preorder_status: "received",
        preorder_received_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        balance: 420.00,
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-8-1`,
            product_id: "preorder-nmixx-1",
            product_name: "NMIXX 1st Full Album [Blue Valentine] MEET&CALL EVENT",
            product_type: "preorder",
            quantity: 1,
            unit_price: 840.00,
            total: 840.00,
            image_url: "https://www.makestar.com/_vercel/image?url=https:%2F%2Fmystarroom-public-cdn.makestar.com%2Fpublic%2Fimage%2Fproduct%2FP_9723_NMIXX_64_Banner_Sub.jpg_2025-12-29_155719818560_thumb.jpeg&w=1024&q=80",
            preorder_release_date: "2026-01-22T00:00:00.000Z",
          },
        ],
        payment_history: [
          {
            payment_type: "item_only",
            amount: 420.00,
            currency: "PHP",
            payment_method: {
              type: "qr_code",
              bank: "BDO",
            },
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            verified: true,
          },
        ],
      },
      
      // ============================================
      // PASABUY / KR WEBSITE PRODUCTS
      // ============================================
      
      // Order 9: Pasabuy - Pending (Custom Request)
      {
        id: `order-${userId}-9`,
        user_id: userId,
        order_number: `ORD-2024-PSB-001`,
        subtotal: 2100.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 2100.00,
        currency: "PHP",
        status: "pending",
        payment_status: "pending",
        payment_type: "item_only",
        box_type_preference: "shared",
        storage_status: "pending",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-9-1`,
            product_id: "pasabuy-custom-1",
            product_name: "Custom Pasabuy Request - Limited Edition K-Pop Merch",
            product_type: "kr_website",
            quantity: 1,
            unit_price: 2100.00,
            total: 2100.00,
            image_url: "https://via.placeholder.com/300x300?text=Pasabuy+Item",
          },
        ],
      },
      
      // Order 10: Pasabuy - Processing (Item Being Sourced)
      {
        id: `order-${userId}-10`,
        user_id: userId,
        order_number: `ORD-2024-PSB-002`,
        subtotal: 3150.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 3150.00,
        currency: "PHP",
        status: "processing",
        payment_status: "paid",
        payment_type: "item_only",
        box_type_preference: "solo",
        storage_status: "pending",
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-10-1`,
            product_id: "pasabuy-custom-2",
            product_name: "Pasabuy - Rare K-Beauty Set from Olive Young",
            product_type: "kr_website",
            quantity: 1,
            unit_price: 3150.00,
            total: 3150.00,
            image_url: "https://via.placeholder.com/300x300?text=Pasabuy+Item",
          },
        ],
      },
      
      // Order 11: Pasabuy - Received at Manila
      {
        id: `order-${userId}-11`,
        user_id: userId,
        order_number: `ORD-2024-PSB-003`,
        subtotal: 1260.00,
        isf: 300.00,
        lsf: 200.00,
        shipping_fee: 500.00,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 1760.00,
        currency: "PHP",
        status: "received_at_manila",
        payment_status: "paid",
        payment_type: "full_payment",
        box_type_preference: "solo",
        storage_status: "in_storage",
        shipping_payment_status: "paid",
        box_id: `box-${userId}-11`,
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-11-1`,
            product_id: "pasabuy-custom-3",
            product_name: "Pasabuy - Exclusive K-Drama OST Album",
            product_type: "kr_website",
            quantity: 1,
            unit_price: 1260.00,
            total: 1260.00,
            image_url: "https://via.placeholder.com/300x300?text=Pasabuy+Item",
          },
        ],
      },
      
      // Order 12: Mixed Order - Onhand + Preorder
      {
        id: `order-${userId}-12`,
        user_id: userId,
        order_number: `ORD-2024-MIX-001`,
        subtotal: 3570.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: 500.00,
        shared_shipping_fee: 300.00,
        total: 2625.00, // Onhand full + Preorder 50% deposit
        currency: "PHP",
        status: "confirmed",
        payment_status: "partial",
        payment_type: "item_only",
        box_type_preference: "shared",
        storage_status: "pending",
        preorder_status: "pending_approval",
        balance: 735.00, // Preorder balance
        shipping_address: {
          street: "123 Rizal Street",
          city: "Makati",
          province: "Metro Manila",
          zipCode: "1200",
          country: "Philippines",
        },
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        order_items: [
          {
            id: `item-${userId}-12-1`,
            product_id: "550e8400-e29b-41d4-a716-446655440010",
            product_name: "COSRX Advanced Snail 96 Mucin Power Essence",
            product_type: "onhand",
            quantity: 1,
            unit_price: 1050.00,
            total: 1050.00,
            image_url: "https://www.lookfantastic.com/images?url=https://static.thcdn.com/productimg/original/11401174-1325238016812216.jpg&format=webp&auto=avif&width=985&height=985&fit=cover&dpr=2",
          },
          {
            id: `item-${userId}-12-2`,
            product_id: "preorder-bts-v-1",
            product_name: "V (BTS) [TYPE 非] (Photobook + POSTER SET)",
            product_type: "preorder",
            quantity: 1,
            unit_price: 1470.00,
            total: 1470.00,
            image_url: "https://www.ktown4u.com/goods_files/SH0164/event_images/043957/EV43956132.default.2.png",
            preorder_release_date: "2026-01-19T00:00:00.000Z",
          },
        ],
        payment_history: [
          {
            payment_type: "item_only",
            amount: 2625.00,
            currency: "PHP",
            payment_method: {
              type: "qr_code",
              bank: "GCASH",
            },
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            verified: true,
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
