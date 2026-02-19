import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../src/constants/theme';
import { LoadingView, Button } from '../../src/components/Common';
import { getCategories, createGroup, Category } from '../../src/services/groupService';

export default function CreateGroupScreen() {
  const { user, isSuperAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('₹499/month');

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      Alert.alert('Access Denied', 'Only Super Admins can create groups');
      router.back();
      return;
    }
    loadCategories();
  }, [isSuperAdmin, loadCategories]);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (isPremium && !price.trim()) {
      Alert.alert('Error', 'Please enter a price for premium group');
      return;
    }

    setCreating(true);
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        isPremium,
        price: isPremium ? price.trim() : 'Free',
        createdBy: user?.uid || '',
        adminId: user?.uid || '',
        adminName: user?.displayName || 'Admin',
      });

      Alert.alert(
        'Success!',
        `Group "${group.name}" has been created.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingView message="Loading..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Group Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group Name</Text>
          <View style={styles.inputContainer}>
            <Feather name="users" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your group..."
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory?.id === category.id && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory?.id === category.id && styles.categoryChipTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Premium Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.label}>Premium Group</Text>
              <Text style={styles.toggleDescription}>
                Charge members a subscription fee
              </Text>
            </View>
            <Switch
              value={isPremium}
              onValueChange={setIsPremium}
              trackColor={{ false: COLORS.backgroundTertiary, true: `${COLORS.premium}80` }}
              thumbColor={isPremium ? COLORS.premium : COLORS.textMuted}
            />
          </View>
        </View>

        {/* Price (if Premium) */}
        {isPremium && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subscription Price</Text>
            <View style={styles.inputContainer}>
              <Feather name="tag" size={20} color={COLORS.premium} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., ₹499/month or $9.99/month"
                placeholderTextColor={COLORS.textMuted}
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>
        )}

        {/* Preview Card */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewIconContainer}>
                <Feather name="users" size={22} color={COLORS.primary} />
              </View>
              {isPremium ? (
                <View style={styles.premiumBadge}>
                  <Feather name="star" size={12} color={COLORS.premium} />
                  <Text style={styles.premiumText}>Premium</Text>
                  <Text style={styles.premiumPrice}>{price}</Text>
                </View>
              ) : (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeText}>Free</Text>
                </View>
              )}
            </View>
            <Text style={styles.previewName}>{name || 'Group Name'}</Text>
            <Text style={styles.previewDescription} numberOfLines={2}>
              {description || 'Group description will appear here...'}
            </Text>
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>0 members</Text>
              <Text style={styles.previewMetaText}>{selectedCategory?.name || 'Category'}</Text>
            </View>
          </View>
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Create Group"
            onPress={handleCreateGroup}
            loading={creating}
            icon="plus"
          />
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
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  categoryScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  previewSection: {
    marginTop: SPACING.md,
  },
  previewTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  previewCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  previewIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.premium}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  premiumText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.premium,
    marginLeft: SPACING.xs,
  },
  premiumPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.premiumLight,
    marginLeft: SPACING.xs,
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
  previewName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  previewDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewMetaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
});
