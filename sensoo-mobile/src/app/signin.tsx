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

  const handleSignIn = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required Field', 'Please enter your registered email address or phone number.');
      return;
    }
    if (loginMode === 'PASSWORD' && !password) {
      Alert.alert('Required Field', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({
        identifier: identifier.trim(),
        password: loginMode === 'PASSWORD' ? password : undefined,
        useOtp: loginMode === 'OTP',
      });

      setLoading(false);
      if (res.requiresOtp) {
        router.push({
          pathname: '/otp',
          params: {
            destination: identifier.trim(),
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

          <View style={styles.headerPlaceholder} />
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
              Email OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields Card */}
        <View style={styles.formCard}>
          {/* Email or Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email or Phone Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email or phone"
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
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
                  onPress={() => {
                    if (!identifier.trim()) {
                      Alert.alert('Reset Password', 'Please enter your email above first.');
                    } else {
                      setLoginMode('OTP');
                    }
                  }}
                >
                  <Text style={styles.forgotPassText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
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
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* If OTP Mode Info */}
          {loginMode === 'OTP' && (
            <View style={styles.otpNoticeBox}>
              <Text style={styles.otpNoticeText}>
                We will send a 4-digit code to your email via Resend to verify your identity.
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
              <Text style={styles.primaryButtonText}>
                {loginMode === 'PASSWORD' ? 'Sign In' : 'Send Verification Code'}
              </Text>
            )}
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

        {/* Security Note */}
        <View style={styles.securityBadgeRow}>
          <Text style={styles.securityBadgeText}>
            Protected by Sensoo Product Verification
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
  headerPlaceholder: {
    width: 36,
    height: 36,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  titleBlock: {
    marginBottom: 24,
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
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 20,
    shadowColor: '#0B2215',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 18,
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
    color: '#334155',
    marginBottom: 6,
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00875A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  eyeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00875A',
  },

  otpNoticeBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
  },
  otpNoticeText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },

  primaryButton: {
    height: 52,
    backgroundColor: '#00875A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  },
  signUpLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00875A',
  },

  securityBadgeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  securityBadgeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
