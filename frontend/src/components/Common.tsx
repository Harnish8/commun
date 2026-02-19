import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  subtitle, 
  actionText, 
  onAction 
}) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Feather name={icon as any} size={48} color={COLORS.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {actionText && onAction && (
      <TouchableOpacity style={styles.emptyButton} onPress={onAction}>
        <Text style={styles.emptyButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon, 
  disabled = false,
  loading = false 
}) => {
  const variantStyles = {
    primary: { bg: COLORS.primary, text: '#FFFFFF' },
    secondary: { bg: COLORS.backgroundSecondary, text: COLORS.textPrimary },
    danger: { bg: COLORS.error, text: '#FFFFFF' },
    success: { bg: COLORS.success, text: '#FFFFFF' },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variantStyles.bg },
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text} />
      ) : (
        <>
          {icon && <Feather name={icon as any} size={18} color={variantStyles.text} style={styles.buttonIcon} />}
          <Text style={[styles.buttonText, { color: variantStyles.text }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
