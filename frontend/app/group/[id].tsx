import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../src/constants/theme';
import { ChatMessageItem } from '../../src/components/ChatMessageItem';
import { ChatInput } from '../../src/components/ChatInput';
import { LoadingView, Button } from '../../src/components/Common';
import { PremiumBadge } from '../../src/components/PremiumBadge';
import {
  getGroup,
  getMembership,
  checkSubscriptionStatus,
  Group,
  GroupMember,
  SubscriptionStatus,
} from '../../src/services/groupService';
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  ChatMessage,
} from '../../src/services/chatService';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isSuperAdmin } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<GroupMember | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadGroupData = useCallback(async () => {
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
        
        const status = checkSubscriptionStatus(membershipData);
        setSubscriptionStatus(status);
        
        // Load initial messages if user has access
        if (status.isActive || !groupData?.isPremium) {
          const initialMessages = await getMessages(id);
          setMessages(initialMessages);
        }
      } else {
        // No user - set subscription status to expired
        setSubscriptionStatus({
          isActive: false,
          isExpiringSoon: false,
          isInGracePeriod: false,
          isExpired: true,
          daysUntilExpiry: 0,
          subscriptionEndDate: null,
        });
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!id) return;
    
    // Allow message subscription for free groups OR active subscriptions
    const canSubscribe = !group?.isPremium || subscriptionStatus?.isActive;
    if (!canSubscribe) return;
    
    const unsubscribe = subscribeToMessages(id, (newMessages) => {
      setMessages(newMessages);
    });
    
    return () => unsubscribe();
  }, [id, group?.isPremium, subscriptionStatus?.isActive]);

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    
    // For free groups, create anonymous user if not logged in
    const senderId = user?.uid || `anon_${Date.now()}`;
    const senderName = user?.displayName || 'Anonymous';
    const senderEmail = user?.email || 'anonymous@user.com';
    
    // Check if user can send (free group or active subscription)
    const canSend = !group?.isPremium || subscriptionStatus?.isActive;
    if (!canSend) {
      Alert.alert('Premium Required', 'Join this group to send messages');
      return;
    }
    
    setSending(true);
    try {
      const newMessage = await sendMessage(id, senderId, senderName, senderEmail, content);
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isAdmin = group?.adminId === user?.uid || isSuperAdmin;
  // FREE groups can be accessed by anyone, Premium requires subscription
  const canAccess = !group?.isPremium || subscriptionStatus?.isActive;

  if (loading) {
    return <LoadingView message="Loading group..." />;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
            <Text style={styles.memberCount}>{group.memberCount} members</Text>
          </View>
          
          <View style={styles.headerActions}>
            {group.isPremium && <PremiumBadge price={group.price} size="small" />}
            {isAdmin && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => router.push(`/admin/manage-members/${id}`)}
              >
                <Feather name="settings" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {canAccess ? (
          <>
            {/* Chat Messages */}
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatMessageItem
                  message={item}
                  isOwnMessage={item.userId === user?.uid}
                />
              )}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              inverted={false}
            />

            {/* Chat Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={sending}
            />
            
            {subscriptionStatus?.isInGracePeriod && (
              <View style={styles.gracePeriodBanner}>
                <Feather name="alert-triangle" size={16} color={COLORS.warning} />
                <Text style={styles.gracePeriodText}>
                  Grace period active. Renew to continue chatting.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.lockedContainer}>
            <View style={styles.lockedContent}>
              <View style={styles.lockIconContainer}>
                <Feather name="lock" size={48} color={COLORS.premium} />
              </View>
              <Text style={styles.lockedTitle}>
                {!user ? 'Login Required' : 'Premium Content'}
              </Text>
              <Text style={styles.lockedSubtitle}>
                {!user 
                  ? 'Please login or create an account to join this group'
                  : membership 
                    ? 'Your subscription has expired' 
                    : 'Subscribe to access this group\'s content'
                }
              </Text>
              {!user ? (
                <View style={{ gap: 12, width: '100%' }}>
                  <Button
                    title="Login"
                    onPress={() => router.push('/(auth)/login')}
                    icon="log-in"
                  />
                  <Button
                    title="Sign Up"
                    onPress={() => router.push('/(auth)/signup')}
                    variant="secondary"
                    icon="user-plus"
                  />
                </View>
              ) : (
                <Button
                  title={membership ? 'Renew Access' : 'Join Group'}
                  onPress={() => router.push(`/group/join/${id}${membership ? '?renew=true' : ''}`)}
                  icon="star"
                />
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
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
  groupName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  memberCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  manageButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: SPACING.md,
  },
  gracePeriodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.warning}20`,
    padding: SPACING.sm,
  },
  gracePeriodText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  lockedContent: {
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${COLORS.premium}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  lockedTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  lockedSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
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
