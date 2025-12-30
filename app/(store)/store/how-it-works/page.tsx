export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-12 text-center text-4xl font-bold text-foreground">
        How It Works
      </h1>

      {/* Solo Box Concept */}
      <section className="mb-16">
        <h2 className="mb-6 text-3xl font-bold text-foreground">
          What is a Solo Box?
        </h2>
        <div className="rounded-lg border border-border bg-card p-8">
          <p className="mb-4 text-lg text-muted-foreground">
            A Solo Box is your dedicated storage space at our Korea warehouse.
            When you shop Korean products through HanBuy, all your items are
            consolidated into your personal Solo Box. This allows you to:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Shop from multiple Korean stores and consolidate into one shipment</li>
            <li>Save on shipping costs by combining multiple items</li>
            <li>Track all your items in one place</li>
            <li>Ship when you're ready (no rush to ship individual items)</li>
          </ul>
        </div>
      </section>

      {/* Step by Step */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Step-by-Step Process
        </h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              1
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Shop & Add to Box</h3>
              <p className="text-muted-foreground">
                Browse our catalog of Korean products. When you find something you
                like, click "Add to Solo Box". Your items will be stored in your
                dedicated box at our Korea warehouse.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              2
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Review Your Box</h3>
              <p className="text-muted-foreground">
                Visit your dashboard to see all items in your Solo Box. You can
                view details, remove items, or add more products before shipping.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              3
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Choose Shipping Method</h3>
              <p className="text-muted-foreground">
                When you're ready, choose between Sea Freight (cheaper, 7-14 days)
                or Air Freight (faster, 3-5 days). We'll calculate shipping costs
                based on your box's weight and dimensions.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              4
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Track Your Shipment</h3>
              <p className="text-muted-foreground">
                Once shipped, you'll receive a tracking ID. Use our tracking page
                to see real-time updates: Departed Incheon → Arrived Manila Port →
                Cleared Customs → At PH Hub → Out for Delivery → Delivered!
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              5
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Receive & Enjoy</h3>
              <p className="text-muted-foreground">
                Your package will be delivered to your address in the Philippines.
                Pay any remaining fees (customs, delivery) and enjoy your Korean
                products!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Shipping Options
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-2xl font-semibold">Sea Freight</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Delivery: 7-14 business days</li>
              <li>• Cost: More affordable</li>
              <li>• Best for: Large orders, non-urgent items</li>
              <li>• Weight limit: Up to 30kg per box</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-2xl font-semibold">Air Freight</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Delivery: 3-5 business days</li>
              <li>• Cost: Higher shipping fee</li>
              <li>• Best for: Urgent orders, smaller items</li>
              <li>• Weight limit: Up to 10kg per box</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CBM Calculator CTA */}
      <section className="rounded-lg border border-border bg-soft-blue-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Estimate Your Shipping Costs
        </h2>
        <p className="mb-6 text-muted-foreground">
          Use our CBM Calculator to estimate how much space your items will take
          and get shipping cost estimates.
        </p>
        <a
          href="/dashboard/cbm-calculator"
          className="inline-block rounded-lg bg-soft-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
        >
          Open CBM Calculator
        </a>
      </section>
    </div>
  );
}

