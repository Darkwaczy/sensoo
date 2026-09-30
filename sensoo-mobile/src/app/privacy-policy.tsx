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

export default function PrivacyPolicyScreen() {
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
          <Text style={styles.centerTitle}>Privacy Policy</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple Shield Icon in Circle */}
        <View style={styles.iconCircleWrapper}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../../assets/icons/icon_profile_security.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.lastUpdatedText}>Last updated: Aug 15, 2025</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>1. Information We Collect</Text>
          <Text style={styles.sectionBody}>
            We collect information necessary to provide and improve Sensoo, including:
          </Text>
          <Text style={styles.bulletItem}>• Account information (name, email, phone number)</Text>
          <Text style={styles.bulletItem}>• Location data (with your permission)</Text>
          <Text style={styles.bulletItem}>• Product scans and verification history</Text>
          <Text style={styles.bulletItem}>• Device information</Text>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>2. How We Use Your Information</Text>
          <Text style={styles.sectionBody}>
            We use your information to:
          </Text>
          <Text style={styles.bulletItem}>• Verify product authenticity</Text>
          <Text style={styles.bulletItem}>• Improve our services</Text>
          <Text style={styles.bulletItem}>• Provide customer support</Text>
          <Text style={styles.bulletItem}>• Send important updates</Text>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>3. Location Data</Text>
          <Text style={styles.sectionBody}>
            With your permission, we use your location to provide more accurate product verification based on regional distribution data.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>4. Data Security</Text>
          <Text style={styles.sectionBody}>
            We take reasonable measures to protect your information from unauthorized access, use or disclosure.
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
    paddingTop: 16,
    paddingBottom: 36,
  },
  iconCircleWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconImg: {
    width: 28,
    height: 28,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 6,
  },
});
