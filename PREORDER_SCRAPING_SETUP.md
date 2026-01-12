# Preorder Scraping Setup Guide - Ktown4u Events

## Overview

This guide explains how to set up preorder scraping for Korean event websites (Ktown4u, Mnet Plus, Makestar) so customers can reserve and pay for preorder items like K-pop albums, photobooks, and merchandise.

**Example URL**: `https://www.ktown4u.com/eventinfo?eve_no=43965357&biz_no=220`

---

## Current Status

### ✅ Already Implemented (Frontend)

1. **Preorder Import Page**: `/admin/inventory/preorder-import`
   - UI for entering event URLs
   - Form fields for preorder data (dates, deadlines, deposit, etc.)
   - Calls scraping API and saves to backend

2. **Scraping API Route**: `/api/products/scrape`
   - Updated to detect Ktown4u URLs
   - Basic Ktown4u scraper implemented (uses cheerio)
   - Extracts: name, price, images, description, release date, preorder deadline

3. **Frontend Integration**: The preorder-import page expects:
   - Scraped data with preorder fields
   - Backend endpoint: `POST /api/admin/inventory` (for saving)

### ❌ Missing (Backend & Database)

1. **Backend API Endpoint**: `POST /api/admin/inventory` (or `/api/admin/scrape-product`)
2. **Database Schema**: Verify preorder fields exist in `products` table
3. **Enhanced Scraping**: Current scraper is basic - may need Puppeteer for JavaScript-rendered content

---

## How It Works

### Flow Diagram

```
Admin enters Ktown4u URL
    ↓
Frontend calls /api/products/scrape
    ↓
Scraper extracts event data (name, price, images, dates)
    ↓
Admin reviews/edits scraped data
    ↓
Frontend calls POST /api/admin/inventory
    ↓
Backend saves preorder product to database
    ↓
Customers can browse and reserve preorders
```

---

## Requirements & Setup

### 1. Database Schema (Neon PostgreSQL)

The `products` table needs to support preorder fields. Run this SQL to verify/add columns:

```sql
-- Check if preorder columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('order_date', 'order_deadline', 'release_date', 'product_type');

-- If missing, add preorder fields (adjust as needed)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS order_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'onhand' 
  CHECK (product_type IN ('onhand', 'preorder', 'kr_website', 'preorder_and_onhand')),
ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS preorder_available_stock INTEGER,
ADD COLUMN IF NOT EXISTS preorders_claimed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_time_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Update existing products table structure if needed
-- (Run the full schema from COMPLETE_SCHEMA_AND_SEED.sql if table doesn't exist)
```

### 2. Backend API Endpoint

Create `POST /api/admin/inventory` endpoint that accepts preorder product data:

```javascript
// routes/admin/inventory.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateAdmin } = require('../middleware/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// POST /api/admin/inventory - Create product (including preorders)
router.post('/', authenticateAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      name,
      description,
      price,
      currency = 'KRW',
      images,
      category,
      brand,
      sku,
      stock = 0,
      status = 'active',
      product_type = 'preorder', // Default for preorder imports
      weight,
      dimensions,
      // Preorder-specific fields
      order_date,
      order_deadline,
      release_date,
      deposit_percentage = 50,
      preorder_available_stock,
      preorders_claimed = 0,
      shipping_time_days = 14,
      source_url
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required',
        message: 'Product name cannot be empty'
      });
    }

    if (!price || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid price is required',
        message: 'Price must be a positive number'
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one product image is required',
        message: 'Please provide at least one image URL'
      });
    }

    // For preorder products, release_date is typically required
    if (product_type === 'preorder' && !release_date) {
      return res.status(400).json({
        success: false,
        error: 'Release date is required for preorder products',
        message: 'Please provide a release date'
      });
    }

    await client.query('BEGIN');

    // Insert product with preorder fields
    const insertQuery = `
      INSERT INTO products (
        name, description, price, currency, images, category, brand, sku,
        stock, weight, length, width, height, status, product_type,
        order_date, order_deadline, release_date,
        deposit_percentage, preorder_available_stock, preorders_claimed,
        shipping_time_days, source_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING *
    `;

    const values = [
      name.trim(),
      description?.trim() || null,
      price,
      currency,
      images,
      category?.trim() || null,
      brand?.trim() || null,
      sku?.trim() || null,
      stock,
      weight || null,
      dimensions?.length || null,
      dimensions?.width || null,
      dimensions?.height || null,
      status,
      product_type,
      order_date ? new Date(order_date) : null,
      order_deadline ? new Date(order_deadline) : null,
      release_date ? new Date(release_date) : null,
      deposit_percentage,
      preorder_available_stock || null,
      preorders_claimed,
      shipping_time_days,
      source_url || null
    ];

    const result = await client.query(insertQuery, values);
    const product = result.rows[0];

    await client.query('COMMIT');

    // Format response
    const responseData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      currency: product.currency,
      images: product.images,
      category: product.category,
      brand: product.brand,
      sku: product.sku,
      stock: product.stock,
      status: product.status,
      product_type: product.product_type,
      order_date: product.order_date,
      order_deadline: product.order_deadline,
      release_date: product.release_date,
      deposit_percentage: product.deposit_percentage,
      preorder_available_stock: product.preorder_available_stock,
      preorders_claimed: product.preorders_claimed,
      shipping_time_days: product.shipping_time_days,
      source_url: product.source_url,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    res.status(201).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Error creating preorder product:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Duplicate SKU',
        message: 'A product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create preorder product',
      message: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
```

### 3. Update Frontend Service (Optional)

The preorder-import page already calls `/api/admin/inventory`, but verify `src/services/productService.ts` uses the correct endpoint:

```typescript
async createProduct(productData: Partial<Product>): Promise<Product> {
  try {
    const response = await apiClient.post<GetProductResponse>('/admin/inventory', productData);
    return response.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
```

---

## Scraping Ktown4u Events

### Current Implementation

The scraper (`src/lib/productScraper.ts`) now includes basic Ktown4u support:
- Detects `ktown4u.com` URLs
- Extracts name, price, images, description
- Attempts to extract release dates and deadlines
- Uses cheerio (server-side HTML parsing)

### Limitations

The current scraper uses **cheerio**, which only parses static HTML. Ktown4u may use JavaScript to render content, so:

1. **Basic scraping works** for static content (Open Graph tags, meta tags)
2. **May miss data** that's loaded via JavaScript
3. **For better results**, consider using Puppeteer/Playwright (see Enhanced Scraping below)

### Testing the Scraper

Test with a Ktown4u URL:

```bash
curl -X POST http://localhost:3000/api/products/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.ktown4u.com/eventinfo?eve_no=43965357&biz_no=220"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "name": "Event/Product Name",
    "description": "...",
    "price": 35000,
    "currency": "KRW",
    "images": ["https://..."],
    "brand": "Artist Name",
    "category": "k-pop",
    "releaseDate": "2026-01-19",
    "preorderDeadline": "2026-01-15",
    "sourceUrl": "https://www.ktown4u.com/eventinfo?eve_no=43965357&biz_no=220"
  }
}
```

---

## Enhanced Scraping (Optional - For Better Results)

If the basic scraper doesn't extract enough data, implement a Puppeteer-based scraper on your backend:

### Backend Scraper with Puppeteer

```javascript
// backend/services/ktown4uScraper.js
const puppeteer = require('puppeteer');

async function scrapeKtown4uEvent(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Extract data using page.evaluate
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent?.trim() : null;
      };
      
      const getImages = (selector) => {
        const imgs = Array.from(document.querySelectorAll(selector));
        return imgs.map(img => img.src || img.getAttribute('data-src')).filter(Boolean);
      };
      
      return {
        name: getText('h1.event-title, .event-title, h1'),
        price: getText('.event-price, .price-event, [class*="price"]'),
        images: getImages('.event-banner img, .event-image img, .product-images img'),
        description: getText('.event-description, .event-detail'),
        releaseDate: getText('[class*="release"], [class*="date"]'),
        brand: getText('.event-artist, .artist-name')
      };
    });
    
    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

module.exports = { scrapeKtown4uEvent };
```

**Note**: Puppeteer requires additional setup and dependencies. Use only if cheerio scraping is insufficient.

---

## Customer Preorder Flow

Once products are imported, customers can:

1. **Browse Preorders**: Visit `/store/products/preorder`
2. **View Details**: See release dates, deadlines, deposit percentages
3. **Reserve Items**: Add to cart and checkout
4. **Pay Deposit**: Pay partial amount (e.g., 50% deposit)
5. **Pay Balance**: Pay remaining balance before release
6. **Track Orders**: Monitor order status until delivery

---

## Testing the Complete Flow

### Step 1: Test Scraping

1. Go to `/admin/inventory/preorder-import`
2. Enter Ktown4u URL: `https://www.ktown4u.com/eventinfo?eve_no=43965357&biz_no=220`
3. Click "Extract Data"
4. Verify scraped data appears in form

### Step 2: Test Product Creation

1. Fill in any missing fields (deposit %, stock, etc.)
2. Set release date and deadline
3. Click "Create Pre-Order Product"
4. Check browser console for errors
5. Verify product appears in `/admin/inventory`

### Step 3: Verify Database

```sql
SELECT id, name, price, product_type, release_date, order_deadline, source_url
FROM products
WHERE product_type = 'preorder'
ORDER BY created_at DESC
LIMIT 5;
```

### Step 4: Test Customer View

1. Go to `/store/products/preorder`
2. Verify imported preorder appears
3. Check that dates, prices, and images display correctly

---

## Troubleshooting

### Issue: Scraping Returns Empty Data

**Solutions**:
- Ktown4u may block scraping or use JavaScript rendering
- Try the URL in a browser to verify it's accessible
- Consider implementing Puppeteer scraper for better results
- Check server logs for scraping errors
- Some event pages may require authentication

### Issue: Dates Not Extracted

**Solutions**:
- Dates may be in Korean format or embedded in text
- Manually enter dates in the form after scraping
- The scraper extracts basic date patterns - complex formats may need manual entry
- Consider adding date parsing logic for Korean date formats

### Issue: "Failed to create preorder product"

**Solutions**:
1. Check backend logs for database errors
2. Verify `products` table has all preorder columns
3. Check that dates are in ISO format (YYYY-MM-DD)
4. Verify admin authentication token is valid
5. Check CORS settings if calling from frontend

### Issue: Images Not Loading

**Solutions**:
- Ktown4u images may be blocked by CORS
- Consider downloading and hosting images on your CDN
- Check image URLs are absolute (start with http/https)
- Some images may require authentication to view

---

## Database Schema Reference

Ensure your `products` table has these columns for preorders:

```sql
-- Required columns
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
price DECIMAL(10,2) NOT NULL
currency VARCHAR(10) DEFAULT 'KRW'
images TEXT[] -- Array of image URLs
product_type VARCHAR(50) -- 'preorder', 'onhand', etc.

-- Preorder-specific columns
order_date TIMESTAMP WITH TIME ZONE
order_deadline TIMESTAMP WITH TIME ZONE
release_date TIMESTAMP WITH TIME ZONE
deposit_percentage INTEGER DEFAULT 50
preorder_available_stock INTEGER
preorders_claimed INTEGER DEFAULT 0
shipping_time_days INTEGER DEFAULT 14
source_url TEXT -- Original Ktown4u URL
```

---

## Summary Checklist

### Frontend (✅ Mostly Done)
- [x] Preorder import page exists
- [x] Scraping API route exists
- [x] Ktown4u detection added
- [x] Basic Ktown4u scraper implemented
- [ ] Test with real Ktown4u URLs

### Backend (❌ Need to Implement)
- [ ] Create `POST /api/admin/inventory` endpoint
- [ ] Add preorder field support
- [ ] Implement authentication check
- [ ] Add error handling
- [ ] Test with sample data

### Database (⚠️ Verify)
- [ ] Verify `products` table exists
- [ ] Check preorder columns exist
- [ ] Add missing columns if needed
- [ ] Test INSERT query
- [ ] Verify connection string

### Enhanced Scraping (Optional)
- [ ] Evaluate if Puppeteer is needed
- [ ] Implement Puppeteer scraper if needed
- [ ] Test with JavaScript-rendered pages

---

## Next Steps

1. **Implement Backend Endpoint**: Create `POST /api/admin/inventory` with preorder support
2. **Verify Database**: Run SQL to check/add preorder columns
3. **Test Scraping**: Try scraping a real Ktown4u URL
4. **Test Full Flow**: Import a preorder product end-to-end
5. **Monitor**: Check logs for scraping/database errors
6. **Enhance**: Add Puppeteer scraper if needed for better data extraction

---

## Related Documentation

- `ADMIN_WEB_SCRAPING_SETUP.md` - General scraping setup
- `docs/WEB_SCRAPING_IMPLEMENTATION.md` - Scraping architecture
- `API_ENDPOINTS.md` - API specifications
- `database/COMPLETE_SCHEMA_AND_SEED.sql` - Full database schema

---

## Example: Complete Preorder Import

1. **Admin Action**:
   - Navigate to `/admin/inventory/preorder-import`
   - Enter: `https://www.ktown4u.com/eventinfo?eve_no=43965357&biz_no=220`
   - Click "Extract Data"

2. **System Scrapes**:
   - Extracts: Name, price, images, description
   - Detects: Release date, deadline (if available)

3. **Admin Reviews**:
   - Edits scraped data if needed
   - Sets: Deposit % (50%), Available stock (500), Shipping days (14)
   - Confirms: Release date, deadline

4. **System Saves**:
   - Creates preorder product in database
   - Sets `product_type = 'preorder'`
   - Stores source URL for reference

5. **Customers Browse**:
   - Visit `/store/products/preorder`
   - See new preorder with countdown, progress, payment info
   - Can reserve and pay deposit

---

For questions or issues, check the troubleshooting section or review server logs.
