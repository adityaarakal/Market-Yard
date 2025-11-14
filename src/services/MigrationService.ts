/**
 * Data Migration Service
 * Utilities for exporting local storage data and formatting for backend migration
 */

import StorageService from './StorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { User, Shop, Product, ShopProduct, PriceUpdate, Subscription, Payment, Favorite, Notification } from '../types';

export interface MigrationData {
  version: string;
  exportedAt: string;
  metadata: {
    totalUsers: number;
    totalShops: number;
    totalProducts: number;
    totalShopProducts: number;
    totalPriceUpdates: number;
    totalSubscriptions: number;
    totalPayments: number;
    totalFavorites: number;
    totalNotifications: number;
  };
  data: {
    users: User[];
    shops: Shop[];
    products: Product[];
    shopProducts: ShopProduct[];
    priceUpdates: PriceUpdate[];
    subscriptions: Subscription[];
    payments: Payment[];
    favorites: Favorite[];
    notifications: Notification[];
  };
}

export interface BackendMigrationFormat {
  version: string;
  exportedAt: string;
  tables: {
    users: User[];
    shops: Shop[];
    products: Product[];
    shop_products: ShopProduct[];
    price_updates: PriceUpdate[];
    subscriptions: Subscription[];
    payments: Payment[];
    favorites: Favorite[];
    notifications: Notification[];
  };
}

/**
 * Export all local storage data for migration
 */
export function exportAllData(): MigrationData {
  const users = StorageService.getUsers();
  const shops = StorageService.getShops();
  const products = StorageService.getProducts();
  const shopProducts = StorageService.getShopProducts();
  const priceUpdates = StorageService.getPriceUpdates();
  const subscriptions = StorageService.getSubscriptions();
  const payments = StorageService.getPayments();
  const favorites = StorageService.getFavorites();
  const notifications = StorageService.getNotifications();

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    metadata: {
      totalUsers: users.length,
      totalShops: shops.length,
      totalProducts: products.length,
      totalShopProducts: shopProducts.length,
      totalPriceUpdates: priceUpdates.length,
      totalSubscriptions: subscriptions.length,
      totalPayments: payments.length,
      totalFavorites: favorites.length,
      totalNotifications: notifications.length,
    },
    data: {
      users,
      shops,
      products,
      shopProducts,
      priceUpdates,
      subscriptions,
      payments,
      favorites,
      notifications,
    },
  };
}

/**
 * Format data for backend migration (SQL/CSV ready format)
 */
export function formatForBackendMigration(data?: MigrationData): BackendMigrationFormat {
  const migrationData = data || exportAllData();

  return {
    version: migrationData.version,
    exportedAt: migrationData.exportedAt,
    tables: {
      users: migrationData.data.users,
      shops: migrationData.data.shops,
      products: migrationData.data.products,
      shop_products: migrationData.data.shopProducts,
      price_updates: migrationData.data.priceUpdates,
      subscriptions: migrationData.data.subscriptions,
      payments: migrationData.data.payments,
      favorites: migrationData.data.favorites,
      notifications: migrationData.data.notifications,
    },
  };
}

/**
 * Export data as JSON file
 */
export function exportDataAsFile(filename: string = `market-yard-export-${Date.now()}.json`): void {
  const data = exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data in backend migration format
 */
export function exportBackendFormat(filename: string = `market-yard-backend-export-${Date.now()}.json`): void {
  const data = formatForBackendMigration();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV files (one per table)
 */
export function exportAsCSV(): void {
  const data = exportAllData();
  const timestamp = Date.now();

  // Helper to convert array to CSV
  const arrayToCSV = (arr: any[], tableName: string): void => {
    if (arr.length === 0) return;

    const headers = Object.keys(arr[0]);
    const csvRows = [
      headers.join(','),
      ...arr.map(row =>
        headers
          .map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
            return String(value).replace(/"/g, '""');
          })
          .map(v => `"${v}"`)
          .join(',')
      ),
    ];

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export each table
  arrayToCSV(data.data.users, 'users');
  arrayToCSV(data.data.shops, 'shops');
  arrayToCSV(data.data.products, 'products');
  arrayToCSV(data.data.shopProducts, 'shop_products');
  arrayToCSV(data.data.priceUpdates, 'price_updates');
  arrayToCSV(data.data.subscriptions, 'subscriptions');
  arrayToCSV(data.data.payments, 'payments');
  arrayToCSV(data.data.favorites, 'favorites');
  arrayToCSV(data.data.notifications, 'notifications');
}

/**
 * Generate SQL INSERT statements for backend migration
 */
export function generateSQLInserts(): string {
  const data = exportAllData();
  const sql: string[] = [];

  // Helper to escape SQL strings
  const escapeSQL = (value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    return `'${String(value).replace(/'/g, "''")}'`;
  };

  // Helper to generate INSERT statements
  const generateInserts = (tableName: string, rows: any[]): void => {
    if (rows.length === 0) return;

    const columns = Object.keys(rows[0]);
    sql.push(`-- ${tableName} (${rows.length} rows)`);
    sql.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES`);

    const values = rows.map((row, index) => {
      const rowValues = columns.map(col => escapeSQL(row[col]));
      const suffix = index < rows.length - 1 ? ',' : ';';
      return `  (${rowValues.join(', ')})${suffix}`;
    });

    sql.push(...values);
    sql.push('');
  };

  generateInserts('users', data.data.users);
  generateInserts('shops', data.data.shops);
  generateInserts('products', data.data.products);
  generateInserts('shop_products', data.data.shopProducts);
  generateInserts('price_updates', data.data.priceUpdates);
  generateInserts('subscriptions', data.data.subscriptions);
  generateInserts('payments', data.data.payments);
  generateInserts('favorites', data.data.favorites);
  generateInserts('notifications', data.data.notifications);

  return sql.join('\n');
}

/**
 * Export SQL file
 */
export function exportAsSQL(filename: string = `market-yard-export-${Date.now()}.sql`): void {
  const sql = generateSQLInserts();
  const blob = new Blob([sql], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get migration summary
 */
export function getMigrationSummary(): {
  totalRecords: number;
  breakdown: Record<string, number>;
  estimatedSize: string;
} {
  const data = exportAllData();
  const breakdown: Record<string, number> = {
    users: data.metadata.totalUsers,
    shops: data.metadata.totalShops,
    products: data.metadata.totalProducts,
    shopProducts: data.metadata.totalShopProducts,
    priceUpdates: data.metadata.totalPriceUpdates,
    subscriptions: data.metadata.totalSubscriptions,
    payments: data.metadata.totalPayments,
    favorites: data.metadata.totalFavorites,
    notifications: data.metadata.totalNotifications,
  };

  const totalRecords = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
  const jsonSize = JSON.stringify(data).length;
  const estimatedSize = formatBytes(jsonSize);

  return {
    totalRecords,
    breakdown,
    estimatedSize,
  };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

