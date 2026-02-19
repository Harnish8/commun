import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS } from '../src/constants/theme';
import { initializeDefaultData } from '../src/services/groupService';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initialize default mock data
    initializeDefaultData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
