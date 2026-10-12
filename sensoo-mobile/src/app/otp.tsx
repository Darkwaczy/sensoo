import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destination?: string; name?: string; mode?: string }>();

  const destination = params.destination || 'your email';

  const [digit1, setDigit1] = useState('');
  const [digit2, setDigit2] = useState('');
  const [digit3, setDigit3] = useState('');
  const [digit4, setDigit4] = useState('');
  const [digit5, setDigit5] = useState('');
  const [digit6, setDigit6] = useState('');

  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);
  const ref5 = useRef<TextInput>(null);
  const ref6 = useRef<TextInput>(null);

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

  const handleVerify = async (codeOverride?: string) => {
    const fullCode = codeOverride || `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`;
    if (fullCode.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpCode(fullCode, destination);
      setLoading(false);

      if (res.success) {
        Alert.alert(
          'Verification Successful',
          `Welcome to Sensoo! Your account has been verified. Let's set up your permissions to start verifying products.`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/permissions' as any),
            },
          ]
        );
      } else {
        Alert.alert('Verification Failed', res.message);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Could not verify code.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await resendOtpCode(destination, params.name);
      setResending(false);
      setCountdown(45);
      Alert.alert('Code Resent', res.message);
    } catch {
      setResending(false);
      Alert.alert('Error', 'Could not resend verification code.');
    }
  };

  const handlePasteOrInput = (val: string, index: number) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split('');
      if (digits[0]) setDigit1(digits[0]);
      if (digits[1]) setDigit2(digits[1]);
      if (digits[2]) setDigit3(digits[2]);
      if (digits[3]) setDigit4(digits[3]);
      if (digits[4]) setDigit5(digits[4]);
      if (digits[5]) {
        setDigit6(digits[5]);
        handleVerify(clean.slice(0, 6));
        return;
      }
      return;
    }

    if (index === 1) {
      setDigit1(clean);
      if (clean) ref2.current?.focus();
    } else if (index === 2) {
      setDigit2(clean);
      if (clean) ref3.current?.focus();
      else ref1.current?.focus();
    } else if (index === 3) {
      setDigit3(clean);
      if (clean) ref4.current?.focus();
      else ref2.current?.focus();
    } else if (index === 4) {
      setDigit4(clean);
      if (clean) ref5.current?.focus();
      else ref3.current?.focus();
    } else if (index === 5) {
      setDigit5(clean);
      if (clean) ref6.current?.focus();
      else ref4.current?.focus();
    } else if (index === 6) {
      setDigit6(clean);
      if (!clean) {
        ref5.current?.focus();
      } else {
        handleVerify(`${digit1}${digit2}${digit3}${digit4}${digit5}${clean}`);
      }
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

          <Text style={styles.headerTitle}>Verification</Text>

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
          <Text style={styles.mainTitle}>Enter Verification Code</Text>
          <Text style={styles.subTitle}>
            We sent a 6-digit verification code to:
          </Text>
          <Text style={styles.destinationHighlight}>{destination}</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* 6 Pin Input Boxes */}
          <View style={styles.pinRow}>
            <TextInput
              ref={ref1}
              style={[styles.pinBox, digit1 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={6}
              value={digit1}
              autoFocus
              onChangeText={(val) => handlePasteOrInput(val, 1)}
            />

            <TextInput
              ref={ref2}
              style={[styles.pinBox, digit2 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit2}
              onChangeText={(val) => handlePasteOrInput(val, 2)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit2) ref1.current?.focus();
              }}
            />

            <TextInput
              ref={ref3}
              style={[styles.pinBox, digit3 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit3}
              onChangeText={(val) => handlePasteOrInput(val, 3)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit3) ref2.current?.focus();
              }}
            />

            <TextInput
              ref={ref4}
              style={[styles.pinBox, digit4 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit4}
              onChangeText={(val) => handlePasteOrInput(val, 4)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit4) ref3.current?.focus();
              }}
            />

            <TextInput
              ref={ref5}
              style={[styles.pinBox, digit5 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit5}
              onChangeText={(val) => handlePasteOrInput(val, 5)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit5) ref4.current?.focus();
              }}
            />

            <TextInput
              ref={ref6}
              style={[styles.pinBox, digit6 ? styles.pinBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit6}
              onChangeText={(val) => handlePasteOrInput(val, 6)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit6) ref5.current?.focus();
              }}
            />
          </View>

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
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  titleBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B2215',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  destinationHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00875A',
    marginTop: 4,
    textAlign: 'center',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 24,
    shadowColor: '#0B2215',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 24,
  },

  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  pinBox: {
    width: Math.floor((SCREEN_WIDTH - 48 - 48 - 40) / 6),
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2215',
    textAlign: 'center',
  },
  pinBoxFilled: {
    borderColor: '#00875A',
    backgroundColor: '#F0FDF4',
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
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: '#64748B',
  },
  countdownBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  resendActiveText: {
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
