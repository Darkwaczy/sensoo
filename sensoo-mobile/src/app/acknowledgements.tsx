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

export default function AcknowledgementsScreen() {
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
          <Text style={styles.centerTitle}>Acknowledgements</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Icon Circle */}
        <View style={styles.iconCircleWrapper}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../../assets/icons/icon_people_outline.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Section: Credits & Acknowledgements */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Credits & Acknowledgements</Text>
          <Text style={styles.bodyText}>
            Sensoo is made possible through the support of trusted data providers, open-source tools, and the amazing community behind it.
          </Text>
        </View>

        {/* Section: Our Partners */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Our Partners</Text>

          {/* Partner 1: GS1 */}
          <View style={styles.partnerCard}>
            <Image
              source={require('../../assets/icons/partner_gs1.png')}
              style={styles.partnerBadge}
              resizeMode="contain"
            />
            <View style={styles.partnerMeta}>
              <Text style={styles.partnerTitle}>GS1</Text>
              <Text style={styles.partnerSubtitle}>
                Global standards for barcodes and product identification.
              </Text>
            </View>
          </View>

          {/* Partner 2: Open Source Community */}
          <View style={styles.partnerCard}>
            <Image
              source={require('../../assets/icons/partner_opensource.png')}
              style={styles.partnerBadge}
              resizeMode="contain"
            />
            <View style={styles.partnerMeta}>
              <Text style={styles.partnerTitle}>Open Source Community</Text>
              <Text style={styles.partnerSubtitle}>
                Tools and libraries that power our technology.
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Special Thanks */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Special Thanks</Text>
          <Text style={styles.bodyText}>
            To the developers, designers, researchers, and early users who contributed their time, feedback, and ideas to make Sensoo better.
          </Text>
        </View>

        {/* Bottom Banner */}
        <View style={styles.bottomBanner}>
          <View style={styles.heartCircle}>
            <Text style={styles.heartText}>🛡️</Text>
          </View>
          <Text style={styles.bottomBannerText}>
            Together, we can build a safer and more transparent marketplace.
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
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: {
    width: 30,
    height: 30,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  partnerBadge: {
    width: 44,
    height: 44,
    marginRight: 14,
  },
  partnerMeta: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  partnerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 16,
  },
  bottomBanner: {
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
  heartCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    fontSize: 16,
  },
  bottomBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
  },
});
