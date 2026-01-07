"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-4 text-center text-4xl font-bold text-[#2C2C2C]">
        Contact Us
      </h1>
      <p className="mb-12 text-center text-lg text-[#6b7280]">
        Have a question or need assistance? We're here to help!
      </p>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
              <h2 className="mb-6 text-2xl font-bold text-[#2C2C2C]">Get in Touch</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#2C2C2C]">📧 Email</h3>
                  <a 
                    href="mailto:support@hanbuy.com" 
                    className="text-[#FF85A2] hover:underline"
                  >
                    support@hanbuy.com
                  </a>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#2C2C2C]">📱 Phone</h3>
                  <a 
                    href="tel:+639123456789" 
                    className="text-[#FF85A2] hover:underline"
                  >
                    +63 912 345 6789
                  </a>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#2C2C2C]">📍 Office Address</h3>
                  <p className="text-[#6b7280]">
                    Manila Office<br />
                    Philippines
                  </p>
                </div>
                
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[#2C2C2C]">🕒 Business Hours</h3>
                  <p className="text-[#6b7280]">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-[4px] border border-[#FCE4EC] bg-[#FFF5F7] p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#2C2C2C]">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/store/how-it-works" className="text-[#FF85A2] hover:underline">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/store/about" className="text-[#FF85A2] hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/store/products" className="text-[#FF85A2] hover:underline">
                    Browse Products
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-6">
            <h2 className="mb-6 text-2xl font-bold text-[#2C2C2C]">Send us a Message</h2>
            
            {submitted ? (
              <div className="rounded-[4px] border border-[#FCE4EC] bg-[#FFF5F7] p-6 text-center">
                <div className="mb-4 text-4xl">✓</div>
                <p className="text-lg font-semibold text-[#2C2C2C]">Thank you!</p>
                <p className="text-[#6b7280]">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-[#2C2C2C] placeholder:text-[#6b7280] focus:border-[#FF85A2] focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-[#2C2C2C] placeholder:text-[#6b7280] focus:border-[#FF85A2] focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-[#2C2C2C] focus:border-[#FF85A2] focus:outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="payment">Payment Issue</option>
                    <option value="product">Product Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-[#2C2C2C]">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-[#2C2C2C] placeholder:text-[#6b7280] focus:border-[#FF85A2] focus:outline-none resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-[4px] bg-[#FF85A2] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#FF85A2]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

