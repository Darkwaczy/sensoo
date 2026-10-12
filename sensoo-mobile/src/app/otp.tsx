import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyOtpCode, resendOtpCode } from '../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destination?: string;
    name?: string;
    mode?: string;
  }>();

  const destination = params.destination || '+234 801 234 5678';

  const [digit1, setDigit1] = useState('');
  const [digit2, setDigit2] = useState('');
  const [digit3, setDigit3] = useState('');
  const [digit4, setDigit4] = useState('');

  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);

  const [countdown, setCountdown] = useState(45);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const handleAutoFillDemo = () => {
    setDigit1('1');
    setDigit2('2');
    setDigit3('3');
    setDigit4('4');
    ref4.current?.focus();
  };

  const handleVerify = async (codeOverride?: string) => {
    const fullCode = codeOverride || `${digit1}${digit2}${digit3}${digit4}`;
    if (fullCode.length < 4) {
      Alert.alert('Incomplete Code', 'Please enter the complete 4-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpCode(fullCode);
      setLoading(false);

      if (res.success) {
        Alert.alert(
          'Verification Successful! 🎉',
          `Welcome to Sensoo, ${res.user?.fullName || 'Ings'}! Your identity has been verified.`,
          [
            {
              text: 'Go to Dashboard',
              onPress: () => router.replace('/home'),
            },
          ]
        );
      } else {
        Alert.alert('Verification Failed', res.message);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Could not verify OTP.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await resendOtpCode();
      setResending(false);
      setCountdown(45);
      Alert.alert('Code Resent', res.message);
    } catch {
      setResending(false);
      Alert.alert('Error', 'Could not resend OTP code.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        {/* Navigation Row */}
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

          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Security Shield Visual Badge */}
        <View style={styles.visualBadgeWrapper}>
          <View style={styles.shieldHalo}>
            <Image
              source={require('../../assets/3d_shield.png')}
              style={styles.shieldImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>Verify Your Identity</Text>
          <Text style={styles.subTitle}>
            We have sent a 4-digit authentication code to:
          </Text>
          <View style={styles.destinationRow}>
            <Text style={styles.destinationText}>{destination}</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.editDestLink}> (Edit)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Digit PIN Inputs */}
        <View style={styles.otpCard}>
          <Text style={styles.otpCardLabel}>Enter 4-Digit Code</Text>
          <View style={styles.inputsRow}>
            {/* Box 1 */}
            <TextInput
              ref={ref1}
              style={[styles.pinBox, digit1 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit1}
              autoFocus
              onChangeText={(val) => {
                setDigit1(val);
                if (val) ref2.current?.focus();
              }}
            />

            {/* Box 2 */}
            <TextInput
              ref={ref2}
              style={[styles.pinBox, digit2 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit2}
              onChangeText={(val) => {
                setDigit2(val);
                if (val) ref3.current?.focus();
                else ref1.current?.focus();
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit2) ref1.current?.focus();
              }}
            />

            {/* Box 3 */}
            <TextInput
              ref={ref3}
              style={[styles.pinBox, digit3 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit3}
              onChangeText={(val) => {
                setDigit3(val);
                if (val) ref4.current?.focus();
                else ref2.current?.focus();
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit3) ref2.current?.focus();
              }}
            />

            {/* Box 4 */}
            <TextInput
              ref={ref4}
              style={[styles.pinBox, digit4 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit4}
              onChangeText={(val) => {
                setDigit4(val);
                if (!val) ref3.current?.focus();
                else {
                  // Auto verify upon 4th digit
                  handleVerify(`${digit1}${digit2}${digit3}${val}`);
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit4) ref3.current?.focus();
              }}
            />
          </View>

          {/* Quick Demo Helper Hint Button */}
          <TouchableOpacity
            style={styles.demoCodeBadge}
            activeOpacity={0.8}
            onPress={handleAutoFillDemo}
          >
            <Text style={styles.demoCodeIcon}>⚡</Text>
            <Text style={styles.demoCodeText}>
              Tap to auto-fill Demo Code: <Text style={styles.demoCodeBold}>1234</Text>
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.8 }]}
            activeOpacity={0.85}
            onPress={() => handleVerify()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Resend Countdown */}
          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                Resend code in <Text style={styles.countdownBold}>{countdown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                activeOpacity={0.7}
              >
                <Text style={styles.resendActiveText}>
                  {resending ? 'Sending...' : 'Didn’t receive code? Resend Code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Security Trust Footnote */}
        <View style={styles.securityBadgeRow}>
          <Text style={styles.securityShield}>🔒</Text>
          <Text style={styles.securityBadgeText}>
            256-Bit Encrypted One-Time Authentication
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

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },

  visualBadgeWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  shieldHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  shieldImage: {
    width: 48,
    height: 48,
  },

  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B2215',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  destinationText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  editDestLink: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },

  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  otpCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  pinBox: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  pinBoxFilled: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },

  demoCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  demoCodeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  demoCodeText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  demoCodeBold: {
    fontWeight: '900',
    color: '#059669',
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
    marginBottom: 16,
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

  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  countdownBold: {
    color: '#0F172A',
    fontWeight: '700',
  },
  resendActiveText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '800',
  },

  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityShield: {
    fontSize: 13,
    marginRight: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
