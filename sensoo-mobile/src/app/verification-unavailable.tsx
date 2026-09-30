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
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VerificationUnavailableScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();

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
          <Text style={styles.headerTitle}>Verification Result</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Cloud & Disconnected Wifi Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Cloud Vector Shape */}
            <View style={styles.cloudWrapper}>
              <View style={styles.cloudPuffMain} />
              <View style={styles.cloudPuffLeft} />
              <View style={styles.cloudPuffRight} />
              <View style={styles.cloudBase} />
            </View>

            {/* Red Wifi Disconnected Badge */}
            <View style={styles.wifiAlertBadge}>
              <Text style={styles.wifiIconSymbol}>📡</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Verification Unavailable</Text>
        <Text style={styles.subtitle}>
          We couldn't connect to the verification service. Please check your internet connection and try again.
        </Text>

        {/* Checklist Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconSymbol}>📶</Text>
            </View>
            <Text style={styles.infoText}>Check your internet connection.</Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconSymbol}>🔄</Text>
            </View>
            <Text style={styles.infoText}>Try again in a few seconds.</Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconSymbol}>ℹ️</Text>
            </View>
            <Text style={styles.infoText}>
              If the problem persists, you can still report this product.
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() =>
            router.replace({
              pathname: '/checking',
              params: { code: params.code || 'RETRY-CODE' },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryOutlinedButton}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/report-product',
              params: {
                name: 'Network Unreachable Item',
                code: params.code || 'OFFLINE-CODE',
              },
            })
          }
        >
          <Text style={styles.secondaryOutlinedText}>Report Product</Text>
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
    backgroundColor: '#FEE2E2',
    opacity: 0.5,
  },
  innerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cloudWrapper: {
    width: 80,
    height: 50,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudPuffMain: {
    position: 'absolute',
    top: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CBD5E1',
  },
  cloudPuffLeft: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CBD5E1',
  },
  cloudPuffRight: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CBD5E1',
  },
  cloudBase: {
    position: 'absolute',
    bottom: 4,
    width: 60,
    height: 18,
    backgroundColor: '#CBD5E1',
    borderRadius: 9,
  },
  wifiAlertBadge: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  wifiIconSymbol: {
    fontSize: 14,
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
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIconSymbol: {
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
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
  secondaryOutlinedButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0D382B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryOutlinedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D382B',
  },
});
