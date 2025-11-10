import { Subscription } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';

export interface CreateSubscriptionInput {
  userId: string;
  amount: number;
  durationInDays: number;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionInput {
  status?: Subscription['status'];
  expiresAt?: string;
  autoRenew?: boolean;
  amount?: number;
}

export function createSubscription(input: CreateSubscriptionInput): Subscription {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + input.durationInDays * 24 * 60 * 60 * 1000);

  const activeSubscription = StorageService.getSubscriptionByUserId(input.userId);
  if (activeSubscription) {
    activeSubscription.status = 'cancelled';
    activeSubscription.cancelled_at = now.toISOString();
    activeSubscription.updated_at = now.toISOString();
    StorageService.saveSubscription(activeSubscription);
  }

  const subscription: Subscription = {
    id: generateId('subscription'),
    user_id: input.userId,
    status: 'active',
    amount: input.amount,
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    auto_renew: input.autoRenew ?? true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  StorageService.saveSubscription(subscription);
  return subscription;
}

export function getSubscriptionStatus(userId: string): Subscription | null {
  return StorageService.getSubscriptionByUserId(userId);
}

export function updateSubscription(subscriptionId: string, changes: UpdateSubscriptionInput): Subscription {
  const history = StorageService.getSubscriptions();
  const existing = history.find(sub => sub.id === subscriptionId);
  if (!existing) {
    throw new Error('Subscription not found');
  }

  const updated: Subscription = {
    ...existing,
    status: changes.status ?? existing.status,
    expires_at: changes.expiresAt ?? existing.expires_at,
    auto_renew: changes.autoRenew ?? existing.auto_renew,
    amount: changes.amount ?? existing.amount,
    updated_at: new Date().toISOString(),
  };

  StorageService.saveSubscription(updated);
  return updated;
}

export function cancelSubscription(subscriptionId: string): Subscription {
  return updateSubscription(subscriptionId, {
    status: 'cancelled',
    expiresAt: new Date().toISOString(),
    autoRenew: false,
  });
}

export function getSubscriptionHistory(userId: string): Subscription[] {
  return StorageService.getSubscriptionHistoryByUser(userId).sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}


