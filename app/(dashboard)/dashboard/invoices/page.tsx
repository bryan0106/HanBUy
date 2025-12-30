"use client";

import { useEffect, useState } from "react";
import { invoiceService } from "@/services/api";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Invoice } from "@/types";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    const data = await invoiceService.getUserInvoices("user-1");
    setInvoices(data);
    setLoading(false);
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    await invoiceService.downloadInvoicePDF(invoiceId);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-foreground">Invoices</h1>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No invoices found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Invoice {invoice.invoiceNumber}
                  </h3>
                  {invoice.boxId && (
                    <p className="text-sm text-muted-foreground">
                      Box: {invoice.boxId}
                    </p>
                  )}
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
                </div>
                {invoice.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid On</p>
                    <p className="font-semibold">{formatDate(invoice.paidAt)}</p>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">{invoice.paymentMethod}</p>
                  </div>
                )}
              </div>

              <div className="mb-4 border-t border-border pt-4">
                <h4 className="mb-2 font-semibold">Items</h4>
                <div className="space-y-2">
                  {invoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.description} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(item.total, invoice.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4 space-y-1 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span>{formatCurrency(invoice.shippingFee, invoice.currency)}</span>
                </div>
                {invoice.customsFee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customs Fee</span>
                    <span>{formatCurrency(invoice.customsFee, invoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-lg">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadPDF(invoice.id)}
                className="mt-4 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-grey-50"
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
