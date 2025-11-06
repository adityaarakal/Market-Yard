import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export default function Card({ children, style, elevation = 2 }: CardProps) {
  return (
    <View style={[styles.card, { shadowOpacity: elevation * 0.1 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 2,
  },
});

