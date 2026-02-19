// Theme Constants for Premium Community Sharing App

export const COLORS = {
  // Primary Colors
  primary: '#2D5BFF',
  primaryDark: '#1E47CC',
  primaryLight: '#4A73FF',
  
  // Background Colors
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2A2A2A',
  
  // Accent Colors
  premium: '#8A2BE2',
  premiumLight: '#A855F7',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#6B7280',
  
  // Border Colors
  border: '#333333',
  borderLight: '#404040',
  
  // Glassmorphism
  glassBackground: 'rgba(30, 30, 30, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const CATEGORIES_ICONS: { [key: string]: string } = {
  'Streaming': 'play-circle',
  'Software': 'code',
  'Education': 'book-open',
  'Tools': 'tool',
  'Fitness': 'activity',
  'Gaming': 'cpu',
  'Music': 'music',
  'Default': 'grid',
};
