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
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REPORT_REASONS = [
  'Counterfeit product',
  'Suspicious packaging',
  'Wrong or missing information',
  'Expired product',
  'Other',
];

export default function ReportProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    code?: string;
    image?: string;
  }>();

  const [selectedReason, setSelectedReason] = useState<string>('Counterfeit product');
  const [note, setNote] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = () => {
    setSubmitted(true);
    Alert.alert(
      'Report Submitted',
      'Thank you for reporting. Your telemetry and product details have been securely logged to the Sensoo Anti-Counterfeit Registry and forwarded to regulatory authorities (NAFDAC).',
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Report Product</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          Help us identify and stop counterfeit{'\n'}and suspicious products.
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
          {/* Product Banner Card */}
          <View style={styles.productBannerCard}>
            <View style={styles.productThumbWrapper}>
              <Image
                source={require('../../assets/dove_body_wash.png')}
                style={styles.productThumb}
                resizeMode="contain"
              />
            </View>
            <View style={styles.productMeta}>
              <Text style={styles.productName}>Dove Body Wash{'\n'}Deep Moisture 250ml</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillIcon}>!</Text>
                <Text style={styles.statusPillText}>Counterfeit Detected</Text>
              </View>
            </View>
            <Text style={styles.bannerCalloutText}>
              This product does not match trusted manufacturer records. It may be fake or altered.
            </Text>
          </View>

          {/* Reasons Radio Selector Card */}
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Why are you reporting this product?</Text>
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={styles.radioRow}
                  activeOpacity={0.8}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                  <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note Input Section */}
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Add a note (optional)</Text>
            <View style={styles.noteInputWrapper}>
              <TextInput
                style={styles.noteInput}
                multiline
                placeholder="Share any additional details, e.g. where you bought it, price, or packaging issues..."
                placeholderTextColor="#94A3B8"
                maxLength={300}
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{note.length}/300</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Button */}
        <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Report</Text>
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

  /* Header */
  topSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 20,
  },

  /* Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  /* Product Banner Card */
  productBannerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 16,
    marginBottom: 20,
  },
  productThumbWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  productThumb: {
    width: 50,
    height: 50,
  },
  productMeta: {
    marginLeft: 74,
    minHeight: 60,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 4,
  },
  statusPillIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DC2626',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  bannerCalloutText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#FED7D7',
    paddingTop: 10,
  },

  /* Reasons Radio Card */
  reasonsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 20,
  },
  reasonsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#064E3B',
  },
  radioInnerDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#064E3B',
  },
  radioLabel: {
    fontSize: 14.5,
    color: '#475569',
    fontWeight: '500',
  },
  radioLabelSelected: {
    color: '#0F172A',
    fontWeight: '600',
  },

  /* Note Section */
  noteSection: {
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  noteInputWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    minHeight: 110,
  },
  noteInput: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    minHeight: 70,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },

  /* Bottom Submit Button */
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
  },
  submitButton: {
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
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
