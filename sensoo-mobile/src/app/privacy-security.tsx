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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function PrivacySecurityScreen() {
  const router = useRouter();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({
    visible: false,
    title: '',
    content: '',
  });

  const handleToggle2FA = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    Alert.alert(
      'Two-Factor Authentication',
      newState
        ? 'Two-Factor Authentication has been enabled. A verification code will be requested on new logins.'
        : 'Two-Factor Authentication has been disabled.'
    );
  };

  const handleUpdatePassword = () => {
    if (!currentPass) {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }
    if (newPass.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Password updated successfully!');
    setShowPasswordModal(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
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
          <Text style={styles.centerTitle}>Privacy & Security</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Account Security */}
        <Text style={styles.sectionHeading}>Account Security</Text>

        {/* Change Password */}
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.75}
          onPress={() => setShowPasswordModal(true)}
        >
          <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
            <Image
              source={require('../../assets/icons/icon_lock_purple.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.itemTitle}>Change Password</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Two-Factor Authentication */}
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.75}
          onPress={handleToggle2FA}
        >
          <View style={[styles.iconBox, { backgroundColor: '#EAF7EE' }]}>
            <Image
              source={require('../../assets/icons/icon_shield_green.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.itemTitle}>Two-Factor Authentication</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{twoFactorEnabled ? 'On' : 'Off'}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Section: Data & Permissions */}
        <Text style={[styles.sectionHeading, { marginTop: 14 }]}>Data & Permissions</Text>

        {/* Data Usage */}
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.75}
          onPress={() =>
            setInfoModal({
              visible: true,
              title: 'Data Usage',
              content:
                'Sensoo uses high-precision barcode telemetry (timestamp, latitude, longitude, and region identifier) solely to verify manufacturer supply chains and detect counterfeit clones in real time. We do not sell your personal data.',
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
            <Image
              source={require('../../assets/icons/icon_db_slate.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.itemMeta}>
            <Text style={styles.itemTitle}>Data Usage</Text>
            <Text style={styles.itemSubtitle}>How we use your data</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* App Permissions */}
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.75}
          onPress={() =>
            setInfoModal({
              visible: true,
              title: 'App Permissions',
              content:
                '• Camera: Required to scan barcodes and QR codes on packaging.\n• Location: Used for regional authenticity checks and impossible-travel detection.\n• Notifications: Informs you of counterfeit flags or verified batch updates.',
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: '#EAF7EE' }]}>
            <Image
              source={require('../../assets/icons/icon_lock_green.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.itemMeta}>
            <Text style={styles.itemTitle}>App Permissions</Text>
            <Text style={styles.itemSubtitle}>Camera, location and more</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.75}
          onPress={() =>
            setInfoModal({
              visible: true,
              title: 'Privacy Policy',
              content:
                'Sensoo is committed to consumer privacy. All product verification telemetry is encrypted at rest and in transit. No health or biometric information is collected.',
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Image
              source={require('../../assets/icons/icon_shield_blue.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.itemMeta}>
            <Text style={styles.itemTitle}>Privacy Policy</Text>
            <Text style={styles.itemSubtitle}>Read our privacy policy</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Terms of Service */}
        <TouchableOpacity
          style={styles.itemCard}
          activeOpacity={0.75}
          onPress={() =>
            setInfoModal({
              visible: true,
              title: 'Terms of Service',
              content:
                'By using Sensoo, you agree to submit genuine product scan telemetry to safeguard community health against counterfeit and adulterated goods.',
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
            <Image
              source={require('../../assets/icons/icon_doc_purple.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.itemMeta}>
            <Text style={styles.itemTitle}>Terms of Service</Text>
            <Text style={styles.itemSubtitle}>Read our terms of service</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Callout Card at Bottom */}
        <View style={styles.calloutCard}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMarkText}>✓</Text>
          </View>
          <Text style={styles.calloutText}>
            Your data is secure. We only use your information to provide product verification and improve your experience.
          </Text>
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={infoModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal({ visible: false, title: '', content: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{infoModal.title}</Text>
              <TouchableOpacity
                onPress={() => setInfoModal({ visible: false, title: '', content: '' })}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalParagraph}>{infoModal.content}</Text>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => setInfoModal({ visible: false, title: '', content: '' })}
            >
              <Text style={styles.modalConfirmBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView style={styles.modalSheetContainer} edges={['top', 'bottom']}>
          <View style={styles.modalSheetHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.backChevronText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.centerTitle}>Change Password</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.modalSheetBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.passInput}
              value={currentPass}
              onChangeText={setCurrentPass}
              placeholder="Enter current password"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.passInput}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Enter new password"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.passInput}
              value={confirmPass}
              onChangeText={setConfirmPass}
              placeholder="Confirm new password"
              secureTextEntry
            />

            <Text style={styles.helperText}>
              Your password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
            </Text>
          </ScrollView>

          <View style={styles.modalSheetBottom}>
            <TouchableOpacity
              style={styles.updatePassBtn}
              activeOpacity={0.85}
              onPress={handleUpdatePassword}
            >
              <Text style={styles.updatePassBtnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
    paddingBottom: 36,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconImg: {
    width: 22,
    height: 22,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemMeta: {
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Callout Card */
  calloutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 14,
    marginTop: 16,
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkMarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  calloutText: {
    flex: 1,
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
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
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  modalParagraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
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

  /* Sheet Modal */
  modalSheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalSheetBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  passInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  modalSheetBottom: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  updatePassBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatePassBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
