import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, SUPER_ADMIN_EMAIL, isFirebaseConfigured } from '../services/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'super_admin' | 'group_admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  isSuperAdmin: boolean;
  isGroupAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Development mode without Firebase
      loadMockUser();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as AppUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  const loadMockUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('mock_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading mock user:', error);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) {
      // Mock signup for development
      const mockUser: AppUser = {
        uid: `mock_${Date.now()}`,
        email,
        displayName,
        role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'super_admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    // Determine role based on email
    const role: UserRole = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() 
      ? 'super_admin' 
      : 'user';
    
    const userData: AppUser = {
      uid: fbUser.uid,
      email: fbUser.email || email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', fbUser.uid), userData);
    setUser({ ...userData, createdAt: new Date(), updatedAt: new Date() });
  };

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      // Mock signin for development
      const mockUser: AppUser = {
        uid: `mock_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'super_admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (userDoc.exists()) {
      setUser(userDoc.data() as AppUser);
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) {
      await AsyncStorage.removeItem('mock_user');
      setUser(null);
      return;
    }

    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    if (!isFirebaseConfigured) {
      if (user && user.uid === userId) {
        const updatedUser = { ...user, role };
        await AsyncStorage.setItem('mock_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return;
    }

    await updateDoc(doc(db, 'users', userId), { 
      role, 
      updatedAt: serverTimestamp() 
    });
    
    if (user && user.uid === userId) {
      setUser({ ...user, role });
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isGroupAdmin = user?.role === 'group_admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      signUp,
      signIn,
      signOut,
      updateUserRole,
      isSuperAdmin,
      isGroupAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
