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

export default function ReportUpdatedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();

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
          <Text style={styles.headerTitle}>Report Updated</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Document with Checkmark Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Minimalist Document Vector */}
            <View style={styles.documentBody}>
              <View style={styles.docCornerFold} />
              <View style={[styles.docLine, { width: 34 }]} />
              <View style={[styles.docLine, { width: 44 }]} />
              <View style={[styles.docLine, { width: 40 }]} />
              <View style={[styles.docLine, { width: 28 }]} />
            </View>

            {/* Green Checkmark Badge */}
            <View style={styles.checkBadge}>
              <Text style={styles.checkSymbol}>✓</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Report Updated</Text>
        <Text style={styles.subtitle}>
          Your report has been updated successfully.
        </Text>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() =>
            router.push({
              pathname: '/report-details',
              params: { name: params.name },
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
          <Text style={styles.secondaryButtonText}>Back to Reports</Text>
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
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  documentBody: {
    width: 68,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#059669',
    paddingTop: 18,
    paddingHorizontal: 10,
    position: 'relative',
    elevation: 3,
    shadowColor: '#059669',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  docCornerFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderBottomLeftRadius: 6,
    backgroundColor: '#A7F3D0',
  },
  docLine: {
    height: 3,
    backgroundColor: '#CBD5E1',
    borderRadius: 1.5,
    marginBottom: 8,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#059669',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  checkSymbol: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
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
