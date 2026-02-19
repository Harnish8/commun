import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../src/constants/theme';
import { CategoryCard } from '../../src/components/CategoryCard';
import { GroupCard } from '../../src/components/GroupCard';
import { LoadingView, Button } from '../../src/components/Common';
import {
  getCategories,
  getGroups,
  getGroupsByCategory,
  addCategory,
  Category,
  Group,
} from '../../src/services/groupService';

export default function HomeScreen() {
  const { user, isSuperAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [cats, grps] = await Promise.all([getCategories(), getGroups()]);
      setCategories(cats);
      setGroups(grps);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCategoryPress = async (category: Category) => {
    setSelectedCategory(category);
    try {
      const categoryGroups = await getGroupsByCategory(category.id);
      setGroups(categoryGroups);
    } catch (error) {
      console.error('Error loading category groups:', error);
    }
  };

  const handleClearFilter = async () => {
    setSelectedCategory(null);
    const allGroups = await getGroups();
    setGroups(allGroups);
  };

  const handleGroupPress = (group: Group) => {
    router.push(`/group/${group.id}`);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await addCategory(newCategoryName.trim(), 'grid', user?.uid || '');
      setNewCategoryName('');
      setShowCategoryModal(false);
      loadData();
      Alert.alert('Success', 'Category added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const getGroupCountForCategory = (categoryId: string) => {
    return groups.filter(g => g.categoryId === categoryId).length;
  };

  const displayGroups = selectedCategory
    ? groups.filter(g => g.categoryId === selectedCategory.id)
    : groups;

  if (loading) {
    return <LoadingView message="Loading communities..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName || 'User'} 👋</Text>
          <Text style={styles.title}>Explore Communities</Text>
        </View>
        {isSuperAdmin && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/admin/create-group')}
          >
            <Feather name="plus-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {isSuperAdmin && (
              <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                <Feather name="plus" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                groupCount={getGroupCountForCategory(category.id)}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${selectedCategory.name} Groups` : 'All Groups'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity onPress={handleClearFilter} style={styles.clearFilter}>
                <Text style={styles.clearFilterText}>Clear Filter</Text>
                <Feather name="x" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {displayGroups.length > 0 ? (
            displayGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => handleGroupPress(group)}
              />
            ))
          ) : (
            <View style={styles.emptyGroups}>
              <Feather name="inbox" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No groups found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category Name"
              placeholderTextColor={COLORS.textMuted}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddButton} onPress={handleAddCategory}>
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  adminButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  emptyGroups: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  modalCancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  modalAddButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  modalAddText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
