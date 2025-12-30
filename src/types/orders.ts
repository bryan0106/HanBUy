// Order and payment types

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: "PHP" | "KRW";
  status: OrderStatus;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: PaymentMethod;
  qrCode?: string;
  proofOfPayment?: string;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  amount: number;
  currency: "PHP";
  bank: "BPI" | "BDO" | "GCASH" | "GOTYME" | "MAYA";
  qrCode: string; // Base64 or URL
  expiresAt: Date;
  paid: boolean;
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

