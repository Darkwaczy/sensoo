import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Easing,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RETICLE_SIZE = Math.min(SCREEN_WIDTH * 0.72, 270);

export default function ScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ origin?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'qr'>('barcode');
  const [isScanning, setIsScanning] = useState(true);

  // Automatically request permission on mount if not yet determined
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Re-enable scanner whenever returning to this screen
  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
    }, [])
  );

  // Animated sweeping laser beam
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopLaser = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loopLaser.start();
    return () => loopLaser.stop();
  }, [laserAnim]);

  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, RETICLE_SIZE - 6],
  });

  // Candidate buffer to prevent truncated partial barcode reads
  const pendingShortCodeRef = useRef<{ code: string; timeout: any } | null>(null);

  // Navigate to dedicated Checking / Verification screen with real code
  const navigateToChecking = (codeToVerify: string) => {
    if (pendingShortCodeRef.current) {
      clearTimeout(pendingShortCodeRef.current.timeout);
      pendingShortCodeRef.current = null;
    }
    setIsScanning(false);
    router.push({
      pathname: '/checking',
      params: { code: codeToVerify, origin: params.origin },
    });
  };

  const handleBarcodeScanned = (result: { data: string; type: string }) => {
    if (!isScanning) return;
    const clean = (result.data || '').trim();
    if (!clean) return;

    const digitsOnly = clean.replace(/[^0-9]/g, '');

    // Standard retail barcodes (UPC-A: 12 digits, EAN-13: 13 digits, Code-128)
    if (digitsOnly.length >= 12 || clean.length >= 12) {
      navigateToChecking(clean);
      return;
    }

    // If an 8-11 digit code arrives (possible partial slice of a 12-digit UPC),
    // debounce for 350ms to allow the camera to capture the full 12/13 digits
    if (!pendingShortCodeRef.current) {
      const timeout = setTimeout(() => {
        if (isScanning) {
          navigateToChecking(clean);
        }
      }, 350);
      pendingShortCodeRef.current = { code: clean, timeout };
    }
  };

  const handleRequestPermission = async () => {
    const res = await requestPermission();
    if (!res.granted) {
      Alert.alert(
        'Camera Permission',
        'Camera access was not granted. Please enable camera permissions in your device settings to scan products.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* REAL Live Expo Camera Feed */}
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{
            barcodeTypes:
              scanMode === 'barcode'
                ? ['ean13', 'upc_a', 'code128', 'itf14']
                : ['qr', 'datamatrix'],
          }}
          onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        />
      ) : (
        <View style={styles.permissionFallback}>
          <View style={styles.permissionIconCircle}>
            <Image
              source={require('../../assets/icons/icon_camera_badge.png')}
              style={styles.permissionCameraIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSubtitle}>
            Sensoo needs camera access to scan barcodes and QR codes for instant product verification.
          </Text>
          <TouchableOpacity
            style={styles.enableCameraButton}
            activeOpacity={0.85}
            onPress={handleRequestPermission}
          >
            <Text style={styles.enableCameraText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dark Ambient Vignette Overlay */}
      {permission?.granted && <View style={styles.vignetteOverlay} pointerEvents="none" />}

      {/* Top Header Row */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerRow}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.circleIconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrowText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitleCenter}>Scan Product</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Help / Scan Failed Tips button */}
            <TouchableOpacity
              style={styles.circleIconButton}
              activeOpacity={0.7}
              onPress={() => router.push('/scan-failed')}
            >
              <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' }}>?</Text>
            </TouchableOpacity>

            {/* Flashlight Toggle */}
            <TouchableOpacity
              style={[styles.circleIconButton, torchOn && styles.circleIconButtonActive]}
              activeOpacity={0.7}
              onPress={() => setTorchOn(!torchOn)}
            >
              <Text style={styles.torchIconText}>⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Center Scanner Viewfinder (Purely visual overlay, never intercepts touches) */}
      {permission?.granted && (
        <View style={styles.viewfinderCenter} pointerEvents="none">
          <View style={styles.reticleBox}>
            {/* 4 Neon Green Corner Brackets */}
            <View style={[styles.cornerBracket, styles.topLeft]} />
            <View style={[styles.cornerBracket, styles.topRight]} />
            <View style={[styles.cornerBracket, styles.bottomLeft]} />
            <View style={[styles.cornerBracket, styles.bottomRight]} />

            {/* Sweeping Neon Green Laser Beam */}
            {isScanning && (
              <Animated.View
                style={[
                  styles.laserBeam,
                  {
                    transform: [{ translateY }],
                  },
                ]}
              >
                <View style={styles.laserLine} />
                <View style={styles.laserGlow} />
              </Animated.View>
            )}
          </View>

          <Text style={styles.reticleHintText}>
            Align {scanMode === 'barcode' ? 'barcode' : 'QR code'} inside the frame
          </Text>
        </View>
      )}

      {/* Bottom Mode Switcher: Barcode vs QR Code */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <View style={styles.modeSwitcherRow}>
          {/* Barcode Mode */}
          <TouchableOpacity
            style={styles.modeItem}
            activeOpacity={0.8}
            onPress={() => setScanMode('barcode')}
          >
            <View
              style={[
                styles.modeButtonCircle,
                scanMode === 'barcode' ? styles.modeActiveCircle : styles.modeInactiveCircle,
              ]}
            >
              <Text
                style={[
                  styles.modeIconText,
                  scanMode === 'barcode' ? styles.modeActiveIconText : styles.modeInactiveIconText,
                ]}
              >
                |||||
              </Text>
            </View>
            <Text
              style={[
                styles.modeLabel,
                scanMode === 'barcode' ? styles.modeActiveLabel : styles.modeInactiveLabel,
              ]}
            >
              Barcode
            </Text>
          </TouchableOpacity>

          {/* QR Code Mode */}
          <TouchableOpacity
            style={styles.modeItem}
            activeOpacity={0.8}
            onPress={() => setScanMode('qr')}
          >
            <View
              style={[
                styles.modeButtonCircle,
                scanMode === 'qr' ? styles.modeActiveCircle : styles.modeInactiveCircle,
              ]}
            >
              <Text
                style={[
                  styles.modeIconText,
                  scanMode === 'qr' ? styles.modeActiveIconText : styles.modeInactiveIconText,
                ]}
              >
                ▣
              </Text>
            </View>
            <Text
              style={[
                styles.modeLabel,
                scanMode === 'qr' ? styles.modeActiveLabel : styles.modeInactiveLabel,
              ]}
            >
              QR Code
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  /* Fallback Permission View */
  permissionFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A140F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    zIndex: 10,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#13281E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permissionCameraIcon: {
    width: 40,
    height: 40,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionSubtitle: {
    color: '#9EBAA9',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  enableCameraButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  enableCameraText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Dark Vignette */
  vignetteOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  /* Top Header */
  topSafeArea: {
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
  },
  circleIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIconButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  backArrowText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  headerTitleCenter: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  torchIconText: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  /* Viewfinder */
  viewfinderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },

  /* Laser Beam */
  laserBeam: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    top: 0,
    zIndex: 10,
  },
  laserLine: {
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 1.5,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  laserGlow: {
    height: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    marginTop: -8.5,
    borderRadius: 7,
  },
  reticleHintText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13.5,
    fontWeight: '500',
    marginTop: 22,
  },

  /* Bottom Mode Switcher */
  bottomSafeArea: {
    zIndex: 20,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 20 : 28,
  },
  modeSwitcherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  modeItem: {
    alignItems: 'center',
  },
  modeButtonCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeActiveCircle: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
  },
  modeInactiveCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  modeIconText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  modeActiveIconText: {
    color: '#0A341E',
  },
  modeInactiveIconText: {
    color: '#FFFFFF',
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeActiveLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modeInactiveLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
