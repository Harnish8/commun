import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants/theme';
import { GroupCard } from '../../src/components/GroupCard';
import { LoadingView, EmptyState } from '../../src/components/Common';
import {
  getUserGroups,
  getGroup,
  checkSubscriptionStatus,
  GroupMember,
  Group,
  SubscriptionStatus,
} from '../../src/services/groupService';
import { format, differenceInDays } from 'date-fns';

interface UserGroupWithDetails {
  membership: GroupMember;
  group: Group;
  subscriptionStatus: SubscriptionStatus;
}

export default function MyGroupsScreen() {
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState<UserGroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserGroups = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const memberships = await getUserGroups(user.uid);
      const groupsWithDetails: UserGroupWithDetails[] = [];
      
      for (const membership of memberships) {
        const group = await getGroup(membership.groupId);
        if (group) {
          const subscriptionStatus = checkSubscriptionStatus(membership);
          groupsWithDetails.push({ membership, group, subscriptionStatus });
        }
      }
      
      setUserGroups(groupsWithDetails);
    } catch (error) {
      console.error('Error loading user groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserGroups();
  }, [loadUserGroups]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserGroups();
  };

  const handleGroupPress = (item: UserGroupWithDetails) => {
    const { group, subscriptionStatus } = item;
    
    if (subscriptionStatus.isExpired) {
      // Redirect to renew page
      router.push(`/group/join/${group.id}?renew=true`);
    } else {
      // Go to group chat
      router.push(`/group/${group.id}`);
    }
  };

  const getExpiringText = (status: SubscriptionStatus): string | undefined => {
    if (status.isExpiringSoon) {
      return `Expires in ${status.daysUntilExpiry} days`;
    }
    if (status.isInGracePeriod) {
      return 'Grace period - Renew now!';
    }
    if (status.isExpired) {
      return 'Access expired - Renew to continue';
    }
    return undefined;
  };

  if (loading) {
    return <LoadingView message="Loading your groups..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
        <Text style={styles.subtitle}>{userGroups.length} group{userGroups.length !== 1 ? 's' : ''} joined</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          userGroups.length === 0 && styles.emptyContent
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {userGroups.length > 0 ? (
          <>
            {/* Expiring Soon Section */}
            {userGroups.filter(g => g.subscriptionStatus.isExpiringSoon || g.subscriptionStatus.isInGracePeriod).length > 0 && (
              <View style={styles.section}>
                <View style={styles.warningHeader}>
                  <Feather name="alert-triangle" size={18} color={COLORS.warning} />
                  <Text style={styles.warningSectionTitle}>Expiring Soon</Text>
                </View>
                {userGroups
                  .filter(g => g.subscriptionStatus.isExpiringSoon || g.subscriptionStatus.isInGracePeriod)
                  .map(item => (
                    <GroupCard
                      key={item.group.id}
                      group={item.group}
                      onPress={() => handleGroupPress(item)}
                      showExpiring
                      expiringText={getExpiringText(item.subscriptionStatus)}
                    />
                  ))}
              </View>
            )}

            {/* Active Subscriptions */}
            {userGroups.filter(g => g.subscriptionStatus.isActive && !g.subscriptionStatus.isExpiringSoon).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Subscriptions</Text>
                {userGroups
                  .filter(g => g.subscriptionStatus.isActive && !g.subscriptionStatus.isExpiringSoon)
                  .map(item => (
                    <GroupCard
                      key={item.group.id}
                      group={item.group}
                      onPress={() => handleGroupPress(item)}
                    />
                  ))}
              </View>
            )}

            {/* Expired */}
            {userGroups.filter(g => g.subscriptionStatus.isExpired).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expired Access</Text>
                {userGroups
                  .filter(g => g.subscriptionStatus.isExpired)
                  .map(item => (
                    <GroupCard
                      key={item.group.id}
                      group={item.group}
                      onPress={() => handleGroupPress(item)}
                      showExpiring
                      expiringText={getExpiringText(item.subscriptionStatus)}
                    />
                  ))}
              </View>
            )}
            
            <View style={{ height: 100 }} />
          </>
        ) : (
          <EmptyState
            icon="users"
            title="No Groups Yet"
            subtitle="Join a community to start sharing and connecting with others"
            actionText="Explore Groups"
            onAction={() => router.push('/(tabs)/home')}
          />
        )}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  emptyContent: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  warningSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
});
