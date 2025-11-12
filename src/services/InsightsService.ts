import { Shop, Product, ShopProduct, PriceUpdate } from '../types';
import StorageService from './StorageService';
import { getGlobalPriceSummary, GlobalPriceEntry } from './PriceService';

export interface PopularShop {
  shop: Shop;
  productCount: number;
  totalPriceUpdates: number;
  averageRating: number;
  goodwillScore: number;
  popularityScore: number; // Calculated score based on multiple factors
}

export interface TrendingProduct {
  product: Product;
  priceChange: number; // Percentage change in price
  priceChangeDirection: 'up' | 'down' | 'stable';
  viewCount: number; // Mock data
  shopCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  trendScore: number; // Calculated score based on multiple factors
}

export interface BestDeal {
  product: Product;
  shop: Shop;
  price: number;
  savings: number; // Savings compared to average price
  savingsPercentage: number;
  dealScore: number;
}

export interface UserPurchasingPattern {
  category: string;
  purchaseCount: number;
  totalSpent: number;
  averagePrice: number;
  favoriteShops: string[];
  favoriteProducts: string[];
}

export interface Recommendation {
  type: 'product' | 'shop' | 'deal';
  title: string;
  description: string;
  productId?: string;
  shopId?: string;
  dealId?: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Get most popular shops based on ratings, goodwill, product count, and price updates
 */
export function getMostPopularShops(limit: number = 10): PopularShop[] {
  const shops = StorageService.getShops().filter(s => s.is_active);
  const shopProducts = StorageService.getShopProducts();
  const priceUpdates = StorageService.getPriceUpdates();

  const popularShops: PopularShop[] = shops.map(shop => {
    const shopProductList = shopProducts.filter(sp => sp.shop_id === shop.id);
    const productCount = shopProductList.length;
    const totalPriceUpdates = priceUpdates.filter(
      update => shopProductList.some(sp => sp.id === update.shop_product_id)
    ).length;

    // Calculate popularity score (weighted combination)
    // Factors: ratings (40%), goodwill (20%), product count (20%), price updates (20%)
    const ratingScore = (shop.average_rating || 0) * 20; // Max 100 (5 * 20)
    const goodwillScore = shop.goodwill_score || 0;
    const productScore = Math.min(productCount * 2, 100); // Max 100 (50 products)
    const updateScore = Math.min(totalPriceUpdates * 2, 100); // Max 100 (50 updates)

    const popularityScore =
      ratingScore * 0.4 + goodwillScore * 0.2 + productScore * 0.2 + updateScore * 0.2;

    return {
      shop,
      productCount,
      totalPriceUpdates,
      averageRating: shop.average_rating || 0,
      goodwillScore: shop.goodwill_score || 0,
      popularityScore,
    };
  });

  // Sort by popularity score (descending)
  return popularShops.sort((a, b) => b.popularityScore - a.popularityScore).slice(0, limit);
}

/**
 * Get trending products based on price changes, view count, and shop count
 */
export function getTrendingProducts(limit: number = 10): TrendingProduct[] {
  const products = StorageService.getProducts().filter(p => p.is_active);
  const shopProducts = StorageService.getShopProducts();
  const priceUpdates = StorageService.getPriceUpdates();
  const globalPrices = getGlobalPriceSummary();

  // Calculate price changes over the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendingProducts: TrendingProduct[] = products.map(product => {
    const productShopProducts = shopProducts.filter(sp => sp.product_id === product.id);
    const shopCount = productShopProducts.filter(sp => sp.is_available && sp.current_price != null).length;

    // Get recent price updates (last 7 days)
    const recentUpdates = priceUpdates.filter(update => {
      const updateDate = new Date(update.created_at);
      return (
        updateDate >= sevenDaysAgo &&
        productShopProducts.some(sp => sp.id === update.shop_product_id)
      );
    });

    // Get older price updates (8-14 days ago)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const olderUpdates = priceUpdates.filter(update => {
      const updateDate = new Date(update.created_at);
      return (
        updateDate >= fourteenDaysAgo &&
        updateDate < sevenDaysAgo &&
        productShopProducts.some(sp => sp.id === update.shop_product_id)
      );
    });

    // Calculate average prices
    const recentAvgPrice =
      recentUpdates.length > 0
        ? recentUpdates.reduce((sum, update) => sum + update.price, 0) / recentUpdates.length
        : null;
    const olderAvgPrice =
      olderUpdates.length > 0
        ? olderUpdates.reduce((sum, update) => sum + update.price, 0) / olderUpdates.length
        : null;

    // Calculate price change
    let priceChange = 0;
    let priceChangeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvgPrice && olderAvgPrice && olderAvgPrice > 0) {
      priceChange = ((recentAvgPrice - olderAvgPrice) / olderAvgPrice) * 100;
      if (priceChange > 2) {
        priceChangeDirection = 'up';
      } else if (priceChange < -2) {
        priceChangeDirection = 'down';
      } else {
        priceChangeDirection = 'stable';
      }
    }

    // Mock view count (based on shop count and price updates)
    const viewCount = shopCount * 10 + recentUpdates.length * 5;

    // Get current price range
    const globalPrice = globalPrices.find(p => p.product.id === product.id);
    const minPrice = globalPrice?.minPrice || null;
    const maxPrice = globalPrice?.maxPrice || null;

    // Calculate trend score
    // Factors: price change (40%), view count (30%), shop count (30%)
    const priceChangeScore = Math.min(Math.abs(priceChange) * 10, 100);
    const viewCountScore = Math.min(viewCount, 100);
    const shopCountScore = Math.min(shopCount * 10, 100);
    const trendScore = priceChangeScore * 0.4 + viewCountScore * 0.3 + shopCountScore * 0.3;

    return {
      product,
      priceChange,
      priceChangeDirection,
      viewCount,
      shopCount,
      minPrice,
      maxPrice,
      trendScore,
    };
  });

  // Filter out products with no data and sort by trend score
  return trendingProducts
    .filter(tp => tp.shopCount > 0 && tp.minPrice != null)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

/**
 * Get best deals (products with lowest prices compared to average)
 */
export function getBestDeals(limit: number = 10): BestDeal[] {
  const globalPrices = getGlobalPriceSummary();
  const shopProducts = StorageService.getShopProducts();
  const shops = StorageService.getShops().filter(s => s.is_active);

  const deals: BestDeal[] = [];

  globalPrices.forEach(entry => {
    if (entry.minPrice == null || entry.avgPrice == null || entry.minPrice === entry.avgPrice) {
      return;
    }

    const savings = entry.avgPrice - entry.minPrice;
    const savingsPercentage = (savings / entry.avgPrice) * 100;

    // Only include deals with at least 5% savings
    if (savingsPercentage < 5) {
      return;
    }

    if (entry.bestShop) {
      const dealScore = savingsPercentage * 10 + (entry.shopCount > 1 ? 20 : 0);

      deals.push({
        product: entry.product,
        shop: entry.bestShop,
        price: entry.minPrice,
        savings,
        savingsPercentage,
        dealScore,
      });
    }
  });

  // Sort by deal score (descending)
  return deals.sort((a, b) => b.dealScore - a.dealScore).slice(0, limit);
}

/**
 * Get user purchasing patterns (mock data for now)
 */
export function getUserPurchasingPatterns(_userId: string): UserPurchasingPattern {
  // Mock data - in real implementation, this would come from purchase history
  const categories = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];
  const patterns: UserPurchasingPattern[] = categories.map(category => {
    // Mock purchase count (random between 5-50)
    const purchaseCount = Math.floor(Math.random() * 45) + 5;
    // Mock total spent (based on purchase count)
    const totalSpent = purchaseCount * (Math.random() * 200 + 50);
    const averagePrice = totalSpent / purchaseCount;

    // Mock favorite shops (top 3 shops)
    const shops = StorageService.getShops()
      .filter(s => s.is_active)
      .slice(0, 3)
      .map(s => s.id);

    // Mock favorite products (top 5 products in this category)
    const products = StorageService.getProducts()
      .filter(p => p.is_active && p.category === category)
      .slice(0, 5)
      .map(p => p.id);

    return {
      category,
      purchaseCount,
      totalSpent,
      averagePrice,
      favoriteShops: shops,
      favoriteProducts: products,
    };
  });

  // Return aggregated pattern (combining all categories)
  return {
    category: 'all',
    purchaseCount: patterns.reduce((sum, p) => sum + p.purchaseCount, 0),
    totalSpent: patterns.reduce((sum, p) => sum + p.totalSpent, 0),
    averagePrice: patterns.reduce((sum, p) => sum + p.averagePrice, 0) / patterns.length,
    favoriteShops: Array.from(new Set(patterns.flatMap(p => p.favoriteShops))).slice(0, 5),
    favoriteProducts: Array.from(new Set(patterns.flatMap(p => p.favoriteProducts))).slice(0, 10),
  };
}

/**
 * Get recommendations based on user behavior and market data
 */
export function getRecommendations(userId: string): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const globalPrices = getGlobalPriceSummary();
  const popularShops = getMostPopularShops(5);
  const trendingProducts = getTrendingProducts(5);
  const bestDeals = getBestDeals(5);
  const userPatterns = getUserPurchasingPatterns(userId);

  // Product recommendations based on user's favorite categories
  const userCategoryProducts = globalPrices.filter(entry =>
    userPatterns.favoriteProducts.includes(entry.product.id)
  );
  if (userCategoryProducts.length > 0) {
    const product = userCategoryProducts[0].product;
    recommendations.push({
      type: 'product',
      title: `Check out ${product.name}`,
      description: `Based on your preferences, you might like ${product.name}. Currently available at ${userCategoryProducts[0].shopCount} shops.`,
      productId: product.id,
      priority: 'high',
    });
  }

  // Shop recommendations based on popular shops
  if (popularShops.length > 0) {
    const shop = popularShops[0].shop;
    recommendations.push({
      type: 'shop',
      title: `Visit ${shop.shop_name}`,
      description: `Highly rated shop with ${popularShops[0].productCount} products and ${popularShops[0].averageRating.toFixed(1)}⭐ rating.`,
      shopId: shop.id,
      priority: 'high',
    });
  }

  // Deal recommendations
  if (bestDeals.length > 0) {
    const deal = bestDeals[0];
    recommendations.push({
      type: 'deal',
      title: `Great Deal: ${deal.product.name}`,
      description: `Save ${deal.savingsPercentage.toFixed(1)}% on ${deal.product.name} at ${deal.shop.shop_name}.`,
      productId: deal.product.id,
      shopId: deal.shop.id,
      priority: 'high',
    });
  }

  // Trending product recommendations
  if (trendingProducts.length > 0) {
    const trending = trendingProducts[0];
    const trendText =
      trending.priceChangeDirection === 'down'
        ? `Price dropped by ${Math.abs(trending.priceChange).toFixed(1)}%`
        : trending.priceChangeDirection === 'up'
        ? `Price increased by ${trending.priceChange.toFixed(1)}%`
        : 'Price is stable';
    recommendations.push({
      type: 'product',
      title: `Trending: ${trending.product.name}`,
      description: `${trending.product.name} is trending. ${trendText}. Available at ${trending.shopCount} shops.`,
      productId: trending.product.id,
      priority: 'medium',
    });
  }

  // Category-based recommendations
  if (userPatterns.category !== 'all') {
    const categoryProducts = globalPrices.filter(
      entry => entry.product.category === userPatterns.category
    );
    if (categoryProducts.length > 0) {
      const product = categoryProducts[0].product;
      recommendations.push({
        type: 'product',
        title: `New in ${product.category.replace('_', ' ')}`,
        description: `Discover ${product.name} in the ${product.category.replace('_', ' ')} category.`,
        productId: product.id,
        priority: 'medium',
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Get category distribution for user purchases (mock data)
 */
export function getCategoryDistribution(_userId: string): Record<string, number> {
  const categories = ['fruits', 'vegetables', 'farming_materials', 'farming_products'];

  // Mock distribution based on purchase patterns
  const distribution: Record<string, number> = {};
  categories.forEach(category => {
    // Mock percentage (should sum to 100)
    distribution[category] = Math.floor(Math.random() * 40) + 15;
  });

  // Normalize to 100%
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  Object.keys(distribution).forEach(key => {
    distribution[key] = Math.round((distribution[key] / total) * 100);
  });

  return distribution;
}

/**
 * Get monthly spending trend (mock data)
 */
export function getMonthlySpendingTrend(_userId: string): Array<{ month: string; amount: number }> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  // Mock data - generate spending for last 6 months
  return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map(month => ({
    month,
    amount: Math.floor(Math.random() * 5000) + 2000, // Random between 2000-7000
  }));
}

