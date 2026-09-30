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

export default function TermsOfServiceScreen() {
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
          <Text style={styles.centerTitle}>Terms of Service</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Icon in Soft Blue Circle */}
        <View style={styles.iconCircleWrapper}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../../assets/icons/icon_doc_purple.png')}
              style={[styles.iconImg, { tintColor: '#3B82F6' }]}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.lastUpdatedText}>Last updated: Aug 15, 2025</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionBody}>
            By using Sensoo, you agree to these Terms of Service. If you do not agree, please do not use the app.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>2. About Sensoo</Text>
          <Text style={styles.sectionBody}>
            Sensoo provides product verification information based on trusted manufacturer and third-party data. We do not manufacture or sell products.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>3. Use of the App</Text>
          <Text style={styles.sectionBody}>
            You agree to use Sensoo for lawful purposes and in accordance with these terms.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>4. Product Information</Text>
          <Text style={styles.sectionBody}>
            While we strive for accuracy, we do not guarantee that all product information is complete, accurate or up to date.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>5. Limitations</Text>
          <Text style={styles.sectionBody}>
            Sensoo is not responsible for purchase decisions made based on information provided in the app, use or disclosure.
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
    backgroundColor: '#EFF6FF',
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
  },
});
