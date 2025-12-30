// Product scraper service - Extracts product data from e-commerce URLs
import { load } from "cheerio";

export interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  brand?: string;
  sku?: string;
  category?: string;
  stock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
}

// Detect website type from URL
export function detectWebsite(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes("gmarket.co.kr")) return "gmarket";
  if (hostname.includes("coupang.com")) return "coupang";
  if (hostname.includes("11st.co.kr")) return "11st";
  if (hostname.includes("auction.co.kr")) return "auction";
  if (hostname.includes("amazon.com") || hostname.includes("amazon.co.kr")) return "amazon";
  if (hostname.includes("ebay.com")) return "ebay";
  if (hostname.includes("shopee")) return "shopee";
  if (hostname.includes("lazada")) return "lazada";
  
  return "generic";
}

// Helper function to extract price from text
function extractPrice(text: string): number {
  if (!text) return 0;
  // Remove all non-digit characters except comma and period
  const cleaned = text.replace(/[^\d,.]/g, "");
  // Try to find numbers (handle both comma and period as thousands separators)
  const match = cleaned.match(/[\d,]+/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ""));
  }
  return 0;
}

// Helper function to normalize image URL
function normalizeImageUrl(url: string, baseUrl: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("/")) {
    const base = new URL(baseUrl);
    return `${base.origin}${url}`;
  }
  return url;
}

// Generic scraper using Open Graph and common meta tags
async function scrapeGeneric(url: string): Promise<ScrapedProduct> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = load(html);
  
  // Extract using Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  
  // Extract price from various common selectors
  let price = 0;
  let currency = "KRW";
  
  // Try JSON-LD structured data (multiple scripts)
  $('script[type="application/ld+json"]').each((_, el) => {
    if (price > 0) return; // Already found price
    try {
      const jsonLd = $(el).html();
      if (jsonLd) {
        const data = JSON.parse(jsonLd);
        // Try different structures
        if (data.offers?.price) {
          price = parseFloat(data.offers.price);
          currency = data.offers.priceCurrency || "KRW";
        } else if (data.price) {
          price = parseFloat(data.price);
        } else if (Array.isArray(data)) {
          // Handle array of structured data
          for (const item of data) {
            if (item.offers?.price) {
              price = parseFloat(item.offers.price);
              currency = item.offers.priceCurrency || "KRW";
              break;
            }
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });
  
  // Try meta tags for price
  if (price === 0) {
    const priceMeta = $('meta[property="product:price:amount"]').attr("content") ||
                      $('meta[name="price"]').attr("content");
    if (priceMeta) {
      price = parseFloat(priceMeta);
      currency = $('meta[property="product:price:currency"]').attr("content") || "KRW";
    }
  }
  
  // Try multiple price selectors (more aggressive)
  if (price === 0) {
    const priceSelectors = [
      '[class*="price"]',
      '[id*="price"]',
      '[data-price]',
      '[itemprop="price"]',
      '.price',
      '#price',
      '[class*="cost"]',
      '[class*="amount"]',
      '[class*="won"]',
      '[class*="원"]',
      '[class*="가격"]',
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = $(selector).first();
      if (priceElement.length) {
        const priceText = priceElement.text() || priceElement.attr("content") || priceElement.attr("data-price") || "";
        const extractedPrice = extractPrice(priceText);
        if (extractedPrice > 0 && extractedPrice < 100000000) { // Reasonable price range
          price = extractedPrice;
          break;
        }
      }
    }
  }
  
  // Last resort: search in all text for price patterns (e.g., "25,000원", "$25.99")
  if (price === 0) {
    const bodyText = $("body").text();
    // Look for common price patterns
    const pricePatterns = [
      /(\d{1,3}(?:[,\s]\d{3})*)\s*원/g,  // Korean won: 25,000원
      /\$\s*(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)/g,  // USD: $25.99
      /₩\s*(\d{1,3}(?:[,\s]\d{3})*)/g,  // Won symbol: ₩25,000
      /(\d{1,3}(?:[,\s]\d{3})*)\s*KRW/g,  // KRW: 25,000 KRW
    ];
    
    for (const pattern of pricePatterns) {
      const matches = bodyText.match(pattern);
      if (matches && matches.length > 0) {
        const extractedPrice = extractPrice(matches[0]);
        if (extractedPrice > 0 && extractedPrice < 100000000) {
          price = extractedPrice;
          break;
        }
      }
    }
  }
  
  // Extract images - more aggressive approach
  const images: string[] = [];
  
  // Add Open Graph image
  if (ogImage) {
    images.push(normalizeImageUrl(ogImage, url));
  }
  
  // Try multiple image selectors
  const imageSelectors = [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    '[class*="product-image"] img',
    '[class*="product-img"] img',
    '[class*="main-image"] img',
    '[class*="gallery"] img',
    '[class*="thumbnail"] img',
    '[id*="product-image"] img',
    '[id*="main-image"] img',
    '.product-images img',
    '.product-gallery img',
    '[itemprop="image"]',
    'img[src*="product"]',
    'img[alt*="product"]',
  ];
  
  for (const selector of imageSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src") || 
                  $(el).attr("data-src") || 
                  $(el).attr("data-lazy-src") ||
                  $(el).attr("data-original") ||
                  $(el).attr("content");
      
      if (src) {
        const normalizedUrl = normalizeImageUrl(src, url);
        if (normalizedUrl && !images.includes(normalizedUrl) && !normalizedUrl.includes("logo") && !normalizedUrl.includes("icon")) {
          images.push(normalizedUrl);
        }
      }
    });
  }
  
  // Extract brand
  const brand = $('meta[property="product:brand"]').attr("content") || 
                $('meta[property="brand"]').attr("content") ||
                $('[itemprop="brand"]').text().trim() ||
                $('[class*="brand"]').first().text().trim() || 
                undefined;
  
  return {
    name: ogTitle || $("title").text() || "",
    description: ogDescription || $('meta[name="description"]').attr("content") || "",
    price,
    currency,
    images: images.slice(0, 10), // Limit to 10 images
    brand,
  };
}

// Gmarket specific scraper
async function scrapeGmarket(url: string): Promise<ScrapedProduct> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
  
  const html = await response.text();
  const $ = load(html);
  
  const name = $(".itemtit").text().trim() || 
               $("h1").first().text().trim() ||
               $('meta[property="og:title"]').attr("content") || "";
  
  // Try multiple price selectors for Gmarket
  let price = 0;
  const priceSelectors = [
    ".price_real",
    ".price_sale",
    ".price_original",
    '[class*="price"]',
    '[id*="price"]',
    '[data-price]',
  ];
  
  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text();
    if (priceText) {
      price = extractPrice(priceText);
      if (price > 0) break;
    }
  }
  
  // Extract images - Gmarket specific
  const images: string[] = [];
  
  // Try Gmarket specific image selectors
  const imageSelectors = [
    ".thumb-list img",
    ".product-image img",
    ".item-img img",
    '[class*="product-image"] img',
    '[class*="thumb"] img',
    '[id*="product-image"] img',
  ];
  
  for (const selector of imageSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src") || 
                  $(el).attr("data-src") ||
                  $(el).attr("data-original");
      if (src) {
        const normalizedUrl = normalizeImageUrl(src, url);
        if (normalizedUrl && !images.includes(normalizedUrl)) {
          images.push(normalizedUrl);
        }
      }
    });
  }
  
  // Also try Open Graph image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && !images.includes(ogImage)) {
    images.unshift(normalizeImageUrl(ogImage, url));
  }
  
  const description = $(".item_detail").text().trim() || 
                     $(".item_info").text().trim() ||
                     $('meta[property="og:description"]').attr("content") ||
                     $('meta[name="description"]').attr("content") || "";
  
  return {
    name,
    description,
    price,
    currency: "KRW",
    images: images.slice(0, 10),
  };
}

// Coupang specific scraper
async function scrapeCoupang(url: string): Promise<ScrapedProduct> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
  
  const html = await response.text();
  const $ = load(html);
  
  const name = $(".prod-buy-header__title").text().trim() || 
               $("h1").first().text().trim() ||
               $('meta[property="og:title"]').attr("content") || "";
  
  // Try multiple price selectors for Coupang
  let price = 0;
  const priceSelectors = [
    ".total-price strong",
    ".total-price",
    ".prod-price",
    ".price-value",
    '[class*="price"]',
    '[id*="price"]',
    '[data-price]',
  ];
  
  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text();
    if (priceText) {
      price = extractPrice(priceText);
      if (price > 0) break;
    }
  }
  
  // Also try to find price in script tags (Coupang often uses JS)
  if (price === 0) {
    $('script').each((_, el) => {
      const scriptContent = $(el).html() || "";
      const priceMatch = scriptContent.match(/["']price["']\s*[:=]\s*["']?(\d+[,\d]*)["']?/i);
      if (priceMatch && priceMatch[1]) {
        price = extractPrice(priceMatch[1]);
        if (price > 0) return false; // Break
      }
    });
  }
  
  // Extract images - Coupang specific
  const images: string[] = [];
  
  const imageSelectors = [
    ".prod-image img",
    ".prod-image__detail img",
    '[class*="product-image"] img',
    '[class*="prod-image"] img',
    '[id*="product-image"] img',
    '.product-gallery img',
  ];
  
  for (const selector of imageSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src") || 
                  $(el).attr("data-src") ||
                  $(el).attr("data-lazy-src") ||
                  $(el).attr("data-original");
      if (src) {
        const normalizedUrl = normalizeImageUrl(src, url);
        if (normalizedUrl && !images.includes(normalizedUrl)) {
          images.push(normalizedUrl);
        }
      }
    });
  }
  
  // Also try Open Graph image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage && !images.includes(ogImage)) {
    images.unshift(normalizeImageUrl(ogImage, url));
  }
  
  // Try to extract from data attributes
  $('[data-image], [data-img]').each((_, el) => {
    const dataImage = $(el).attr("data-image") || $(el).attr("data-img");
    if (dataImage) {
      const normalizedUrl = normalizeImageUrl(dataImage, url);
      if (normalizedUrl && !images.includes(normalizedUrl)) {
        images.push(normalizedUrl);
      }
    }
  });
  
  const description = $(".prod-description").text().trim() || 
                     $(".prod-detail").text().trim() ||
                     $('meta[property="og:description"]').attr("content") ||
                     $('meta[name="description"]').attr("content") || "";
  
  return {
    name,
    description,
    price,
    currency: "KRW",
    images: images.slice(0, 10),
  };
}

// Main scraper function
export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  try {
    const website = detectWebsite(url);
    
    switch (website) {
      case "gmarket":
        return await scrapeGmarket(url);
      case "coupang":
        return await scrapeCoupang(url);
      default:
        return await scrapeGeneric(url);
    }
  } catch (error) {
    throw new Error(`Failed to scrape product: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

