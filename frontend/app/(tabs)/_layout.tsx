import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidTabBg]} />
          )
        ),
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-groups"
        options={{
          title: 'My Groups',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.glassBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    height: 85,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
  },
  androidTabBg: {
    backgroundColor: COLORS.glassBackground,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
