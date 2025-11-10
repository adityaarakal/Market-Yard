import { colors } from './colors';

export { colors };

export const theme = {
  colors,
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '9999px',
  },
  typography: {
    h1: {
      fontSize: '32px',
      fontWeight: 'bold',
      lineHeight: '40px',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: '32px',
    },
    h3: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '28px',
    },
    body: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    bodySmall: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
    },
    caption: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '16px',
    },
  },
};

export type Theme = typeof theme;

