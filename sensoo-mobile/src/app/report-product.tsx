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
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REPORT_REASONS = [
  'Suspected counterfeit',
  'Packaging looks different or tampered',
  'Barcode or QR code unreadable/mismatched',
  'Expired or altered expiry date',
  'Adverse physical reaction / poor quality',
  'Other',
];

export default function ReportProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    code?: string;
    image?: string;
  }>();

  const productName = params.name || 'Dove Body Wash\nDeep Moisture 250ml';
  const scannedCode = params.code || '8999990012345';

  const [selectedReason, setSelectedReason] = useState<string>('Suspected counterfeit');
  const [showReasonDropdown, setShowReasonDropdown] = useState<boolean>(false);
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [photosCount, setPhotosCount] = useState<number>(0);

  const handleSubmit = () => {
    router.replace({
      pathname: '/report-submitted',
      params: {
        name: productName,
        code: scannedCode,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Header */}
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
          <Text style={styles.headerTitle}>Report a Product</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          Help us make the marketplace safer.{'\n'}Tell us what's wrong with this product.
        </Text>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Scanned Product Card */}
          <View style={styles.productBannerCard}>
            <View style={styles.productThumbWrapper}>
              <Image
                source={
                  productName.includes('Panadol')
                    ? require('../../assets/panadol_extra.png')
                    : require('../../assets/dove_body_wash.png')
                }
                style={styles.productThumb}
                resizeMode="contain"
              />
            </View>
            <View style={styles.productMeta}>
              <Text style={styles.productName}>{productName}</Text>
              <Text style={styles.productScannedDate}>
                Scanned on Aug 20, 2025, 10:42 AM
              </Text>
            </View>
          </View>

          {/* Reason for Report Dropdown */}
          <Text style={styles.inputSectionTitle}>Reason for report</Text>
          <TouchableOpacity
            style={styles.dropdownSelector}
            activeOpacity={0.8}
            onPress={() => setShowReasonDropdown(true)}
          >
            <Text style={styles.dropdownSelectedText}>{selectedReason}</Text>
            <Text style={styles.dropdownChevron}>⌄</Text>
          </TouchableOpacity>

          {/* Describe the Issue */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.inputSectionTitle}>Describe the issue (optional)</Text>
          </View>
          <View style={styles.textareaWrapper}>
            <TextInput
              style={styles.textareaInput}
              multiline
              placeholder="Tell us more about what looks wrong..."
              placeholderTextColor="#94A3B8"
              maxLength={500}
              value={issueDescription}
              onChangeText={setIssueDescription}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{issueDescription.length}/500</Text>
          </View>

          {/* Add Photos (Optional) */}
          <Text style={styles.inputSectionTitle}>Add photos (optional)</Text>
          <View style={styles.photoSlotsRow}>
            {/* Slot 1: Camera */}
            <TouchableOpacity
              style={[styles.photoSlot, photosCount >= 1 && styles.photoSlotFilled]}
              activeOpacity={0.7}
              onPress={() => setPhotosCount((p) => Math.min(p + 1, 3))}
            >
              <Text style={styles.photoSlotIcon}>📷</Text>
              <Text style={styles.photoSlotLabel}>
                {photosCount >= 1 ? 'Added' : 'Add photo'}
              </Text>
            </TouchableOpacity>

            {/* Slot 2: Gallery */}
            <TouchableOpacity
              style={[styles.photoSlot, photosCount >= 2 && styles.photoSlotFilled]}
              activeOpacity={0.7}
              onPress={() => setPhotosCount((p) => Math.min(p + 1, 3))}
            >
              <Text style={styles.photoSlotIcon}>🖼️</Text>
              <Text style={styles.photoSlotLabel}>
                {photosCount >= 2 ? 'Added' : 'Add photo'}
              </Text>
            </TouchableOpacity>

            {/* Slot 3: Gallery */}
            <TouchableOpacity
              style={[styles.photoSlot, photosCount >= 3 && styles.photoSlotFilled]}
              activeOpacity={0.7}
              onPress={() => setPhotosCount((p) => Math.min(p + 1, 3))}
            >
              <Text style={styles.photoSlotIcon}>🖼️</Text>
              <Text style={styles.photoSlotLabel}>
                {photosCount >= 3 ? 'Added' : 'Add photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Button */}
        <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.88}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Reason Selection Modal */}
      <Modal
        visible={showReasonDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReasonDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowReasonDropdown(false)}
        >
          <View style={styles.modalContentCard}>
            <Text style={styles.modalTitle}>Select Reason</Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOptionItem,
                  selectedReason === reason && styles.reasonOptionActive,
                ]}
                onPress={() => {
                  setSelectedReason(reason);
                  setShowReasonDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.reasonOptionText,
                    selectedReason === reason && styles.reasonOptionTextActive,
                  ]}
                >
                  {reason}
                </Text>
                {selectedReason === reason && (
                  <Text style={styles.reasonCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 34,
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: 36,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 30 : 20,
  },
  productBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 20,
  },
  productThumbWrapper: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productThumb: {
    width: 44,
    height: 44,
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 4,
  },
  productScannedDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  inputSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  dropdownChevron: {
    fontSize: 18,
    color: '#64748B',
    marginTop: -4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textareaWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  textareaInput: {
    height: 100,
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  photoSlotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  photoSlot: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  photoSlotIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  photoSlotLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomSafeArea: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#0D382B',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#0D382B',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'android' ? 36 : 28,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  reasonOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reasonOptionActive: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  reasonOptionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  reasonOptionTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  reasonCheckmark: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '900',
  },
});
