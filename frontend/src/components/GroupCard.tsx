import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';
import { Group } from '../services/groupService';
import { PremiumBadge } from './PremiumBadge';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  showExpiring?: boolean;
  expiringText?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  onPress, 
  showExpiring = false,
  expiringText 
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {showExpiring && expiringText && (
        <View style={styles.expiringBanner}>
          <Feather name="alert-circle" size={12} color={COLORS.warning} />
          <Text style={styles.expiringText}>{expiringText}</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="users" size={22} color={COLORS.primary} />
        </View>
        {group.isPremium ? (
          <PremiumBadge price={group.price} />
        ) : (
          <View style={styles.freeBadge}>
            <Text style={styles.freeText}>Free</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.name} numberOfLines={1}>{group.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{group.description}</Text>
      
      <View style={styles.footer}>
        <View style={styles.memberCount}>
          <Feather name="user" size={14} color={COLORS.textSecondary} />
          <Text style={styles.memberText}>{group.memberCount} members</Text>
        </View>
        <Text style={styles.category}>{group.categoryName}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  expiringBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}20`,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  expiringText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeBadge: {
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  freeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  category: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
});
