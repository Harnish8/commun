import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../constants/theme';

interface PremiumBadgeProps {
  price: string;
  size?: 'small' | 'medium' | 'large';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ price, size = 'medium' }) => {
  const sizeStyles = {
    small: { paddingH: SPACING.xs, paddingV: 2, fontSize: FONT_SIZES.xs, iconSize: 10 },
    medium: { paddingH: SPACING.sm, paddingV: SPACING.xs, fontSize: FONT_SIZES.sm, iconSize: 12 },
    large: { paddingH: SPACING.md, paddingV: SPACING.sm, fontSize: FONT_SIZES.md, iconSize: 14 },
  }[size];

  return (
    <View style={[
      styles.container,
      { paddingHorizontal: sizeStyles.paddingH, paddingVertical: sizeStyles.paddingV }
    ]}>
      <Feather name="star" size={sizeStyles.iconSize} color={COLORS.premium} />
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>Premium</Text>
      <Text style={[styles.price, { fontSize: sizeStyles.fontSize }]}>{price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.premium}20`,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.premium}40`,
  },
  text: {
    fontWeight: '600',
    color: COLORS.premium,
    marginLeft: SPACING.xs,
  },
  price: {
    fontWeight: '400',
    color: COLORS.premiumLight,
    marginLeft: SPACING.xs,
  },
});
