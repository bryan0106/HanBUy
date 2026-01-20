import { http, HttpResponse } from 'msw';

// MSW handlers - Use pattern matching to catch requests regardless of base URL
// MSW will match requests that match these patterns

// In-memory storage for orders (simulates database)
const ordersStore: Map<string, any[]> = new Map();

// In-memory storage for pasabuy requests (simulates database)
const pasabuyStore: Map<string, any[]> = new Map();

// In-memory storage for cart items (simulates database)
const cartStore: Map<string, any[]> = new Map();

export const handlers = [
  // Mock bank types endpoint
  // Matches: */api/bank-type (any base URL)
  http.get('*/api/bank-type', () => {
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
    
    console.log('🎭 MSW: Mocking payment confirmation - Auto-verified');

    return HttpResponse.json({
      success: true,
      data: {
        payment_id: formData?.get('payment_id')?.toString() || crypto.randomUUID(),
        order_id: formData?.get('order_id')?.toString() || '',
        amount: Number(formData?.get('amount') || 0),
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
    const body: any = await request.json().catch(() => ({}));
    
    console.log('🎭 MSW: Creating order', { userId: body.user_id, orderNumber: body.order_number });

    const userId = body.user_id;
    if (!userId) {
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

    // Create new order
    const newOrder = {
      id: crypto.randomUUID(),
      user_id: userId,
      order_number: body.order_number || `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
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
      box_type_preference: body.box_type_preference || 'solo',
      box_size: body.box_size,
      shared_box_id: body.shared_box_id,
      shipping_address: body.shipping_address || {},
      storage_status: body.storage_status || 'pending',
      shipping_payment_status: body.shipping_payment_status,
      shipping_requested_at: body.shipping_requested_at,
      order_items: body.order_items || [],
      customer_message: body.customer_message,
      preorder_status: body.preorder_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add order to store
    userOrders.unshift(newOrder);
    ordersStore.set(userId, userOrders);

    console.log('✅ MSW: Order created successfully', { orderId: newOrder.id, orderNumber: newOrder.order_number });

    return HttpResponse.json({
      success: true,
      data: newOrder,
      message: 'Order created successfully',
    });
  }),

  // Mock get orders endpoint
  // Matches: */api/orders (any base URL)
  http.get('*/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    console.log('🎭 MSW: Fetching orders', { userId });

    if (userId) {
      // Get orders for specific user
      const userOrders = ordersStore.get(userId) || [];
      return HttpResponse.json({
        success: true,
        data: userOrders,
        total: userOrders.length,
      });
    } else {
      // Get all orders (admin view)
      const allOrders: any[] = [];
      ordersStore.forEach((orders) => {
        allOrders.push(...orders);
      });
      return HttpResponse.json({
        success: true,
        data: allOrders,
        total: allOrders.length,
      });
    }
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

