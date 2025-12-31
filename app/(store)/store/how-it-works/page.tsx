export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-12 text-center text-4xl font-bold text-foreground">
        How It Works
      </h1>

      {/* Box Type Options */}
      <section className="mb-16">
        <h2 className="mb-6 text-3xl font-bold text-foreground">
          Choose Your Box Type
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-info/20 bg-card p-8">
            <h3 className="mb-4 text-2xl font-semibold text-info">Solo Box</h3>
            <p className="mb-4 text-muted-foreground">
              Your items are shipped in a dedicated box exclusively for you. Perfect when you want complete control and faster delivery.
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Your items only - no sharing</li>
              <li>Faster processing and shipping</li>
              <li>Full shipping fee applies</li>
              <li>Best for urgent orders</li>
            </ul>
            <div className="rounded-lg bg-info/10 p-3">
              <p className="text-sm font-semibold text-info">Shipping Fee: Full Rate</p>
            </div>
          </div>
          <div className="rounded-lg border-2 border-warning/20 bg-card p-8">
            <h3 className="mb-4 text-2xl font-semibold text-warning">Shared Box</h3>
            <p className="mb-4 text-muted-foreground">
              Your items are consolidated with other customers' orders or owner's personal items in one box. Save on shipping costs!
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Cost-effective shipping option</li>
              <li>Shared shipping costs</li>
              <li>Reduced delivery fee</li>
              <li>Best for budget-conscious shoppers</li>
            </ul>
            <div className="rounded-lg bg-warning/10 p-3">
              <p className="text-sm font-semibold text-warning">Shipping Fee: Reduced Rate (Save up to 60%)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Complete Order Process
        </h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              1
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Shop & Checkout</h3>
              <p className="text-muted-foreground">
                Browse our catalog of Korean products (onhand or preorder items). Add items to your cart and proceed to checkout. 
                Choose your box type preference: <strong>Solo Box</strong> (full shipping fee) or <strong>Shared Box</strong> (reduced shipping fee).
                Select payment method: Full payment or Downpayment.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              2
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Pay via QR Code</h3>
              <p className="text-muted-foreground">
                Pay securely using QR code scanning with your preferred payment method (GCash, GoTyme, Maya, BDO, or BPI). 
                The amount is pre-identified in the QR code for security. Upload proof of payment after completing the transaction. 
                Our Manila office admin will verify your payment.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              3
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Seller Fulfills Order</h3>
              <p className="text-muted-foreground">
                Once payment is verified, the seller packs your items and ships them to our Manila office. 
                Your items are tracked from Korea to Manila. You'll receive updates when items are packed and shipped.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              4
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Manila Office Receives Items</h3>
              <p className="text-muted-foreground">
                All items arrive at our Manila office location. Our admin team receives and inspects your items. 
                Items are then consolidated based on your box type preference:
              </p>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
                <li><strong>Solo Box:</strong> Your items are prepared in a dedicated box</li>
                <li><strong>Shared Box:</strong> Your items are consolidated with other customers' orders or owner's personal items</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              5
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Shipment via Philippines Courier</h3>
              <p className="text-muted-foreground">
                Once your box is ready, it's dispatched via Philippines courier (J&T Express, LBC, 2GO, etc.) to your address. 
                You'll receive a tracking number to monitor your shipment from Manila to your doorstep.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-soft-blue-100 text-xl font-bold text-soft-blue-600">
              6
            </div>
            <div>
              <h3 className="mb-2 text-2xl font-semibold">Track & Receive</h3>
              <p className="text-muted-foreground">
                Use the Philippines courier tracking number to monitor your shipment. Track it from Manila office → 
                In Transit → Out for Delivery → Delivered to your address. Enjoy your Korean products!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Delivery Info */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Payment & Delivery Information
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-2xl font-semibold">Payment Options</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>QR Code Payment:</strong> GCash, GoTyme, Maya, BDO, BPI</li>
              <li>• <strong>Pre-identified Amount:</strong> Amount is encoded in QR code for security</li>
              <li>• <strong>Payment Types:</strong> Full payment or Downpayment available</li>
              <li>• <strong>Verification:</strong> Manila office admin verifies all payments</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-2xl font-semibold">Delivery & Shipping</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Manila Office:</strong> All items consolidated at our Manila location</li>
              <li>• <strong>Philippines Courier:</strong> J&T Express, LBC, 2GO, and more</li>
              <li>• <strong>Tracking:</strong> Real-time tracking from Manila to your address</li>
              <li>• <strong>Box Types:</strong> Solo (full fee) or Shared (reduced fee)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-foreground">
          Why Choose HanBuy?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">💰 Cost-Effective</h3>
            <p className="text-muted-foreground">
              Choose shared boxes to save up to 60% on shipping fees. Solo boxes available for faster delivery.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">📦 Flexible Options</h3>
            <p className="text-muted-foreground">
              Shop onhand items (ready to ship) or preorder items (coming soon). Full payment or downpayment options.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">🔒 Secure Payments</h3>
            <p className="text-muted-foreground">
              QR code payments with pre-identified amounts. Multiple payment options (GCash, GoTyme, Maya, BDO, BPI).
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">📍 Local Support</h3>
            <p className="text-muted-foreground">
              Items consolidated at our Manila office for better quality control and faster local delivery.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">📱 Real-Time Tracking</h3>
            <p className="text-muted-foreground">
              Track your items from Korea to Manila, then from Manila office to your doorstep.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-xl font-semibold">✅ Verified Quality</h3>
            <p className="text-muted-foreground">
              All items inspected at Manila office before final delivery to ensure quality and accuracy.
            </p>
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

