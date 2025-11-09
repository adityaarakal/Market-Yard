import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import PlaceholderScreen from '../screens/PlaceholderScreen';

// Placeholder screens - will be implemented later
const WelcomeScreen = () => <PlaceholderScreen title="Welcome" subtitle="Market Yard" />;
const LoginScreen = () => <PlaceholderScreen title="Login" subtitle="Sign in to your account" />;
const RegisterScreen = () => <PlaceholderScreen title="Register" subtitle="Create a new account" />;
const OTPVerificationScreen = () => (
  <PlaceholderScreen title="OTP Verification" subtitle="Verify your phone number" />
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

const screenOptions = {
  headerShown: false,
};

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={screenOptions}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}
