export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-12 text-center text-4xl font-bold text-foreground">
        About HanBuy
      </h1>

      {/* Company Overview */}
      <section className="mb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-foreground">
            Who We Are
          </h2>
          <div className="rounded-lg border border-border bg-card p-8">
            <p className="mb-4 text-lg text-muted-foreground">
              HanBuy is a Korea-to-Philippines e-commerce and logistics platform that brings 
              authentic Korean products directly to your doorstep. We specialize in consolidating 
              and shipping Korean goods, making it easy and affordable for Filipino customers to 
              access the latest Korean products.
            </p>
            <p className="mb-4 text-lg text-muted-foreground">
              Our business model is built around our Manila office, where all items are received, 
              consolidated, and quality-checked before being dispatched to customers via trusted 
              Philippines courier services.
            </p>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          How We Operate
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-2xl font-semibold">📍 Manila Office Hub</h3>
            <p className="text-muted-foreground">
              All Korean products are shipped to our Manila office location first. 
              This allows us to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Quality check all items before delivery</li>
              <li>Consolidate orders efficiently</li>
              <li>Optimize shipping costs for customers</li>
              <li>Provide faster local delivery</li>
              <li>Better inventory management</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-2xl font-semibold">📦 Flexible Box Options</h3>
            <p className="text-muted-foreground">
              We offer two box types to suit your needs:
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-info/10 p-4">
                <h4 className="mb-2 font-semibold text-info">Solo Box</h4>
                <p className="text-sm text-muted-foreground">
                  Your items shipped exclusively to you. Faster processing, full shipping fee applies.
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 p-4">
                <h4 className="mb-2 font-semibold text-warning">Shared Box</h4>
                <p className="text-sm text-muted-foreground">
                  Items consolidated with other customers or owner's personal items. Reduced shipping fee, save up to 60%!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          What We Offer
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">🛍️ Onhand Products</h3>
            <p className="text-muted-foreground">
              Browse our catalog of Korean products that are ready to ship. 
              From K-beauty to K-pop merchandise, Korean snacks, and more.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">📅 Pre-Order Items</h3>
            <p className="text-muted-foreground">
              Pre-order upcoming Korean products and get them as soon as they're available. 
              Perfect for limited edition items and new releases.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">💳 Flexible Payment</h3>
            <p className="text-muted-foreground">
              Pay via QR code using GCash, GoTyme, Maya, BDO, or BPI. 
              Choose between full payment or downpayment options.
            </p>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Our Process
        </h2>
        <div className="rounded-lg border border-border bg-card p-8">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 font-bold text-soft-blue-600">
                1
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold">Customer Orders</h4>
                <p className="text-muted-foreground">
                  Customers browse our catalog, choose items (onhand or preorder), select box type (solo or shared), 
                  and complete checkout with payment via QR code.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 font-bold text-soft-blue-600">
                2
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold">Seller Fulfillment</h4>
                <p className="text-muted-foreground">
                  Once payment is verified, items are packed and shipped from Korea to our Manila office location.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 font-bold text-soft-blue-600">
                3
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold">Manila Office Receiving</h4>
                <p className="text-muted-foreground">
                  All items arrive at our Manila office where they are received, inspected, and quality-checked by our admin team.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 font-bold text-soft-blue-600">
                4
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold">Box Consolidation</h4>
                <p className="text-muted-foreground">
                  Items are consolidated based on customer preferences - solo boxes for individual customers, 
                  or shared boxes combining multiple orders or owner's personal items for cost savings.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 font-bold text-soft-blue-600">
                5
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold">Local Delivery</h4>
                <p className="text-muted-foreground">
                  Consolidated boxes are dispatched via trusted Philippines courier services (J&T Express, LBC, 2GO, etc.) 
                  to customers' addresses. Customers can track their shipments in real-time.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Why Choose HanBuy?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mb-4 text-4xl">💰</div>
            <h3 className="mb-2 font-semibold">Cost-Effective</h3>
            <p className="text-sm text-muted-foreground">
              Shared box option saves you up to 60% on shipping fees
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mb-4 text-4xl">🔒</div>
            <h3 className="mb-2 font-semibold">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              QR code payments with pre-identified amounts for security
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="mb-2 font-semibold">Quality Assured</h3>
            <p className="text-sm text-muted-foreground">
              All items inspected at Manila office before delivery
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <div className="mb-4 text-4xl">📱</div>
            <h3 className="mb-2 font-semibold">Real-Time Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track from Korea to Manila to your doorstep
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="rounded-lg border border-border bg-soft-blue-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Have Questions?
        </h2>
        <p className="mb-6 text-muted-foreground">
          We're here to help! Check out our "How It Works" page for detailed information, 
          or contact us if you need assistance.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/store/how-it-works"
            className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
          >
            How It Works
          </a>
          <a
            href="/contact"
            className="inline-block rounded-lg border-2 border-soft-blue-600 bg-white px-6 py-3 font-semibold text-soft-blue-600 transition-colors hover:bg-soft-blue-50"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}

