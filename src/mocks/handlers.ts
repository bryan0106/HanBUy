import { http, HttpResponse } from 'msw';

// MSW handlers - Use pattern matching to catch requests regardless of base URL
// MSW will match requests that match these patterns

// In-memory storage for orders (simulates database)
const ordersStore: Map<string, any[]> = new Map();

// Initialize with sample orders for testing
const initializeSampleOrders = () => {
  // Only initialize if store is empty
  if (ordersStore.size > 0) return;
  
  const sampleUserId = 'user-test-customer-1';
  const sampleOrders = [
    {
      id: 'order-test-1',
      user_id: sampleUserId,
      order_number: 'ORD-2024-001',
      subtotal: 68000,
      isf: 1500,
      lsf: 800,
      shipping_fee: 2300,
      total: 70300,
      currency: 'PHP',
      status: 'pending',
      payment_status: 'pending',
      payment_type: 'full',
      box_type_preference: 'solo',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '+639123456789',
      shipping_address: {
        street: '123 Test Street',
        city: 'Manila',
        province: 'Metro Manila',
        zipCode: '1000',
        country: 'Philippines',
      },
      order_items: [
        {
          id: 'item-1',
          product_id: 'prod-test-1',
          product_name: 'COSRX Advanced Snail 96 Mucin Power Essence',
          product_type: 'onhand',
          quantity: 2,
          unit_price: 25000,
          total: 50000,
          image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
        },
        {
          id: 'item-2',
          product_id: 'prod-test-2',
          product_name: 'Beauty of Joseon Relief Sun SPF50+',
          product_type: 'onhand',
          quantity: 1,
          unit_price: 18000,
          total: 18000,
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'order-test-2',
      user_id: sampleUserId,
      order_number: 'ORD-2024-002',
      subtotal: 50000,
      isf: 1500,
      lsf: 600,
      shipping_fee: 2100,
      total: 52100,
      currency: 'PHP',
      status: 'confirmed',
      payment_status: 'paid',
      payment_type: 'downpayment',
      downpayment_amount: 26050,
      balance: 26050,
      box_type_preference: 'shared',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '+639123456789',
      shipping_address: {
        street: '456 Sample Avenue',
        city: 'Quezon City',
        province: 'Metro Manila',
        zipCode: '1100',
        country: 'Philippines',
      },
      order_items: [
        {
          id: 'item-3',
          product_id: 'prod-test-3',
          product_name: 'Limited Edition K-Beauty Set',
          product_type: 'preorder',
          quantity: 1,
          unit_price: 50000,
          total: 50000,
          preorder_release_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      payment_history: [
        {
          payment_type: 'downpayment',
          amount: 26050,
          currency: 'PHP',
          created_at: new Date().toISOString(),
          verified: true,
        },
      ],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  ordersStore.set(sampleUserId, sampleOrders);
  console.log('🎭 MSW: Initialized with sample orders', { count: sampleOrders.length });
};

// Initialize sample data immediately when module loads
initializeSampleOrders();

// In-memory storage for pasabuy requests (simulates database)
const pasabuyStore: Map<string, any[]> = new Map();

// In-memory storage for cart items (simulates database)
const cartStore: Map<string, any[]> = new Map();

// In-memory storage for payments (simulates database)
// Key: payment_id, Value: payment object
const paymentsStore: Map<string, any> = new Map();

export const handlers = [
  // Mock bank types endpoint (new endpoint per guide)
  // Matches: */api/payments/bank-type (any base URL)
  http.get('*/api/payments/bank-type', () => {
    console.log('🎭 MSW: Fetching payment bank types');
    return HttpResponse.json({
      success: true,
      data: [
        { 
          id: 'GCASH', 
          name: 'GCash', 
          type: 'qr_code', 
          icon: 'gcash', 
          description: 'Pay via GCash QR code'
        },
        { 
          id: 'MAYA', 
          name: 'Maya', 
          type: 'qr_code', 
          icon: 'maya', 
          description: 'Pay via Maya QR code'
        },
        { 
          id: 'BPI', 
          name: 'BPI', 
          type: 'qr_code', 
          icon: 'bpi', 
          description: 'Pay via BPI QR code'
        },
        { 
          id: 'BDO', 
          name: 'BDO', 
          type: 'qr_code', 
          icon: 'bdo', 
          description: 'Pay via BDO QR code'
        },
        { 
          id: 'GOTYME', 
          name: 'GoTyme', 
          type: 'qr_code', 
          icon: 'gotyme', 
          description: 'Pay via GoTyme QR code'
        },
      ],
    });
  }),

  // Mock bank types endpoint (for backward compatibility)
  // Matches: */api/bank-type (any base URL)
  http.get('*/api/bank-type', () => {
    console.log('🎭 MSW: Fetching bank types (legacy endpoint)');
    return HttpResponse.json({
      success: true,
      data: [
        { 
          code: 'GCASH', 
          name: 'GCash', 
          type: 'qr_code', 
          icon: 'gcash', 
          description: 'Pay via GCash QR code',
          color: 'bg-blue-500'
        },
        { 
          code: 'MAYA', 
          name: 'Maya', 
          type: 'qr_code', 
          icon: 'maya', 
          description: 'Pay via Maya QR code',
          color: 'bg-green-600'
        },
        { 
          code: 'BPI', 
          name: 'BPI', 
          type: 'qr_code', 
          icon: 'bpi', 
          description: 'Pay via BPI QR code',
          color: 'bg-red-600'
        },
        { 
          code: 'BDO', 
          name: 'BDO', 
          type: 'qr_code', 
          icon: 'bdo', 
          description: 'Pay via BDO QR code',
          color: 'bg-blue-600'
        },
        { 
          code: 'GOTYME', 
          name: 'GoTyme', 
          type: 'qr_code', 
          icon: 'gotyme', 
          description: 'Pay via GoTyme QR code',
          color: 'bg-purple-600'
        },
      ],
    });
  }),

  // Mock QR code generation endpoint
  // Matches: */api/payments/qr-code (any base URL)
  http.post('*/api/payments/qr-code', async ({ request }) => {
    const body: any = await request.json().catch(() => ({}));
    const bank = (body?.payment_method?.bank || 'GCASH').toUpperCase();
    const amount = Number(body?.amount || 0).toFixed(2);

    // Generate a nicer-looking mock QR code SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="360">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3a4b6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff6b9d;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="360" fill="#ffffff" stroke="url(#grad1)" stroke-width="3" rx="12" />
        <text x="160" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ff6b9d">MSW TEST MODE</text>
        <text x="160" y="52" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">Mock QR Code</text>
        <rect x="60" y="80" width="200" height="200" fill="#fafafa" stroke="#ddd" stroke-width="2" rx="4" />
        <rect x="80" y="100" width="20" height="20" fill="#000" />
        <rect x="220" y="100" width="20" height="20" fill="#000" />
        <rect x="80" y="240" width="20" height="20" fill="#000" />
        <rect x="220" y="240" width="20" height="20" fill="#000" />
        <rect x="140" y="140" width="40" height="40" fill="#000" />
        <text x="160" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#333">${bank}</text>
        <text x="160" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ff6b9d">₱${amount}</text>
        <text x="160" y="348" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">Not scannable - Test Mode</text>
      </svg>
    `.trim();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    console.log('🎭 MSW: Mocking QR code generation', { bank, amount });

    return HttpResponse.json({
      success: true,
      data: {
        qr_code: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        qr_code_data: `MSW_MOCK_QR_${Date.now()}_${bank}`,
        amount: Number(amount),
        payment_method: body.payment_method || {
          type: 'qr_code',
          bank: bank,
        },
        payment_id: crypto.randomUUID(),
        expires_at: expiresAt,
      },
    });
  }),

  // Mock payment confirmation endpoint
  // Matches: */api/payments/confirm (any base URL)
  http.post('*/api/payments/confirm', async ({ request }) => {
    const formData = await request.formData().catch(() => null);
    
    const paymentId = formData?.get('payment_id')?.toString() || '';
    const orderId = formData?.get('order_id')?.toString() || '';
    const amount = Number(formData?.get('amount') || 0);
    const proofOfPayment = formData?.get('proof_of_payment')?.toString() || '';
    
    console.log('🎭 MSW: Mocking payment confirmation - Auto-verified', { paymentId, orderId, amount });

    // Update payment record
    const paymentRecord = paymentsStore.get(paymentId);
    if (paymentRecord) {
      paymentRecord.status = 'verified';
      paymentRecord.verified = true;
      paymentRecord.verified_at = new Date().toISOString();
      paymentRecord.proof_of_payment = proofOfPayment;
      paymentRecord.updated_at = new Date().toISOString();
      paymentsStore.set(paymentId, paymentRecord);
    } else {
      // Create new payment record if not found
      const newPayment = {
        id: paymentId || crypto.randomUUID(),
        order_id: orderId,
        amount: amount,
        currency: 'PHP',
        payment_type: 'full_payment',
        payment_method: { type: 'qr_code', bank: 'GCASH' },
        status: 'verified',
        verified: true,
        verified_at: new Date().toISOString(),
        proof_of_payment: proofOfPayment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      paymentsStore.set(newPayment.id, newPayment);
    }

    // Update order payment_status and payment_history
    if (orderId) {
      for (const [userId, orders] of ordersStore.entries()) {
        const orderIndex = orders.findIndex((o: any) => o.id === orderId);
        if (orderIndex !== -1) {
          const order = orders[orderIndex];
          
          // Update payment_status
          order.payment_status = 'paid';
          order.status = order.status === 'pending' ? 'confirmed' : order.status;
          order.paid_at = new Date().toISOString();
          order.proof_of_payment = proofOfPayment;
          
          // Update payment_history
          if (!order.payment_history) {
            order.payment_history = [];
          }
          
          // Find existing payment in history or add new one
          const paymentHistoryIndex = order.payment_history.findIndex((p: any) => p.id === paymentId);
          if (paymentHistoryIndex !== -1) {
            order.payment_history[paymentHistoryIndex].status = 'verified';
            order.payment_history[paymentHistoryIndex].verified = true;
            order.payment_history[paymentHistoryIndex].verified_at = new Date().toISOString();
            order.payment_history[paymentHistoryIndex].proof_of_payment = proofOfPayment;
          } else {
            order.payment_history.push({
              id: paymentId || crypto.randomUUID(),
              payment_type: order.payment_type || 'full_payment',
              amount: amount,
              currency: order.currency || 'PHP',
              payment_method: order.payment_method || { type: 'qr_code', bank: 'GCASH' },
              status: 'verified',
              verified: true,
              verified_at: new Date().toISOString(),
              proof_of_payment: proofOfPayment,
              created_at: new Date().toISOString(),
            });
          }
          
          order.updated_at = new Date().toISOString();
          orders[orderIndex] = order;
          ordersStore.set(userId, orders);
          console.log('✅ MSW: Updated order payment_status and payment_history', { orderId, paymentId });
          break;
        }
      }
    }

    return HttpResponse.json({
      success: true,
      data: {
        payment_id: paymentId || crypto.randomUUID(),
        order_id: orderId,
        amount: amount,
        status: 'verified' as const,
        verified: true,
      },
      message: 'Payment proof uploaded and automatically verified (MSW Mock).',
    });
  }),

  // Mock payment status endpoint
  // Matches: */api/payments/:id (any base URL)
  http.get('*/api/payments/:id', ({ params }) => {
    const paymentId = params.id as string;
    
    console.log('🎭 MSW: Mocking payment status - Auto-verified', { paymentId });

    return HttpResponse.json({
      success: true,
      data: {
        id: paymentId,
        order_id: crypto.randomUUID(),
        amount: 100.00,
        currency: 'PHP',
        payment_type: 'full_payment',
        payment_method: {
          type: 'qr_code',
          bank: 'GCASH',
        },
        status: 'verified' as const,
        verified: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    });
  }),

  // Mock create order endpoint
  // Matches: */api/orders (any base URL)
  http.post('*/api/orders', async ({ request }) => {
    try {
      const body: any = await request.json().catch(() => ({}));
      
      console.log('🎭 MSW: Intercepted POST /api/orders');
      console.log('🎭 MSW: Order data received:', { 
        userId: body.user_id, 
        orderNumber: body.order_number,
        total: body.total,
        itemCount: body.order_items?.length || 0,
        hasShippingAddress: !!body.shipping_address,
      });

      const userId = body.user_id;
      if (!userId) {
        console.error('❌ MSW: Missing user_id');
        return HttpResponse.json(
          { success: false, error: 'user_id is required' },
          { status: 400 }
        );
      }

      // Initialize user's orders array if not exists
      if (!ordersStore.has(userId)) {
        ordersStore.set(userId, []);
      }

      const userOrders = ordersStore.get(userId)!;

      // Create new order - accept any shipping address (even incomplete)
      const orderId = crypto.randomUUID();
      const orderNumber = body.order_number || `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const newOrder = {
        id: orderId,
        user_id: userId,
        order_number: orderNumber,
        subtotal: body.subtotal || 0,
        isf: body.isf || 0,
        lsf: body.lsf || 0,
        shipping_fee: body.shipping_fee || 0,
        solo_shipping_fee: body.solo_shipping_fee,
        shared_shipping_fee: body.shared_shipping_fee,
        total: body.total || 0,
        currency: body.currency || 'PHP',
        status: body.status || 'pending',
        payment_status: body.payment_status || 'pending',
        payment_type: body.payment_type || 'full_payment',
        payment_method: body.payment_method,
        box_type_preference: body.box_type_preference || 'solo',
        box_size: body.box_size,
        shared_box_id: body.shared_box_id,
        // Accept any shipping address, even if incomplete
        shipping_address: body.shipping_address || {
          street: '',
          city: '',
          province: '',
          zipCode: '',
          country: 'Philippines',
        },
        storage_status: body.storage_status || 'pending',
        shipping_payment_status: body.shipping_payment_status,
        shipping_requested_at: body.shipping_requested_at,
        order_items: body.order_items || [],
        customer_message: body.customer_message,
        preorder_status: body.preorder_status,
        // Include customer info for admin API compatibility
        customer_name: body.customer_name || `Customer ${userId.slice(-6)}`,
        customer_email: body.customer_email || `customer${userId.slice(-6)}@example.com`,
        customer_phone: body.customer_phone,
        // Initialize payment_history as empty array
        payment_history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add order to store
      userOrders.unshift(newOrder);
      ordersStore.set(userId, userOrders);

      console.log('✅ MSW: Order created successfully', { 
        orderId: newOrder.id, 
        orderNumber: newOrder.order_number,
        total: newOrder.total,
      });

      return HttpResponse.json({
        success: true,
        data: newOrder,
        message: 'Order created successfully',
      });
    } catch (error: any) {
      console.error('❌ MSW: Error in order creation handler:', error);
      return HttpResponse.json(
        { success: false, error: error.message || 'Failed to create order' },
        { status: 500 }
      );
    }
  }),

  // Mock get orders endpoint
  // Matches: */api/orders (any base URL)
  http.get('*/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const status = url.searchParams.get('status');
    const payment_status = url.searchParams.get('payment_status');
    
    // Ensure sample data is initialized
    initializeSampleOrders();
    
    console.log('🎭 MSW: Fetching orders', { userId, status, payment_status });
    console.log('🎭 MSW: OrdersStore keys:', Array.from(ordersStore.keys()));
    console.log('🎭 MSW: OrdersStore size:', ordersStore.size);

    let orders: any[] = [];

    if (userId) {
      // Get orders for specific user
      const userOrders = ordersStore.get(userId);
      console.log('🎭 MSW: Orders for user', userId, ':', userOrders?.length || 0);
      orders = userOrders || [];
      
      // Also check if userId matches any order's user_id (in case of format mismatch)
      if (orders.length === 0) {
        console.log('🎭 MSW: No orders found for userId, searching all orders...');
        ordersStore.forEach((allUserOrders, storedUserId) => {
          const matchingOrders = allUserOrders.filter((order: any) => 
            order.user_id === userId || storedUserId === userId
          );
          if (matchingOrders.length > 0) {
            console.log('🎭 MSW: Found', matchingOrders.length, 'orders with matching user_id');
            orders.push(...matchingOrders);
          }
        });
      }
    } else {
      // Get all orders (admin view)
      ordersStore.forEach((userOrders) => {
        orders.push(...userOrders);
      });
    }

    // Apply filters
    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }
    if (payment_status && payment_status !== 'all') {
      orders = orders.filter(order => order.payment_status === payment_status);
    }

    console.log('🎭 MSW: Returning', orders.length, 'orders');
    return HttpResponse.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  }),

  // Mock get order by ID endpoint
  // Matches: */api/orders/:id (any base URL)
  http.get('*/api/orders/:id', ({ params }) => {
    const orderId = params.id as string;
    
    console.log('🎭 MSW: Fetching order by ID', { orderId });

    // Search through all users' orders
    for (const [userId, orders] of ordersStore.entries()) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        return HttpResponse.json({
          success: true,
          data: order,
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }),

  // ========== ADMIN API ENDPOINTS ==========

  // Mock admin get all orders endpoint
  // Matches: */api/admin/orders (any base URL)
  http.get('*/api/admin/orders', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const payment_status = url.searchParams.get('payment_status');
    const order_type = url.searchParams.get('order_type');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Ensure sample data is initialized
    initializeSampleOrders();
    
    console.log('🎭 MSW: Fetching admin orders', { status, payment_status, order_type, search });

    let orders: any[] = [];

    // Get all orders from store
    ordersStore.forEach((userOrders) => {
      orders.push(...userOrders);
    });

    // Apply filters
    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }
    if (payment_status && payment_status !== 'all') {
      orders = orders.filter(order => order.payment_status === payment_status);
    }
    if (order_type && order_type !== 'all') {
      orders = orders.filter(order => {
        const orderItems = order.order_items || [];
        const productTypes = new Set(orderItems.map((item: any) => item.product_type || 'onhand'));
        if (order_type === 'pasabuy') {
          return productTypes.has('pasabuy') || orderItems.some((item: any) => item.product_id?.startsWith('pasabuy-'));
        } else if (order_type === 'preorder') {
          return productTypes.has('preorder') && !productTypes.has('onhand');
        } else if (order_type === 'onhand') {
          return !productTypes.has('preorder') && !productTypes.has('pasabuy');
        }
        return true;
      });
    }
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer_name?.toLowerCase().includes(searchLower) ||
        order.customer_email?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = orders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Transform to admin API format (include customer info)
    const adminOrders = paginatedOrders.map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || `Customer ${order.user_id?.slice(-6) || 'Unknown'}`,
      customer_email: order.customer_email || `customer${order.user_id?.slice(-6) || 'unknown'}@example.com`,
      customer_phone: order.customer_phone,
      status: order.status,
      payment_status: order.payment_status,
      storage_status: order.storage_status || 'pending',
      fulfillment_status: order.fulfillment_status || (order.status === 'pending' ? 'pending_packing' : undefined),
      preorder_status: order.preorder_status || null,
      total: order.total,
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee || order.isf + order.lsf,
      item_count: order.order_items?.length || 0,
      created_at: order.created_at,
      shipping_address: order.shipping_address,
      order_items: order.order_items,
      payment_history: order.payment_history,
    }));

    return HttpResponse.json({
      success: true,
      data: adminOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }),

  // Mock admin get single order endpoint
  // Matches: */api/admin/orders/:id (any base URL)
  http.get('*/api/admin/orders/:id', ({ params }) => {
    const orderId = params.id as string;
    
    console.log('🎭 MSW: Fetching admin order by ID', { orderId });

    // Search through all users' orders
    for (const [userId, orders] of ordersStore.entries()) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Transform to admin API format
        const adminOrder = {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name || `Customer ${order.user_id?.slice(-6) || 'Unknown'}`,
          customer_email: order.customer_email || `customer${order.user_id?.slice(-6) || 'unknown'}@example.com`,
          customer_phone: order.customer_phone,
          status: order.status,
          payment_status: order.payment_status,
          storage_status: order.storage_status || 'pending',
          fulfillment_status: order.fulfillment_status || (order.status === 'pending' ? 'pending_packing' : undefined),
          preorder_status: order.preorder_status || null,
          total: order.total,
          subtotal: order.subtotal,
          shipping_fee: order.shipping_fee || order.isf + order.lsf,
          shipping_address: order.shipping_address,
          order_items: order.order_items || [],
          payment_history: order.payment_history || [],
        };
        
        return HttpResponse.json({
          success: true,
          data: adminOrder,
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }),

  // Mock admin update order status endpoint
  // Matches: */api/admin/orders/:id/status (any base URL)
  http.patch('*/api/admin/orders/:id/status', async ({ params, request }) => {
    const orderId = params.id as string;
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Updating admin order status', { orderId, status: body.status });

    // Search through all users' orders
    for (const [userId, orders] of ordersStore.entries()) {
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        const order = orders[orderIndex];
        const updatedOrder = {
          ...order,
          status: body.status,
          admin_notes: body.admin_notes || order.admin_notes,
          updated_at: new Date().toISOString(),
        };
        orders[orderIndex] = updatedOrder;
        ordersStore.set(userId, orders);
        
        return HttpResponse.json({
          success: true,
          data: updatedOrder,
          message: 'Order status updated successfully',
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }),

  // Mock admin update order payment status endpoint
  // Matches: */api/admin/orders/:id/payment-status (any base URL)
  http.patch('*/api/admin/orders/:id/payment-status', async ({ params, request }) => {
    const orderId = params.id as string;
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Updating admin order payment status', { orderId, payment_status: body.payment_status });

    // Search through all users' orders
    for (const [userId, orders] of ordersStore.entries()) {
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        const order = orders[orderIndex];
        const updatedOrder = {
          ...order,
          payment_status: body.payment_status,
          admin_notes: body.admin_notes || order.admin_notes,
          rejection_reason: body.rejection_reason,
          downpayment_paid: body.downpayment_paid || order.downpayment_paid,
          balance: body.payment_status === 'partial' && body.downpayment_paid 
            ? order.total - body.downpayment_paid 
            : order.balance,
          // Auto-update order status if payment verified
          status: body.payment_status === 'paid' && order.status === 'pending' ? 'confirmed' : order.status,
          updated_at: new Date().toISOString(),
          paid_at: body.payment_status === 'paid' ? new Date().toISOString() : order.paid_at,
        };
        orders[orderIndex] = updatedOrder;
        ordersStore.set(userId, orders);
        
        return HttpResponse.json({
          success: true,
          data: updatedOrder,
          message: 'Payment status updated successfully',
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }),

  // Mock admin get all payments endpoint
  // Matches: */api/admin/payments (any base URL)
  http.get('*/api/admin/payments', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const payment_type = url.searchParams.get('payment_type');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Ensure sample data is initialized
    initializeSampleOrders();
    
    console.log('🎭 MSW: Fetching admin payments', { status, payment_type, search });

    let payments: any[] = [];

    // Get all orders and create payment records
    ordersStore.forEach((userOrders) => {
      userOrders.forEach((order: any) => {
        // Create payment record from order
        if (order.payment_status === 'pending' || order.payment_status === 'partial' || order.payment_status === 'paid') {
          payments.push({
            id: `${order.id}-main`,
            order_id: order.id,
            order_number: order.order_number,
            amount: order.total,
            status: order.payment_status === 'paid' ? 'verified' : order.payment_status === 'failed' ? 'rejected' : 'pending',
            proof_of_payment: order.proof_of_payment,
            payment_method: order.payment_method,
            customer_name: order.customer_name || `Customer ${order.user_id?.slice(-6) || 'Unknown'}`,
            customer_email: order.customer_email || `customer${order.user_id?.slice(-6) || 'unknown'}@example.com`,
            customer_phone: order.customer_phone,
            order_total: order.total,
            order_subtotal: order.subtotal,
            order_payment_status: order.payment_status,
            order_status: order.status,
            created_at: order.created_at,
          });
        }
      });
    });

    // Apply filters
    if (status && status !== 'all') {
      payments = payments.filter(p => {
        if (status === 'pending') return p.status === 'pending';
        if (status === 'verified') return p.status === 'verified';
        if (status === 'failed' || status === 'rejected') return p.status === 'rejected';
        return true;
      });
    }
    if (payment_type) {
      payments = payments.filter(p => p.payment_method?.type === payment_type);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      payments = payments.filter(p => 
        p.order_number.toLowerCase().includes(searchLower) ||
        p.customer_name?.toLowerCase().includes(searchLower) ||
        p.customer_email?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = payments.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = payments.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }),

  // Mock admin get single payment endpoint
  // Matches: */api/admin/payments/:id (any base URL)
  http.get('*/api/admin/payments/:id', ({ params }) => {
    const paymentId = params.id as string;
    
    console.log('🎭 MSW: Fetching admin payment by ID', { paymentId });

    // Extract order ID from payment ID (format: orderId-main or orderId-timestamp)
    // Robust extraction: if it ends with -main, remove it. Otherwise, assume it's the order ID or a direct payment ID.
    const orderId = paymentId.endsWith('-main') ? paymentId.replace('-main', '') : paymentId;

    // Search through all users' orders
    for (const [userId, orders] of ordersStore.entries()) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const payment = {
          id: paymentId,
          order_id: order.id,
          order_number: order.order_number,
          amount: order.total,
          status: order.payment_status === 'paid' ? 'verified' : order.payment_status === 'failed' ? 'rejected' : 'pending',
          proof_of_payment: order.proof_of_payment,
          payment_method: order.payment_method,
          customer_name: order.customer_name || `Customer ${order.user_id?.slice(-6) || 'Unknown'}`,
          customer_email: order.customer_email || `customer${order.user_id?.slice(-6) || 'unknown'}@example.com`,
          customer_phone: order.customer_phone,
          order_total: order.total,
          order_subtotal: order.subtotal,
          shipping_fee: order.shipping_fee || order.isf + order.lsf,
          order_payment_status: order.payment_status,
          order_status: order.status,
          storage_status: order.storage_status || 'pending',
          shipping_address: order.shipping_address,
          payment_history: order.payment_history || [],
        };
        
        return HttpResponse.json({
          success: true,
          data: payment,
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Payment not found' },
      { status: 404 }
    );
  }),

  // Mock admin update payment status endpoint
  // Matches: */api/admin/payments/:id/status (any base URL)
  http.patch('*/api/admin/payments/:id/status', async ({ params, request }) => {
    const paymentId = params.id as string;
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Updating admin payment status', { paymentId, status: body.status });

    // Extract order ID from payment ID
    // Robust extraction: if it ends with -main, remove it. Otherwise, assume it's the order ID or a direct payment ID.
    const orderId = paymentId.endsWith('-main') ? paymentId.replace('-main', '') : paymentId;

    // Search through all users' orders
    for (const [userId, orders] of ordersStore.entries()) {
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        const order = orders[orderIndex];
        const updatedOrder = {
          ...order,
          payment_status: body.status === 'verified' ? 'paid' : body.status === 'rejected' ? 'failed' : order.payment_status,
          admin_notes: body.admin_notes || order.admin_notes,
          rejection_reason: body.rejection_reason,
          // Auto-update order status if payment verified
          status: body.status === 'verified' && order.status === 'pending' ? 'confirmed' : order.status,
          updated_at: new Date().toISOString(),
          paid_at: body.status === 'verified' ? new Date().toISOString() : order.paid_at,
        };
        orders[orderIndex] = updatedOrder;
        ordersStore.set(userId, orders);
        
        return HttpResponse.json({
          success: true,
          message: 'Payment status updated successfully',
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Payment not found' },
      { status: 404 }
    );
  }),

  // Mock create pasabuy request endpoint
  // Matches: */api/pasabuy (any base URL)
  http.post('*/api/pasabuy', async ({ request }) => {
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Creating pasabuy request', body);

    // Extract user_id from Authorization header (in real API, this comes from JWT token)
    const authHeader = request.headers.get('Authorization');
    // For MSW, we'll use a mock user_id - in real API, this comes from JWT
    const userId = 'user-mock-id'; // This should come from JWT token in real API

    // Initialize user's pasabuy requests array if not exists
    if (!pasabuyStore.has(userId)) {
      pasabuyStore.set(userId, []);
    }

    const userPasabuyRequests = pasabuyStore.get(userId)!;

    // Validate required fields
    if (!body.comment && !body.product_url) {
      return HttpResponse.json(
        { success: false, error: 'Either comment or product_url is required' },
        { status: 400 }
      );
    }

    // Create new pasabuy request
    const requestNumber = `PSB-${new Date().getFullYear()}-${String(userPasabuyRequests.length + 1).padStart(3, '0')}`;
    const newRequest = {
      id: crypto.randomUUID(),
      request_number: requestNumber,
      customer_id: userId,
      customer_name: 'Mock User', // In real API, this comes from user data
      customer_email: 'mock@example.com', // In real API, this comes from user data
      product_url: body.product_url || undefined,
      product_name: body.product_name || undefined,
      comment: body.comment || '',
      estimated_price: undefined,
      currency: 'KRW' as const,
      status: 'pending' as const,
      images: [],
      category: undefined,
      sku: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: undefined,
      paid_at: undefined,
      bought_at: undefined,
      in_storage_at: undefined,
      rejected_at: undefined,
      rejection_reason: undefined,
      admin_notes: undefined,
    };

    // Add request to store
    userPasabuyRequests.unshift(newRequest);
    pasabuyStore.set(userId, userPasabuyRequests);

    console.log('✅ MSW: Pasabuy request created successfully', { requestId: newRequest.id, requestNumber: newRequest.request_number });

    return HttpResponse.json({
      success: true,
      message: 'Pasabuy request submitted successfully',
      data: {
        id: newRequest.id,
        request_number: newRequest.request_number,
      },
    });
  }),

  // Mock get pasabuy requests endpoint (customer)
  // Matches: */api/pasabuy (any base URL)
  http.get('*/api/pasabuy', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // Extract user_id from Authorization header (in real API, this comes from JWT token)
    const userId = 'user-mock-id'; // This should come from JWT token in real API
    
    console.log('🎭 MSW: Fetching pasabuy requests', { userId, status });

    const userPasabuyRequests = pasabuyStore.get(userId) || [];
    
    // Filter by status if provided
    let filteredRequests = userPasabuyRequests;
    if (status) {
      filteredRequests = userPasabuyRequests.filter(req => req.status === status);
    }

    return HttpResponse.json({
      success: true,
      data: filteredRequests,
      total: filteredRequests.length,
    });
  }),

  // Mock get single pasabuy request endpoint (customer)
  // Matches: */api/pasabuy/:id (any base URL)
  http.get('*/api/pasabuy/:id', ({ params }) => {
    const requestId = params.id as string;
    
    // Extract user_id from Authorization header (in real API, this comes from JWT token)
    const userId = 'user-mock-id'; // This should come from JWT token in real API
    
    console.log('🎭 MSW: Fetching pasabuy request by ID', { requestId, userId });

    const userPasabuyRequests = pasabuyStore.get(userId) || [];
    const request = userPasabuyRequests.find(req => req.id === requestId);

    if (!request) {
      return HttpResponse.json(
        { success: false, error: 'Pasabuy request not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: request,
    });
  }),

  // Mock get cart endpoint
  // Matches: */api/cart (any base URL)
  http.get('*/api/cart', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    console.log('🎭 MSW: Fetching cart', { userId });

    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const userCart = cartStore.get(userId) || [];
    return HttpResponse.json({
      success: true,
      data: userCart,
    });
  }),

  // Mock add to cart endpoint
  // Matches: */api/cart (any base URL)
  http.post('*/api/cart', async ({ request }) => {
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Adding to cart', body);

    const userId = body.user_id;
    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!body.product_id) {
      return HttpResponse.json(
        { success: false, error: 'product_id is required' },
        { status: 400 }
      );
    }

    // Initialize user's cart if not exists
    if (!cartStore.has(userId)) {
      cartStore.set(userId, []);
    }

    const userCart = cartStore.get(userId)!;

    // Check if item already exists in cart
    const existingItem = userCart.find(item => item.product_id === body.product_id);
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity = (existingItem.quantity || 0) + (body.quantity || 1);
      existingItem.updated_at = new Date().toISOString();
    } else {
      // Add new item
      const newItem = {
        id: crypto.randomUUID(),
        user_id: userId,
        product_id: body.product_id,
        product_name: body.product_name,
        product_type: body.product_type || 'onhand',
        quantity: body.quantity || 1,
        price: body.price,
        image_url: body.image_url,
        box_type_preference: body.box_type_preference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      userCart.push(newItem);
    }

    cartStore.set(userId, userCart);

    const updatedItem = existingItem || userCart[userCart.length - 1];

    console.log('✅ MSW: Item added to cart', { cartItemId: updatedItem.id });

    return HttpResponse.json({
      success: true,
      data: updatedItem,
      message: 'Item added to cart successfully',
    });
  }),

  // Mock update cart item endpoint
  // Matches: */api/cart/:id (any base URL)
  http.put('*/api/cart/:id', async ({ params, request }) => {
    const cartItemId = params.id as string;
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Updating cart item', { cartItemId, quantity: body.quantity });

    // Find the cart item across all users
    for (const [userId, cart] of cartStore.entries()) {
      const item = cart.find(item => item.id === cartItemId);
      if (item) {
        if (body.quantity !== undefined) {
          item.quantity = body.quantity;
          item.updated_at = new Date().toISOString();
        }
        cartStore.set(userId, cart);
        
        return HttpResponse.json({
          success: true,
          data: item,
          message: 'Cart item updated successfully',
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Cart item not found' },
      { status: 404 }
    );
  }),

  // Mock remove cart item endpoint
  // Matches: */api/cart/:id (any base URL)
  http.delete('*/api/cart/:id', ({ params }) => {
    const cartItemId = params.id as string;
    
    console.log('🎭 MSW: Removing cart item', { cartItemId });

    // Find and remove the cart item across all users
    for (const [userId, cart] of cartStore.entries()) {
      const itemIndex = cart.findIndex(item => item.id === cartItemId);
      if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        cartStore.set(userId, cart);
        
        return HttpResponse.json({
          success: true,
          message: 'Cart item removed successfully',
        });
      }
    }

    return HttpResponse.json(
      { success: false, error: 'Cart item not found' },
      { status: 404 }
    );
  }),

  // Mock clear cart endpoint
  // Matches: */api/cart (any base URL)
  http.delete('*/api/cart', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    // If user_id is provided, clear that user's cart
    // Otherwise, clear all carts (for testing)
    if (userId) {
      console.log('🎭 MSW: Clearing cart for user', { userId });
      cartStore.set(userId, []);
    } else {
      console.log('🎭 MSW: Clearing all carts');
      cartStore.clear();
    }

    return HttpResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  }),
];

