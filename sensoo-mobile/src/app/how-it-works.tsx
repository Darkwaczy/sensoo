import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HowSensooWorksScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerCenteredNav}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backChevronText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.centerTitle}>How Sensoo Works</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title */}
        <Text style={styles.heroTitle}>A safer, smarter way to shop</Text>
        <Text style={styles.heroSubtitle}>
          Sensoo helps you verify product authenticity using trusted manufacturer and verification data.
        </Text>

        {/* Step 1 */}
        <View style={styles.stepBlock}>
          <View style={styles.stepHeaderRow}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>1</Text>
            </View>
            <View style={styles.stepTextWrapper}>
              <Text style={styles.stepTitle}>Scan the product</Text>
              <Text style={styles.stepDescription}>
                Scan the barcode or QR code on the product packaging.
              </Text>
            </View>
          </View>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../../assets/icons/step_scan_phone.png')}
              style={styles.illustrationImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepBlock}>
          <View style={styles.stepHeaderRow}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>2</Text>
            </View>
            <View style={styles.stepTextWrapper}>
              <Text style={styles.stepTitle}>We check multiple sources</Text>
              <Text style={styles.stepDescription}>
                Sensoo compares the product details with trusted manufacturer records and distribution data.
              </Text>
            </View>
          </View>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../../assets/icons/step_database_check.png')}
              style={styles.illustrationImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.stepBlock}>
          <View style={styles.stepHeaderRow}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>3</Text>
            </View>
            <View style={styles.stepTextWrapper}>
              <Text style={styles.stepTitle}>Get instant results</Text>
              <Text style={styles.stepDescription}>
                See if the product is authentic, potentially fake, reused or not intended for your region.
              </Text>
            </View>
          </View>
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../../assets/icons/step_result_verified.png')}
              style={styles.illustrationImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Callout */}
        <View style={styles.calloutCard}>
          <View style={styles.shieldIconBox}>
            <Image
              source={require('../../assets/icons/icon_profile_security.png')}
              style={[styles.shieldIcon, { tintColor: '#059669' }]}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.calloutText}>
            Our goal is to help you make safer, smarter and more confident purchasing decisions.
          </Text>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCenteredNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backChevronText: {
    fontSize: 34,
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: 36,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerPlaceholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 26,
  },
  stepBlock: {
    marginBottom: 28,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberBadgeText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepTextWrapper: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  illustrationImg: {
    width: 140,
    height: 110,
  },
  calloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 14,
    gap: 12,
    marginTop: 10,
  },
  shieldIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    width: 22,
    height: 22,
  },
  calloutText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
  },
});
