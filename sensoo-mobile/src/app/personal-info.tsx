import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function PersonalInformationScreen() {
  const router = useRouter();

  // Profile data state
  const [fullName, setFullName] = useState('Ings');
  const [email, setEmail] = useState('ings@example.com');
  const [phone, setPhone] = useState('+234 801 234 5678');

  // Edit sub-modal states
  const [activeModal, setActiveModal] = useState<
    'NONE' | 'NAME' | 'EMAIL' | 'PHONE' | 'PASSWORD'
  >('NONE');

  // Temporary edit states
  const [tempName, setTempName] = useState('Ings');
  const [tempEmail, setTempEmail] = useState('ings@example.com');
  const [tempPhone, setTempPhone] = useState('+234 801 234 5678');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleOpenEditName = () => {
    setTempName(fullName);
    setActiveModal('NAME');
  };

  const handleOpenEditEmail = () => {
    setTempEmail(email);
    setActiveModal('EMAIL');
  };

  const handleOpenEditPhone = () => {
    setTempPhone(phone);
    setActiveModal('PHONE');
  };

  const handleSaveName = () => {
    setFullName(tempName.trim() || 'Ings');
    setActiveModal('NONE');
  };

  const handleSaveEmail = () => {
    setEmail(tempEmail.trim() || 'ings@example.com');
    setActiveModal('NONE');
  };

  const handleSavePhone = () => {
    setPhone(tempPhone.trim() || '+234 801 234 5678');
    setActiveModal('NONE');
  };

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveModal('NONE');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your Sensoo account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => router.replace('/get-started' as any),
        },
      ]
    );
  };

  const handleSaveChanges = () => {
    Alert.alert('Success', 'Personal information saved successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

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
          <Text style={styles.centerTitle}>Personal Information</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar with Camera Badge */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>H</Text>
            </View>
            <TouchableOpacity
              style={styles.cameraBadgeBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Change Photo', 'Upload photo feature is enabled.')}
            >
              <Image
                source={require('../../assets/icons/icon_camera_badge.png')}
                style={styles.cameraBadgeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.fieldsSection}>
          {/* Field: Full Name */}
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TouchableOpacity
            style={styles.fieldBox}
            activeOpacity={0.7}
            onPress={handleOpenEditName}
          >
            <Text style={styles.fieldValueText}>{fullName}</Text>
          </TouchableOpacity>

          {/* Field: Email Address */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <TouchableOpacity
            style={styles.fieldBox}
            activeOpacity={0.7}
            onPress={handleOpenEditEmail}
          >
            <Text style={styles.fieldValueText}>{email}</Text>
          </TouchableOpacity>

          {/* Field: Phone Number */}
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TouchableOpacity
            style={styles.phoneFieldBox}
            activeOpacity={0.7}
            onPress={handleOpenEditPhone}
          >
            <View style={styles.flagBlock}>
              <Image
                source={require('../../assets/icons/flag_ng.png')}
                style={styles.flagIcon}
                resizeMode="contain"
              />
              <Text style={styles.chevronDownText}>⌄</Text>
            </View>
            <Text style={styles.phoneValueText}>{phone}</Text>
          </TouchableOpacity>

          {/* Action: Change Password */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.75}
            onPress={() => setActiveModal('PASSWORD')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Image
                source={require('../../assets/icons/icon_lock_purple.png')}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.actionTitle}>Change Password</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          {/* Action: Delete Account */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.75}
            onPress={handleDeleteAccount}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Image
                source={require('../../assets/icons/icon_trash_red.png')}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.deleteTitle}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.saveChangesBtn}
          activeOpacity={0.85}
          onPress={handleSaveChanges}
        >
          <Text style={styles.saveChangesText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================= */}
      {/* 1. EDIT NAME MODAL */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'NAME'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal('NONE')}
      >
        <SafeAreaView style={styles.subModalContainer} edges={['top', 'bottom']}>
          <View style={styles.subModalHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setActiveModal('NONE')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backChevronText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.centerTitle}>Edit Name</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.subModalBody}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.subModalInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your full name"
              autoFocus
            />
            <Text style={styles.helperNote}>
              This is the name associated with your account.
            </Text>
          </View>

          <View style={styles.subModalBottom}>
            <TouchableOpacity
              style={styles.saveChangesBtn}
              activeOpacity={0.85}
              onPress={handleSaveName}
            >
              <Text style={styles.saveChangesText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================================= */}
      {/* 2. EDIT EMAIL MODAL */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'EMAIL'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal('NONE')}
      >
        <SafeAreaView style={styles.subModalContainer} edges={['top', 'bottom']}>
          <View style={styles.subModalHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setActiveModal('NONE')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backChevronText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.centerTitle}>Edit Email</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.subModalBody}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.subModalInput}
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <Text style={styles.helperNote}>
              We'll send important updates to this email.
            </Text>
          </View>

          <View style={styles.subModalBottom}>
            <TouchableOpacity
              style={styles.saveChangesBtn}
              activeOpacity={0.85}
              onPress={handleSaveEmail}
            >
              <Text style={styles.saveChangesText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================================= */}
      {/* 3. EDIT PHONE NUMBER MODAL */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'PHONE'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal('NONE')}
      >
        <SafeAreaView style={styles.subModalContainer} edges={['top', 'bottom']}>
          <View style={styles.subModalHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setActiveModal('NONE')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backChevronText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.centerTitle}>Edit Phone Number</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.subModalBody}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.flagBlock}>
                <Image
                  source={require('../../assets/icons/flag_ng.png')}
                  style={styles.flagIcon}
                  resizeMode="contain"
                />
                <Text style={styles.chevronDownText}>⌄</Text>
              </View>
              <TextInput
                style={styles.phoneTextInput}
                value={tempPhone}
                onChangeText={setTempPhone}
                placeholder="+234 801 234 5678"
                keyboardType="phone-pad"
                autoFocus
              />
            </View>
            <Text style={styles.helperNote}>
              We may use this number to send important account notifications.
            </Text>
          </View>

          <View style={styles.subModalBottom}>
            <TouchableOpacity
              style={styles.saveChangesBtn}
              activeOpacity={0.85}
              onPress={handleSavePhone}
            >
              <Text style={styles.saveChangesText}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================================= */}
      {/* 4. CHANGE PASSWORD MODAL */}
      {/* ========================================================= */}
      <Modal
        visible={activeModal === 'PASSWORD'}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal('NONE')}
      >
        <SafeAreaView style={styles.subModalContainer} edges={['top', 'bottom']}>
          <View style={styles.subModalHeader}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setActiveModal('NONE')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.backChevronText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.centerTitle}>Change Password</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.subModalBody} showsVerticalScrollIndicator={false}>
            {/* Current Password */}
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={styles.passInputRow}>
              <TextInput
                style={styles.passInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry={!showCurrentPass}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPass(!showCurrentPass)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIconText}>{showCurrentPass ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.passInputRow}>
              <TextInput
                style={styles.passInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry={!showNewPass}
              />
              <TouchableOpacity
                onPress={() => setShowNewPass(!showNewPass)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIconText}>{showNewPass ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm New Password */}
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={styles.passInputRow}>
              <TextInput
                style={styles.passInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPass}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeIconText}>{showConfirmPass ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helperNote}>
              Your password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
            </Text>
          </ScrollView>

          <View style={styles.subModalBottom}>
            <TouchableOpacity
              style={styles.saveChangesBtn}
              activeOpacity={0.85}
              onPress={handleUpdatePassword}
            >
              <Text style={styles.saveChangesText}>Update Password</Text>
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

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DDF4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#0F5132',
    fontSize: 36,
    fontWeight: '700',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraBadgeIcon: {
    width: 14,
    height: 14,
  },

  /* Form Fields */
  fieldsSection: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  fieldBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  fieldValueText: {
    fontSize: 14.5,
    color: '#111827',
    fontWeight: '500',
  },
  phoneFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  flagBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  flagIcon: {
    width: 22,
    height: 16,
    borderRadius: 2,
  },
  chevronDownText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  phoneValueText: {
    fontSize: 14.5,
    color: '#111827',
    fontWeight: '500',
  },

  /* Action Cards */
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  actionTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
  },
  actionChevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  deleteTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#DC2626',
  },

  /* Save Changes Bottom Button */
  saveChangesBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveChangesText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Sub Modals */
  subModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  subModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subModalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subModalInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
  },
  helperNote: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  subModalBottom: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 8,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 10,
  },
  passInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  passInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 6,
  },
  eyeIconText: {
    fontSize: 16,
    color: '#64748B',
  },
});
