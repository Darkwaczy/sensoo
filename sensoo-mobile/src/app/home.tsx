import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ViewType = 'Home' | 'RecentScans' | 'VerifiedProducts' | 'Alerts' | 'Profile' | 'Notifications';

export interface NotificationItem {
  id: string;
  category: 'Verification' | 'System' | 'Updates';
  title: string;
  description: string;
  time: string;
  dateGroup: 'Today' | 'Yesterday';
  iconType: 'counterfeit' | 'repeat' | 'globe' | 'verified' | 'gear';
  iconBg: string;
  isRead: boolean;
  scenario?: 'AUTHENTIC' | 'COUNTERFEIT' | 'ALREADY_PURCHASED' | 'IMPOSSIBLE_TRAVEL' | 'WRONG_REGION';
  code?: string;
}

const INITIAL_NOTIFICATIONS_DATA: NotificationItem[] = [
  {
    id: 'n1',
    category: 'Verification',
    title: 'Counterfeit detected',
    description: 'A product you scanned was flagged as potentially counterfeit.',
    time: '10:42 AM',
    dateGroup: 'Today',
    iconType: 'counterfeit',
    iconBg: '#FEE2E2',
    isRead: false,
    scenario: 'COUNTERFEIT',
    code: '8999990012345',
  },
  {
    id: 'n2',
    category: 'Verification',
    title: 'Repeated scan detected',
    description: 'The same product has been scanned multiple times.',
    time: '9:18 AM',
    dateGroup: 'Today',
    iconType: 'repeat',
    iconBg: '#FEF3C7',
    isRead: false,
    scenario: 'ALREADY_PURCHASED',
    code: '5000158105224',
  },
  {
    id: 'n3',
    category: 'Verification',
    title: 'Regional alert',
    description: 'A product you scanned may not be intended for your current region.',
    time: '8:05 AM',
    dateGroup: 'Today',
    iconType: 'globe',
    iconBg: '#EFF6FF',
    isRead: false,
    scenario: 'WRONG_REGION',
    code: 'SNS-BABY-1099',
  },
  {
    id: 'n4',
    category: 'Verification',
    title: 'Product verified',
    description: 'Panadol Extra 500mg matches official manufacturer records.',
    time: '7:32 PM',
    dateGroup: 'Yesterday',
    iconType: 'verified',
    iconBg: '#059669',
    isRead: true,
    scenario: 'AUTHENTIC',
    code: '5000158105224',
  },
  {
    id: 'n5',
    category: 'Updates',
    title: 'App update',
    description: 'Sensoo has been updated to version 1.2 with new features.',
    time: '11:15 AM',
    dateGroup: 'Yesterday',
    iconType: 'gear',
    iconBg: '#E2E8F0',
    isRead: true,
  },
];

interface RecentScanItem {
  id: string;
  name: string;
  image: any;
  status: 'VERIFIED' | 'COUNTERFEIT' | 'WRONG_REGION';
  statusText: string;
  time: string;
  dateGroup: 'Today' | 'Yesterday';
  scenario: 'AUTHENTIC' | 'COUNTERFEIT' | 'ALREADY_PURCHASED' | 'IMPOSSIBLE_TRAVEL' | 'WRONG_REGION';
  code: string;
}

const RECENT_SCANS_DATA: RecentScanItem[] = [
  {
    id: 'rs1',
    name: 'Panadol Extra\nTablets 500mg',
    image: require('../../assets/panadol_extra.png'),
    status: 'VERIFIED',
    statusText: 'Verified',
    time: '10:24 AM',
    dateGroup: 'Today',
    scenario: 'AUTHENTIC',
    code: '5000158105224',
  },
  {
    id: 'rs2',
    name: 'Dettol Antiseptic\nLiquid 250ml',
    image: require('../../assets/dettol_antiseptic.png'),
    status: 'VERIFIED',
    statusText: 'Verified',
    time: '09:18 AM',
    dateGroup: 'Today',
    scenario: 'AUTHENTIC',
    code: '5000158067447',
  },
  {
    id: 'rs3',
    name: 'Dove Body Wash\nDeep Moisture 250ml',
    image: require('../../assets/dove_body_wash.png'),
    status: 'COUNTERFEIT',
    statusText: 'Counterfeit',
    time: '08:42 AM',
    dateGroup: 'Today',
    scenario: 'COUNTERFEIT',
    code: '8999990012345',
  },
  {
    id: 'rs4',
    name: 'CeraVe Foaming Cleanser\n473ml',
    image: require('../../assets/cerave_foaming.png'),
    status: 'VERIFIED',
    statusText: 'Verified',
    time: 'Yesterday, 6:15 PM',
    dateGroup: 'Yesterday',
    scenario: 'AUTHENTIC',
    code: '3606000537008',
  },
  {
    id: 'rs5',
    name: 'Nivea Sun SPF 50\nSunscreen 200ml',
    image: require('../../assets/nivea_sun.png'),
    status: 'WRONG_REGION',
    statusText: 'Wrong Region',
    time: 'Yesterday, 2:33 PM',
    dateGroup: 'Yesterday',
    scenario: 'WRONG_REGION',
    code: 'SNS-BABY-1099',
  },
];

interface VerifiedProductItem {
  id: string;
  name: string;
  image: any;
  category: 'Medicine' | 'Skincare' | 'Personal Care' | 'Food';
  time: string;
  code: string;
}

const VERIFIED_PRODUCTS_DATA: VerifiedProductItem[] = [
  {
    id: 'vp1',
    name: 'Panadol Extra\nTablets 500mg',
    image: require('../../assets/panadol_extra.png'),
    category: 'Medicine',
    time: 'Today, 10:24 AM',
    code: '5000158105224',
  },
  {
    id: 'vp2',
    name: 'Dettol Antiseptic\nLiquid 250ml',
    image: require('../../assets/dettol_antiseptic.png'),
    category: 'Medicine',
    time: 'Yesterday, 6:15 PM',
    code: '5000158067447',
  },
  {
    id: 'vp3',
    name: 'CeraVe Foaming Cleanser\n473ml',
    image: require('../../assets/cerave_foaming.png'),
    category: 'Skincare',
    time: 'Sep 20, 2025, 3:12 PM',
    code: '3606000537008',
  },
  {
    id: 'vp4',
    name: 'Nivea Sun SPF 50\nSunscreen 200ml',
    image: require('../../assets/nivea_sun.png'),
    category: 'Skincare',
    time: 'Sep 19, 2025, 11:04 AM',
    code: 'SNS-MED-9021',
  },
  {
    id: 'vp5',
    name: 'Colgate Total\nToothpaste 120g',
    image: require('../../assets/colgate_total.png'),
    category: 'Personal Care',
    time: 'Sep 18, 2025, 4:28 PM',
    code: 'SNS-COL-5512',
  },
  {
    id: 'vp6',
    name: 'Dove Body Wash\nDeep Moisture 250ml',
    image: require('../../assets/dove_body_wash.png'),
    category: 'Personal Care',
    time: 'Sep 17, 2025, 8:55 PM',
    code: 'SNS-DOV-1123',
  },
];

interface AlertItem {
  id: string;
  name: string;
  image: any;
  alertType: 'Counterfeit' | 'Reused' | 'Wrong Region' | 'Suspicious';
  badgeIcon: string;
  badgeBg: string;
  badgeTextColor: string;
  statusPillText: string;
  statusPillBg: string;
  statusPillColor: string;
  time: string;
  callout: string;
  scenario: 'COUNTERFEIT' | 'ALREADY_PURCHASED' | 'IMPOSSIBLE_TRAVEL' | 'WRONG_REGION';
  code: string;
}

const ALERTS_DATA: AlertItem[] = [
  {
    id: 'alt1',
    name: 'Dove Body Wash\nDeep Moisture 250ml',
    image: require('../../assets/dove_body_wash.png'),
    alertType: 'Counterfeit',
    badgeIcon: '!',
    badgeBg: '#DC2626',
    badgeTextColor: '#FFFFFF',
    statusPillText: 'Counterfeit Detected',
    statusPillBg: '#FEE2E2',
    statusPillColor: '#DC2626',
    time: 'Today, 8:42 AM',
    callout:
      "This product does not match trusted manufacturer records. It may be fake or altered.",
    scenario: 'COUNTERFEIT',
    code: '8999990012345',
  },
  {
    id: 'alt2',
    name: 'Panadol Extra\nTablets 500mg',
    image: require('../../assets/panadol_extra.png'),
    alertType: 'Reused',
    badgeIcon: '⚠️',
    badgeBg: '#D97706',
    badgeTextColor: '#FFFFFF',
    statusPillText: 'Already Purchased',
    statusPillBg: '#FEF3C7',
    statusPillColor: '#D97706',
    time: 'Yesterday, 5:12 PM',
    callout:
      'This product has already been scanned multiple times. It may be reused, cloned or resold.',
    scenario: 'ALREADY_PURCHASED',
    code: '5000158105224',
  },
  {
    id: 'alt3',
    name: 'Dettol Antiseptic\nLiquid 250ml',
    image: require('../../assets/dettol_antiseptic.png'),
    alertType: 'Suspicious',
    badgeIcon: '✈️',
    badgeBg: '#DC2626',
    badgeTextColor: '#FFFFFF',
    statusPillText: 'Impossible Travel',
    statusPillBg: '#FEE2E2',
    statusPillColor: '#DC2626',
    time: 'Sep 19, 2025, 7:36 PM',
    callout:
      'This barcode was scanned in two locations too far apart in a short time. This is not possible.',
    scenario: 'IMPOSSIBLE_TRAVEL',
    code: '5000158067447',
  },
  {
    id: 'alt4',
    name: 'CeraVe Foaming Cleanser\n473ml',
    image: require('../../assets/cerave_foaming.png'),
    alertType: 'Wrong Region',
    badgeIcon: '🌐',
    badgeBg: '#D97706',
    badgeTextColor: '#FFFFFF',
    statusPillText: 'Wrong Region',
    statusPillBg: '#FEF3C7',
    statusPillColor: '#D97706',
    time: 'Sep 18, 2025, 2:21 PM',
    callout:
      'This product is genuine but not officially distributed in this region. It may be imported or diverted.',
    scenario: 'WRONG_REGION',
    code: '3606000537008',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>('Home');
  const [previousView, setPreviousView] = useState<ViewType>('Home');

  // Search & Filters state
  const [recentSearch, setRecentSearch] = useState('');
  const [recentFilter, setRecentFilter] = useState<'All' | 'Verified' | 'Counterfeit' | 'Alerts'>('All');

  const [verifiedSearch, setVerifiedSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'All' | 'Medicine' | 'Skincare' | 'Personal Care' | 'Food'>('All');

  const [alertFilter, setAlertFilter] = useState<'All' | 'Counterfeit' | 'Reused' | 'Wrong Region' | 'Suspicious'>('All');

  // Notifications & Profile state
  const [notificationFilter, setNotificationFilter] = useState<'All' | 'Verification' | 'System' | 'Updates'>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS_DATA);

  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out of your Sensoo account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => router.replace('/get-started' as any),
        },
      ]
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    if (notificationFilter === 'All') return true;
    return item.category === notificationFilter;
  });

  const handleScanPress = () => {
    router.push('/scanner' as any);
  };

  const navigateToResult = (scenario: string, code: string) => {
    router.push({
      pathname: '/result',
      params: { scenario, code },
    });
  };

  // Filtered lists
  const filteredRecentScans = RECENT_SCANS_DATA.filter((item) => {
    const matchesSearch =
      recentSearch === '' ||
      item.name.toLowerCase().includes(recentSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (recentFilter === 'Verified') return item.status === 'VERIFIED';
    if (recentFilter === 'Counterfeit') return item.status === 'COUNTERFEIT';
    if (recentFilter === 'Alerts') return item.status !== 'VERIFIED';
    return true;
  });

  const filteredVerifiedProducts = VERIFIED_PRODUCTS_DATA.filter((item) => {
    const matchesSearch =
      verifiedSearch === '' ||
      item.name.toLowerCase().includes(verifiedSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (verifiedFilter !== 'All') return item.category === verifiedFilter;
    return true;
  });

  const filteredAlerts = ALERTS_DATA.filter((item) => {
    if (alertFilter === 'All') return true;
    return item.alertType === alertFilter;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* ======================================================== */}
      {/* 1. MAIN HOME DASHBOARD VIEW */}
      {/* ======================================================== */}
      {activeView === 'Home' && (
        <>
          <SafeAreaView style={styles.topSafeArea} edges={['top']}>
            <View style={styles.headerRow}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.bellButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPreviousView('Home');
                    setActiveView('Notifications');
                  }}
                >
                  <Image
                    source={require('../../assets/icons/icon_bell.png')}
                    style={styles.bellIconImage}
                    resizeMode="contain"
                  />
                  {notifications.some((n) => !n.isRead) && (
                    <View style={styles.bellBadgeDot} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.avatarButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    setPreviousView('Home');
                    setActiveView('Profile');
                  }}
                >
                  <Text style={styles.avatarText}>H</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* User Greeting */}
            <View style={styles.greetingSection}>
              <Text style={styles.greetingTitle}>
                <Text style={styles.greetingBlack}>Good morning, </Text>
                <Text style={styles.greetingGreen}>Hilda</Text>
              </Text>
              <Text style={styles.greetingSubtitle}>Verify a product before you buy or use it.</Text>
            </View>

            {/* Hero Scan Banner Card */}
            <TouchableOpacity style={styles.heroBannerCard} activeOpacity={0.92} onPress={handleScanPress}>
              <Image
                source={require('../../assets/home_scan_banner.png')}
                style={styles.heroBannerImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            {/* 3 Shortcut Action Cards Row */}
            <View style={styles.shortcutsRow}>
              {/* Card 1: Recent Scans */}
              <TouchableOpacity
                style={[styles.shortcutCard, { backgroundColor: '#EBF6F0' }]}
                activeOpacity={0.8}
                onPress={() => setActiveView('RecentScans')}
              >
                <Image
                  source={require('../../assets/icons/icon_clock_badge.png')}
                  style={styles.shortcutBadgeImage}
                  resizeMode="contain"
                />
                <View style={styles.shortcutTextWrapper}>
                  <Text style={styles.shortcutTitle}>Recent Scans</Text>
                  <Text style={styles.shortcutSubtitle}>View your history</Text>
                </View>
                <View style={styles.shortcutChevron}>
                  <Text style={styles.shortcutChevronArrow}>›</Text>
                </View>
              </TouchableOpacity>

              {/* Card 2: Verified Products */}
              <TouchableOpacity
                style={[styles.shortcutCard, { backgroundColor: '#EAF4F9' }]}
                activeOpacity={0.8}
                onPress={() => setActiveView('VerifiedProducts')}
              >
                <Image
                  source={require('../../assets/icons/icon_cube_badge.png')}
                  style={styles.shortcutBadgeImage}
                  resizeMode="contain"
                />
                <View style={styles.shortcutTextWrapper}>
                  <Text style={styles.shortcutTitle}>Verified{'\n'}Products</Text>
                  <Text style={styles.shortcutSubtitle}>Trusted brands</Text>
                </View>
                <View style={styles.shortcutChevron}>
                  <Text style={styles.shortcutChevronArrow}>›</Text>
                </View>
              </TouchableOpacity>

              {/* Card 3: Alerts */}
              <TouchableOpacity
                style={[styles.shortcutCard, { backgroundColor: '#FDEEEC' }]}
                activeOpacity={0.8}
                onPress={() => setActiveView('Alerts')}
              >
                <Image
                  source={require('../../assets/icons/icon_shield_badge.png')}
                  style={styles.shortcutBadgeImage}
                  resizeMode="contain"
                />
                <View style={styles.shortcutTextWrapper}>
                  <Text style={styles.shortcutTitle}>Alerts</Text>
                  <Text style={styles.shortcutSubtitle}>Stay informed</Text>
                </View>
                <View style={styles.shortcutChevron}>
                  <Text style={styles.shortcutChevronArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Recent Scans Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setActiveView('RecentScans')}>
                <Text style={styles.seeAllText}>See all ›</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Scans Preview Items */}
            {RECENT_SCANS_DATA.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.scanCard}
                activeOpacity={0.85}
                onPress={() => navigateToResult(item.scenario, item.code)}
              >
                <View style={styles.thumbWrapper}>
                  <Image source={item.image} style={styles.thumbImage} resizeMode="contain" />
                </View>
                <View style={styles.scanMeta}>
                  <Text style={styles.productName}>{item.name.replace('\n', ' ')}</Text>
                  <Text style={styles.scanTimestamp}>{item.time}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    item.status === 'VERIFIED' ? styles.statusVerified : styles.statusCounterfeit,
                  ]}
                >
                  <Text style={styles.statusPillIcon}>{item.status === 'VERIFIED' ? '✓' : '!'}</Text>
                  <Text
                    style={[
                      styles.statusPillText,
                      item.status === 'VERIFIED' ? styles.textVerified : styles.textCounterfeit,
                    ]}
                  >
                    {item.statusText}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. SCREEN 1: RECENT SCANS */}
      {/* ======================================================== */}
      {activeView === 'RecentScans' && (
        <>
          <SafeAreaView style={styles.subTopSafeArea} edges={['top']}>
            <View style={styles.subHeaderNav}>
              <TouchableOpacity
                style={styles.backArrowBtn}
                activeOpacity={0.7}
                onPress={() => setActiveView('Home')}
              >
                <Text style={styles.backArrowGlyph}>←</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.subHeaderTitleBlock}>
              <Text style={styles.subPageTitle}>Recent Scans</Text>
              <Text style={styles.subPageSubtitle}>View all the products you've scanned.</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by product name or brand..."
                placeholderTextColor="#94A3B8"
                value={recentSearch}
                onChangeText={setRecentSearch}
              />
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
              {(['All', 'Verified', 'Counterfeit', 'Alerts'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, recentFilter === filter && styles.filterChipActive]}
                  onPress={() => setRecentFilter(filter)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, recentFilter === filter && styles.filterChipTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.subScrollContent} showsVerticalScrollIndicator={false}>
            {/* Group: Today */}
            {filteredRecentScans.some((i) => i.dateGroup === 'Today') && (
              <View style={styles.dateGroupContainer}>
                <Text style={styles.dateGroupTitle}>Today</Text>
                {filteredRecentScans
                  .filter((i) => i.dateGroup === 'Today')
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.subListItemCard}
                      activeOpacity={0.85}
                      onPress={() => navigateToResult(item.scenario, item.code)}
                    >
                      <View style={styles.subListThumbWrapper}>
                        <Image source={item.image} style={styles.subListThumb} resizeMode="contain" />
                      </View>
                      <View style={styles.subListMeta}>
                        <Text style={styles.subListTitle}>{item.name}</Text>
                        <Text style={styles.subListTime}>{item.time}</Text>
                      </View>
                      <View
                        style={[
                          styles.subListStatusPill,
                          item.status === 'VERIFIED' && styles.statusVerified,
                          item.status === 'COUNTERFEIT' && styles.statusCounterfeit,
                          item.status === 'WRONG_REGION' && styles.statusWarning,
                        ]}
                      >
                        <Text style={styles.statusPillIcon}>
                          {item.status === 'VERIFIED' ? '✓' : '!'}
                        </Text>
                        <Text
                          style={[
                            styles.statusPillText,
                            item.status === 'VERIFIED' && styles.textVerified,
                            item.status === 'COUNTERFEIT' && styles.textCounterfeit,
                            item.status === 'WRONG_REGION' && styles.textWarning,
                          ]}
                        >
                          {item.statusText}
                        </Text>
                      </View>
                      <Text style={styles.subListChevron}>›</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Group: Yesterday */}
            {filteredRecentScans.some((i) => i.dateGroup === 'Yesterday') && (
              <View style={styles.dateGroupContainer}>
                <Text style={styles.dateGroupTitle}>Yesterday</Text>
                {filteredRecentScans
                  .filter((i) => i.dateGroup === 'Yesterday')
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.subListItemCard}
                      activeOpacity={0.85}
                      onPress={() => navigateToResult(item.scenario, item.code)}
                    >
                      <View style={styles.subListThumbWrapper}>
                        <Image source={item.image} style={styles.subListThumb} resizeMode="contain" />
                      </View>
                      <View style={styles.subListMeta}>
                        <Text style={styles.subListTitle}>{item.name}</Text>
                        <Text style={styles.subListTime}>{item.time}</Text>
                      </View>
                      <View
                        style={[
                          styles.subListStatusPill,
                          item.status === 'VERIFIED' && styles.statusVerified,
                          item.status === 'COUNTERFEIT' && styles.statusCounterfeit,
                          item.status === 'WRONG_REGION' && styles.statusWarning,
                        ]}
                      >
                        <Text style={styles.statusPillIcon}>
                          {item.status === 'VERIFIED' ? '✓' : '!'}
                        </Text>
                        <Text
                          style={[
                            styles.statusPillText,
                            item.status === 'VERIFIED' && styles.textVerified,
                            item.status === 'COUNTERFEIT' && styles.textCounterfeit,
                            item.status === 'WRONG_REGION' && styles.textWarning,
                          ]}
                        >
                          {item.statusText}
                        </Text>
                      </View>
                      <Text style={styles.subListChevron}>›</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* ======================================================== */}
      {/* 3. SCREEN 2: VERIFIED PRODUCTS */}
      {/* ======================================================== */}
      {activeView === 'VerifiedProducts' && (
        <>
          <SafeAreaView style={styles.subTopSafeArea} edges={['top']}>
            <View style={styles.subHeaderNav}>
              <TouchableOpacity
                style={styles.backArrowBtn}
                activeOpacity={0.7}
                onPress={() => setActiveView('Home')}
              >
                <Text style={styles.backArrowGlyph}>←</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.subHeaderTitleBlock}>
              <Text style={styles.subPageTitle}>Verified Products</Text>
              <Text style={styles.subPageSubtitle}>Products that match official manufacturer records.</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search verified products..."
                placeholderTextColor="#94A3B8"
                value={verifiedSearch}
                onChangeText={setVerifiedSearch}
              />
            </View>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
              {(['All', 'Medicine', 'Skincare', 'Personal Care', 'Food'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, verifiedFilter === cat && styles.filterChipActive]}
                  onPress={() => setVerifiedFilter(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, verifiedFilter === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.subScrollContent} showsVerticalScrollIndicator={false}>
            {filteredVerifiedProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.subListItemCard}
                activeOpacity={0.85}
                onPress={() => navigateToResult('AUTHENTIC', item.code)}
              >
                <View style={styles.subListThumbWrapper}>
                  <Image source={item.image} style={styles.subListThumb} resizeMode="contain" />
                </View>
                <View style={styles.subListMeta}>
                  <Text style={styles.subListTitle}>{item.name}</Text>
                  <View style={[styles.subListStatusPillInline, styles.statusVerified]}>
                    <Text style={styles.statusPillIcon}>✓</Text>
                    <Text style={[styles.statusPillText, styles.textVerified]}>Verified</Text>
                  </View>
                  <Text style={styles.subListTimeUnder}>{item.time}</Text>
                </View>
                <Text style={styles.subListChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* ======================================================== */}
      {/* 4. SCREEN 3: ALERTS */}
      {/* ======================================================== */}
      {activeView === 'Alerts' && (
        <>
          <SafeAreaView style={styles.subTopSafeArea} edges={['top']}>
            <View style={styles.subHeaderNav}>
              <TouchableOpacity
                style={styles.backArrowBtn}
                activeOpacity={0.7}
                onPress={() => setActiveView('Home')}
              >
                <Text style={styles.backArrowGlyph}>←</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.subHeaderTitleBlock}>
              <Text style={styles.subPageTitle}>Alerts</Text>
              <Text style={styles.subPageSubtitle}>Important findings that need your attention.</Text>
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
              {(['All', 'Counterfeit', 'Reused', 'Wrong Region', 'Suspicious'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, alertFilter === filter && styles.filterChipActive]}
                  onPress={() => setAlertFilter(filter)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, alertFilter === filter && styles.filterChipTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.subScrollContent} showsVerticalScrollIndicator={false}>
            {filteredAlerts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.alertCardContainer}
                activeOpacity={0.85}
                onPress={() => navigateToResult(item.scenario, item.code)}
              >
                {/* Top Row: Thumbnail + Badge + Name & Status + Chevron */}
                <View style={styles.alertCardTopRow}>
                  <View style={styles.alertThumbBox}>
                    <Image source={item.image} style={styles.alertThumbImage} resizeMode="contain" />
                  </View>

                  {/* Circular Icon Tag */}
                  <View style={[styles.alertCircleBadge, { backgroundColor: item.badgeBg }]}>
                    <Text style={[styles.alertCircleBadgeText, { color: item.badgeTextColor }]}>
                      {item.badgeIcon}
                    </Text>
                  </View>

                  <View style={styles.alertMetaBox}>
                    <Text style={styles.alertProductName}>{item.name}</Text>
                    <View style={[styles.alertStatusPill, { backgroundColor: item.statusPillBg }]}>
                      <Text style={[styles.alertStatusPillText, { color: item.statusPillColor }]}>
                        {item.statusPillText}
                      </Text>
                    </View>
                    <Text style={styles.alertTimestamp}>{item.time}</Text>
                  </View>

                  <Text style={styles.subListChevron}>›</Text>
                </View>

                {/* Bottom Callout Text */}
                <Text style={styles.alertCalloutText}>{item.callout}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* ======================================================== */}
      {/* 5. USER PROFILE SCREEN */}
      {/* ======================================================== */}
      {activeView === 'Profile' && (
        <>
          <SafeAreaView style={styles.subTopSafeArea} edges={['top']}>
            <View style={styles.subHeaderCenteredNav}>
              <TouchableOpacity
                style={styles.subBackBtn}
                activeOpacity={0.7}
                onPress={() => setActiveView('Home')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.subCenterTitle}>Profile</Text>
              <View style={styles.subHeaderPlaceholder} />
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.profileScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Centered Avatar and User Header */}
            <View style={styles.profileHeaderBlock}>
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarTextLarge}>H</Text>
              </View>
              <Text style={styles.profileName}>Ings</Text>
              <Text style={styles.profileRole}>Account holder</Text>
            </View>

            {/* Menu Items List */}
            <View style={styles.profileMenuContainer}>
              {/* Item 1: Personal Information */}
              <TouchableOpacity
                style={styles.profileMenuItemCard}
                activeOpacity={0.75}
                onPress={() => router.push('/personal-info' as any)}
              >
                <View style={[styles.profileMenuIconBox, { backgroundColor: '#EAF7EE' }]}>
                  <Image
                    source={require('../../assets/icons/icon_profile_user.png')}
                    style={styles.profileMenuIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.profileMenuMeta}>
                  <Text style={styles.profileMenuTitle}>Personal Information</Text>
                  <Text style={styles.profileMenuSubtitle}>Name, email, phone number</Text>
                </View>
                <Text style={styles.profileMenuChevron}>›</Text>
              </TouchableOpacity>

              {/* Item 2: Notifications */}
              <TouchableOpacity
                style={styles.profileMenuItemCard}
                activeOpacity={0.75}
                onPress={() => {
                  setPreviousView('Profile');
                  setActiveView('Notifications');
                }}
              >
                <View style={[styles.profileMenuIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Image
                    source={require('../../assets/icons/icon_profile_bell.png')}
                    style={styles.profileMenuIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.profileMenuMeta}>
                  <Text style={styles.profileMenuTitle}>Notifications</Text>
                  <Text style={styles.profileMenuSubtitle}>Manage your alerts and updates</Text>
                </View>
                <Text style={styles.profileMenuChevron}>›</Text>
              </TouchableOpacity>

              {/* Item 3: Location & Region */}
              <TouchableOpacity
                style={styles.profileMenuItemCard}
                activeOpacity={0.75}
                onPress={() => router.push('/location-region' as any)}
              >
                <View style={[styles.profileMenuIconBox, { backgroundColor: '#EAF7EE' }]}>
                  <Image
                    source={require('../../assets/icons/icon_profile_location.png')}
                    style={styles.profileMenuIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.profileMenuMeta}>
                  <Text style={styles.profileMenuTitle}>Location & Region</Text>
                  <Text style={styles.profileMenuSubtitle}>Your current location and region</Text>
                </View>
                <Text style={styles.profileMenuChevron}>›</Text>
              </TouchableOpacity>

              {/* Item 4: Privacy & Security */}
              <TouchableOpacity
                style={styles.profileMenuItemCard}
                activeOpacity={0.75}
                onPress={() => router.push('/privacy-security' as any)}
              >
                <View style={[styles.profileMenuIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Image
                    source={require('../../assets/icons/icon_profile_security.png')}
                    style={styles.profileMenuIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.profileMenuMeta}>
                  <Text style={styles.profileMenuTitle}>Privacy & Security</Text>
                  <Text style={styles.profileMenuSubtitle}>Data, security and permissions</Text>
                </View>
                <Text style={styles.profileMenuChevron}>›</Text>
              </TouchableOpacity>

              {/* Item 5: About Sensoo */}
              <TouchableOpacity
                style={styles.profileMenuItemCard}
                activeOpacity={0.75}
                onPress={() => router.push('/about-sensoo' as any)}
              >
                <View style={[styles.profileMenuIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Image
                    source={require('../../assets/icons/icon_profile_about.png')}
                    style={styles.profileMenuIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.profileMenuMeta}>
                  <Text style={styles.profileMenuTitle}>About Sensoo</Text>
                  <Text style={styles.profileMenuSubtitle}>Version, support and legal</Text>
                </View>
                <Text style={styles.profileMenuChevron}>›</Text>
              </TouchableOpacity>

              {/* Log out Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                activeOpacity={0.8}
                onPress={handleLogout}
              >
                <Image
                  source={require('../../assets/icons/icon_profile_logout.png')}
                  style={styles.logoutIcon}
                  resizeMode="contain"
                />
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      )}

      {/* ======================================================== */}
      {/* 6. NOTIFICATIONS SCREEN */}
      {/* ======================================================== */}
      {activeView === 'Notifications' && (
        <>
          <SafeAreaView style={styles.subTopSafeArea} edges={['top']}>
            <View style={styles.subHeaderCenteredNav}>
              <TouchableOpacity
                style={styles.subBackBtn}
                activeOpacity={0.7}
                onPress={() => setActiveView(previousView || 'Home')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.subCenterTitle}>Notifications</Text>
              <TouchableOpacity
                style={styles.markAllReadBtn}
                activeOpacity={0.7}
                onPress={handleMarkAllAsRead}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.markAllReadText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.notifFilterPillsRow}
            >
              {(['All', 'Verification', 'System', 'Updates'] as const).map((filter) => {
                const isActive = notificationFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.notifFilterChip,
                      isActive && styles.notifFilterChipActive,
                    ]}
                    onPress={() => setNotificationFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.notifFilterChipText,
                        isActive && styles.notifFilterChipTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.notifScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section: Today */}
            {filteredNotifications.some((n) => n.dateGroup === 'Today') && (
              <View style={styles.notifSectionGroup}>
                <Text style={styles.notifSectionTitle}>Today</Text>
                {filteredNotifications
                  .filter((n) => n.dateGroup === 'Today')
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.notifCard}
                      activeOpacity={0.85}
                      onPress={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
                        );
                        if (item.scenario && item.code) {
                          navigateToResult(item.scenario, item.code);
                        } else {
                          Alert.alert(item.title, item.description);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.notifIconCircle,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        {item.iconType === 'counterfeit' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_counterfeit.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'repeat' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_repeat.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'globe' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_globe.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'verified' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_verified.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'gear' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_gear.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                      </View>

                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifDescription}>{item.description}</Text>
                        <Text style={styles.notifTime}>{item.time}</Text>
                      </View>

                      {!item.isRead ? (
                        <View style={styles.notifUnreadDot} />
                      ) : (
                        <Text style={styles.notifChevron}>›</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Section: Yesterday */}
            {filteredNotifications.some((n) => n.dateGroup === 'Yesterday') && (
              <View style={styles.notifSectionGroup}>
                <Text style={styles.notifSectionTitle}>Yesterday</Text>
                {filteredNotifications
                  .filter((n) => n.dateGroup === 'Yesterday')
                  .map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.notifCard}
                      activeOpacity={0.85}
                      onPress={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
                        );
                        if (item.scenario && item.code) {
                          navigateToResult(item.scenario, item.code);
                        } else {
                          Alert.alert(item.title, item.description);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.notifIconCircle,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        {item.iconType === 'counterfeit' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_counterfeit.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'repeat' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_repeat.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'globe' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_globe.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'verified' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_verified.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                        {item.iconType === 'gear' && (
                          <Image
                            source={require('../../assets/icons/icon_notif_gear.png')}
                            style={styles.notifIconImg}
                            resizeMode="contain"
                          />
                        )}
                      </View>

                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifDescription}>{item.description}</Text>
                        <Text style={styles.notifTime}>{item.time}</Text>
                      </View>

                      {!item.isRead ? (
                        <View style={styles.notifUnreadDot} />
                      ) : (
                        <Text style={styles.notifChevron}>›</Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* ======================================================== */}
      {/* MODALS: Personal Info, Privacy, About */}
      {/* ======================================================== */}
      <Modal
        visible={showPersonalInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPersonalInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <TouchableOpacity
                onPress={() => setShowPersonalInfoModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Full Name</Text>
                <Text style={styles.modalInfoValue}>Ings</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Account Status</Text>
                <Text style={styles.modalInfoValue}>Account holder (Verified)</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Email</Text>
                <Text style={styles.modalInfoValue}>ings@sensoo.app</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Phone Number</Text>
                <Text style={styles.modalInfoValue}>+234 802 345 6789</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Registered Region</Text>
                <Text style={styles.modalInfoValue}>Lagos, Nigeria</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={() => setShowPersonalInfoModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Privacy & Security</Text>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalParagraph}>
                • <Text style={{ fontWeight: '700' }}>On-Device Encryption:</Text> Every scanned barcode is hashed and verified using local cryptographic keys.
              </Text>
              <Text style={styles.modalParagraph}>
                • <Text style={{ fontWeight: '700' }}>Geofence Privacy:</Text> GPS coordinates are solely checked for haversine velocity anomalies and regional distribution safety.
              </Text>
              <Text style={styles.modalParagraph}>
                • <Text style={{ fontWeight: '700' }}>Zero Personal Tracking:</Text> No personal identifying data is transmitted across manufacturer verification clusters.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>About Sensoo</Text>
              <TouchableOpacity
                onPress={() => setShowAboutModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalParagraph}>
                <Text style={{ fontWeight: '700', color: '#059669' }}>Sensoo v1.2.0</Text>
              </Text>
              <Text style={styles.modalParagraph}>
                "Trusted products. Healthier people. Know what you buy. Help stop fake products and keep your community safe."
              </Text>
              <Text style={styles.modalParagraph}>
                Integrated with MSFlib cluster verification engine and real-time counterfeit anomaly detection.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* PERMANENT BOTTOM NAVIGATION BAR */}
      {/* ======================================================== */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <View style={styles.bottomNav}>
          {/* Home */}
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => setActiveView('Home')}
          >
            <Image
              source={require('../../assets/icons/nav_home.png')}
              style={[
                styles.navIconImage,
                activeView === 'Home' && styles.navIconImageActive,
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.navLabel, activeView === 'Home' && styles.navLabelActive]}>Home</Text>
            <View style={[styles.navActiveDot, activeView !== 'Home' && styles.navDotHidden]} />
          </TouchableOpacity>

          {/* History / Recent Scans */}
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => setActiveView('RecentScans')}
          >
            <Image
              source={require('../../assets/icons/nav_history.png')}
              style={[
                styles.navIconImage,
                (activeView === 'RecentScans' || activeView === 'VerifiedProducts') &&
                  styles.navIconImageActive,
              ]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.navLabel,
                (activeView === 'RecentScans' || activeView === 'VerifiedProducts') &&
                  styles.navLabelActive,
              ]}
            >
              History
            </Text>
            <View
              style={[
                styles.navActiveDot,
                activeView !== 'RecentScans' && activeView !== 'VerifiedProducts' && styles.navDotHidden,
              ]}
            />
          </TouchableOpacity>

          {/* Reports / Alerts */}
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => setActiveView('Alerts')}
          >
            <Image
              source={require('../../assets/icons/nav_reports.png')}
              style={[
                styles.navIconImage,
                activeView === 'Alerts' && styles.navIconImageActive,
              ]}
              resizeMode="contain"
            />
            <Text style={[styles.navLabel, activeView === 'Alerts' && styles.navLabelActive]}>Reports</Text>
            <View style={[styles.navActiveDot, activeView !== 'Alerts' && styles.navDotHidden]} />
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => setActiveView('Profile')}
          >
            <Image
              source={require('../../assets/icons/nav_profile.png')}
              style={[
                styles.navIconImage,
                (activeView === 'Profile' || activeView === 'Notifications') &&
                  styles.navIconImageActive,
              ]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.navLabel,
                (activeView === 'Profile' || activeView === 'Notifications') &&
                  styles.navLabelActive,
              ]}
            >
              Profile
            </Text>
            <View
              style={[
                styles.navActiveDot,
                activeView !== 'Profile' && activeView !== 'Notifications' && styles.navDotHidden,
              ]}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Top Header on Home */
  topSafeArea: {
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 12,
  },
  logo: {
    width: 124,
    height: 38,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIconImage: {
    width: 22,
    height: 22,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A341E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Sub-Page Top Header */
  subTopSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  subHeaderNav: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backArrowBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backArrowGlyph: {
    fontSize: 26,
    color: '#0F172A',
    fontWeight: '600',
  },
  subHeaderTitleBlock: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subPageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subPageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 19,
  },

  /* Search Bar */
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },

  /* Filter Pills */
  filterPillsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#064E3B',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Scroll Content */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  subScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },

  /* Dashboard Greeting */
  greetingSection: {
    marginTop: 8,
    marginBottom: 18,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  greetingBlack: {
    color: '#0B2215',
  },
  greetingGreen: {
    color: '#10B981',
  },
  greetingSubtitle: {
    fontSize: 14.5,
    color: '#65796E',
    marginTop: 4,
  },

  /* Hero Scan Banner */
  heroBannerCard: {
    width: '100%',
    aspectRatio: 780 / 320,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
  },

  /* 3 Shortcuts Row */
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 26,
    gap: 8,
  },
  shortcutCard: {
    flex: 1,
    height: 124,
    borderRadius: 18,
    padding: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  shortcutBadgeImage: {
    width: 32,
    height: 32,
  },
  shortcutTextWrapper: {
    minHeight: 44,
    justifyContent: 'flex-start',
    marginTop: 2,
  },
  shortcutTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B2215',
    lineHeight: 16,
  },
  shortcutSubtitle: {
    fontSize: 10,
    color: '#65796E',
    marginTop: 1,
  },
  shortcutChevron: {
    alignSelf: 'flex-end',
  },
  shortcutChevronArrow: {
    fontSize: 14,
    color: '#0B2215',
    fontWeight: '700',
  },

  /* Section Header */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0B2215',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },

  /* Scan Card (Home Preview) */
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECE8',
    marginBottom: 12,
  },
  thumbWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumbImage: {
    width: 44,
    height: 44,
  },
  scanMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2215',
    marginBottom: 3,
  },
  scanTimestamp: {
    fontSize: 12.5,
    color: '#7C8E84',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
  },
  statusPillIcon: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusVerified: {
    backgroundColor: '#DCFCE7',
  },
  textVerified: {
    color: '#15803D',
  },
  statusCounterfeit: {
    backgroundColor: '#FEE2E2',
  },
  textCounterfeit: {
    color: '#DC2626',
  },
  statusWarning: {
    backgroundColor: '#FEF3C7',
  },
  textWarning: {
    color: '#D97706',
  },

  /* Sub-List Common Card (Recent Scans & Verified Products) */
  dateGroupContainer: {
    marginBottom: 20,
  },
  dateGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  subListItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  subListThumbWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subListThumb: {
    width: 42,
    height: 42,
  },
  subListMeta: {
    flex: 1,
  },
  subListTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 3,
  },
  subListTime: {
    fontSize: 12,
    color: '#64748B',
  },
  subListTimeUnder: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
  },
  subListStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 4,
    marginRight: 6,
  },
  subListStatusPillInline: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
    marginTop: 2,
  },
  subListChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 4,
  },

  /* Alerts Card */
  alertCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  alertCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  alertThumbBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertThumbImage: {
    width: 44,
    height: 44,
  },
  alertCircleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertCircleBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  alertMetaBox: {
    flex: 1,
  },
  alertProductName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
  },
  alertStatusPill: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 3,
  },
  alertStatusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  alertTimestamp: {
    fontSize: 11.5,
    color: '#64748B',
  },
  alertCalloutText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },

  /* Profile View */
  profileContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileHeaderBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DDF4E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatarTextLarge: {
    color: '#0F5132',
    fontSize: 36,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  profileMenuContainer: {
    width: '100%',
  },
  profileMenuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  profileMenuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuIcon: {
    width: 22,
    height: 22,
  },
  profileMenuMeta: {
    flex: 1,
    marginLeft: 14,
  },
  profileMenuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  profileMenuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  profileMenuChevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    height: 52,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutIcon: {
    width: 18,
    height: 18,
    tintColor: '#DC2626',
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },

  /* Sub Header Nav with Back Chevron & Title */
  subHeaderCenteredNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  subBackBtn: {
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
  subCenterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subHeaderPlaceholder: {
    width: 36,
  },
  markAllReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  /* Notifications Screen Styles */
  notifFilterPillsRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  notifFilterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  notifFilterChipActive: {
    backgroundColor: '#064E3B',
  },
  notifFilterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  notifFilterChipTextActive: {
    color: '#FFFFFF',
  },
  notifScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  notifSectionGroup: {
    marginBottom: 20,
  },
  notifSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  notifIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconImg: {
    width: 22,
    height: 22,
  },
  notifContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  notifDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginLeft: 6,
  },
  notifChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 6,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContentCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalInfoLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalParagraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalConfirmBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Bottom Navigation */
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDF2EE',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 10 : 6,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 54,
  },
  navIconImage: {
    width: 22,
    height: 22,
    marginBottom: 3,
    tintColor: '#8A9C91',
  },
  navIconImageActive: {
    tintColor: '#059669',
  },
  navLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8A9C91',
  },
  navLabelActive: {
    color: '#059669',
    fontWeight: '700',
  },
  navActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#059669',
    marginTop: 3,
  },
  navDotHidden: {
    opacity: 0,
  },
});
