// Cart API Implementation
// GET /api/cart and POST /api/cart

// ============================================
// GET /api/cart
// Get all cart items for a user
// Query: ?user_id=uuid
// ============================================
app.get('/api/cart', async (req, res) => {
  const { user_id } = req.query;

  // Validate user_id
  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id is required'
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

  try {
    // Query cart items with product details (JOIN)
    const cartItems = await sql`
      SELECT 
        ci.id,
        ci.user_id,
        ci.product_id,
        ci.quantity,
        ci.box_type_preference,
        ci.created_at,
        ci.updated_at,
        p.name as product_name,
        p.price,
        p.currency,
        p.images,
        p.stock,
        p.status as product_status
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${user_id}
      ORDER BY ci.created_at DESC
    `;

    // Format response
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_type: item.product_status || 'onhand',
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      image_url: Array.isArray(item.images) ? item.images[0] : null,
      box_type_preference: item.box_type_preference || 'solo',
      created_at: item.created_at,
      updated_at: item.updated_at,
      product: {
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        currency: item.currency,
        images: Array.isArray(item.images) ? item.images : [],
        stock: item.stock || 0
      }
    }));

    res.json(formattedItems);

  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch cart items'
    });
  }
});

// ============================================
// POST /api/cart
// Add item to cart or update quantity if exists
// ============================================
app.post('/api/cart', async (req, res) => {
  const { user_id, product_id, quantity, box_type_preference } = req.body;

  // Validate required fields
  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({
      success: false,
      error: 'user_id, product_id, and quantity are required'
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
  if (!uuidRegex.test(product_id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product_id format. Expected UUID.'
    });
  }

  // Validate quantity
  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({
      success: false,
      error: 'quantity must be a positive integer'
    });
  }

  // Validate box_type_preference if provided
  if (box_type_preference && !['solo', 'shared'].includes(box_type_preference)) {
    return res.status(400).json({
      success: false,
      error: 'box_type_preference must be "solo" or "shared"'
    });
  }

  try {
    // Check if product exists
    const product = await sql`
      SELECT id, name, price, currency, images, stock, status
      FROM products
      WHERE id = ${product_id}
      LIMIT 1
    `;

    if (!product || product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const productData = product[0];

    // Check if cart item already exists for this user, product, and box type
    const existingItem = await sql`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ${user_id}
        AND product_id = ${product_id}
        AND box_type_preference = ${box_type_preference || 'solo'}
      LIMIT 1
    `;

    let cartItem;

    if (existingItem && existingItem.length > 0) {
      // Update existing item quantity
      const existing = existingItem[0];
      const newQuantity = existing.quantity + qty;

      await sql`
        UPDATE cart_items
        SET 
          quantity = ${newQuantity},
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      // Fetch updated item with product details
      const updated = await sql`
        SELECT 
          ci.id,
          ci.user_id,
          ci.product_id,
          ci.quantity,
          ci.box_type_preference,
          ci.created_at,
          ci.updated_at,
          p.name as product_name,
          p.price,
          p.currency,
          p.images,
          p.stock,
          p.status as product_status
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ${existing.id}
      `;

      cartItem = updated[0];
    } else {
      // Create new cart item
      const newItem = await sql`
        INSERT INTO cart_items (
          id,
          user_id,
          product_id,
          quantity,
          box_type_preference,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${user_id},
          ${product_id},
          ${qty},
          ${box_type_preference || 'solo'},
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      // Fetch created item with product details
      const created = await sql`
        SELECT 
          ci.id,
          ci.user_id,
          ci.product_id,
          ci.quantity,
          ci.box_type_preference,
          ci.created_at,
          ci.updated_at,
          p.name as product_name,
          p.price,
          p.currency,
          p.images,
          p.stock,
          p.status as product_status
        FROM cart_items ci
        INNER JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ${newItem[0].id}
      `;

      cartItem = created[0];
    }

    // Format response
    const response = {
      id: cartItem.id,
      product_id: cartItem.product_id,
      product_name: cartItem.product_name,
      product_type: cartItem.product_status || 'onhand',
      quantity: cartItem.quantity,
      price: cartItem.price,
      currency: cartItem.currency,
      image_url: Array.isArray(cartItem.images) ? cartItem.images[0] : null,
      box_type_preference: cartItem.box_type_preference || 'solo',
      created_at: cartItem.created_at,
      updated_at: cartItem.updated_at,
      product: {
        id: cartItem.product_id,
        name: cartItem.product_name,
        price: cartItem.price,
        currency: cartItem.currency,
        images: Array.isArray(cartItem.images) ? cartItem.images : [],
        stock: cartItem.stock || 0
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add item to cart'
    });
  }
});

