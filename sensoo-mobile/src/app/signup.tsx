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
import { registerUser } from '../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDemoFill = () => {
    setFullName('Ings Abubakar');
    setEmail('ings@sensoo.app');
    setPhone('+234 801 234 5678');
    setPassword('Sensoo2026!');
    setConfirmPassword('Sensoo2026!');
    setAgreeTerms(true);
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Required Field', 'Please provide either an email or phone number.');
      return;
    }
    if (email && !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Required Field', 'Please create a password for your account.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Terms Agreement', 'Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        fullName,
        email,
        phone,
        password,
      });

      setLoading(false);
      if (res.success) {
        router.push({
          pathname: '/otp',
          params: {
            destination: res.destination,
            name: fullName,
            mode: 'signup',
          },
        });
      } else {
        Alert.alert('Registration Failed', res.message);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Could not complete registration.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        {/* Navigation & Logo Header */}
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
            <Text style={styles.demoFillText}>Fill Demo</Text>
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
          <Text style={styles.mainTitle}>Create an Account</Text>
          <Text style={styles.subTitle}>
            Join Sensoo to verify authenticity, report counterfeits, and track safety alerts.
          </Text>
        </View>

        {/* Input Fields Card */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Ings Abubakar"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ings@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Number with Nigerian country flag */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryFlag}>🇳🇬</Text>
                <Text style={styles.countryCodeText}>+234</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="801 234 5678"
                placeholderTextColor="#94A3B8"
                value={phone.replace(/^\+234\s*/, '')}
                onChangeText={(val) => setPhone(`+234 ${val}`)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Minimum 6 characters"
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

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Re-type your password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
              {confirmPassword.length > 0 && password === confirmPassword && (
                <Text style={styles.matchCheck}>✓</Text>
              )}
            </View>
          </View>

          {/* Terms Agreement Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            activeOpacity={0.8}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.8 }]}
            activeOpacity={0.85}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.primaryButtonText}>Create Account</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Switch to Sign In */}
        <View style={styles.bottomSwitchRow}>
          <Text style={styles.bottomSwitchText}>Already have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/signin')}
          >
            <Text style={styles.signInLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Security Trust Badge */}
        <View style={styles.securityBadgeRow}>
          <Text style={styles.securityShield}>🛡️</Text>
          <Text style={styles.securityBadgeText}>
            Secured by NAFDAC Sentinel Network & GS1 Standards
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
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
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryFlag: {
    fontSize: 14,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
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
  matchCheck: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '800',
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  termsLink: {
    color: '#059669',
    fontWeight: '700',
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
  signInLinkText: {
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
