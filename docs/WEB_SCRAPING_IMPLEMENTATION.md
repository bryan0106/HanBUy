# Web Scraping Implementation Guide

## Overview

This guide explains how to implement web scraping for importing pre-order products from Korean e-commerce websites (Ktown4u, Mnet Plus, Makestar, etc.) into the admin dashboard.

## Architecture

### Frontend (Admin Dashboard)
- **Page**: `/admin/inventory/preorder-import`
- **Component**: Preorder import form with URL input
- **Service**: `src/utils/webScraper.ts` (client-side helpers)

### Backend (API)
- **Endpoint**: `POST /api/admin/scrape-product`
- **Service**: Backend scraper using Puppeteer/Playwright
- **Database**: Store scraped products

---

## Implementation Steps

### 1. Backend Scraper Service

Create a backend service to scrape product data:

```typescript
// backend/services/scraper.ts
import puppeteer from 'puppeteer';
import { detectSiteType, parseKoreanDate, parseKoreanPrice } from './scraperUtils';

export interface ScrapedProductData {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  images?: string[];
  releaseDate?: string;
  preorderDeadline?: string;
  preorderStartDate?: string;
  expectedArrival?: string;
  brand?: string;
  category?: string;
  sourceUrl: string;
  sourceSite: string;
}

export async function scrapeProduct(url: string): Promise<ScrapedProductData> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const siteType = detectSiteType(url);
    const data = await extractProductData(page, siteType, url);
    
    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function extractProductData(
  page: Page, 
  siteType: string, 
  url: string
): Promise<ScrapedProductData> {
  switch (siteType) {
    case 'ktown4u':
      return await scrapeKtown4u(page, url);
    case 'mnetplus':
      return await scrapeMnetPlus(page, url);
    case 'makestar':
      return await scrapeMakestar(page, url);
    default:
      throw new Error(`Unsupported site: ${siteType}`);
  }
}

async function scrapeKtown4u(page: Page, url: string): Promise<ScrapedProductData> {
  const data: ScrapedProductData = {
    sourceUrl: url,
    sourceSite: 'ktown4u',
  };

  // Extract product name
  try {
    data.name = await page.$eval('h1.product-title, .event-title', el => el.textContent?.trim());
  } catch {}

  // Extract price
  try {
    const priceText = await page.$eval('.price, .event-price', el => el.textContent?.trim());
    data.price = parseKoreanPrice(priceText || '');
  } catch {}

  // Extract images
  try {
    data.images = await page.$$eval('.product-images img, .event-banner img', imgs => 
      imgs.map(img => (img as HTMLImageElement).src).filter(Boolean)
    );
  } catch {}

  // Extract release date
  try {
    const releaseText = await page.$eval('.release-date, .event-date', el => el.textContent?.trim());
    data.releaseDate = parseKoreanDate(releaseText || '')?.toISOString();
  } catch {}

  // Extract description
  try {
    data.description = await page.$eval('.product-description, .event-description', el => el.textContent?.trim());
  } catch {}

  return data;
}

async function scrapeMnetPlus(page: Page, url: string): Promise<ScrapedProductData> {
  const data: ScrapedProductData = {
    sourceUrl: url,
    sourceSite: 'mnetplus',
  };

  // Mnet Plus specific selectors
  try {
    data.name = await page.$eval('h1.product-name, .album-title', el => el.textContent?.trim());
  } catch {}

  try {
    const priceText = await page.$eval('.price, .product-price', el => el.textContent?.trim());
    data.price = parseKoreanPrice(priceText || '');
  } catch {}

  try {
    data.images = await page.$$eval('.product-image img, .album-cover img', imgs => 
      imgs.map(img => (img as HTMLImageElement).src).filter(Boolean)
    );
  } catch {}

  // Extract pre-order period
  try {
    const preorderText = await page.$eval('.preorder-period', el => el.textContent?.trim());
    const dates = extractDatesFromText(preorderText || '');
    data.preorderStartDate = dates.start;
    data.preorderDeadline = dates.end;
  } catch {}

  return data;
}

async function scrapeMakestar(page: Page, url: string): Promise<ScrapedProductData> {
  const data: ScrapedProductData = {
    sourceUrl: url,
    sourceSite: 'makestar',
  };

  // Makestar specific selectors
  try {
    data.name = await page.$eval('h1.product-title, .project-title', el => el.textContent?.trim());
  } catch {}

  try {
    const priceText = await page.$eval('.price, .project-price', el => el.textContent?.trim());
    data.price = parseKoreanPrice(priceText || '');
  } catch {}

  try {
    data.images = await page.$$eval('.product-gallery img, .project-images img', imgs => 
      imgs.map(img => (img as HTMLImageElement).src).filter(Boolean)
    );
  } catch {}

  return data;
}
```

### 2. Backend API Endpoint

Create the API endpoint:

```typescript
// backend/routes/admin/scraper.ts
import { Router } from 'express';
import { scrapeProduct } from '../../services/scraper';
import { authenticateAdmin } from '../../middleware/auth';

const router = Router();

router.post('/scrape-product', authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    const data = await scrapeProduct(url);
    
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape product',
    });
  }
});

export default router;
```

### 3. Frontend Integration

The frontend page (`/admin/inventory/preorder-import`) is already created. It will:
1. Accept URL input from admin
2. Call `/api/admin/scrape-product` endpoint
3. Display scraped data
4. Allow admin to edit and save

---

## Supported Websites

### Ktown4u (ktown4u.com)
- **Selectors**: `.product-title`, `.event-title`, `.price`, `.release-date`
- **Data**: Name, price, images, release date, description

### Mnet Plus (mnetplus.world)
- **Selectors**: `.product-name`, `.album-title`, `.price`, `.preorder-period`
- **Data**: Name, price, images, pre-order period, release date

### Makestar (makestar.com)
- **Selectors**: `.product-title`, `.project-title`, `.price`, `.project-images`
- **Data**: Name, price, images, event dates

---

## Best Practices

### 1. Rate Limiting
- Add delays between requests (2-3 seconds)
- Use request queue for multiple URLs
- Respect robots.txt

### 2. Error Handling
- Handle missing selectors gracefully
- Retry failed requests (max 3 times)
- Log errors for debugging

### 3. Data Validation
- Validate scraped data before saving
- Allow admin to edit before publishing
- Store source URL for reference

### 4. Legal Considerations
- Check website's Terms of Service
- Use scraping responsibly
- Consider using official APIs if available

### 5. Performance
- Use headless browser efficiently
- Cache scraped data when possible
- Run scraping in background jobs

---

## Alternative: Manual Entry with URL Helper

If scraping is not feasible, you can:

1. **URL Helper**: Extract basic info from URL (product ID, site type)
2. **Manual Entry**: Admin fills in remaining details
3. **Template**: Pre-fill form based on site type

```typescript
// Extract product ID from URL
function extractProductId(url: string): string | null {
  const ktown4uMatch = url.match(/eve_no=(\d+)/);
  if (ktown4uMatch) return ktown4uMatch[1];
  
  const mnetMatch = url.match(/products\/(\d+)/);
  if (mnetMatch) return mnetMatch[1];
  
  return null;
}
```

---

## Testing

1. Test with sample URLs from each supported site
2. Verify all fields are extracted correctly
3. Test error handling (invalid URLs, missing data)
4. Test with different product types (albums, photobooks, merchandise)

---

## Future Enhancements

1. **Scheduled Scraping**: Automatically check for new products
2. **Price Monitoring**: Track price changes
3. **Stock Monitoring**: Monitor availability
4. **Notification System**: Alert when new products found
5. **Bulk Import**: Import multiple products at once

---

## Dependencies

```json
{
  "puppeteer": "^21.0.0",
  "cheerio": "^1.0.0-rc.12",
  "axios": "^1.6.0"
}
```

---

## Example Usage

```typescript
// Admin enters URL in dashboard
const url = "https://www.ktown4u.com/eventinfo?eve_no=43956132";

// Backend scrapes the URL
const data = await scrapeProduct(url);

// Returns:
{
  name: "V (BTS) [TYPE 非] (Photobook + POSTER SET)",
  price: 35000,
  currency: "KRW",
  images: ["https://..."],
  releaseDate: "2026-01-19T00:00:00.000Z",
  sourceUrl: "https://www.ktown4u.com/eventinfo?eve_no=43956132",
  sourceSite: "ktown4u"
}

// Admin reviews and saves to database
```
