import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { user, signOut, isSuperAdmin, isGroupAdmin } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const getRoleBadge = () => {
    if (isSuperAdmin) return { label: 'Super Admin', color: COLORS.premium };
    if (isGroupAdmin) return { label: 'Group Admin', color: COLORS.primary };
    return { label: 'Member', color: COLORS.success };
  };

  const roleBadge = getRoleBadge();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${roleBadge.color}20` }]}>
            <Text style={[styles.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Feather name="user" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Edit Profile</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Feather name="bell" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {(isSuperAdmin || isGroupAdmin) && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Admin</Text>
            
            {isSuperAdmin && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/admin/create-group')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: `${COLORS.premium}20` }]}>
                  <Feather name="plus-circle" size={20} color={COLORS.premium} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>Create New Group</Text>
                  <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: `${COLORS.premium}20` }]}>
                <Feather name="settings" size={20} color={COLORS.premium} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Manage Categories</Text>
                <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Feather name="help-circle" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Help Center</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Feather name="file-text" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Terms & Privacy</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Feather name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  displayName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.error}15`,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  signOutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});
