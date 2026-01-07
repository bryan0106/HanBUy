"use client";

import { useEffect, useState } from "react";
import { invoiceService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Invoice } from "@/types";

export default function StoreInvoicesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/invoices");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadInvoices();
    }
  }, [isAuthenticated, user]);

  const loadInvoices = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await invoiceService.getUserInvoices(user.id);
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    await invoiceService.downloadInvoicePDF(invoiceId);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-[#6b7280]">Loading invoices...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#2C2C2C]">Invoices</h1>

      {invoices.length === 0 ? (
        <div className="rounded-[4px] border border-[#FCE4EC] bg-white p-12 text-center">
          <p className="text-[#6b7280]">No invoices found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-[4px] border border-[#FCE4EC] bg-white p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#2C2C2C]">
                    Invoice {invoice.invoiceNumber}
                  </h3>
                  {invoice.boxId && (
                    <p className="text-sm text-[#6b7280]">
                      Box: {invoice.boxId}
                    </p>
                  )}
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-[#6b7280]">Date</p>
                  <p className="font-semibold text-[#2C2C2C]">{formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6b7280]">Due Date</p>
                  <p className="font-semibold text-[#2C2C2C]">{formatDate(invoice.dueDate)}</p>
                </div>
                {invoice.paidAt && (
                  <div>
                    <p className="text-sm text-[#6b7280]">Paid On</p>
                    <p className="font-semibold text-[#2C2C2C]">{formatDate(invoice.paidAt)}</p>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-sm text-[#6b7280]">Payment Method</p>
                    <p className="font-semibold text-[#2C2C2C]">{invoice.paymentMethod}</p>
                  </div>
                )}
              </div>

              <div className="mb-4 border-t border-[#FCE4EC] pt-4">
                <h4 className="mb-2 font-semibold text-[#2C2C2C]">Items</h4>
                <div className="space-y-2">
                  {invoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-[#6b7280]">
                        {item.description} × {item.quantity}
                      </span>
                      <span className="font-semibold text-[#2C2C2C]">
                        {formatCurrency(item.total, invoice.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 space-y-1 border-t border-[#FCE4EC] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Subtotal</span>
                  <span className="text-[#2C2C2C]">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Shipping Fee</span>
                  <span className="text-[#2C2C2C]">{formatCurrency(invoice.shippingFee, invoice.currency)}</span>
                </div>
                {invoice.customsFee && (
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Customs Fee</span>
                    <span className="text-[#2C2C2C]">{formatCurrency(invoice.customsFee, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#FCE4EC] pt-2 font-semibold">
                  <span className="text-[#2C2C2C]">Total</span>
                  <span className="text-lg text-[#FF85A2]">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadPDF(invoice.id)}
                className="mt-4 rounded-[4px] border border-[#FCE4EC] bg-white px-4 py-2 text-sm font-semibold text-[#FF85A2] transition-colors hover:bg-[#FFF5F7]"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

