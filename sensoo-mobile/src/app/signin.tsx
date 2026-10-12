import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { loginUser } from '../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = () => {
    setIdentifier('ings@sensoo.app');
    setPassword('Sensoo2026!');
  };

  const handleSignIn = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required Field', 'Please enter your registered email or phone number.');
      return;
    }
    if (loginMode === 'PASSWORD' && !password) {
      Alert.alert('Required Field', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({
        identifier,
        password,
        useOtp: loginMode === 'OTP',
      });

      setLoading(false);
      if (res.requiresOtp) {
        router.push({
          pathname: '/otp',
          params: {
            destination: identifier,
            mode: 'signin',
          },
        });
      } else if (res.success) {
        router.replace('/home');
      } else {
        Alert.alert('Sign In Failed', res.message);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Could not sign in.');
    }
  };

  const handleQuickDemoBypass = async () => {
    setLoading(true);
    await loginUser({
      identifier: 'ings@sensoo.app',
      password: 'password123',
    });
    setLoading(false);
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        {/* Navigation & Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.demoFillBtn}
            activeOpacity={0.8}
            onPress={handleDemoFill}
          >
            <Text style={styles.demoFillText}>Demo Fill</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>Welcome Back</Text>
          <Text style={styles.subTitle}>
            Sign in to verify products, manage reports, and access scan telemetry.
          </Text>
        </View>

        {/* Tab Toggle: Password vs Instant OTP */}
        <View style={styles.tabToggleWrapper}>
          <TouchableOpacity
            style={[styles.tabButton, loginMode === 'PASSWORD' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setLoginMode('PASSWORD')}
          >
            <Text style={[styles.tabButtonText, loginMode === 'PASSWORD' && styles.tabButtonTextActive]}>
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, loginMode === 'OTP' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setLoginMode('OTP')}
          >
            <Text style={[styles.tabButtonText, loginMode === 'OTP' && styles.tabButtonTextActive]}>
              Instant OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields Card */}
        <View style={styles.formCard}>
          {/* Email or Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email or Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>{identifier.includes('@') ? '✉️' : '📱'}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ings@sensoo.app or +234 801 234 5678"
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password (if Password Mode) */}
          {loginMode === 'PASSWORD' && (
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Reset Password', 'A password reset link will be sent to your registered email.')}
                >
                  <Text style={styles.forgotPassText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* If OTP Mode Info */}
          {loginMode === 'OTP' && (
            <View style={styles.otpNoticeBox}>
              <Text style={styles.otpNoticeIcon}>💬</Text>
              <Text style={styles.otpNoticeText}>
                We will send an instant 4-digit code to verify your phone or email. Zero password needed.
              </Text>
            </View>
          )}

          {/* Submit Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.8 }]}
            activeOpacity={0.85}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.primaryButtonText}>
                  {loginMode === 'PASSWORD' ? 'Sign In' : 'Send One-Time Code'}
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Quick Demo Bypass for Hackathon Judges */}
          <TouchableOpacity
            style={styles.demoBypassBtn}
            activeOpacity={0.8}
            onPress={handleQuickDemoBypass}
          >
            <Text style={styles.demoBypassText}>⚡ Quick Demo Sign In (Ings)</Text>
          </TouchableOpacity>
        </View>

        {/* Switch to Sign Up */}
        <View style={styles.bottomSwitchRow}>
          <Text style={styles.bottomSwitchText}>Don’t have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.signUpLinkText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Security Trust Badge */}
        <View style={styles.securityBadgeRow}>
          <Text style={styles.securityShield}>🛡️</Text>
          <Text style={styles.securityBadgeText}>
            Protected by Sensoo Decentralized Cryptographic Ledger
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '300',
    marginTop: -2,
  },
  logo: {
    width: 110,
    height: 36,
  },
  demoFillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  demoFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },

  titleBlock: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B2215',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '400',
  },

  tabToggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#059669',
    fontWeight: '800',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  forgotPassText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 15,
  },

  otpNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  otpNoticeIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  otpNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
  },

  primaryButton: {
    backgroundColor: '#059669',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  primaryButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  demoBypassBtn: {
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBypassText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },

  bottomSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSwitchText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  signUpLinkText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '800',
  },

  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  securityShield: {
    fontSize: 14,
    marginRight: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
});
