// Application constants

export const APP_NAME = "HanBuy";
export const APP_DESCRIPTION =
  "Korea-to-Philippines E-commerce and Consolidation Logistics Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hanbuy.com";

// Box status labels
export const BOX_STATUS_LABELS: Record<string, string> = {
  in_warehouse: "In Warehouse",
  in_transit: "In Transit",
  in_customs: "In Customs",
  at_ph_hub: "At PH Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

// Invoice status labels
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  unpaid: "Unpaid",
  overdue: "Overdue",
};

// Navigation items
export const DASHBOARD_NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "overview" },
  { label: "My Orders", href: "/dashboard/orders", icon: "orders" },
  { label: "My Solo Box", href: "/dashboard/box", icon: "box" },
  { label: "Tracking", href: "/dashboard/tracking", icon: "tracking" },
  { label: "Invoices", href: "/dashboard/invoices", icon: "invoices" },
  { label: "CBM Calculator", href: "/dashboard/cbm-calculator", icon: "calculator" },
  { label: "Shipping Calculator", href: "/dashboard/shipping-calculator", icon: "shipping" },
  { label: "Penalty Calculator", href: "/dashboard/penalty-calculator", icon: "penalty" },
  { label: "Documents", href: "/dashboard/documents", icon: "documents" },
] as const;

