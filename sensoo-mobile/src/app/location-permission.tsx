import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LocationPermissionScreen() {
  const router = useRouter();

  const handleAllowAccess = () => {
    // In mobile, save regional preference or proceed
    router.replace('/scanner');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Header */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backChevronText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location Access</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Map & Pin Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Minimalist Folded Map Vector */}
            <View style={styles.mapFoldWrapper}>
              <View style={[styles.mapFold, styles.mapFoldLeft]} />
              <View style={[styles.mapFold, styles.mapFoldCenter]} />
              <View style={[styles.mapFold, styles.mapFoldRight]} />
            </View>

            {/* Prominent Green Location Pin */}
            <View style={styles.pinWrapper}>
              <View style={styles.pinHead}>
                <View style={styles.pinDot} />
              </View>
              <View style={styles.pinPoint} />
              <View style={styles.pinShadow} />
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Allow Location Access</Text>
        <Text style={styles.subtitle}>Sensoo uses your location to:</Text>

        {/* 3 Value Propositions */}
        <View style={styles.reasonsCard}>
          <View style={styles.reasonRow}>
            <View style={styles.reasonIconCircle}>
              <Text style={styles.reasonIconText}>🌐</Text>
            </View>
            <Text style={styles.reasonText}>
              Check if a product is intended for your region.
            </Text>
          </View>

          <View style={[styles.reasonRow, { marginTop: 14 }]}>
            <View style={styles.reasonIconCircle}>
              <Text style={styles.reasonIconText}>🛡️</Text>
            </View>
            <Text style={styles.reasonText}>
              Provide more accurate verification results.
            </Text>
          </View>

          <View style={[styles.reasonRow, { marginTop: 14 }]}>
            <View style={styles.reasonIconCircle}>
              <Text style={styles.reasonIconText}>📊</Text>
            </View>
            <Text style={styles.reasonText}>
              Help detect products that may be imported or diverted from other markets.
            </Text>
          </View>
        </View>

        {/* Privacy disclaimer */}
        <Text style={styles.disclaimerText}>
          Your location is only used for product verification and is not shared with third parties without your consent.
        </Text>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={handleAllowAccess}
        >
          <Text style={styles.primaryButtonText}>Allow Location Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryTextButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Maybe Later</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 32,
    color: '#1E293B',
    lineHeight: 34,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E8F5E9',
    opacity: 0.6,
  },
  innerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapFoldWrapper: {
    width: 86,
    height: 52,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    opacity: 0.85,
  },
  mapFold: {
    height: '100%',
    borderRadius: 4,
  },
  mapFoldLeft: {
    width: 28,
    backgroundColor: '#A7F3D0',
    transform: [{ skewY: '-8deg' }],
  },
  mapFoldCenter: {
    width: 30,
    backgroundColor: '#6EE7B7',
    transform: [{ skewY: '8deg' }],
  },
  mapFoldRight: {
    width: 28,
    backgroundColor: '#34D399',
    transform: [{ skewY: '-8deg' }],
  },
  pinWrapper: {
    alignItems: 'center',
    transform: [{ translateY: -14 }],
  },
  pinHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#059669',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#059669',
    transform: [{ translateY: -2 }],
  },
  pinShadow: {
    width: 18,
    height: 5,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.18)',
    marginTop: 2,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },
  reasonsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonIconText: {
    fontSize: 15,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
  },
  disclaimerText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
  },
  bottomSafeArea: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 18 : 8,
  },
  primaryButton: {
    backgroundColor: '#0D382B',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0D382B',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryTextButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0D382B',
  },
});
