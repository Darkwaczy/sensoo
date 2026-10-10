import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  getVoiceAssistantSettings,
  subscribeVoiceAssistantSettings,
  VoiceAssistantSettings,
} from '../services/voiceAssistantService';
import { getCurrentUserLocation } from '../services/clinicService';

export default function ProfileScreen() {
  const router = useRouter();

  const [voiceSettings, setVoiceSettings] = useState<VoiceAssistantSettings>(getVoiceAssistantSettings());
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [userCity, setUserCity] = useState('Current Location');

  useEffect(() => {
    getCurrentUserLocation().then((loc) => {
      if (loc.city && loc.city !== 'Current Location') {
        setUserCity(loc.city);
      }
    });
  }, []);

  useEffect(() => {
    const unsub = subscribeVoiceAssistantSettings((s) => setVoiceSettings(s));
    return unsub;
  }, []);

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
          <Text style={styles.centerTitle}>Profile</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Header */}
        <View style={styles.profileHeaderBlock}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>H</Text>
          </View>
          <Text style={styles.profileName}>Ings</Text>
          <Text style={styles.profileRole}>Account holder</Text>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuContainer}>
          {/* 1. Personal Information */}
          <TouchableOpacity
            style={styles.menuItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/personal-info' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EAF7EE' }]}>
              <Image
                source={require('../../assets/icons/icon_profile_user.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.menuMeta}>
              <Text style={styles.menuTitle}>Personal Information</Text>
              <Text style={styles.menuSubtitle}>Name, email, phone number</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* 2. Notifications */}
          <TouchableOpacity
            style={styles.menuItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/notifications' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Image
                source={require('../../assets/icons/icon_profile_bell.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.menuMeta}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSubtitle}>Manage your alerts and updates</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* 3. Location & Region */}
          <TouchableOpacity
            style={styles.menuItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/location-region' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EAF7EE' }]}>
              <Image
                source={require('../../assets/icons/icon_profile_location.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.menuMeta}>
              <Text style={styles.menuTitle}>Location & Region</Text>
              <Text style={styles.menuSubtitle}>Your current location and region</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* 4. Privacy & Security */}
          <TouchableOpacity
            style={styles.menuItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/privacy-security' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Image
                source={require('../../assets/icons/icon_profile_security.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.menuMeta}>
              <Text style={styles.menuTitle}>Privacy & Security</Text>
              <Text style={styles.menuSubtitle}>Data, security and permissions</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* 5. Voice Assistant ("Hey Sensoo") */}
          <TouchableOpacity
            style={styles.menuItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/voice-assistant' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Text style={{ fontSize: 18 }}>🎙️</Text>
            </View>
            <View style={styles.menuMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.menuTitle}>Voice Assistant</Text>
                <View
                  style={{
                    backgroundColor: voiceSettings.enabled ? '#ECFDF5' : '#F1F5F9',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: voiceSettings.enabled ? '#A7F3D0' : '#E2E8F0',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: voiceSettings.enabled ? '#059669' : '#64748B',
                    }}
                  >
                    {voiceSettings.enabled ? 'Ready 🟢' : 'Off'}
                  </Text>
                </View>
              </View>
              <Text style={styles.menuSubtitle}>"Hey Sensoo" hands-free & voiceprint</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          {/* 6. About Sensoo */}
          <TouchableOpacity
            style={styles.menuItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/about-sensoo' as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Image
                source={require('../../assets/icons/icon_profile_about.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.menuMeta}>
              <Text style={styles.menuTitle}>About Sensoo</Text>
              <Text style={styles.menuSubtitle}>Version, support and legal</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
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

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
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

      {/* Modals */}
      <Modal
        visible={showPersonalInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPersonalInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setShowPersonalInfoModal(false)}>
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
                <Text style={styles.modalInfoValue}>{userCity}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
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
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Privacy & Security</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
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
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>About Sensoo</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
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
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalConfirmBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  profileHeaderBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DDF4E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTextLarge: {
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
  menuContainer: {
    width: '100%',
  },
  menuItemCard: {
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
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 22,
    height: 22,
  },
  menuMeta: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  menuChevron: {
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

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
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
});
