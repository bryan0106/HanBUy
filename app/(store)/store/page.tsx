import Link from "next/link";

export default function StorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Welcome to HanBuy Store
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover authentic Korean products delivered directly to the Philippines.
          Shop, consolidate, and track your purchases all in one place.
        </p>
      </div>
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/store/products/onhand"
          className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg"
        >
          <div className="mb-4 text-4xl">📦</div>
          <h3 className="mb-2 text-xl font-semibold">Onhand Items</h3>
          <p className="text-muted-foreground">
            Available items ready for immediate shipping
          </p>
        </Link>
        <Link
          href="/store/products/preorder"
          className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg"
        >
          <div className="mb-4 text-4xl">📅</div>
          <h3 className="mb-2 text-xl font-semibold">Pre-Order</h3>
          <p className="text-muted-foreground">
            Pre-order items with estimated release dates
          </p>
        </Link>
        <Link
          href="/store/products/kr-comparison"
          className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg"
        >
          <div className="mb-4 text-4xl">💰</div>
          <h3 className="mb-2 text-xl font-semibold">Price Comparison</h3>
          <p className="text-muted-foreground">
            Compare prices across Korean websites
          </p>
        </Link>
        <Link
          href="/store/products"
          className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg"
        >
          <div className="mb-4 text-4xl">🛍️</div>
          <h3 className="mb-2 text-xl font-semibold">All Products</h3>
          <p className="text-muted-foreground">
            Browse our complete product catalog
          </p>
        </Link>
      </div>
      <div className="text-center">
        <Link
          href="/store/products"
          className="inline-block rounded-lg bg-soft-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
}

