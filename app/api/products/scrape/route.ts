import { NextRequest, NextResponse } from "next/server";
import { scrapeProduct } from "@/lib/productScraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Only allow http/https protocols
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are allowed" },
        { status: 400 }
      );
    }

    // Scrape the product data
    const productData = await scrapeProduct(url);

    // Log what was extracted (for debugging)
    console.log("Scraped product data:", {
      name: productData.name ? "✓" : "✗",
      description: productData.description ? "✓" : "✗",
      price: productData.price > 0 ? `✓ ${productData.price}` : "✗",
      images: productData.images.length > 0 ? `✓ ${productData.images.length} images` : "✗",
    });

    return NextResponse.json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to scrape product",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

