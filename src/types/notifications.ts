// Notification types

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
}

export type NotificationType =
  | "invoice_created"
  | "payment_reminder"
  | "payment_received"
  | "order_confirmed"
  | "order_shipped"
  | "stock_alert"
  | "sale_alert"
  | "penalty_reminder"
  | "box_closed"
  | "photo_update_reminder"
  | "live_selling_scheduled";

export type NotificationChannel = "email" | "sms" | "facebook_messenger" | "in_app";

export interface NotificationPreference {
  userId: string;
  email: boolean;
  sms: boolean;
  facebookMessenger: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]: {
      email: boolean;
      sms: boolean;
      facebookMessenger: boolean;
      inApp: boolean;
    };
  };
}

