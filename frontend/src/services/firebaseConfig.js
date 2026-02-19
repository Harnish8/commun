// Firebase Configuration
// =====================================================
// IMPORTANT: Replace the placeholder values below with your
// actual Firebase project credentials before deploying.
//
// To get these values:
// 1. Go to Firebase Console (https://console.firebase.google.com)
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General > Your apps > Web app
// 4. Copy the configuration values
// =====================================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// Super Admin Email Configuration
// Change this to your email to become Super Admin
export const SUPER_ADMIN_EMAIL = "INSERT_YOUR_EMAIL_HERE";

// Check if Firebase is configured (all placeholders are replaced)
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("YOUR_");

// Initialize Firebase
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Initialize Auth with proper persistence for React Native
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
    
    // Initialize Firestore
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.log('Firebase not configured - running in development mode with mock data');
}

export { app, auth, db };
export default firebaseConfig;
