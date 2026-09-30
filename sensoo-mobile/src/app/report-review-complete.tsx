import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportReviewCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const productName = params.name || 'Dove Body Wash\nDeep Moisture 250ml';

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
          <Text style={styles.headerTitle}>Report Review Complete</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Document with Magnifier & Check Illustration */}
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

            {/* Checkmark Badge */}
            <View style={styles.checkBadge}>
              <Text style={styles.checkSymbol}>✓</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Review Complete</Text>
        <Text style={styles.subtitle}>
          Thank you for your report.{'\n'}We've completed our review.
        </Text>

        {/* Product Card with Action Taken Pill */}
        <View style={styles.productCard}>
          <View style={styles.productThumbBox}>
            <Image
              source={require('../../assets/dove_body_wash.png')}
              style={styles.productThumb}
              resizeMode="contain"
            />
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productName}>{productName}</Text>
            <View style={styles.actionTakenPill}>
              <Text style={styles.actionTakenPillText}>Action Taken</Text>
            </View>
          </View>
        </View>

        {/* Green Protective Flag Banner */}
        <View style={styles.protectionBanner}>
          <Text style={styles.protectionIcon}>🛡️</Text>
          <Text style={styles.protectionText}>
            This product has been flagged and appropriate action has been taken to protect other users.
          </Text>
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
              params: { name: productName, status: 'Action Taken' },
            })
          }
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
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
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#DCFCE7',
    opacity: 0.5,
  },
  innerCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  documentBody: {
    width: 64,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#059669',
    paddingTop: 16,
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
    width: 14,
    height: 14,
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
    bottom: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 16,
    fontWeight: '900',
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
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  productCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  productThumbBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productThumb: {
    width: 40,
    height: 40,
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 4,
  },
  actionTakenPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionTakenPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  protectionBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  protectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  protectionText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#065F46',
    fontWeight: '500',
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
