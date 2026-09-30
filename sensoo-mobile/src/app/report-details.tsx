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

export default function ReportDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    status?: string;
    date?: string;
  }>();

  const productName = params.name || 'Dove Body Wash\nDeep Moisture 250ml';
  const reportStatus = params.status || 'Under Review';
  const reportedDate = params.date || 'Aug 20, 2025, 10:42 AM';

  const isUnderReview = reportStatus === 'Under Review';
  const isActionTaken = reportStatus === 'Action Taken';
  const isClosed = reportStatus === 'Closed';

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
          <Text style={styles.headerTitle}>Report Details</Text>
          
          {/* Quick Status / Edit Trigger */}
          <TouchableOpacity
            style={styles.editHeaderBtn}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/report-edit',
                params: { name: productName, status: reportStatus },
              })
            }
          >
            <Text style={styles.editHeaderText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productThumbBox}>
            <Image
              source={
                productName.includes('Panadol')
                  ? require('../../assets/panadol_extra.png')
                  : productName.includes('Dettol')
                  ? require('../../assets/dettol_antiseptic.png')
                  : require('../../assets/dove_body_wash.png')
              }
              style={styles.productThumb}
              resizeMode="contain"
            />
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productTitle}>{productName}</Text>
            <View style={styles.statusPillRow}>
              <View
                style={[
                  styles.statusPill,
                  isUnderReview && styles.statusPillUnderReview,
                  isActionTaken && styles.statusPillActionTaken,
                  isClosed && styles.statusPillClosed,
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    isUnderReview && styles.statusTextUnderReview,
                    isActionTaken && styles.statusTextActionTaken,
                    isClosed && styles.statusTextClosed,
                  ]}
                >
                  {reportStatus}
                </Text>
              </View>
            </View>
            <Text style={styles.reportedDateText}>Reported on {reportedDate}</Text>
          </View>
        </View>

        {/* Report Information Card */}
        <View style={styles.infoSectionCard}>
          <Text style={styles.sectionHeaderTitle}>Report Information</Text>

          {/* Reason */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>📄</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Reason for report</Text>
              <Text style={styles.infoValue}>Suspected counterfeit</Text>
            </View>
          </View>

          {/* Issue Details */}
          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>🔍</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Issue details</Text>
              <Text style={styles.infoValue}>
                Packaging looks different from the original and the barcode doesn't match.
              </Text>
            </View>
          </View>

          {/* Photos Submitted */}
          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Text style={styles.infoIconSymbol}>📷</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Photos submitted</Text>
              <View style={styles.photosThumbRow}>
                <View style={styles.photoThumbWrapper}>
                  <Image
                    source={require('../../assets/dove_body_wash.png')}
                    style={styles.photoThumbImg}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.photoThumbWrapper}>
                  <Image
                    source={require('../../assets/barcode_icon.png')}
                    style={styles.photoThumbImg}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.photoThumbWrapper}>
                  <Image
                    source={require('../../assets/dove_body_wash.png')}
                    style={styles.photoThumbImg}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Status Vertical Timeline */}
        <View style={styles.timelineSectionCard}>
          <Text style={styles.sectionHeaderTitle}>Status</Text>

          {/* Step 1: Report Submitted (Done) */}
          <View style={styles.timelineStep}>
            <View style={styles.stepIndicatorColumn}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Text style={styles.stepDotCheck}>✓</Text>
              </View>
              <View style={[styles.stepLine, styles.stepLineDone]} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Report submitted</Text>
              <Text style={styles.stepSubtitle}>{reportedDate}</Text>
            </View>
          </View>

          {/* Step 2: Under Review (Active) */}
          <View style={styles.timelineStep}>
            <View style={styles.stepIndicatorColumn}>
              <View style={[styles.stepDot, styles.stepDotActive]}>
                <View style={styles.stepDotInnerSolid} />
              </View>
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Under review</Text>
              <Text style={styles.stepSubtitle}>Our team is reviewing your report.</Text>
            </View>
          </View>

          {/* Step 3: Review Complete */}
          <View style={styles.timelineStep}>
            <View style={styles.stepIndicatorColumn}>
              <View style={styles.stepDot} />
              <View style={styles.stepLine} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, styles.stepTitlePending]}>
                Review complete
              </Text>
            </View>
          </View>

          {/* Step 4: Action Taken */}
          <View style={styles.timelineStep}>
            <View style={styles.stepIndicatorColumn}>
              <View style={styles.stepDot} />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, styles.stepTitlePending]}>
                Action taken
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Action Test Buttons (For Judges & Demo) */}
        <View style={styles.quickNavDemoRow}>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => router.push('/report-status')}
          >
            <Text style={styles.demoPillText}>Status Sheet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => router.push('/report-review-complete')}
          >
            <Text style={styles.demoPillText}>Outcome: Flagged</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => router.push('/report-closed')}
          >
            <Text style={styles.demoPillText}>Outcome: Closed</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Report Option */}
        <TouchableOpacity
          style={styles.deleteOptionButton}
          activeOpacity={0.7}
          onPress={() => router.push('/report-delete')}
        >
          <Text style={styles.deleteOptionText}>Delete Report</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
    height: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 32,
    color: '#1E293B',
    lineHeight: 34,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  editHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  editHeaderText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0D382B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 36 : 28,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    marginBottom: 16,
  },
  productThumbBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productThumb: {
    width: 48,
    height: 48,
  },
  productMeta: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 4,
  },
  statusPillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillUnderReview: {
    backgroundColor: '#FEE2E2',
  },
  statusPillActionTaken: {
    backgroundColor: '#DBEAFE',
  },
  statusPillClosed: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusTextUnderReview: {
    color: '#DC2626',
  },
  statusTextActionTaken: {
    color: '#2563EB',
  },
  statusTextClosed: {
    color: '#64748B',
  },
  reportedDateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  infoSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoIconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIconSymbol: {
    fontSize: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 19,
  },
  photosThumbRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  photoThumbWrapper: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  photoThumbImg: {
    width: '100%',
    height: '100%',
  },
  timelineSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepIndicatorColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 14,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    borderColor: '#059669',
    backgroundColor: '#059669',
  },
  stepDotCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  stepDotActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  stepDotInnerSolid: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  stepLineDone: {
    backgroundColor: '#059669',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepTitlePending: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quickNavDemoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  demoPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  demoPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0D382B',
  },
  deleteOptionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  deleteOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
