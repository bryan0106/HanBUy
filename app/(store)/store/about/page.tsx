export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-12 text-center text-4xl font-bold text-[#2C2C2C]">
        About HanBuy
      </h1>

      {/* Company Overview */}
      <section className="mb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-[#2C2C2C]">
            Who We Are
          </h2>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-8">
            <p className="mb-4 text-lg text-[#6b7280]">
              HanBuy is a Korea-to-Philippines e-commerce and logistics platform that brings 
              authentic Korean products directly to your doorstep. We specialize in consolidating 
              and shipping Korean goods, making it easy and affordable for Filipino customers to 
              access the latest Korean products.
            </p>
            <p className="mb-4 text-lg text-[#6b7280]">
              Our business model is built around our Manila office, where all items are received, 
              consolidated, and quality-checked before being dispatched to customers via trusted 
              Philippines courier services.
            </p>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-[#2C2C2C]">
          How We Operate
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            <h3 className="mb-4 text-2xl font-semibold text-[#2C2C2C]">📍 Manila Office Hub</h3>
            <p className="text-[#6b7280]">
              All Korean products are shipped to our Manila office location first. 
              This allows us to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-[#6b7280]">
              <li>Quality check all items before delivery</li>
              <li>Consolidate orders efficiently</li>
              <li>Optimize shipping costs for customers</li>
              <li>Provide faster local delivery</li>
              <li>Better inventory management</li>
            </ul>
          </div>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            <h3 className="mb-4 text-2xl font-semibold text-[#2C2C2C]">📦 Flexible Box Options</h3>
            <p className="text-[#6b7280]">
              We offer two box types to suit your needs:
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-[4px] border border-[#FCE4EC] bg-[#FFF5F7] p-4">
                <h4 className="mb-2 font-semibold text-[#FF85A2]">Solo Box</h4>
                <p className="text-sm text-[#6b7280]">
                  Your items shipped exclusively to you. Faster processing, full shipping fee applies.
                </p>
              </div>
              <div className="rounded-[4px] border border-[#FCE4EC] bg-[#FFF5F7] p-4">
                <h4 className="mb-2 font-semibold text-[#FF85A2]">Shared Box</h4>
                <p className="text-sm text-[#6b7280]">
                  Items consolidated with other customers or owner's personal items. Reduced shipping fee, save up to 60%!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-[#2C2C2C]">
          What We Offer
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            <h3 className="mb-3 text-xl font-semibold text-[#2C2C2C]">🛍️ Onhand Products</h3>
            <p className="text-[#6b7280]">
              Browse our catalog of Korean products that are ready to ship. 
              From K-beauty to K-pop merchandise, Korean snacks, and more.
            </p>
          </div>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            <h3 className="mb-3 text-xl font-semibold text-[#2C2C2C]">📅 Pre-Order Items</h3>
            <p className="text-[#6b7280]">
              Pre-order upcoming Korean products and get them as soon as they're available. 
              Perfect for limited edition items and new releases.
            </p>
          </div>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            <h3 className="mb-3 text-xl font-semibold text-[#2C2C2C]">💳 Flexible Payment</h3>
            <p className="text-[#6b7280]">
              Pay via QR code using GCash, GoTyme, Maya, BDO, or BPI. 
              Choose between full payment or downpayment options.
            </p>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="mb-16">
        <h2 className="mb-8 text-3xl font-bold text-[#2C2C2C]">
          Our Process
        </h2>
        <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-8">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF5F7] font-bold text-[#FF85A2]">
                1
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#2C2C2C]">Customer Orders</h4>
                <p className="text-[#6b7280]">
                  Customers browse our catalog, choose items (onhand or preorder), select box type (solo or shared), 
                  and complete checkout with payment via QR code.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF5F7] font-bold text-[#FF85A2]">
                2
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#2C2C2C]">Seller Fulfillment</h4>
                <p className="text-[#6b7280]">
                  Once payment is verified, items are packed and shipped from Korea to our Manila office location.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF5F7] font-bold text-[#FF85A2]">
                3
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#2C2C2C]">Manila Office Receiving</h4>
                <p className="text-[#6b7280]">
                  All items arrive at our Manila office where they are received, inspected, and quality-checked by our admin team.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF5F7] font-bold text-[#FF85A2]">
                4
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#2C2C2C]">Box Consolidation</h4>
                <p className="text-[#6b7280]">
                  Items are consolidated based on customer preferences - solo boxes for individual customers, 
                  or shared boxes combining multiple orders or owner's personal items for cost savings.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF5F7] font-bold text-[#FF85A2]">
                5
              </span>
              <div>
                <h4 className="mb-2 text-lg font-semibold text-[#2C2C2C]">Local Delivery</h4>
                <p className="text-[#6b7280]">
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
        <h2 className="mb-8 text-3xl font-bold text-[#2C2C2C]">
          Why Choose HanBuy?
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6 text-center">
            <div className="mb-4 text-4xl">💰</div>
            <h3 className="mb-2 font-semibold text-[#2C2C2C]">Cost-Effective</h3>
            <p className="text-sm text-[#6b7280]">
              Shared box option saves you up to 60% on shipping fees
            </p>
          </div>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6 text-center">
            <div className="mb-4 text-4xl">🔒</div>
            <h3 className="mb-2 font-semibold text-[#2C2C2C]">Secure Payments</h3>
            <p className="text-sm text-[#6b7280]">
              QR code payments with pre-identified amounts for security
            </p>
          </div>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="mb-2 font-semibold text-[#2C2C2C]">Quality Assured</h3>
            <p className="text-sm text-[#6b7280]">
              All items inspected at Manila office before delivery
            </p>
          </div>
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6 text-center">
            <div className="mb-4 text-4xl">📱</div>
            <h3 className="mb-2 font-semibold text-[#2C2C2C]">Real-Time Tracking</h3>
            <p className="text-sm text-[#6b7280]">
              Track from Korea to Manila to your doorstep
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="rounded-[4px] border border-[#FCE4EC] bg-[#FFF5F7] p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-[#2C2C2C]">
          Have Questions?
        </h2>
        <p className="mb-6 text-[#6b7280]">
          We're here to help! Check out our "How It Works" page for detailed information, 
          or contact us if you need assistance.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/store/how-it-works"
            className="inline-block rounded-[4px] bg-[#FF85A2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90"
          >
            How It Works
          </a>
          <a
            href="/store/contact"
            className="inline-block rounded-[4px] border border-[#FCE4EC] bg-white px-6 py-3 font-semibold text-[#FF85A2] transition-colors hover:bg-[#FFF5F7]"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}


