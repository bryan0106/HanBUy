import apiClient from '@/lib/apiClient';
import { handleApiError } from '@/utils/errorHandler';

export interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'payment' | 'shipping' | 'box' | 'system';
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GetNotificationsParams {
  read?: boolean;
  type?: 'order' | 'payment' | 'shipping' | 'box' | 'system';
  page?: number;
  limit?: number;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarkNotificationReadResponse {
  success: boolean;
  data: Notification;
  message?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  payment_updates: boolean;
  shipping_updates: boolean;
  box_updates: boolean;
  system_announcements: boolean;
}

export interface GetNotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

export interface UpdateNotificationPreferencesRequest {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  order_updates?: boolean;
  payment_updates?: boolean;
  shipping_updates?: boolean;
  box_updates?: boolean;
  system_announcements?: boolean;
}

export interface UpdateNotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
  message?: string;
}

export const notificationService = {
  /**
   * Get user notifications with optional filters
   */
  async getNotifications(params?: GetNotificationsParams): Promise<GetNotificationsResponse> {
    try {
      const response = await apiClient.get<GetNotificationsResponse>('/notifications', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<Notification> {
    try {
      const response = await apiClient.patch<MarkNotificationReadResponse>(
        `/notifications/${id}/read`
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<GetNotificationPreferencesResponse>(
        '/notifications/preferences'
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.patch<UpdateNotificationPreferencesResponse>(
        '/notifications/preferences',
        preferences
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
