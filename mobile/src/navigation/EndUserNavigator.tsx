import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EndUserStackParamList } from './types';

// Placeholder screens - will be implemented later
const HomeScreen = () => null;
const GlobalPricesScreen = () => null;
const ProductDetailScreen = () => null;
const ShopDetailScreen = () => null;
const SubscriptionScreen = () => null;
const ProfileScreen = () => null;

const Stack = createNativeStackNavigator<EndUserStackParamList>();

export default function EndUserNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="GlobalPrices" component={GlobalPricesScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

