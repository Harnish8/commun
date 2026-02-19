import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../src/constants/theme';
import { Button } from '../../src/components/Common';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Feather name="user-plus" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the community sharing platform</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor={COLORS.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Feather name="check-circle" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <Button title="Create Account" onPress={handleSignup} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.loginLink}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.md,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loginText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  loginHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
