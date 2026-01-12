// Mock Preorder Products Data for testing
import type { Product, GetProductsParams, GetProductsResponse } from "@/services/productService";

// Sample preorder products with release dates (3 items)
const mockPreorderProducts: Product[] = [
  {
    id: "preorder-bts-v-1",
    name: "V (BTS) [TYPE 非] (Photobook + POSTER SET)",
    description: "BTS V Photobook with poster set. Pre-order now to secure your copy! *This item may sell out early. Shipments will begin sequentially from the release date. Worldwide shipping available (excluding Japan and China). Orders will be shipped in the order they are completed.",
    price: 35000,
    currency: "KRW",
    images: [
      "https://www.ktown4u.com/goods_files/SH0164/event_images/043957/EV43956132.default.2.png",
    ],
    category: "k-pop",
    brand: "BTS",
    sku: "BTS-V-PB-2026",
    stock: 110,
    preorder_stock: 500,
    status: "active",
    product_type: "preorder",
    is_preorder_available: true,
    is_onhand_available: false,
    order_date: "2025-12-31T11:00:00.000Z", // Pre-order starts: 2025.12.31 11AM KST
    order_deadline: "2026-01-18T23:59:59.000Z", // Pre-order deadline: before release (may sell out early)
    release_date: "2026-01-19T00:00:00.000Z", // Release date: 2026.01.19 (Shipments will begin sequentially from this date)
    deposit_percentage: 50,
    preorder_available_stock: 500,
    preorders_claimed: 127,
    shipping_time_days: 14, // Estimated shipping time after release
    weight: 0.8,
    dimensions: {
      length: 25,
      width: 20,
      height: 3,
    },
    created_at: "2025-12-15T00:00:00.000Z",
    updated_at: "2025-12-15T00:00:00.000Z",
  },
  {
    id: "preorder-zerobaseone-1",
    name: "ZEROBASEONE Special Limited Album [RE-FLOW]",
    description: "[PRE-ORDER EVENT] ZEROBASEONE Special Limited Album [RE-FLOW]. Pre-order Period: 2026.01.09 (Fri) 02:00 PM ~ 2026.02.01 (Sun) 11:59 PM (KST). Special Event Period: 2026.01.09 (Fri) 02:00 PM ~ 2026.01.15 (Thu) 11:59 PM (KST). Estimated Shipping Schedule: Sequential shipping from 2026.02.03 (Tue) (KST). All album purchasers receive 1 random Plus Chat-exclusive unreleased photocard (1 of 9 types). Album purchases on Mnet Plus will be accurately reflected on the HANTEO Chart and CIRCLE Chart.",
    price: 35600,
    currency: "KRW",
    images: [
      "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/zerobaseone/641c7fe3-a3fb-4854-89a2-bca98cf973b9/a1f46549-3c58-419f-82a7-91ce06da03c4/ori.jpg",
    ],
    category: "k-pop",
    brand: "ZEROBASEONE",
    sku: "ZB1-RE-FLOW-2026",
    stock: 10,
    preorder_stock: 1000,
    status: "active",
    product_type: "preorder",
    is_preorder_available: true,
    is_onhand_available: false,
    order_date: "2026-01-09T14:00:00.000Z", // Pre-order starts: 2026.01.09 (Fri) 02:00 PM KST
    order_deadline: "2026-02-01T23:59:59.000Z", // Pre-order deadline: 2026.02.01 (Sun) 11:59 PM KST
    release_date: "2026-02-26T00:00:00.000Z", // Release date: 26.02 (February 26, 2026)
    deposit_percentage: 50,
    preorder_available_stock: 1000,
    preorders_claimed: 234,
    shipping_time_days: 7, // Sequential shipping from 2026.02.03
    weight: 0.5,
    dimensions: {
      length: 20,
      width: 20,
      height: 2,
    },
    created_at: "2026-01-09T00:00:00.000Z",
    updated_at: "2026-01-09T00:00:00.000Z",
  },
  {
    id: "preorder-nmixx-1",
    name: "NMIXX 1st Full Album [Blue Valentine] MEET&CALL EVENT",
    description: "NMIXX 1st Full Album [Blue Valentine] MEET&CALL EVENT. Sales period: 2026.01.12 ~ 2026.01.14 (KST). Winner announcement: 2026.01.15. Face-to-face Fan Signing Event: 2026.01.22 20:00~ (KST). 1:1 Video Call Event: 2026.01.22 21:30~ (KST). Includes: Blue ver. + Valentine ver. + Chaos ver. 1pc random out of 3 types, Unreleased selfie photocard (NMIXX in Love ver. or Forest Girl ver.) 1pc random out of 6 types. Sales data will be 100% reflected in Hanteo Chart, Circle Chart, and Music Bank chart. This product is a limited-time item.",
    price: 20000,
    currency: "KRW",
    images: [
      "https://www.makestar.com/_vercel/image?url=https:%2F%2Fmystarroom-public-cdn.makestar.com%2Fpublic%2Fimage%2Fproduct%2FP_9723_NMIXX_64_Banner_Sub.jpg_2025-12-29_155719818560_thumb.jpeg&w=1024&q=80",
    ],
    category: "k-pop",
    brand: "NMIXX",
    sku: "NMIXX-BV-2026",
    stock: 110,
    preorder_stock: 500,
    status: "active",
    product_type: "preorder",
    is_preorder_available: true,
    is_onhand_available: false,
    order_date: "2026-01-12T11:00:00.000Z", // Sales period: 2026.01.12 11:00 ~ 2026.01.14 22:59 (KST)
    order_deadline: "2026-01-14T22:59:59.000Z", // Sales period deadline
    release_date: "2026-01-22T00:00:00.000Z", // Event date: 2026.01.22 (Fan Signing & Video Call Event)
    deposit_percentage: 50,
    preorder_available_stock: 500,
    preorders_claimed: 156,
    shipping_time_days: 14, // Estimated shipping after event
    weight: 0.4,
    dimensions: {
      length: 20,
      width: 20,
      height: 2,
    },
    created_at: "2026-01-12T00:00:00.000Z",
    updated_at: "2026-01-12T00:00:00.000Z",
  },
];

export const mockPreorderService = {
  getPreorderProducts: (params?: GetProductsParams): Promise<GetProductsResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredProducts = [...mockPreorderProducts];

        // Filter by category
        if (params?.category && params.category !== "all") {
          filteredProducts = filteredProducts.filter(
            (p) => p.category === params.category
          );
        }

        // Filter by brand
        if (params?.brand && params.brand !== "all") {
          filteredProducts = filteredProducts.filter((p) => p.brand === params.brand);
        }

        // Filter by price range
        if (params?.min_price !== undefined) {
          filteredProducts = filteredProducts.filter((p) => p.price >= params.min_price!);
        }
        if (params?.max_price !== undefined) {
          filteredProducts = filteredProducts.filter((p) => p.price <= params.max_price!);
        }

        // Search filter
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(searchLower) ||
              p.description?.toLowerCase().includes(searchLower) ||
              p.brand?.toLowerCase().includes(searchLower)
          );
        }

        // Sort
        if (params?.sort) {
          switch (params.sort) {
            case "price_asc":
              filteredProducts.sort((a, b) => a.price - b.price);
              break;
            case "price_desc":
              filteredProducts.sort((a, b) => b.price - a.price);
              break;
            case "name_asc":
              filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case "name_desc":
              filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case "created_desc":
              filteredProducts.sort(
                (a, b) =>
                  new Date(b.created_at || 0).getTime() -
                  new Date(a.created_at || 0).getTime()
              );
              break;
            case "created_asc":
              filteredProducts.sort(
                (a, b) =>
                  new Date(a.created_at || 0).getTime() -
                  new Date(b.created_at || 0).getTime()
              );
              break;
            case "stock_desc":
              filteredProducts.sort((a, b) => (b.preorder_stock || 0) - (a.preorder_stock || 0));
              break;
          }
        }

        // Pagination
        const page = params?.page || 1;
        const limit = params?.limit || 50;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        resolve({
          success: true,
          data: paginatedProducts,
          pagination: {
            page,
            limit,
            total: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / limit),
            hasNextPage: endIndex < filteredProducts.length,
            hasPrevPage: page > 1,
          },
        });
      }, 200);
    });
  },
};
