import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface NotificationItem {
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

const INITIAL_DATA: NotificationItem[] = [
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
    code: 'SNS-CLONE-ALERT',
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
    description: 'Registered product matches official manufacturer records.',
    time: '7:32 PM',
    dateGroup: 'Yesterday',
    iconType: 'verified',
    iconBg: '#059669',
    isRead: true,
    scenario: 'AUTHENTIC',
    code: 'VERIFIED-RECORD',
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

export default function NotificationsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'All' | 'Verification' | 'System' | 'Updates'>('All');
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_DATA);

  const handleMarkAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true;
    return item.category === filter;
  });

  const handleNotificationPress = (item: NotificationItem) => {
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    if (item.scenario && item.code) {
      router.push({
        pathname: '/result',
        params: { scenario: item.scenario, code: item.code },
      });
    } else {
      Alert.alert(item.title, item.description);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Header Bar */}
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
          <Text style={styles.centerTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.markAllReadBtn}
            activeOpacity={0.7}
            onPress={handleMarkAllAsRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {(['All', 'Verification', 'System', 'Updates'] as const).map((cat) => {
            const isActive = filter === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Group */}
        {filteredItems.some((n) => n.dateGroup === 'Today') && (
          <View style={styles.sectionGroup}>
            <Text style={styles.sectionTitle}>Today</Text>
            {filteredItems
              .filter((n) => n.dateGroup === 'Today')
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.notifCard}
                  activeOpacity={0.85}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                    {item.iconType === 'counterfeit' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_counterfeit.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'repeat' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_repeat.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'globe' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_globe.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'verified' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_verified.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'gear' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_gear.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  <View style={styles.contentCol}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifDescription}>{item.description}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>

                  {!item.isRead ? (
                    <View style={styles.unreadDot} />
                  ) : (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Yesterday Group */}
        {filteredItems.some((n) => n.dateGroup === 'Yesterday') && (
          <View style={styles.sectionGroup}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            {filteredItems
              .filter((n) => n.dateGroup === 'Yesterday')
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.notifCard}
                  activeOpacity={0.85}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                    {item.iconType === 'counterfeit' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_counterfeit.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'repeat' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_repeat.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'globe' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_globe.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'verified' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_verified.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                    {item.iconType === 'gear' && (
                      <Image
                        source={require('../../assets/icons/icon_notif_gear.png')}
                        style={styles.iconImg}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  <View style={styles.contentCol}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifDescription}>{item.description}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>

                  {!item.isRead ? (
                    <View style={styles.unreadDot} />
                  ) : (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav Bar */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.push('/home' as any)}
          >
            <Image
              source={require('../../assets/icons/nav_home.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/home', params: { view: 'RecentScans' } } as any)}
          >
            <Image
              source={require('../../assets/icons/nav_history.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
            <Text style={styles.navLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/home', params: { view: 'Alerts' } } as any)}
          >
            <Image
              source={require('../../assets/icons/nav_reports.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
            <Text style={styles.navLabel}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.push('/profile' as any)}
          >
            <Image
              source={require('../../assets/icons/nav_profile.png')}
              style={[styles.navIconImage, styles.navIconImageActive]}
              resizeMode="contain"
            />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
            <View style={styles.navActiveDot} />
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
  markAllReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  filterPillsRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
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
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionGroup: {
    marginBottom: 20,
  },
  sectionTitle: {
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
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: {
    width: 22,
    height: 22,
  },
  contentCol: {
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginLeft: 6,
  },
  chevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 6,
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
    height: 60,
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
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
});
