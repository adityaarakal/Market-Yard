import StorageService from './StorageService';
import { STORAGE_KEYS } from '../utils/constants';
import { getAllProducts } from './ProductService';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount?: number;
}

export interface PopularSearch {
  query: string;
  count: number;
}

/**
 * Save a search query to history
 */
export function saveSearchHistory(userId: string, query: string, resultCount?: number): void {
  if (!query.trim()) return;

  const history = getSearchHistory(userId);
  const now = new Date().toISOString();

  // Remove duplicate if exists
  const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());

  // Add new search at the beginning
  const newItem: SearchHistoryItem = {
    id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    query: query.trim(),
    timestamp: now,
    resultCount,
  };

  const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50 searches
  saveSearchHistoryForUser(userId, updated);
}

/**
 * Get search history for a user
 */
export function getSearchHistory(userId: string): SearchHistoryItem[] {
  const allHistory = StorageService.getItem<Record<string, SearchHistoryItem[]>>(STORAGE_KEYS.SETTINGS) || {};
  return allHistory[`search_history_${userId}`] || [];
}

/**
 * Save search history for a user
 */
function saveSearchHistoryForUser(userId: string, history: SearchHistoryItem[]): void {
  const allHistory = StorageService.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS) || {};
  allHistory[`search_history_${userId}`] = history;
  StorageService.setItem(STORAGE_KEYS.SETTINGS, allHistory);
}

/**
 * Clear search history for a user
 */
export function clearSearchHistory(userId: string): void {
  saveSearchHistoryForUser(userId, []);
}

/**
 * Get recent searches (last 10)
 */
export function getRecentSearches(userId: string, limit: number = 10): SearchHistoryItem[] {
  return getSearchHistory(userId).slice(0, limit);
}

/**
 * Get popular searches based on search frequency
 */
export function getPopularSearches(userId: string, limit: number = 10): PopularSearch[] {
  const history = getSearchHistory(userId);
  const queryCounts: Record<string, number> = {};

  history.forEach(item => {
    const query = item.query.toLowerCase();
    queryCounts[query] = (queryCounts[query] || 0) + 1;
  });

  return Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => ({ query: item.query, count: item.count }));
}

/**
 * Get search suggestions based on current query
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  if (!query.trim()) return [];

  const queryLower = query.toLowerCase();
  const products = getAllProducts();
  const suggestions: string[] = [];

  // Match product names
  products.forEach(product => {
    if (product.name.toLowerCase().includes(queryLower)) {
      if (!suggestions.includes(product.name)) {
        suggestions.push(product.name);
      }
    }
  });

  // Match categories
  const categories = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];
  categories.forEach(category => {
    if (category.toLowerCase().includes(queryLower) || category.replace('_', ' ').toLowerCase().includes(queryLower)) {
      const displayName = category.replace('_', ' ');
      if (!suggestions.includes(displayName)) {
        suggestions.push(displayName);
      }
    }
  });

  return suggestions.slice(0, limit);
}

/**
 * Get search suggestions from history
 */
export function getSearchSuggestionsFromHistory(userId: string, query: string, limit: number = 5): string[] {
  if (!query.trim()) return getRecentSearches(userId, limit).map(item => item.query);

  const queryLower = query.toLowerCase();
  const history = getSearchHistory(userId);
  const suggestions = history
    .filter(item => item.query.toLowerCase().includes(queryLower))
    .map(item => item.query)
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .slice(0, limit);

  return suggestions;
}

/**
 * Combine product suggestions and history suggestions
 */
export function getCombinedSearchSuggestions(userId: string, query: string, limit: number = 8): string[] {
  const productSuggestions = getSearchSuggestions(query, Math.ceil(limit / 2));
  const historySuggestions = getSearchSuggestionsFromHistory(userId, query, Math.ceil(limit / 2));

  // Combine and deduplicate
  const combined = [...productSuggestions, ...historySuggestions];
  const unique = combined.filter((value, index, self) => self.indexOf(value) === index);

  return unique.slice(0, limit);
}

