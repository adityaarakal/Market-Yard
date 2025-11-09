import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { EndUserStackParamList } from './types';
import PlaceholderScreen from '../screens/PlaceholderScreen';

// Placeholder screens - will be implemented later
const HomeScreen = () => <PlaceholderScreen title="Home" subtitle="Market Yard" />;
const GlobalPricesScreen = () => (
  <PlaceholderScreen title="Global Prices" subtitle="View all product prices" />
);
const ProductDetailScreen = ({
  route,
}: {
  route: RouteProp<EndUserStackParamList, 'ProductDetail'>;
}) => (
  <PlaceholderScreen title="Product Details" subtitle={`Product ID: ${route.params.productId}`} />
);
const ShopDetailScreen = ({ route }: { route: RouteProp<EndUserStackParamList, 'ShopDetail'> }) => (
  <PlaceholderScreen title="Shop Details" subtitle={`Shop ID: ${route.params.shopId}`} />
);
const SubscriptionScreen = () => (
  <PlaceholderScreen title="Subscription" subtitle="Premium features" />
);
const ProfileScreen = () => <PlaceholderScreen title="Profile" subtitle="Your profile" />;

const Stack = createNativeStackNavigator<EndUserStackParamList>();

const screenOptions = {
  headerShown: true,
};

export default function EndUserNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="GlobalPrices" component={GlobalPricesScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
