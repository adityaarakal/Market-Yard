import { Notification } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';
import { STORAGE_KEYS } from '../utils/constants';

export interface CreateNotificationInput {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new notification
 */
export function createNotification(input: CreateNotificationInput): Notification {
  const notification: Notification = {
    id: generateId('notification'),
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    is_read: false,
    action_url: input.actionUrl,
    metadata: input.metadata,
    created_at: new Date().toISOString(),
  };

  StorageService.saveNotification(notification);
  return notification;
}

/**
 * Get all notifications for a user
 */
export function getUserNotifications(userId: string): Notification[] {
  return StorageService.getNotificationsByUserId(userId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Get unread notifications for a user
 */
export function getUnreadNotifications(userId: string): Notification[] {
  return StorageService.getUnreadNotificationsByUserId(userId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Get unread notification count for a user
 */
export function getUnreadNotificationCount(userId: string): number {
  return getUnreadNotifications(userId).length;
}

/**
 * Mark a notification as read
 */
export function markAsRead(notificationId: string): void {
  StorageService.markNotificationAsRead(notificationId);
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId: string): void {
  StorageService.markAllNotificationsAsRead(userId);
}

/**
 * Mark a notification as unread
 */
export function markAsUnread(notificationId: string): void {
  const notifications = StorageService.getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.is_read = false;
    notification.read_at = undefined;
    StorageService.saveNotification(notification);
  }
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  StorageService.deleteNotification(notificationId);
}

/**
 * Delete all notifications for a user
 */
export function deleteAllNotifications(userId: string): void {
  const notifications = StorageService.getNotifications();
  const filtered = notifications.filter(n => n.user_id !== userId);
  // Save only notifications not belonging to this user
  StorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
}

/**
 * Get notification preferences for a user
 */
export function getNotificationPreferences(userId: string): Record<string, boolean> {
  return StorageService.getNotificationPreferences(userId);
}

/**
 * Save notification preferences for a user
 */
export function saveNotificationPreferences(userId: string, preferences: Record<string, boolean>): void {
  StorageService.saveNotificationPreferences(userId, preferences);
}

/**
 * Check if a notification type is enabled for a user
 */
export function isNotificationTypeEnabled(userId: string, type: Notification['type']): boolean {
  const preferences = getNotificationPreferences(userId);
  // Default to true if preference not set
  return preferences[type] !== false;
}

/**
 * Create sample notifications for testing
 */
export function createSampleNotifications(userId: string): void {
  const now = new Date();
  const sampleNotifications: CreateNotificationInput[] = [
    {
      userId,
      type: 'price_drop',
      title: 'Price Drop Alert! 🎉',
      message: 'Tomato price dropped to ₹40/kg at Fresh Market',
      actionUrl: '/end-user/global-prices',
      metadata: { productId: 'prod_1', shopId: 'shop_1' },
    },
    {
      userId,
      type: 'payment_received',
      title: 'Payment Received',
      message: 'You received ₹5.00 for price updates',
      actionUrl: '/shop-owner/earnings',
    },
    {
      userId,
      type: 'subscription_expiring',
      title: 'Subscription Expiring Soon',
      message: 'Your premium subscription expires in 3 days',
      actionUrl: '/subscription/manage',
    },
    {
      userId,
      type: 'system',
      title: 'Welcome to Market Yard!',
      message: 'Thank you for joining Market Yard. Start exploring products and prices.',
      actionUrl: '/end-user/home',
    },
  ];

  sampleNotifications.forEach((input, index) => {
    const notificationDate = new Date(now.getTime() - index * 24 * 60 * 60 * 1000); // Spread over days
    const notification: Notification = {
      id: generateId('notification'),
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      is_read: index > 1, // First two are unread
      action_url: input.actionUrl,
      metadata: input.metadata,
      created_at: notificationDate.toISOString(),
      read_at: index > 1 ? notificationDate.toISOString() : undefined,
    };
    StorageService.saveNotification(notification);
  });
}

