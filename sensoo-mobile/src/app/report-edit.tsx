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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    status?: string;
  }>();

  const productName = params.name || 'Reported Product';
  const [selectedReason, setSelectedReason] = useState('Suspected counterfeit');
  const [description, setDescription] = useState(
    "Packaging looks different from the original and the barcode doesn't match."
  );

  const handleSaveChanges = () => {
    router.replace({
      pathname: '/report-updated',
      params: { name: productName },
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
          <Text style={styles.headerTitle}>Edit Report</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Header Card */}
          <View style={styles.productBannerCard}>
            <View style={styles.productThumbWrapper}>
              <Image
                source={require('../../assets/barcode_icon.png')}
                style={styles.productThumb}
                resizeMode="contain"
              />
            </View>
            <View style={styles.productMeta}>
              <Text style={styles.productName}>{productName}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Under Review</Text>
              </View>
              <Text style={styles.reportedDateText}>
                Reported recently
              </Text>
            </View>
          </View>

          {/* Reason for Report */}
          <Text style={styles.inputLabel}>Reason for report</Text>
          <View style={styles.dropdownBox}>
            <Text style={styles.dropdownValueText}>{selectedReason}</Text>
            <Text style={styles.dropdownChevron}>⌄</Text>
          </View>

          {/* Describe the Issue */}
          <Text style={styles.inputLabel}>Describe the issue</Text>
          <View style={styles.textareaWrapper}>
            <TextInput
              style={styles.textareaInput}
              multiline
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Photos */}
          <Text style={styles.inputLabel}>Photos</Text>
          <View style={styles.photosRow}>
            <View style={styles.photoThumbWrapper}>
              <Image
                source={require('../../assets/barcode_icon.png')}
                style={styles.photoImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.photoThumbWrapper}>
              <Image
                source={require('../../assets/barcode_icon.png')}
                style={styles.photoImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.photoThumbWrapper}>
              <Image
                source={require('../../assets/barcode_icon.png')}
                style={styles.photoImg}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.addPhotoSlot} activeOpacity={0.7}>
              <Text style={styles.addPhotoIcon}>🖼️</Text>
              <Text style={styles.addPhotoLabel}>Add photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Save Changes Button */}
        <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.88}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 30 : 20,
  },
  productBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  reportedDateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  dropdownBox: {
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
  dropdownValueText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  dropdownChevron: {
    fontSize: 18,
    color: '#64748B',
    marginTop: -4,
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
  photosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  photoThumbWrapper: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  addPhotoSlot: {
    width: 62,
    height: 62,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  addPhotoLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomSafeArea: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
