import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RegionalInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    code?: string;
    imageUrl?: string;
  }>();

  const productName = params.name || (params.code ? `Product (${params.code})` : 'Diverted Product');

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
          <Text style={styles.headerTitle}>About Regional Verification</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Card */}
        <View style={styles.productBannerCard}>
          <View style={styles.globeBadge}>
            <Text style={styles.globeIcon}>🌐</Text>
          </View>
          <View style={styles.productThumbWrapper}>
            <Image
              source={
                params.imageUrl
                  ? { uri: params.imageUrl }
                  : require('../../assets/barcode_icon.png')
              }
              style={styles.productThumb}
              resizeMode="contain"
            />
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productName}>{productName}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillIcon}>!</Text>
              <Text style={styles.statusPillText}>Wrong Region</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Why did I get this alert? */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Why did I get this alert?</Text>
          <Text style={styles.sectionBodyText}>
            This product appears to be genuine, but it is not officially distributed for your current region. It may be imported or diverted from another market.
          </Text>

          {/* Region Comparison Card */}
          <View style={styles.comparisonCard}>
            {/* Intended Region Row */}
            <View style={styles.regionRow}>
              <Image
                source={require('../../assets/icons/flag_us.png')}
                style={styles.flagIcon}
                resizeMode="contain"
              />
              <View style={styles.regionMeta}>
                <Text style={styles.regionLabel}>Intended region</Text>
                <Text style={styles.regionValue}>United States</Text>
              </View>
            </View>

            <View style={styles.regionDivider} />

            {/* Current Region Row */}
            <View style={styles.regionRow}>
              <Image
                source={require('../../assets/icons/flag_ng.png')}
                style={styles.flagIcon}
                resizeMode="contain"
              />
              <View style={styles.regionMeta}>
                <Text style={styles.regionLabel}>Current region</Text>
                <Text style={styles.regionValue}>Nigeria</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Why this matters */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionHeading}>Why this matters</Text>
          <Text style={styles.sectionBodyText}>
            Products distributed in different regions can have different regulatory requirements, packaging, ingredients, storage conditions, or manufacturer support. Using products from mismatched regions may affect safety, warranty or after-sales support.
          </Text>
        </View>

        {/* Section 3: What you can do */}
        <View style={styles.actionAdviceCard}>
          <View style={styles.adviceHeaderRow}>
            <View style={styles.adviceCheckCircle}>
              <Text style={styles.adviceCheckText}>✓</Text>
            </View>
            <Text style={styles.adviceHeading}>What you can do</Text>
          </View>
          <Text style={styles.adviceBullet}>
            • Purchase from an authorized local distributor when possible.
          </Text>
          <Text style={styles.adviceBullet}>
            • Check the product packaging for intended region.
          </Text>
          <Text style={styles.adviceBullet}>
            • When in doubt, verify with the manufacturer.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Fixed Action Button */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.gotItButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Text style={styles.gotItButtonText}>Got it</Text>
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

  /* Header */
  topSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 34,
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  /* Product Banner Card */
  productBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 14,
    marginBottom: 24,
    position: 'relative',
  },
  globeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  globeIcon: {
    fontSize: 16,
  },
  productThumbWrapper: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productThumb: {
    width: 44,
    height: 44,
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  statusPillIcon: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D97706',
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },

  /* Section Common */
  infoSection: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  sectionBodyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 14,
  },

  /* Region Comparison Card */
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flagIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 14,
  },
  regionMeta: {
    flex: 1,
  },
  regionLabel: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 2,
  },
  regionValue: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  regionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  /* Advice Card */
  actionAdviceCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  adviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adviceCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  adviceCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  adviceHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#064E3B',
  },
  adviceBullet: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 6,
  },

  /* Bottom Action Button */
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
  },
  gotItButton: {
    backgroundColor: '#064E3B',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  gotItButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
