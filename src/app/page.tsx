import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-soft-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold text-foreground md:text-6xl">
              Shop Korean Products
              <br />
              <span className="text-soft-blue-600">Delivered to Philippines</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Consolidate your Korean purchases into one convenient Solo Box.
              Track your shipments in real-time from Korea to your doorstep.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/store/products"
                className="rounded-lg bg-soft-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-soft-blue-700"
              >
                Shop Now
              </Link>
              <Link
                href="/store/how-it-works"
                className="rounded-lg border-2 border-soft-blue-600 px-8 py-4 text-lg font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-soft-blue-100 text-2xl font-bold text-soft-blue-600 mx-auto">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Shop Korean Products</h3>
              <p className="text-muted-foreground">
                Browse our catalog of authentic Korean products - skincare, food,
                fashion, and more.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-soft-blue-100 text-2xl font-bold text-soft-blue-600 mx-auto">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Add to Solo Box</h3>
              <p className="text-muted-foreground">
                Items are stored in your dedicated Solo Box at our Korea warehouse.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-soft-blue-100 text-2xl font-bold text-soft-blue-600 mx-auto">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Ship to Philippines</h3>
              <p className="text-muted-foreground">
                Choose sea or air freight. We handle customs and logistics.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-soft-blue-100 text-2xl font-bold text-soft-blue-600 mx-auto">
                4
              </div>
              <h3 className="mb-2 text-xl font-semibold">Receive & Enjoy</h3>
              <p className="text-muted-foreground">
                Track your package and receive it at your doorstep in the Philippines.
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/store/how-it-works"
              className="text-soft-blue-600 hover:underline font-semibold"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-grey-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-4xl font-bold text-foreground">
            Featured Korean Products
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
              <h3 className="mb-2 text-xl font-semibold">Korean Skincare</h3>
              <p className="mb-4 text-muted-foreground">
                Discover the secrets of K-beauty with our curated skincare collection.
              </p>
              <Link
                href="/store/products?category=skincare"
                className="text-soft-blue-600 hover:underline font-medium"
              >
                Shop Skincare →
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
              <h3 className="mb-2 text-xl font-semibold">Korean Food & Snacks</h3>
              <p className="mb-4 text-muted-foreground">
                Authentic Korean flavors delivered fresh to your door.
              </p>
              <Link
                href="/store/products?category=food"
                className="text-soft-blue-600 hover:underline font-medium"
              >
                Shop Food →
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 aspect-square w-full rounded-lg bg-grey-200"></div>
              <h3 className="mb-2 text-xl font-semibold">Korean Fashion</h3>
              <p className="mb-4 text-muted-foreground">
                Latest Korean streetwear and fashion trends.
              </p>
              <Link
                href="/store/products?category=fashion"
                className="text-soft-blue-600 hover:underline font-medium"
              >
                Shop Fashion →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-soft-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to Start Shopping?
          </h2>
          <p className="mb-8 text-xl text-soft-blue-100">
            Join thousands of customers enjoying authentic Korean products.
          </p>
          <Link
            href="/store/products"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-soft-blue-600 transition-colors hover:bg-grey-50"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}
