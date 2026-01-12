/**
 * Web Scraper Utility for Extracting Product Data from Korean E-commerce Sites
 * 
 * This utility helps extract product information from sites like:
 * - Ktown4u (ktown4u.com)
 * - Mnet Plus (mnetplus.world)
 * - Makestar (makestar.com)
 * - GQ Korea (gq.co.kr)
 * 
 * Note: Web scraping should be done responsibly:
 * - Respect robots.txt
 * - Add delays between requests
 * - Handle errors gracefully
 * - Consider using official APIs if available
 */

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

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedProductData;
  error?: string;
  warnings?: string[];
}

/**
 * Scrape product data from a URL
 * This is a client-side helper that extracts data from the page
 * For production, this should be done on the backend
 */
export async function scrapeProductFromUrl(url: string): Promise<ScrapeResult> {
  try {
    // Detect which site the URL is from
    const siteType = detectSiteType(url);
    
    if (!siteType) {
      return {
        success: false,
        error: 'Unsupported website. Supported sites: Ktown4u, Mnet Plus, Makestar, GQ Korea',
      };
    }

    // For client-side, we can only extract basic info from URL and meta tags
    // Full scraping should be done on the backend using Puppeteer/Playwright
    const basicData = await extractBasicData(url, siteType);
    
    return {
      success: true,
      data: basicData,
      warnings: [
        'This is basic extraction. For full data (images, prices, dates), use the backend scraper.',
        'Backend scraper can access full page content including JavaScript-rendered elements.',
      ],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to scrape product data',
    };
  }
}

/**
 * Detect which website the URL is from
 */
function detectSiteType(url: string): string | null {
  if (url.includes('ktown4u.com')) return 'ktown4u';
  if (url.includes('mnetplus.world') || url.includes('mnetplus.com')) return 'mnetplus';
  if (url.includes('makestar.com')) return 'makestar';
  if (url.includes('gq.co.kr')) return 'gqkorea';
  return null;
}

/**
 * Extract basic data from URL and meta tags (client-side)
 * For full scraping, use backend service
 */
async function extractBasicData(url: string, siteType: string): Promise<ScrapedProductData> {
  const data: ScrapedProductData = {
    sourceUrl: url,
    sourceSite: siteType,
  };

  // Try to fetch the page and extract meta tags
  try {
    // Note: This will fail due to CORS in browser
    // In production, this should be done on the backend
    const response = await fetch(url, {
      mode: 'no-cors', // This won't work for reading content
    });
    
    // For now, return basic structure
    // Backend scraper will fill in the details
    return data;
  } catch (error) {
    // CORS error expected - return basic data structure
    return data;
  }
}

/**
 * Backend API endpoint structure for scraping
 * This should be implemented on your backend server
 */
export interface ScrapeRequest {
  url: string;
  siteType?: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: ScrapedProductData;
  error?: string;
  rawHtml?: string; // For debugging
}

/**
 * Example backend implementation (Node.js with Puppeteer)
 * 
 * ```typescript
 * // backend/services/scraper.ts
 * import puppeteer from 'puppeteer';
 * 
 * export async function scrapeProduct(url: string): Promise<ScrapedProductData> {
 *   const browser = await puppeteer.launch();
 *   const page = await browser.newPage();
 *   
 *   await page.goto(url, { waitUntil: 'networkidle0' });
 *   
 *   // Extract data based on site type
 *   const siteType = detectSiteType(url);
 *   const data = await extractProductData(page, siteType);
 *   
 *   await browser.close();
 *   return data;
 * }
 * 
 * async function extractProductData(page: Page, siteType: string) {
 *   switch (siteType) {
 *     case 'ktown4u':
 *       return await scrapeKtown4u(page);
 *     case 'mnetplus':
 *       return await scrapeMnetPlus(page);
 *     case 'makestar':
 *       return await scrapeMakestar(page);
 *     default:
 *       throw new Error('Unsupported site');
 *   }
 * }
 * 
 * async function scrapeKtown4u(page: Page): Promise<ScrapedProductData> {
 *   const name = await page.$eval('h1.product-title', el => el.textContent);
 *   const price = await page.$eval('.price', el => el.textContent);
 *   const images = await page.$$eval('.product-images img', imgs => 
 *     imgs.map(img => img.src)
 *   );
 *   const releaseDate = await page.$eval('.release-date', el => el.textContent);
 *   
 *   return {
 *     name: name?.trim(),
 *     price: parsePrice(price),
 *     images,
 *     releaseDate: parseDate(releaseDate),
 *   };
 * }
 * ```
 */

/**
 * Helper to parse dates from Korean websites
 */
export function parseKoreanDate(dateString: string): Date | null {
  // Common formats:
  // "2026.01.19"
  // "2026-01-19"
  // "2026년 1월 19일"
  // "Release: 2026.01.19"
  
  try {
    // Remove Korean text
    let cleaned = dateString
      .replace(/년|월|일/g, '')
      .replace(/Release:|Pre-order:|Deadline:/gi, '')
      .trim();
    
    // Replace dots with dashes
    cleaned = cleaned.replace(/\./g, '-');
    
    // Try to parse
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Helper to parse prices from Korean websites
 */
export function parseKoreanPrice(priceString: string): number | null {
  // Common formats:
  // "₩35,000"
  // "35,000원"
  // "35,000 KRW"
  // "35,000"
  
  try {
    const cleaned = priceString
      .replace(/[₩원KRW,]/g, '')
      .trim();
    
    const price = parseInt(cleaned, 10);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}
