import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import ShopOwnerNavigator from './ShopOwnerNavigator';
import EndUserNavigator from './EndUserNavigator';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Welcome" component={AuthNavigator} />
        ) : user?.user_type === 'shop_owner' ? (
          <Stack.Screen name="ShopOwnerStack" component={ShopOwnerNavigator} />
        ) : (
          <Stack.Screen name="EndUserStack" component={EndUserNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

