import { db, isFirebaseConfigured } from './firebaseConfig';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

export interface Category {
  id: string;
  name: string;
  icon: string;
  createdAt: any;
  createdBy: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  isPremium: boolean;
  price: string;
  memberCount: number;
  createdBy: string;
  adminId: string;
  adminName: string;
  imageUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionStartDate: any;
  subscriptionEndDate: any;
  isActive: boolean;
  joinedAt: any;
}

export interface SubscriptionStatus {
  isActive: boolean;
  isExpiringSoon: boolean; // Within 3 days
  isInGracePeriod: boolean; // Past end date but within 2 days
  isExpired: boolean; // Past grace period
  daysUntilExpiry: number;
  subscriptionEndDate: Date | null;
}

// Mock data storage keys
const MOCK_CATEGORIES_KEY = 'mock_categories';
const MOCK_GROUPS_KEY = 'mock_groups';
const MOCK_MEMBERS_KEY = 'mock_members';

// Default categories
const DEFAULT_CATEGORIES: Omit<Category, 'createdAt'>[] = [
  { id: '1', name: 'Streaming', icon: 'play-circle', createdBy: 'system' },
  { id: '2', name: 'Software', icon: 'code', createdBy: 'system' },
  { id: '3', name: 'Education', icon: 'book-open', createdBy: 'system' },
  { id: '4', name: 'Tools', icon: 'tool', createdBy: 'system' },
];

// Default groups for demo
const DEFAULT_GROUPS: Omit<Group, 'createdAt' | 'updatedAt'>[] = [
  { id: '1', name: 'Netflix Premium', description: 'Share Netflix Premium subscription', categoryId: '1', categoryName: 'Streaming', isPremium: true, price: '₹499/month', memberCount: 12, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '2', name: 'Spotify Family', description: 'Spotify Family plan sharing', categoryId: '1', categoryName: 'Streaming', isPremium: false, price: 'Free', memberCount: 25, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '3', name: 'Adobe CC Suite', description: 'Adobe Creative Cloud tools', categoryId: '2', categoryName: 'Software', isPremium: true, price: '$9.99/month', memberCount: 8, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '4', name: 'GitHub Pro', description: 'GitHub Pro features sharing', categoryId: '2', categoryName: 'Software', isPremium: false, price: 'Free', memberCount: 45, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '5', name: 'Coursera Plus', description: 'Coursera subscription sharing', categoryId: '3', categoryName: 'Education', isPremium: true, price: '₹799/month', memberCount: 15, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '6', name: 'Udemy Courses', description: 'Free course recommendations', categoryId: '3', categoryName: 'Education', isPremium: false, price: 'Free', memberCount: 120, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '7', name: 'Notion Plus', description: 'Notion workspace sharing', categoryId: '4', categoryName: 'Tools', isPremium: true, price: '$4.99/month', memberCount: 30, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
  { id: '8', name: 'Canva Pro', description: 'Canva Pro team access', categoryId: '4', categoryName: 'Tools', isPremium: true, price: '₹299/month', memberCount: 18, createdBy: 'system', adminId: 'admin1', adminName: 'Admin' },
];

// Helper to get/set mock data
const getMockData = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setMockData = async <T>(key: string, data: T[]): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

// Initialize default data
export const initializeDefaultData = async () => {
  console.log('Initializing default data...');
  try {
    const categories = await getMockData<Category>(MOCK_CATEGORIES_KEY);
    console.log('Current categories:', categories.length);
    if (categories.length === 0) {
      const defaultCats = DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date().toISOString() }));
      await setMockData(MOCK_CATEGORIES_KEY, defaultCats);
      console.log('Default categories initialized');
    }
    
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    console.log('Current groups:', groups.length);
    if (groups.length === 0) {
      const defaultGrps = DEFAULT_GROUPS.map(g => ({ 
        ...g, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      await setMockData(MOCK_GROUPS_KEY, defaultGrps);
      console.log('Default groups initialized');
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  if (!isFirebaseConfigured) {
    await initializeDefaultData();
    return getMockData<Category>(MOCK_CATEGORIES_KEY);
  }
  
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategory = async (name: string, icon: string, createdBy: string): Promise<Category> => {
  if (!isFirebaseConfigured) {
    const categories = await getMockData<Category>(MOCK_CATEGORIES_KEY);
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name,
      icon,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    await setMockData(MOCK_CATEGORIES_KEY, [...categories, newCategory]);
    return newCategory;
  }
  
  const docRef = await addDoc(collection(db, 'categories'), {
    name,
    icon,
    createdBy,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, name, icon, createdBy, createdAt: new Date() };
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    const categories = await getMockData<Category>(MOCK_CATEGORIES_KEY);
    await setMockData(MOCK_CATEGORIES_KEY, categories.filter(c => c.id !== categoryId));
    return;
  }
  
  await deleteDoc(doc(db, 'categories', categoryId));
};

// Groups
export const getGroups = async (): Promise<Group[]> => {
  if (!isFirebaseConfigured) {
    await initializeDefaultData();
    return getMockData<Group>(MOCK_GROUPS_KEY);
  }
  
  const snapshot = await getDocs(collection(db, 'groups'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
};

export const getGroupsByCategory = async (categoryId: string): Promise<Group[]> => {
  if (!isFirebaseConfigured) {
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    return groups.filter(g => g.categoryId === categoryId);
  }
  
  const q = query(collection(db, 'groups'), where('categoryId', '==', categoryId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
};

export const getGroup = async (groupId: string): Promise<Group | null> => {
  if (!isFirebaseConfigured) {
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    return groups.find(g => g.id === groupId) || null;
  }
  
  const docSnap = await getDoc(doc(db, 'groups', groupId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Group;
  }
  return null;
};

export const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>): Promise<Group> => {
  if (!isFirebaseConfigured) {
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    const newGroup: Group = {
      ...groupData,
      id: `grp_${Date.now()}`,
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setMockData(MOCK_GROUPS_KEY, [...groups, newGroup]);
    return newGroup;
  }
  
  const docRef = await addDoc(collection(db, 'groups'), {
    ...groupData,
    memberCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...groupData, memberCount: 0, createdAt: new Date(), updatedAt: new Date() };
};

export const updateGroup = async (groupId: string, updates: Partial<Group>): Promise<void> => {
  if (!isFirebaseConfigured) {
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    await setMockData(MOCK_GROUPS_KEY, updatedGroups);
    return;
  }
  
  await updateDoc(doc(db, 'groups', groupId), { ...updates, updatedAt: serverTimestamp() });
};

// Group Members & Subscriptions
export const joinGroup = async (
  groupId: string, 
  userId: string, 
  userEmail: string, 
  userName: string
): Promise<GroupMember> => {
  const subscriptionEndDate = addDays(new Date(), 30);
  
  if (!isFirebaseConfigured) {
    const members = await getMockData<GroupMember>(MOCK_MEMBERS_KEY);
    const newMember: GroupMember = {
      id: `mem_${Date.now()}`,
      groupId,
      userId,
      userEmail,
      userName,
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: subscriptionEndDate.toISOString(),
      isActive: true,
      joinedAt: new Date().toISOString(),
    };
    await setMockData(MOCK_MEMBERS_KEY, [...members, newMember]);
    
    // Update member count
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, memberCount: g.memberCount + 1 } : g
    );
    await setMockData(MOCK_GROUPS_KEY, updatedGroups);
    
    return newMember;
  }
  
  const memberRef = doc(db, 'groups', groupId, 'members', userId);
  const memberData = {
    groupId,
    userId,
    userEmail,
    userName,
    subscriptionStartDate: serverTimestamp(),
    subscriptionEndDate: Timestamp.fromDate(subscriptionEndDate),
    isActive: true,
    joinedAt: serverTimestamp(),
  };
  await setDoc(memberRef, memberData);
  
  // Update member count
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    await updateDoc(groupRef, { memberCount: (groupSnap.data().memberCount || 0) + 1 });
  }
  
  return { id: userId, ...memberData, subscriptionStartDate: new Date(), subscriptionEndDate, joinedAt: new Date() };
};

export const renewSubscription = async (groupId: string, userId: string): Promise<void> => {
  const newEndDate = addDays(new Date(), 30);
  
  if (!isFirebaseConfigured) {
    const members = await getMockData<GroupMember>(MOCK_MEMBERS_KEY);
    const updatedMembers = members.map(m => 
      m.groupId === groupId && m.userId === userId 
        ? { ...m, subscriptionEndDate: newEndDate.toISOString(), isActive: true }
        : m
    );
    await setMockData(MOCK_MEMBERS_KEY, updatedMembers);
    return;
  }
  
  await updateDoc(doc(db, 'groups', groupId, 'members', userId), {
    subscriptionEndDate: Timestamp.fromDate(newEndDate),
    isActive: true,
  });
};

export const getMembership = async (groupId: string, userId: string): Promise<GroupMember | null> => {
  if (!isFirebaseConfigured) {
    const members = await getMockData<GroupMember>(MOCK_MEMBERS_KEY);
    return members.find(m => m.groupId === groupId && m.userId === userId) || null;
  }
  
  const docSnap = await getDoc(doc(db, 'groups', groupId, 'members', userId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as GroupMember;
  }
  return null;
};

export const getUserGroups = async (userId: string): Promise<GroupMember[]> => {
  if (!isFirebaseConfigured) {
    const members = await getMockData<GroupMember>(MOCK_MEMBERS_KEY);
    return members.filter(m => m.userId === userId);
  }
  
  // This requires a collection group query in Firebase
  const groups = await getGroups();
  const memberships: GroupMember[] = [];
  
  for (const group of groups) {
    const membership = await getMembership(group.id, userId);
    if (membership) {
      memberships.push(membership);
    }
  }
  
  return memberships;
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  if (!isFirebaseConfigured) {
    const members = await getMockData<GroupMember>(MOCK_MEMBERS_KEY);
    return members.filter(m => m.groupId === groupId);
  }
  
  const snapshot = await getDocs(collection(db, 'groups', groupId, 'members'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupMember));
};

export const removeMember = async (groupId: string, userId: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    const members = await getMockData<GroupMember>(MOCK_MEMBERS_KEY);
    await setMockData(MOCK_MEMBERS_KEY, members.filter(m => !(m.groupId === groupId && m.userId === userId)));
    
    // Update member count
    const groups = await getMockData<Group>(MOCK_GROUPS_KEY);
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, memberCount: Math.max(0, g.memberCount - 1) } : g
    );
    await setMockData(MOCK_GROUPS_KEY, updatedGroups);
    return;
  }
  
  await deleteDoc(doc(db, 'groups', groupId, 'members', userId));
  
  // Update member count
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.exists()) {
    await updateDoc(groupRef, { memberCount: Math.max(0, (groupSnap.data().memberCount || 1) - 1) });
  }
};

export const checkSubscriptionStatus = (membership: GroupMember | null): SubscriptionStatus => {
  if (!membership) {
    return {
      isActive: false,
      isExpiringSoon: false,
      isInGracePeriod: false,
      isExpired: true,
      daysUntilExpiry: 0,
      subscriptionEndDate: null,
    };
  }
  
  const now = new Date();
  const endDate = membership.subscriptionEndDate instanceof Date 
    ? membership.subscriptionEndDate 
    : new Date(membership.subscriptionEndDate);
  
  const daysUntilExpiry = differenceInDays(endDate, now);
  const gracePeriodEnd = addDays(endDate, 2);
  
  const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  const isInGracePeriod = isAfter(now, endDate) && isBefore(now, gracePeriodEnd);
  const isExpired = isAfter(now, gracePeriodEnd);
  const isActive = !isExpired && membership.isActive;
  
  return {
    isActive,
    isExpiringSoon,
    isInGracePeriod,
    isExpired,
    daysUntilExpiry,
    subscriptionEndDate: endDate,
  };
};
