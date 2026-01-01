// Order API Implementation
// GET /api/orders, GET /api/orders/:id, POST /api/orders

// ============================================
// GET /api/orders/:id
// Get a specific order by ID
// ============================================
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order ID format. Expected UUID.'
    });
  }

  try {
    // Get order with order items
    const orders = await sql`
      SELECT 
        o.id,
        o.user_id,
        o.order_number,
        o.subtotal,
        o.isf,
        o.lsf,
        o.shipping_fee,
        o.solo_shipping_fee,
        o.shared_shipping_fee,
        o.total,
        o.currency,
        o.status,
        o.payment_status,
        o.payment_type,
        o.payment_method,
        o.downpayment_amount,
        o.balance,
        o.qr_code,
        o.box_type_preference,
        o.shipping_address,
        o.fulfillment_status,
        o.box_id,
        o.ph_courier_tracking_number,
        o.ph_courier_name,
        o.created_at,
        o.updated_at,
        o.paid_at
      FROM orders o
      WHERE o.id = ${id}
    `;

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const orderItems = await sql`
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.product_name,
        oi.product_type,
        oi.quantity,
        oi.unit_price,
        oi.total,
        oi.image_url,
        oi.preorder_release_date
      FROM order_items oi
      WHERE oi.order_id = ${id}
      ORDER BY oi.created_at ASC
    `;

    // Format response
    const response = {
      success: true,
      order: {
        id: order.id,
        user_id: order.user_id,
        order_number: order.order_number,
        subtotal: parseFloat(order.subtotal),
        isf: parseFloat(order.isf || 0),
        lsf: parseFloat(order.lsf || 0),
        shipping_fee: parseFloat(order.shipping_fee || 0),
        solo_shipping_fee: order.solo_shipping_fee ? parseFloat(order.solo_shipping_fee) : null,
        shared_shipping_fee: order.shared_shipping_fee ? parseFloat(order.shared_shipping_fee) : null,
        total: parseFloat(order.total),
        currency: order.currency,
        status: order.status,
        payment_status: order.payment_status,
        payment_type: order.payment_type,
        payment_method: order.payment_method,
        downpayment_amount: order.downpayment_amount ? parseFloat(order.downpayment_amount) : null,
        balance: order.balance ? parseFloat(order.balance) : null,
        qr_code: order.qr_code,
        box_type_preference: order.box_type_preference,
        shipping_address: order.shipping_address,
        fulfillment_status: order.fulfillment_status,
        box_id: order.box_id,
        ph_courier_tracking_number: order.ph_courier_tracking_number,
        ph_courier_name: order.ph_courier_name,
        created_at: order.created_at,
        updated_at: order.updated_at,
        paid_at: order.paid_at,
        order_items: orderItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_type: item.product_type,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total: parseFloat(item.total),
          image_url: item.image_url,
          preorder_release_date: item.preorder_release_date
        }))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
});

// ============================================
// GET /api/orders
// Get orders with optional filters
// Query: ?user_id=uuid&status=pending&payment_status=paid
// ============================================
app.get('/api/orders', async (req, res) => {
  const { user_id, status, payment_status } = req.query;

  // Validate user_id if provided
  if (user_id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user_id format. Expected UUID.'
      });
    }
  }

  try {
    // Build query dynamically
    let query = sql`
      SELECT 
        o.id,
        o.user_id,
        o.order_number,
        o.subtotal,
        o.isf,
        o.lsf,
        o.shipping_fee,
        o.total,
        o.currency,
        o.status,
        o.payment_status,
        o.payment_type,
        o.box_type_preference,
        o.fulfillment_status,
        o.box_id,
        o.ph_courier_tracking_number,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;

    if (user_id) {
      query = sql`${query} AND o.user_id = ${user_id}`;
    }

    if (status) {
      query = sql`${query} AND o.status = ${status}`;
    }

    if (payment_status) {
      query = sql`${query} AND o.payment_status = ${payment_status}`;
    }

    query = sql`${query} GROUP BY o.id ORDER BY o.created_at DESC`;

    const orders = await query;

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await sql`
          SELECT 
            oi.id,
            oi.product_id,
            oi.product_name,
            oi.product_type,
            oi.quantity,
            oi.unit_price,
            oi.total,
            oi.image_url
          FROM order_items oi
          WHERE oi.order_id = ${order.id}
          ORDER BY oi.created_at ASC
        `;

        return {
          id: order.id,
          user_id: order.user_id,
          order_number: order.order_number,
          subtotal: parseFloat(order.subtotal),
          isf: parseFloat(order.isf || 0),
          lsf: parseFloat(order.lsf || 0),
          shipping_fee: parseFloat(order.shipping_fee || 0),
          total: parseFloat(order.total),
          currency: order.currency,
          status: order.status,
          payment_status: order.payment_status,
          payment_type: order.payment_type,
          box_type_preference: order.box_type_preference,
          fulfillment_status: order.fulfillment_status,
          box_id: order.box_id,
          ph_courier_tracking_number: order.ph_courier_tracking_number,
          items_count: parseInt(order.items_count),
          order_items: orderItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_type: item.product_type,
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            total: parseFloat(item.total),
            image_url: item.image_url
          })),
          created_at: order.created_at,
          updated_at: order.updated_at
        };
      })
    );

    res.json({
      success: true,
      orders: ordersWithItems,
      total: ordersWithItems.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// ============================================
// POST /api/orders
// Create a new order
// ============================================
app.post('/api/orders', async (req, res) => {
  const {
    user_id,
    order_number,
    subtotal,
    isf,
    lsf,
    shipping_fee,
    solo_shipping_fee,
    shared_shipping_fee,
    total,
    currency,
    status,
    payment_status,
    payment_type,
    payment_method,
    downpayment_amount,
    balance,
    qr_code,
    box_type_preference,
    shipping_address,
    order_items
  } = req.body;

  // Validate required fields
  if (!user_id || !order_number || !subtotal || !total || !currency || !status || !payment_status || !payment_type || !box_type_preference || !shipping_address || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'user_id, order_number, subtotal, total, currency, status, payment_status, payment_type, box_type_preference, shipping_address, and order_items are required'
    });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user_id format. Expected UUID.'
    });
  }

  // Validate order items
  for (const item of order_items) {
    if (!item.product_id || !item.product_name || !item.product_type || !item.quantity || !item.unit_price || !item.total) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order item',
        message: 'Each order item must have product_id, product_name, product_type, quantity, unit_price, and total'
      });
    }

    if (!uuidRegex.test(item.product_id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid product_id format for item: ${item.product_name}. Expected UUID.`
      });
    }
  }

  // Validate payment_type
  if (payment_type === 'downpayment') {
    if (!downpayment_amount || downpayment_amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'downpayment_amount is required when payment_type is "downpayment"'
      });
    }
  }

  try {
    // Start transaction
    await sql`BEGIN`;

    // Insert order
    const orderResult = await sql`
      INSERT INTO orders (
        user_id,
        order_number,
        subtotal,
        isf,
        lsf,
        shipping_fee,
        solo_shipping_fee,
        shared_shipping_fee,
        total,
        currency,
        status,
        payment_status,
        payment_type,
        payment_method,
        downpayment_amount,
        balance,
        qr_code,
        box_type_preference,
        shipping_address
      ) VALUES (
        ${user_id},
        ${order_number},
        ${subtotal},
        ${isf || 0},
        ${lsf || 0},
        ${shipping_fee || 0},
        ${solo_shipping_fee || null},
        ${shared_shipping_fee || null},
        ${total},
        ${currency},
        ${status},
        ${payment_status},
        ${payment_type},
        ${payment_method ? JSON.stringify(payment_method) : null},
        ${downpayment_amount || null},
        ${balance || null},
        ${qr_code || null},
        ${box_type_preference},
        ${shipping_address ? JSON.stringify(shipping_address) : null}
      )
      RETURNING id, created_at, updated_at
    `;

    if (!orderResult || orderResult.length === 0) {
      await sql`ROLLBACK`;
      return res.status(500).json({
        success: false,
        error: 'Failed to create order'
      });
    }

    const orderId = orderResult[0].id;

    // Insert order items
    const orderItemsPromises = order_items.map(item =>
      sql`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_type,
          quantity,
          unit_price,
          total,
          image_url,
          preorder_release_date
        ) VALUES (
          ${orderId},
          ${item.product_id},
          ${item.product_name},
          ${item.product_type},
          ${item.quantity},
          ${item.unit_price},
          ${item.total},
          ${item.image_url || null},
          ${item.preorder_release_date || null}
        )
        RETURNING id
      `
    );

    await Promise.all(orderItemsPromises);

    // Commit transaction
    await sql`COMMIT`;

    // Fetch the created order with items
    const createdOrder = await sql`
      SELECT 
        o.id,
        o.user_id,
        o.order_number,
        o.subtotal,
        o.isf,
        o.lsf,
        o.shipping_fee,
        o.solo_shipping_fee,
        o.shared_shipping_fee,
        o.total,
        o.currency,
        o.status,
        o.payment_status,
        o.payment_type,
        o.payment_method,
        o.downpayment_amount,
        o.balance,
        o.qr_code,
        o.box_type_preference,
        o.shipping_address,
        o.fulfillment_status,
        o.box_id,
        o.ph_courier_tracking_number,
        o.ph_courier_name,
        o.created_at,
        o.updated_at,
        o.paid_at
      FROM orders o
      WHERE o.id = ${orderId}
    `;

    const orderItemsResult = await sql`
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.product_name,
        oi.product_type,
        oi.quantity,
        oi.unit_price,
        oi.total,
        oi.image_url,
        oi.preorder_release_date
      FROM order_items oi
      WHERE oi.order_id = ${orderId}
      ORDER BY oi.created_at ASC
    `;

    const order = createdOrder[0];

    // Log successful order creation
    console.log('Order created successfully:', {
      orderId: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      total: order.total
    });

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        user_id: order.user_id,
        order_number: order.order_number,
        subtotal: parseFloat(order.subtotal),
        isf: parseFloat(order.isf || 0),
        lsf: parseFloat(order.lsf || 0),
        shipping_fee: parseFloat(order.shipping_fee || 0),
        solo_shipping_fee: order.solo_shipping_fee ? parseFloat(order.solo_shipping_fee) : null,
        shared_shipping_fee: order.shared_shipping_fee ? parseFloat(order.shared_shipping_fee) : null,
        total: parseFloat(order.total),
        currency: order.currency,
        status: order.status,
        payment_status: order.payment_status,
        payment_type: order.payment_type,
        payment_method: order.payment_method,
        downpayment_amount: order.downpayment_amount ? parseFloat(order.downpayment_amount) : null,
        balance: order.balance ? parseFloat(order.balance) : null,
        qr_code: order.qr_code,
        box_type_preference: order.box_type_preference,
        shipping_address: order.shipping_address,
        fulfillment_status: order.fulfillment_status,
        box_id: order.box_id,
        ph_courier_tracking_number: order.ph_courier_tracking_number,
        ph_courier_name: order.ph_courier_name,
        created_at: order.created_at,
        updated_at: order.updated_at,
        paid_at: order.paid_at,
        order_items: orderItemsResult.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_type: item.product_type,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total: parseFloat(item.total),
          image_url: item.image_url,
          preorder_release_date: item.preorder_release_date
        }))
      }
    });
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
    // Provide detailed error response
    const errorMessage = error.message || 'Unknown error';
    const errorDetails = {
      error: 'Internal server error',
      message: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    res.status(500).json(errorDetails);
  }
});

