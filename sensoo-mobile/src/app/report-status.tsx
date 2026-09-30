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

export default function ReportStatusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    date?: string;
  }>();

  const reportedDate = params.date || 'Aug 20, 2025, 10:42 AM';

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
          <Text style={styles.headerTitle}>Report Status</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Clipboard & Magnifier Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Clipboard Vector */}
            <View style={styles.clipboardBody}>
              <View style={styles.clipboardClip} />
              <View style={styles.clipHole} />
              {/* Document lines */}
              <View style={[styles.docLine, { width: 32 }]} />
              <View style={[styles.docLine, { width: 44 }]} />
              <View style={[styles.docLine, { width: 38 }]} />
              <View style={[styles.docLine, { width: 28 }]} />
            </View>

            {/* Magnifying Glass Overlay */}
            <View style={styles.magnifierRing}>
              <View style={styles.glassReflection} />
            </View>
            <View style={styles.magnifierHandle} />
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Under Review</Text>
        <Text style={styles.subtitle}>
          Our team is reviewing your report. We'll notify you once there is an update.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>🕒</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Reported on</Text>
              <Text style={styles.infoValue}>{reportedDate}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>⏳</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Current status</Text>
              <Text style={[styles.infoValue, { color: '#D97706' }]}>Under review</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>✉️</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>We'll notify you</Text>
              <Text style={styles.infoValue}>
                You'll receive a notification once there is an update.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.outlinedButton}
          activeOpacity={0.8}
          onPress={() => router.push('/report-details')}
        >
          <Text style={styles.outlinedButtonText}>View Report Details</Text>
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
    backgroundColor: '#DCFCE7',
    opacity: 0.5,
  },
  innerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clipboardBody: {
    width: 66,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#059669',
    alignItems: 'center',
    paddingTop: 18,
    elevation: 3,
    shadowColor: '#059669',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  clipboardClip: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 12,
    backgroundColor: '#047857',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipHole: {
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  docLine: {
    height: 3,
    backgroundColor: '#CBD5E1',
    borderRadius: 1.5,
    marginBottom: 6,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  magnifierRing: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#059669',
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassReflection: {
    width: 10,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateX: -5 }, { translateY: -5 }],
  },
  magnifierHandle: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    width: 6,
    height: 18,
    backgroundColor: '#047857',
    borderRadius: 3,
    transform: [{ rotate: '-45deg' }],
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
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoIconSymbol: {
    fontSize: 14,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  bottomSafeArea: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 18 : 8,
  },
  outlinedButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#0D382B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D382B',
  },
});
