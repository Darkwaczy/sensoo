import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PermissionItem {
  id: 'location' | 'camera' | 'audio';
  icon: string;
  title: string;
  badge: string;
  description: string;
  granted: boolean;
}

export default function PermissionsScreen() {
  const router = useRouter();

  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [cameraGranted, setCameraGranted] = useState<boolean>(false);
  const [audioGranted, setAudioGranted] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [requestingAll, setRequestingAll] = useState<boolean>(false);

  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    try {
      const [loc, cam, mic] = await Promise.all([
        Location.getForegroundPermissionsAsync().catch(() => ({ status: 'undetermined', granted: false })),
        Camera.getCameraPermissionsAsync().catch(() => ({ status: 'undetermined', granted: false })),
        Camera.getMicrophonePermissionsAsync().catch(() => ({ status: 'undetermined', granted: false })),
      ]);

      setLocationGranted(loc.status === 'granted');
      setCameraGranted(cam.granted);
      setAudioGranted(mic.granted);
    } catch (err) {
      console.warn('Error checking permissions:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleRequestLocation = async () => {
    try {
      const res = await Location.requestForegroundPermissionsAsync();
      const granted = res.status === 'granted';
      setLocationGranted(granted);
      if (!granted) {
        Alert.alert(
          'Location Permission',
          'Location access helps Sensoo check regional authenticity and alert you to counterfeit batches in your area.'
        );
      }
      return granted;
    } catch {
      return false;
    }
  };

  const handleRequestCamera = async () => {
    try {
      const res = await Camera.requestCameraPermissionsAsync();
      const granted = res.granted;
      setCameraGranted(granted);
      if (!granted) {
        Alert.alert(
          'Camera Permission',
          'Camera access is required to scan barcodes and GS1 QR codes for instant verification.'
        );
      }
      return granted;
    } catch {
      return false;
    }
  };

  const handleRequestAudio = async () => {
    try {
      const res = await Camera.requestMicrophonePermissionsAsync();
      const granted = res.granted;
      setAudioGranted(granted);
      if (!granted) {
        Alert.alert(
          'Microphone Permission',
          'Microphone access is needed for hands-free Sensoo Voice Commander and voice queries.'
        );
      }
      return granted;
    } catch {
      return false;
    }
  };

  const handleGrantAll = async () => {
    setRequestingAll(true);
    try {
      if (!locationGranted) {
        await handleRequestLocation();
      }
      if (!cameraGranted) {
        await handleRequestCamera();
      }
      if (!audioGranted) {
        await handleRequestAudio();
      }
    } finally {
      setRequestingAll(false);
      // Re-check and proceed to home
      router.replace('/home');
    }
  };

  const handleProceed = () => {
    router.replace('/home');
  };

  const allGranted = locationGranted && cameraGranted && audioGranted;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleProceed}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
          >
            <Text style={styles.skipButtonText}>{allGranted ? 'Continue' : 'Skip for now'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Block */}
        <View style={styles.titleSection}>
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>DEVICE PERMISSIONS</Text>
          </View>
          <Text style={styles.headingTitle}>Enable Device Access</Text>
          <Text style={styles.headingSubtitle}>
            To protect you from counterfeit goods and verify products instantly in Nigeria, Sensoo needs access to 3 essential phone features.
          </Text>
        </View>

        {/* Permissions Cards */}
        <View style={styles.cardsContainer}>
          {/* 1. Location Access */}
          <View style={[styles.permissionCard, locationGranted && styles.cardGranted]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Text style={styles.iconEmoji}>📍</Text>
              </View>
              <View style={styles.cardTitleCol}>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.cardTitle}>Location Access</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>Regional Safety</Text>
                  </View>
                </View>
                <Text style={styles.cardCategory}>Regional Authenticity & Hotspots</Text>
              </View>
            </View>

            <Text style={styles.cardDesc}>
              Detects if a product is intended for your Nigerian region (Lagos, Abuja, PH, Kano) and alerts you to counterfeit batches nearby.
            </Text>

            <View style={styles.cardFooter}>
              {locationGranted ? (
                <View style={styles.grantedBadge}>
                  <Text style={styles.grantedBadgeText}>✓ Allowed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.8}
                  onPress={handleRequestLocation}
                >
                  <Text style={styles.actionButtonText}>Allow Access</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 2. Camera Access */}
          <View style={[styles.permissionCard, cameraGranted && styles.cardGranted]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.iconEmoji}>📷</Text>
              </View>
              <View style={styles.cardTitleCol}>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.cardTitle}>Camera Access</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>Core Scanner</Text>
                  </View>
                </View>
                <Text style={styles.cardCategory}>Barcode & QR Code Verification</Text>
              </View>
            </View>

            <Text style={styles.cardDesc}>
              Scans 1D barcodes, GS1 DataMatrix, and batch QR codes in real time to instantly verify product genuineness.
            </Text>

            <View style={styles.cardFooter}>
              {cameraGranted ? (
                <View style={styles.grantedBadge}>
                  <Text style={styles.grantedBadgeText}>✓ Allowed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.8}
                  onPress={handleRequestCamera}
                >
                  <Text style={styles.actionButtonText}>Allow Access</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 3. Audio / Microphone Access */}
          <View style={[styles.permissionCard, audioGranted && styles.cardGranted]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.iconEmoji}>🎙️</Text>
              </View>
              <View style={styles.cardTitleCol}>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.cardTitle}>Microphone Access</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>Voice Assistant</Text>
                  </View>
                </View>
                <Text style={styles.cardCategory}>Sensoo Voice Commander</Text>
              </View>
            </View>

            <Text style={styles.cardDesc}>
              Enables hands-free "Hey Sensoo" commands, voice searches for verified medicine, and audio safety reports.
            </Text>

            <View style={styles.cardFooter}>
              {audioGranted ? (
                <View style={styles.grantedBadge}>
                  <Text style={styles.grantedBadgeText}>✓ Allowed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.8}
                  onPress={handleRequestAudio}
                >
                  <Text style={styles.actionButtonText}>Allow Access</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyShield}>🛡️</Text>
          <Text style={styles.privacyText}>
            Your privacy is our priority. Sensoo only uses your camera to scan products, your location to verify market bounds, and your microphone for voice queries. No telemetry is shared with third parties.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        {allGranted ? (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={handleProceed}
          >
            <Text style={styles.primaryButtonText}>Continue to Dashboard →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={handleGrantAll}
            disabled={requestingAll}
          >
            {requestingAll ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Grant All Permissions</Text>
            )}
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  logo: {
    width: 108,
    height: 32,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F5ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B2215',
    letterSpacing: 1.2,
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B2215',
    lineHeight: 33,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  headingSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 22,
  },
  permissionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardGranted: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 22,
  },
  cardTitleCol: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2215',
  },
  pillBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  cardCategory: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#032B20',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  grantedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  grantedBadgeText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '700',
  },
  privacyBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    gap: 10,
  },
  privacyShield: {
    fontSize: 18,
    marginTop: 1,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  primaryButton: {
    height: 52,
    backgroundColor: '#032B20',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#032B20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
