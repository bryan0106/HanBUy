import Link from "next/link";

export default function StorePage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-12">
      <div className="mb-8 text-center sm:mb-12">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-4xl">
          Welcome to HanBuy Store
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Discover authentic Korean products delivered directly to the Philippines.
          Shop, consolidate, and track your purchases all in one place.
        </p>
      </div>
      <div className="mb-6 grid gap-4 sm:gap-6 sm:mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/store/products/onhand"
          className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
        >
          <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">📦</div>
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">Onhand Items</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Available items ready for immediate shipping
          </p>
        </Link>
        <Link
          href="/store/products/preorder"
          className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
        >
          <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">📅</div>
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">Pre-Order</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Pre-order items with estimated release dates
          </p>
        </Link>
        <Link
          href="/store/products/kr-comparison"
          className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
        >
          <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">💰</div>
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">Price Comparison</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Compare prices across Korean websites
          </p>
        </Link>
        <Link
          href="/store/products"
          className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg sm:p-6"
        >
          <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">🛍️</div>
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">All Products</h3>
          <p className="text-sm text-muted-foreground sm:text-base">
            Browse our complete product catalog
          </p>
        </Link>
      </div>
      <div className="text-center">
        <Link
          href="/store/products"
          className="inline-block w-full rounded-lg bg-soft-blue-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:w-auto sm:px-8"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
}

