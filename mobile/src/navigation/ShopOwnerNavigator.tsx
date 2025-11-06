import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShopOwnerStackParamList } from './types';

// Placeholder screens - will be implemented later
const DashboardScreen = () => null;
const ShopRegistrationScreen = () => null;
const ProductManagementScreen = () => null;
const PriceUpdateScreen = () => null;
const EarningsScreen = () => null;
const ProfileScreen = () => null;

const Stack = createNativeStackNavigator<ShopOwnerStackParamList>();

export default function ShopOwnerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ShopRegistration" component={ShopRegistrationScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="PriceUpdate" component={PriceUpdateScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

