import { Product } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';

export interface CreateProductInput {
  name: string;
  category: Product['category'];
  unit: Product['unit'];
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  category?: Product['category'];
  unit?: Product['unit'];
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export function createProduct(input: CreateProductInput): Product {
  const now = new Date().toISOString();
  const product: Product = {
    id: generateId('product'),
    name: input.name.trim(),
    category: input.category,
    unit: input.unit,
    description: input.description?.trim(),
    image_url: input.imageUrl?.trim(),
    is_active: input.isActive ?? true,
    created_at: now,
  };

  StorageService.saveProduct(product);
  return product;
}

export function getAllProducts(): Product[] {
  return StorageService.getProducts().sort((a, b) => a.name.localeCompare(b.name));
}

export function getProductById(productId: string): Product | null {
  return StorageService.getProductById(productId);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return StorageService.getProducts()
    .filter(product => product.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function searchProducts(query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getAllProducts();
  }

  return StorageService.getProducts()
    .filter(product => {
      const haystack = [product.name, product.category, product.unit, product.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function updateProduct(productId: string, updates: UpdateProductInput): Product {
  const existing = StorageService.getProductById(productId);
  if (!existing) {
    throw new Error('Product not found');
  }

  const updated: Product = {
    ...existing,
    name: updates.name?.trim() || existing.name,
    category: updates.category ?? existing.category,
    unit: updates.unit ?? existing.unit,
    description: typeof updates.description === 'string' ? updates.description.trim() || undefined : existing.description,
    image_url: typeof updates.imageUrl === 'string' ? updates.imageUrl.trim() || undefined : existing.image_url,
    is_active: updates.isActive ?? existing.is_active,
  };

  StorageService.saveProduct(updated);
  return updated;
}

export function deleteProduct(productId: string): void {
  StorageService.deleteProduct(productId);
}


