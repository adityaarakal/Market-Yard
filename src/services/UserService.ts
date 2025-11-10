import { User } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';
import { VALIDATION } from '../utils/constants';

type UserRole = User['user_type'];

export interface CreateUserInput {
  phone: string;
  name: string;
  userType: UserRole;
  password?: string;
  email?: string;
  isPremium?: boolean;
  subscriptionExpiresAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  userType?: UserRole;
  isPremium?: boolean;
  subscriptionExpiresAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function validatePhone(phone: string) {
  if (!VALIDATION.PHONE_NUMBER_REGEX.test(phone)) {
    throw new Error('Invalid phone number format');
  }
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const normalizedPhone = normalizePhone(input.phone);
  validatePhone(normalizedPhone);

  const existing = StorageService.getUserByPhone(normalizedPhone);
  if (existing) {
    throw new Error('Phone number already registered');
  }

  const now = new Date().toISOString();
  const user: User = {
    id: generateId('user'),
    phone_number: normalizedPhone,
    name: input.name.trim(),
    email: input.email?.trim(),
    user_type: input.userType,
    password_hash: input.password,
    is_premium: input.isPremium ?? false,
    subscription_expires_at: input.subscriptionExpiresAt,
    is_active: input.isActive ?? true,
    is_verified: input.isVerified ?? false,
    created_at: now,
    updated_at: now,
  };

  StorageService.saveUser(user);
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return StorageService.getUsers();
}

export async function getUserById(userId: string): Promise<User | null> {
  return StorageService.getUserById(userId);
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  return StorageService.getUserByPhone(normalizePhone(phone));
}

export async function updateUser(userId: string, updates: UpdateUserInput): Promise<User> {
  const existing = StorageService.getUserById(userId);
  if (!existing) {
    throw new Error('User not found');
  }

  let phoneNumber = existing.phone_number;
  if (updates.phone) {
    const normalizedPhone = normalizePhone(updates.phone);
    validatePhone(normalizedPhone);

    const conflict = StorageService.getUserByPhone(normalizedPhone);
    if (conflict && conflict.id !== userId) {
      throw new Error('Phone number already in use');
    }
    phoneNumber = normalizedPhone;
  }

  const updated: User = {
    ...existing,
    name: updates.name?.trim() || existing.name,
    email: typeof updates.email === 'string' ? updates.email.trim() || undefined : existing.email,
    phone_number: phoneNumber,
    user_type: updates.userType ?? existing.user_type,
    password_hash: updates.password ?? existing.password_hash,
    is_premium: updates.isPremium ?? existing.is_premium,
    subscription_expires_at: updates.subscriptionExpiresAt ?? existing.subscription_expires_at,
    is_active: updates.isActive ?? existing.is_active,
    is_verified: updates.isVerified ?? existing.is_verified,
    updated_at: new Date().toISOString(),
  };

  StorageService.saveUser(updated);
  return updated;
}

export async function deleteUser(userId: string): Promise<void> {
  StorageService.deleteUser(userId);
}


