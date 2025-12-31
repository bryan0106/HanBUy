// Order and payment types

import type { Address } from "./index";

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  // Service Fees
  isf: number; // ISF - International Service Fee (Korea to Manila)
  lsf: number; // LSF - Local Service Fee (Manila to customer via courier)
  // Shipping Fees (legacy - can be calculated from ISF + LSF)
  shippingFee: number; // Total shipping fee (ISF + LSF)
  soloShippingFee?: number; // Full shipping fee for solo box
  sharedShippingFee?: number; // Reduced shipping fee for shared box
  boxTypePreference: "solo" | "shared"; // Customer's box type preference
  total: number; // Subtotal + ISF + LSF
  currency: "PHP" | "KRW";
  status: OrderStatus;
  paymentStatus: "pending" | "partial" | "paid" | "failed" | "refunded";
  paymentMethod?: PaymentMethod;
  paymentType: "full" | "downpayment"; // Payment type
  downpaymentAmount?: number; // Required if paymentType is "downpayment"
  downpaymentPaid?: number; // Amount of downpayment already paid
  balance?: number; // Remaining balance (for downpayment)
  qrCode?: string;
  proofOfPayment?: string;
  shippingAddress: Address;
  // Fulfillment workflow
  fulfillmentStatus?: FulfillmentStatus;
  packedAt?: Date; // When seller packed the items
  shippedToManilaAt?: Date; // When items shipped to Manila office
  receivedAtManilaAt?: Date; // When items received at Manila office
  boxId?: string; // Assigned box (solo or shared)
  phCourierTrackingNumber?: string; // Philippines courier tracking
  phCourierName?: string; // Courier name (J&T, LBC, etc.)
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "in_transit_to_manila"
  | "received_at_manila"
  | "consolidated"
  | "shipped"
  | "delivered"
  | "cancelled";

export type FulfillmentStatus =
  | "pending_packing"
  | "packed"
  | "in_transit_to_manila"
  | "received_at_manila"
  | "consolidated"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: "onhand" | "preorder" | "kr_website";
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
  preorderReleaseDate?: Date;
}

export interface PaymentMethod {
  type: "qr_code" | "bank_transfer" | "online";
  bank: "BPI" | "BDO" | "GCASH" | "GOTYME" | "MAYA";
  accountNumber?: string;
  accountName?: string;
  qrCode?: string;
}

export interface QRPayment {
  id: string;
  orderId: string;
  amount: number; // Pre-identified amount (exact amount to pay)
  currency: "PHP";
  bank: "BPI" | "BDO" | "GCASH" | "GOTYME" | "MAYA";
  qrCode: string; // Base64 or URL with pre-identified amount
  qrCodeData?: string; // The actual QR code data for scanning
  paymentType: "full" | "downpayment"; // Payment type
  expiresAt: Date;
  paid: boolean;
  paidAt?: Date;
  verified: boolean; // Verified by Manila admin
  verifiedAt?: Date;
  verifiedBy?: string; // Admin who verified
  createdAt: Date;
}

export interface DocumentUpload {
  id: string;
  userId: string;
  orderId?: string;
  invoiceId?: string;
  type: "proof_of_payment" | "id" | "other";
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

