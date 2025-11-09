import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShopOwnerStackParamList } from './types';
import PlaceholderScreen from '../screens/PlaceholderScreen';

// Placeholder screens - will be implemented later
const DashboardScreen = () => <PlaceholderScreen title="Dashboard" subtitle="Shop Owner" />;
const ShopRegistrationScreen = () => (
  <PlaceholderScreen title="Shop Registration" subtitle="Register your shop" />
);
const ProductManagementScreen = () => (
  <PlaceholderScreen title="Product Management" subtitle="Manage your products" />
);
const PriceUpdateScreen = () => (
  <PlaceholderScreen title="Price Update" subtitle="Update product prices" />
);
const EarningsScreen = () => <PlaceholderScreen title="Earnings" subtitle="View your earnings" />;
const ProfileScreen = () => <PlaceholderScreen title="Profile" subtitle="Your profile" />;

const Stack = createNativeStackNavigator<ShopOwnerStackParamList>();

const screenOptions = {
  headerShown: true,
};

export default function ShopOwnerNavigator() {
  return (
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ShopRegistration" component={ShopRegistrationScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="PriceUpdate" component={PriceUpdateScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
