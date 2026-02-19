import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../../src/constants/theme';
import { LoadingView, Button } from '../../../src/components/Common';
import { PremiumBadge } from '../../../src/components/PremiumBadge';
import {
  getGroup,
  getMembership,
  joinGroup,
  renewSubscription,
  Group,
  GroupMember,
} from '../../../src/services/groupService';
import { format, addDays } from 'date-fns';

export default function JoinGroupScreen() {
  const { id, renew } = useLocalSearchParams<{ id: string; renew?: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<GroupMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const isRenewal = renew === 'true';

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      const groupData = await getGroup(id);
      setGroup(groupData);
      
      if (user) {
        const membershipData = await getMembership(id, user.uid);
        setMembership(membershipData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSimulatePayment = async () => {
    if (!id || !group) return;
    
    // If no user, redirect to signup
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please create an account or login to join this group.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => router.push('/(auth)/signup') },
          { text: 'Login', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }
    
    setProcessing(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isRenewal && membership) {
        await renewSubscription(id, user.uid);
        Alert.alert(
          'Subscription Renewed!',
          `Your access to ${group.name} has been extended for 30 days.`,
          [{ text: 'OK', onPress: () => router.replace(`/group/${id}`) }]
        );
      } else {
        await joinGroup(id, user.uid, user.email, user.displayName);
        Alert.alert(
          'Welcome!',
          `You have successfully joined ${group.name}. Enjoy the community!`,
          [{ text: 'OK', onPress: () => router.replace(`/group/${id}`) }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Payment simulation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingView message="Loading group details..." />;
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Group not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const subscriptionEndDate = addDays(new Date(), 30);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRenewal ? 'Renew Access' : 'Join Group'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Group Info Card */}
        <View style={styles.groupCard}>
          <View style={styles.groupIconContainer}>
            <Feather name="users" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>
          
          <View style={styles.groupMeta}>
            <View style={styles.metaItem}>
              <Feather name="user" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{group.memberCount} members</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="folder" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{group.categoryName}</Text>
            </View>
          </View>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Subscription Details</Text>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Plan Type</Text>
            {group.isPremium ? (
              <PremiumBadge price={group.price} size="medium" />
            ) : (
              <View style={styles.freeBadge}>
                <Text style={styles.freeText}>Free</Text>
              </View>
            )}
          </View>

          {group.isPremium && (
            <>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Duration</Text>
                <Text style={styles.pricingValue}>30 days</Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Valid Until</Text>
                <Text style={styles.pricingValue}>
                  {format(subscriptionEndDate, 'MMM dd, yyyy')}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>{group.price}</Text>
              </View>
            </>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What You Get</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Feather name="check" size={16} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Access to group chat</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Feather name="check" size={16} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Share links and resources</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Feather name="check" size={16} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>Connect with {group.memberCount}+ members</Text>
          </View>

          {group.isPremium && (
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Feather name="check" size={16} color={COLORS.success} />
              </View>
              <Text style={styles.featureText}>Premium content & benefits</Text>
            </View>
          )}
        </View>

        {/* Payment Button */}
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              processing && styles.paymentButtonDisabled
            ]}
            onPress={handleSimulatePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.paymentButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Feather name="credit-card" size={20} color="#FFFFFF" />
                <Text style={styles.paymentButtonText}>
                  {group.isPremium
                    ? `${isRenewal ? 'Renew' : 'Pay'} ${group.price}`
                    : 'Join Free'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.paymentNote}>
            {group.isPremium
              ? 'This is a simulated payment for demo purposes'
              : 'Free to join - no payment required'}
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  groupCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  groupIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  groupName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  groupDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  pricingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  pricingTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pricingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  pricingValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalPrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuresCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  featuresTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  paymentSection: {
    alignItems: 'center',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  paymentButtonDisabled: {
    opacity: 0.7,
  },
  paymentButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
});
