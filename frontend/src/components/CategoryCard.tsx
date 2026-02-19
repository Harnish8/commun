import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS, CATEGORIES_ICONS } from '../constants/theme';
import { Category } from '../services/groupService';

interface CategoryCardProps {
  category: Category;
  groupCount: number;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, groupCount, onPress }) => {
  const iconName = CATEGORIES_ICONS[category.name] || CATEGORIES_ICONS['Default'];
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Feather name={iconName as any} size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
      <Text style={styles.count}>{groupCount} groups</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '47%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  count: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
