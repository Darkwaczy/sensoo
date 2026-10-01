import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ScenarioType =
  | 'COUNTERFEIT'
  | 'ALREADY_PURCHASED'
  | 'IMPOSSIBLE_TRAVEL'
  | 'AUTHENTIC'
  | 'WRONG_REGION';

interface ScenarioConfig {
  serialNumber: string | undefined;
  type: ScenarioType;
  title: string;
  subtitle: string;
  titleColor: string;
  primaryButtonColor: string;
  heroImage: any;
  productImage: any;
  productName: string;
  productCategory: string;
  statusBadgeText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
  details: { label: string; value: string }[];
  actionSecondaryText: string;
  actionSecondaryIcon: string;
}

const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
  COUNTERFEIT: {
    type: 'COUNTERFEIT',
    title: 'Counterfeit Detected',
    subtitle: "This product doesn't match trusted manufacturer records. It may be fake or altered.",
    titleColor: '#DC2626',
    primaryButtonColor: '#DC2626',
    heroImage: require('../../assets/icons/hero_counterfeit.png'),
    productImage: require('../../assets/dove_body_wash.png'),
    productName: 'Dove Body Wash\nDeep Moisture 250ml',
    productCategory: 'Body Wash',
    statusBadgeText: 'Counterfeit Detected',
    statusBadgeBg: '#FEE2E2',
    statusBadgeColor: '#DC2626',
    details: [
      { label: 'Brand', value: 'Dove' },
      { label: 'Barcode', value: '8999990012345' },
      { label: 'Batch Number', value: 'Not found' },
      { label: 'Expiry Date', value: 'Not found' },
      { label: 'Manufacturer', value: 'Unilever (Expected)' },
    ],
    actionSecondaryText: 'Report Product',
    actionSecondaryIcon: '⚠️',
    serialNumber: undefined
  },
  ALREADY_PURCHASED: {
    type: 'ALREADY_PURCHASED',
    title: 'Already Purchased',
    subtitle: 'This product has already been scanned multiple times. It may be reused, cloned or resold.',
    titleColor: '#D97706',
    primaryButtonColor: '#D97706',
    heroImage: require('../../assets/icons/hero_purchased.png'),
    productImage: require('../../assets/panadol_extra.png'),
    productName: 'Panadol Extra\nTablets 500mg',
    productCategory: 'Analgesic',
    statusBadgeText: 'Already Purchased',
    statusBadgeBg: '#FEF3C7',
    statusBadgeColor: '#D97706',
    details: [
      { label: 'Brand', value: 'Panadol' },
      { label: 'Manufacturer', value: 'Haleon' },
      { label: 'Barcode', value: '5000158105224' },
      { label: 'Batch Number', value: 'A3F7K2' },
      { label: 'Expiry Date', value: 'Dec 2026' },
    ],
    actionSecondaryText: 'View Scan History',
    actionSecondaryIcon: '🔖',
    serialNumber: undefined
  },
  IMPOSSIBLE_TRAVEL: {
    type: 'IMPOSSIBLE_TRAVEL',
    title: 'Impossible Travel',
    subtitle: 'This product was scanned in two locations too far apart in a short time. This is not possible.',
    titleColor: '#DC2626',
    primaryButtonColor: '#DC2626',
    heroImage: require('../../assets/icons/hero_travel.png'),
    productImage: require('../../assets/dettol_antiseptic.png'),
    productName: 'Dettol Antiseptic\nLiquid 250ml',
    productCategory: 'Antiseptic',
    statusBadgeText: 'Impossible Travel',
    statusBadgeBg: '#FEE2E2',
    statusBadgeColor: '#DC2626',
    details: [
      { label: 'Brand', value: 'Dettol' },
      { label: 'Manufacturer', value: 'Reckitt Benckiser' },
      { label: 'Barcode', value: '5000158067447' },
      { label: 'Batch Number', value: 'BATCH-2026-D3' },
      { label: 'Velocity Anomaly', value: '5,333 km/h' },
    ],
    actionSecondaryText: 'Report Product',
    actionSecondaryIcon: '⚠️',
    serialNumber: undefined
  },
  AUTHENTIC: {
    type: 'AUTHENTIC',
    title: 'Authentic Product',
    subtitle: 'This product matches official manufacturer records.',
    titleColor: '#059669',
    primaryButtonColor: '#059669',
    heroImage: require('../../assets/icons/hero_authentic.png'),
    productImage: require('../../assets/panadol_extra.png'),
    productName: 'Panadol Extra\nTablets 500mg',
    productCategory: 'Medicine',
    statusBadgeText: 'Verified by Manufacturer',
    statusBadgeBg: '#DCFCE7',
    statusBadgeColor: '#059669',
    details: [
      { label: 'Brand', value: 'Panadol' },
      { label: 'Manufacturer', value: 'Haleon' },
      { label: 'Barcode', value: '5000158105224' },
      { label: 'Batch Number', value: 'A3F7K2' },
      { label: 'Expiry Date', value: 'Dec 2026' },
      { label: 'Category', value: 'Medicine' },
      { label: 'Country of Origin', value: 'United Kingdom' },
    ],
    actionSecondaryText: 'Save to History',
    actionSecondaryIcon: '🔖',
    serialNumber: undefined
  },
  WRONG_REGION: {
    type: 'WRONG_REGION',
    title: 'Wrong Region',
    subtitle: 'This product is genuine, but it is not distributed in this region. It may be imported or diverted.',
    titleColor: '#3B82F6',
    primaryButtonColor: '#D97706',
    heroImage: require('../../assets/icons/hero_region.png'),
    productImage: require('../../assets/cerave_foaming.png'),
    productName: 'CeraVe Foaming Cleanser\n473ml',
    productCategory: 'Skincare',
    statusBadgeText: 'Wrong Region',
    statusBadgeBg: '#FEF3C7',
    statusBadgeColor: '#D97706',
    details: [
      { label: 'Brand', value: 'CeraVe' },
      { label: 'Manufacturer', value: "L'Oréal USA" },
      { label: 'Barcode', value: '3606000537008' },
      { label: 'Batch Number', value: '54T91L' },
      { label: 'Expiry Date', value: 'Jan 2027' },
      { label: 'Intended Region', value: 'United States' },
      { label: 'Current Location', value: 'Nigeria' },
    ],
    actionSecondaryText: 'Learn More',
    actionSecondaryIcon: 'ℹ️',
    serialNumber: undefined
  },
};

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    scenario?: string;
    code?: string;
    productName?: string;
    manufacturer?: string;
    batchId?: string;
    reason?: string;
  }>();

  // Determine initial scenario from param or match from code
  const getInitialScenario = (): ScenarioType => {
    if (params.scenario && SCENARIOS[params.scenario as ScenarioType]) {
      return params.scenario as ScenarioType;
    }
    const code = (params.code || '').toUpperCase();
    if (code.includes('FAKE') || code === 'SNS-FAKE-0000') return 'COUNTERFEIT';
    if (code.includes('8832') || code === 'SNS-MED-8832') return 'ALREADY_PURCHASED';
    if (code.includes('SPEED') || code.includes('PHYSICS') || code === 'SNS-SPEED-9999')
      return 'IMPOSSIBLE_TRAVEL';
    if (code.includes('1099') || code === 'SNS-BABY-1099') return 'WRONG_REGION';
    return 'AUTHENTIC';
  };

  const [activeScenario, setActiveScenario] = useState<ScenarioType>(getInitialScenario);
  const baseConfig = SCENARIOS[activeScenario];
  const config = {
    ...baseConfig,
    subtitle: params.reason || baseConfig.subtitle,
    productName: params.productName || baseConfig.productName,
    details: baseConfig.details.map((d) => {
      if (d.label === 'Brand' && params.productName) {
        return { ...d, value: params.productName.split(' ')[0] };
      }
      if (d.label === 'Manufacturer' && params.manufacturer) {
        return { ...d, value: params.manufacturer };
      }
      if (d.label === 'Batch Number' && params.batchId) {
        return { ...d, value: params.batchId };
      }
      if (d.label === 'Barcode' && params.code) {
        return { ...d, value: params.code };
      }
      return d;
    }),
  };

  const handleSecondaryAction = () => {
    if (activeScenario === 'COUNTERFEIT' || activeScenario === 'IMPOSSIBLE_TRAVEL') {
      router.push({
        pathname: '/report-product',
        params: {
          name: config.productName.replace('\n', ' '),
          code: params.code || '8999990012345',
        },
      });
    } else if (activeScenario === 'ALREADY_PURCHASED') {
      router.push({
        pathname: '/scan-history',
        params: {
          code: params.code || '5000158105224',
        },
      });
    } else if (activeScenario === 'WRONG_REGION') {
      router.push({
        pathname: '/regional-info',
        params: {
          code: params.code || '3606000537008',
        },
      });
    } else if (activeScenario === 'AUTHENTIC') {
      router.push({
        pathname: '/saved-to-history',
        params: {
          name: config.productName,
          code: params.code || '5000158105224',
        },
      });
    }
  };

  const handleDone = () => {
    router.replace('/scanner');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header Bar */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={() => router.replace('/scanner')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backChevronText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.scenarioChipsContainer}>
            {(['AUTHENTIC', 'COUNTERFEIT', 'ALREADY_PURCHASED', 'IMPOSSIBLE_TRAVEL', 'WRONG_REGION'] as ScenarioType[]).map(
              (sc) => (
                <TouchableOpacity
                  key={sc}
                  style={[
                    styles.scenarioSelectorChip,
                    activeScenario === sc && styles.scenarioSelectorChipActive,
                  ]}
                  onPress={() => setActiveScenario(sc)}
                >
                  <Text
                    style={[
                      styles.scenarioSelectorText,
                      activeScenario === sc && styles.scenarioSelectorTextActive,
                    ]}
                  >
                    {sc === 'AUTHENTIC'
                      ? '✓ Authentic'
                      : sc === 'COUNTERFEIT'
                      ? '🚨 Fake'
                      : sc === 'ALREADY_PURCHASED'
                      ? '⚠️ Cloned'
                      : sc === 'IMPOSSIBLE_TRAVEL'
                      ? '✈️ Travel'
                      : '🌐 Region'}
                  </Text>
                </TouchableOpacity>
              )
            )}
            <TouchableOpacity
              style={styles.scenarioSelectorChip}
              onPress={() => router.push({ pathname: '/product-not-found', params: { code: params.code } })}
            >
              <Text style={styles.scenarioSelectorText}>🔍 Not Found</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scenarioSelectorChip}
              onPress={() => router.push({ pathname: '/verification-unavailable', params: { code: params.code } })}
            >
              <Text style={styles.scenarioSelectorText}>📶 Offline</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={() => {}}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.moreDotsText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Result Banner */}
        <View style={styles.heroSection}>
          <Image
            source={config.heroImage}
            style={styles.heroBadgeImage}
            resizeMode="contain"
          />
          <Text style={[styles.heroTitle, { color: config.titleColor }]}>
            {config.title}
          </Text>
          <Text style={styles.heroSubtitle}>{config.subtitle}</Text>
        </View>

        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productImageWrapper}>
            <Image
              source={config.productImage}
              style={styles.productThumbnail}
              resizeMode="contain"
            />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productNameText}>{config.productName}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: config.statusBadgeBg },
              ]}
            >
              <Text style={styles.statusBadgeIcon}>
                {activeScenario === 'AUTHENTIC' ? '✓' : '!'}
              </Text>
              <Text
                style={[
                  styles.statusBadgeLabel,
                  { color: config.statusBadgeColor },
                ]}
              >
                {config.statusBadgeText}
              </Text>
            </View>
          </View>
        </View>

        {/* Scenario 3 (Impossible Travel): Travel Anomaly Card with Mini Map */}
        {activeScenario === 'IMPOSSIBLE_TRAVEL' && (
          <View style={styles.travelAnomalyCard}>
            <View style={styles.travelAnomalyBanner}>
              <Text style={styles.travelBannerIcon}>✈️</Text>
              <Text style={styles.travelBannerText}>
                Same barcode scanned in different locations within a short time.
              </Text>
            </View>

            <View style={styles.travelFlightRow}>
              <View style={styles.travelLocationsCol}>
                <View style={styles.travelPointRow}>
                  <View style={styles.travelRedDot} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.travelLocName}>Lagos, Nigeria</Text>
                    <Text style={styles.travelLocTime}>Today, 10:42 AM</Text>
                  </View>
                </View>

                <View style={styles.travelTimelineDashed} />

                <View style={styles.travelPointRow}>
                  <View style={styles.travelRedDot} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.travelLocName}>Abuja, Nigeria</Text>
                    <Text style={styles.travelLocTime}>Today, 10:51 AM</Text>
                  </View>
                </View>
              </View>

              <View style={styles.travelSpeedTag}>
                <Text style={styles.travelSpeedPlane}>✈️</Text>
                <Text style={styles.travelSpeedTitle}>Impossible travel</Text>
                <Text style={styles.travelSpeedSub}>9 minutes apart{'\n'}(≈ 800 km)</Text>
              </View>
            </View>

            {/* Travel Map Image */}
            <View style={styles.mapContainer}>
              <Image
                source={require('../../assets/icons/travel_map.png')}
                style={styles.travelMapImage}
                resizeMode="cover"
              />
              <View style={styles.mapPinLagosTag}>
                <Text style={styles.mapPinTagText}>📍 Lagos · 10:42 AM</Text>
              </View>
              <View style={styles.mapPinAbujaTag}>
                <Text style={styles.mapPinTagText}>📍 Abuja · 10:51 AM</Text>
              </View>
            </View>

            <View style={styles.calloutBoxDanger}>
              <Text style={styles.calloutIconDanger}>!</Text>
              <Text style={styles.calloutTextDanger}>
                This pattern suggests the product may be fake, cloned or circulating through an unauthorized channel.
              </Text>
            </View>
          </View>
        )}

        {/* Product Details Table */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsHeaderTitle}>
            {activeScenario === 'COUNTERFEIT'
              ? 'Product Details (Scanned)'
              : 'Product Details'}
          </Text>

          {config.details.map((item, index) => (
            <View
              key={index}
              style={[
                styles.detailRow,
                index < config.details.length - 1 && styles.detailRowBorder,
              ]}
            >
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.detailValue,
                  item.label.includes('Barcode') && styles.detailBarcodeFont,
                  item.value === 'Not found' && styles.detailValueNotFound,
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Scenario 1: Counterfeit Warning Callout & "What to do?" */}
        {activeScenario === 'COUNTERFEIT' && (
          <>
            <View style={styles.calloutBoxDanger}>
              <Text style={styles.calloutIconDanger}>!</Text>
              <Text style={styles.calloutTextDanger}>
                This product does not match official manufacturer records. It may be counterfeit or altered.
              </Text>
            </View>

            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceTitle}>What to do?</Text>
              <Text style={styles.guidanceBullet}>• Do not use this product.</Text>
              <Text style={styles.guidanceBullet}>• Report to relevant authorities.</Text>
              <Text style={styles.guidanceBullet}>• Buy from trusted sellers.</Text>
            </View>
          </>
        )}

        {/* Scenario 2: Already Purchased Timeline Callout */}
        {activeScenario === 'ALREADY_PURCHASED' && (
          <View style={styles.purchasedHistoryCard}>
            <View style={styles.purchasedHistoryHeader}>
              <Text style={styles.purchasedPeopleIcon}>👥</Text>
              <Text style={styles.purchasedHistoryTitle}>
                This barcode has been scanned 5 times before.
              </Text>
            </View>

            <View style={styles.purchasedTimeline}>
              <View style={styles.timelineRow}>
                <View style={styles.timelineOrangeDot} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.timelineLoc}>Lagos, Nigeria</Text>
                  <Text style={styles.timelineTime}>Aug 12, 2025, 10:24 AM</Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              <View style={styles.timelineRow}>
                <View style={styles.timelineOrangeDot} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.timelineLoc}>Port Harcourt, Nigeria</Text>
                  <Text style={styles.timelineTime}>Aug 16, 2025, 2:15 PM</Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              <View style={styles.timelineRow}>
                <View style={styles.timelineOrangeDot} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.timelineLoc}>Abuja, Nigeria</Text>
                  <Text style={styles.timelineTime}>Aug 18, 2025, 6:03 PM</Text>
                </View>
              </View>

              <Text style={styles.timelineMoreScans}>+2 more scans</Text>
            </View>
          </View>
        )}

        {/* Scenario 4: Authentic Manufacturer Seal */}
        {activeScenario === 'AUTHENTIC' && (
          <View style={styles.verifiedSealCard}>
            <View style={styles.verifiedShieldIcon}>
              <Text style={styles.verifiedShieldCheck}>✓</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.verifiedSealTitle}>Verified by Manufacturer</Text>
              <Text style={styles.verifiedSealSubtitle}>
                This product matches official records from the manufacturer.
              </Text>
            </View>
          </View>
        )}

        {/* Scenario 5: Wrong Region Callout & "Why this matters?" */}
        {activeScenario === 'WRONG_REGION' && (
          <>
            <View style={styles.calloutBoxWarning}>
              <Text style={styles.calloutIconWarning}>!</Text>
              <Text style={styles.calloutTextWarning}>
                This product is genuine but not officially distributed in Nigeria. It may be imported or diverted from another market.
              </Text>
            </View>

            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceTitle}>Why this matters?</Text>
              <Text style={styles.guidanceBullet}>• May not meet local regulatory requirements.</Text>
              <Text style={styles.guidanceBullet}>• Storage conditions may be compromised.</Text>
              <Text style={styles.guidanceBullet}>• Warranty or manufacturer support may not apply in this region.</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Fixed Action Buttons */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        {activeScenario !== 'AUTHENTIC' ? (
          <View style={styles.counterfeitActionContainer}>
            {/* Primary Action: Ask Sensoo */}
            <TouchableOpacity
              style={styles.askSensooPrimaryBtn}
              activeOpacity={0.88}
              onPress={() => {
                router.push({
                  pathname: '/agent',
                  params: {
                    startScreen: 'contextual',
                    scanCode: params.code || config.serialNumber,
                    productName: config.productName.replace('\n', ' '),
                    scenario: activeScenario,
                  },
                });
              }}
            >
              <Text style={styles.askSensooMicIcon}>🎙️</Text>
              <Text style={styles.askSensooBtnText}>Ask Sensoo</Text>
            </TouchableOpacity>

            {/* Secondary Actions Row: Why is this fake? & Report Product */}
            <View style={styles.counterfeitSubActionsRow}>
              <TouchableOpacity
                style={styles.subOutlineBtn}
                activeOpacity={0.8}
                onPress={() => {
                  router.push({
                    pathname: '/agent',
                    params: {
                      startScreen: 'explain_scan',
                      scanCode: params.code || config.serialNumber,
                      productName: config.productName.replace('\n', ' '),
                      scenario: activeScenario,
                    },
                  });
                }}
              >
                <Text style={styles.subOutlineBtnText}>
                  {activeScenario === 'WRONG_REGION' ? 'Why wrong region?' : 'Why is this fake?'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subOutlineBtn}
                activeOpacity={0.8}
                onPress={handleSecondaryAction}
              >
                <Text style={styles.subOutlineBtnText}>Report Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryOutlineButton}
              activeOpacity={0.8}
              onPress={handleSecondaryAction}
            >
              <Text style={styles.secondaryButtonIcon}>{config.actionSecondaryIcon}</Text>
              <Text style={[styles.secondaryButtonText, { color: '#059669' }]}>
                {config.actionSecondaryText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primarySolidButton,
                { backgroundColor: config.primaryButtonColor },
              ]}
              activeOpacity={0.85}
              onPress={handleDone}
            >
              <Text style={styles.primarySolidButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingVertical: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevronText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: 34,
  },
  moreDotsText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '700',
  },

  /* Quick Scenario Switcher (for Judge & Demo Testing) */
  scenarioChipsContainer: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  scenarioSelectorChip: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scenarioSelectorChipActive: {
    backgroundColor: '#0F172A',
  },
  scenarioSelectorText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  scenarioSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },

  /* Hero Result Section */
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroBadgeImage: {
    width: 86,
    height: 86,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  /* Product Card */
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  productThumbnail: {
    width: 58,
    height: 58,
  },
  productInfo: {
    flex: 1,
  },
  productNameText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 5,
  },
  statusBadgeIcon: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Product Details Table */
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  detailBarcodeFont: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  detailValueNotFound: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  /* Danger / Warning Callout Box */
  calloutBoxDanger: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  calloutIconDanger: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 10,
  },
  calloutTextDanger: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
    fontWeight: '500',
  },

  calloutBoxWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  calloutIconWarning: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 10,
  },
  calloutTextWarning: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Guidance "What to do?" / "Why this matters?" */
  guidanceSection: {
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  guidanceBullet: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 4,
  },

  /* Scenario 2: Already Purchased Timeline */
  purchasedHistoryCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 16,
    marginBottom: 16,
  },
  purchasedHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  purchasedPeopleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  purchasedHistoryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
  },
  purchasedTimeline: {
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineOrangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D97706',
  },
  timelineConnector: {
    width: 2,
    height: 14,
    backgroundColor: '#FCD34D',
    marginLeft: 4,
  },
  timelineLoc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineTime: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 1,
  },
  timelineMoreScans: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 8,
    marginLeft: 14,
  },

  /* Scenario 3: Impossible Travel Map Card */
  travelAnomalyCard: {
    marginBottom: 16,
  },
  travelAnomalyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  travelBannerIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  travelBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#991B1B',
  },
  travelFlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  travelLocationsCol: {
    flex: 1,
  },
  travelPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  travelTimelineDashed: {
    width: 2,
    height: 16,
    backgroundColor: '#FCA5A5',
    marginLeft: 4,
    marginVertical: 2,
  },
  travelLocName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  travelLocTime: {
    fontSize: 11.5,
    color: '#64748B',
  },
  travelSpeedTag: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  travelSpeedPlane: {
    fontSize: 18,
    marginBottom: 2,
  },
  travelSpeedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  travelSpeedSub: {
    fontSize: 10,
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 2,
  },
  mapContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 140,
    marginBottom: 12,
    position: 'relative',
  },
  travelMapImage: {
    width: '100%',
    height: '100%',
  },
  mapPinLagosTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapPinAbujaTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapPinTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Scenario 4: Authentic Seal */
  verifiedSealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  verifiedShieldIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedShieldCheck: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  verifiedSealTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 2,
  },
  verifiedSealSubtitle: {
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 17,
  },

  /* Bottom Sticky Action Buttons */
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    gap: 12,
  },
  secondaryOutlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  secondaryOutlineButtonRed: {
    borderColor: '#FCA5A5',
  },
  secondaryOutlineButtonAmber: {
    borderColor: '#FCD34D',
  },
  secondaryButtonIcon: {
    fontSize: 15,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  primarySolidButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
  },
  primarySolidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  counterfeitActionContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    gap: 10,
  },
  askSensooPrimaryBtn: {
    backgroundColor: '#059669',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  askSensooMicIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  askSensooBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  counterfeitSubActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subOutlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  subOutlineBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
});
