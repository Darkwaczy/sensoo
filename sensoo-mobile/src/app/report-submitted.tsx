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

export default function ReportSubmittedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    code?: string;
    date?: string;
  }>();

  const formattedDate = params.date || 'Aug 20, 2025, 10:42 AM';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header */}
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
          <Text style={styles.headerTitle}>Report Submitted</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Celebration Badge Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />

          {/* Floating celebratory particles */}
          <View style={[styles.particleDot, styles.particle1]} />
          <View style={[styles.particleDot, styles.particle2]} />
          <View style={[styles.particleDot, styles.particle3]} />
          <View style={[styles.particleDot, styles.particle4]} />

          <View style={styles.innerCircle}>
            <View style={styles.successCheckBadge}>
              <Text style={styles.checkMarkSymbol}>✓</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Thank You!</Text>
        <Text style={styles.subtitle}>
          Your report has been submitted successfully.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          {/* Row 1: Report Submitted */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>🕒</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoHeading}>Report submitted</Text>
              <Text style={styles.infoSubtext}>{formattedDate}</Text>
            </View>
          </View>

          {/* Row 2: Team Review */}
          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>📋</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoHeading}>Our team will review it</Text>
              <Text style={styles.infoSubtext}>
                We'll investigate and take appropriate action.
              </Text>
            </View>
          </View>

          {/* Row 3: Notification */}
          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>🔔</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoHeading}>You'll be notified</Text>
              <Text style={styles.infoSubtext}>
                You'll receive a notification once there is an update.
              </Text>
            </View>
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
              pathname: '/report-details',
              params: {
                name: params.name,
                status: 'Under Review',
                date: formattedDate,
              },
            })
          }
        >
          <Text style={styles.primaryButtonText}>View Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryTextButton}
          activeOpacity={0.7}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
    position: 'relative',
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DCFCE7',
    opacity: 0.5,
  },
  particleDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  particle1: {
    top: 14,
    left: 28,
    width: 8,
    height: 8,
    backgroundColor: '#FDE047',
  },
  particle2: {
    top: 24,
    right: 22,
    width: 6,
    height: 6,
    backgroundColor: '#34D399',
  },
  particle3: {
    bottom: 24,
    left: 20,
    width: 6,
    height: 6,
    backgroundColor: '#60A5FA',
  },
  particle4: {
    bottom: 18,
    right: 26,
    width: 7,
    height: 7,
    backgroundColor: '#F472B6',
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  checkMarkSymbol: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  mainTitle: {
    fontSize: 24,
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
  infoHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
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
