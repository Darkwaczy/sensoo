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

export default function ProductNotFoundScreen() {
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
        {/* Magnifying Glass & Barcode Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Barcode under glass */}
            <View style={styles.glassBarcodeWrapper}>
              <View style={[styles.bar, { width: 3 }]} />
              <View style={[styles.bar, { width: 1.5, marginHorizontal: 2 }]} />
              <View style={[styles.bar, { width: 4 }]} />
              <View style={[styles.bar, { width: 2, marginHorizontal: 2 }]} />
              <View style={[styles.bar, { width: 5 }]} />
              <View style={[styles.bar, { width: 2, marginHorizontal: 1.5 }]} />
              <View style={[styles.bar, { width: 3 }]} />
            </View>

            {/* Magnifying Glass Ring & Handle */}
            <View style={styles.magnifierRim}>
              <View style={styles.lensReflection} />
            </View>
            <View style={styles.magnifierHandle} />

            {/* Yellow Question Mark Badge */}
            <View style={styles.questionBadge}>
              <Text style={styles.questionMarkText}>?</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Product Not Found</Text>
        <Text style={styles.subtitle}>
          We couldn't find this product in our trusted manufacturer records.
        </Text>

        {/* Checklist Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconSymbol}>🔍</Text>
            </View>
            <Text style={styles.infoText}>
              Check that you scanned the correct barcode or QR code.
            </Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconSymbol}>📷</Text>
            </View>
            <Text style={styles.infoText}>
              Try scanning again with a clearer image.
            </Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconSymbol}>ℹ️</Text>
            </View>
            <Text style={styles.infoText}>
              If the issue persists, you can report this product for review.
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
            router.push({
              pathname: '/report-product',
              params: {
                name: 'Unrecognized Scanned Item',
                code: params.code || 'UNKNOWN-CODE',
              },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Report Product</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryOutlinedButton}
          activeOpacity={0.7}
          onPress={() => router.replace('/scanner')}
        >
          <Text style={styles.secondaryOutlinedText}>Scan Again</Text>
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
    backgroundColor: '#FEF9C3',
    opacity: 0.6,
  },
  innerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glassBarcodeWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    opacity: 0.7,
  },
  bar: {
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 1,
  },
  magnifierRim: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#1E3A8A',
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  lensReflection: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateX: -8 }, { translateY: -8 }],
    opacity: 0.8,
  },
  magnifierHandle: {
    position: 'absolute',
    width: 12,
    height: 28,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
    transform: [
      { translateX: 28 },
      { translateY: 28 },
      { rotate: '-45deg' },
    ],
  },
  questionBadge: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  questionMarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
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
    backgroundColor: '#EFF6FF',
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
