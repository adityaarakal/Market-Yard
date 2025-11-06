import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone: string };
  ShopOwnerStack: NavigatorScreenParams<ShopOwnerStackParamList>;
  EndUserStack: NavigatorScreenParams<EndUserStackParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone: string };
};

export type ShopOwnerStackParamList = {
  Dashboard: undefined;
  ShopRegistration: undefined;
  ProductManagement: undefined;
  PriceUpdate: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type EndUserStackParamList = {
  Home: undefined;
  GlobalPrices: undefined;
  ProductDetail: { productId: string };
  ShopDetail: { shopId: string };
  Subscription: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

