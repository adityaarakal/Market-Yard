import React from 'react';
import { View, StyleSheet, ViewStyle, SafeAreaView } from 'react-native';
import { colors } from '../theme';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
}

export default function Container({ children, style, safeArea = true }: ContainerProps) {
  const content = <View style={[styles.container, style]}>{children}</View>;

  if (safeArea) {
    return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
  }

  return content;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

