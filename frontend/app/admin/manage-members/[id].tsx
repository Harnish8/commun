import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../../src/constants/theme';
import { LoadingView, EmptyState, Button } from '../../../src/components/Common';
import {
  getGroup,
  getGroupMembers,
  removeMember,
  checkSubscriptionStatus,
  Group,
  GroupMember,
  SubscriptionStatus,
} from '../../../src/services/groupService';
import { format } from 'date-fns';

interface MemberWithStatus {
  member: GroupMember;
  status: SubscriptionStatus;
}

export default function ManageMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isSuperAdmin } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    
    try {
      const groupData = await getGroup(id);
      setGroup(groupData);
      
      const memberList = await getGroupMembers(id);
      const membersWithStatus: MemberWithStatus[] = memberList.map(member => ({
        member,
        status: checkSubscriptionStatus(member),
      }));
      
      // Sort: active first, then expiring soon, then expired
      membersWithStatus.sort((a, b) => {
        if (a.status.isActive && !b.status.isActive) return -1;
        if (!a.status.isActive && b.status.isActive) return 1;
        return 0;
      });
      
      setMembers(membersWithStatus);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.userName} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(member.userId);
            try {
              await removeMember(id!, member.userId);
              setMembers(prev => prev.filter(m => m.member.userId !== member.userId));
              Alert.alert('Success', `${member.userName} has been removed from the group.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member. Please try again.');
            } finally {
              setRemoving(null);
            }
          },
        },
      ]
    );
  };

  const isAdmin = group?.adminId === user?.uid || isSuperAdmin;

  const getStatusBadge = (status: SubscriptionStatus) => {
    if (status.isExpired) {
      return { label: 'Expired', color: COLORS.error };
    }
    if (status.isInGracePeriod) {
      return { label: 'Grace Period', color: COLORS.warning };
    }
    if (status.isExpiringSoon) {
      return { label: `Expires in ${status.daysUntilExpiry}d`, color: COLORS.warning };
    }
    return { label: 'Active', color: COLORS.success };
  };

  const renderMember = ({ item }: { item: MemberWithStatus }) => {
    const { member, status } = item;
    const badge = getStatusBadge(status);
    const isCurrentUser = member.userId === user?.uid;
    
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>
              {member.userName}
              {isCurrentUser && <Text style={styles.youLabel}> (You)</Text>}
            </Text>
            <Text style={styles.memberEmail} numberOfLines={1}>{member.userEmail}</Text>
            {status.subscriptionEndDate && (
              <Text style={styles.expiryDate}>
                Expires: {format(status.subscriptionEndDate, 'MMM dd, yyyy')}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.memberActions}>
          <View style={[styles.statusBadge, { backgroundColor: `${badge.color}20` }]}>
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          
          {isAdmin && !isCurrentUser && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(member)}
              disabled={removing === member.userId}
            >
              <Feather 
                name="user-x" 
                size={18} 
                color={removing === member.userId ? COLORS.textMuted : COLORS.error} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingView message="Loading members..." />;
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Manage Members</Text>
          <Text style={styles.headerSubtitle}>{group.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {members.filter(m => m.status.isActive && !m.status.isExpiringSoon).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>
            {members.filter(m => m.status.isExpiringSoon || m.status.isInGracePeriod).length}
          </Text>
          <Text style={styles.statLabel}>Expiring</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.error }]}>
            {members.filter(m => m.status.isExpired).length}
          </Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
      </View>

      {members.length > 0 ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item.member.userId}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="users"
          title="No Members Yet"
          subtitle="This group doesn't have any members yet"
        />
      )}
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
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  listContent: {
    padding: SPACING.lg,
  },
  memberCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  youLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '400',
  },
  memberEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  expiryDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: `${COLORS.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
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
