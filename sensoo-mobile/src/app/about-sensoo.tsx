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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AboutSensooScreen() {
  const router = useRouter();

  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    title: string;
    content: string;
  }>({
    visible: false,
    title: '',
    content: '',
  });

  const handleOpenDetail = (title: string, content: string) => {
    setDetailModal({ visible: true, title, content });
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
          <Text style={styles.centerTitle}>About Sensoo</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          {/* Official Sensoo logo (not the placeholder swirl) */}
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandSubtitle}>Know What You Buy</Text>
          <Text style={styles.brandVersion}>Version 1.2.0</Text>
        </View>

        {/* Mission Statement */}
        <Text style={styles.missionText}>
          Sensoo helps you verify the authenticity of products by checking against trusted manufacturer records. Scan. Verify. Buy with confidence.
        </Text>

        {/* Action List Items */}
        <View style={styles.listContainer}>
          {/* 1. How Sensoo Works */}
          <TouchableOpacity
            style={styles.listItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/how-it-works' as any)}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../assets/icons/icon_profile_about.png')}
                style={styles.iconImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemTitle}>How Sensoo Works</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 2. Help & Support */}
          <TouchableOpacity
            style={styles.listItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/help-support' as any)}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../assets/icons/icon_help_circle.png')}
                style={styles.iconImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemTitle}>Help & Support</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 3. Send Feedback */}
          <TouchableOpacity
            style={styles.listItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/send-feedback' as any)}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../assets/icons/icon_feedback.png')}
                style={styles.iconImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemTitle}>Send Feedback</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 4. Terms of Service */}
          <TouchableOpacity
            style={styles.listItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/terms-of-service' as any)}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../assets/icons/icon_doc_purple.png')}
                style={[styles.iconImg, { tintColor: '#64748B' }]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemTitle}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 5. Privacy Policy */}
          <TouchableOpacity
            style={styles.listItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/privacy-policy' as any)}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../assets/icons/icon_shield_blue.png')}
                style={[styles.iconImg, { tintColor: '#64748B' }]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemTitle}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          {/* 6. Acknowledgements */}
          <TouchableOpacity
            style={styles.listItemCard}
            activeOpacity={0.75}
            onPress={() => router.push('/acknowledgements' as any)}
          >
            <View style={styles.iconCircle}>
              <Image
                source={require('../../assets/icons/icon_people_outline.png')}
                style={styles.iconImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.itemTitle}>Acknowledgements</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Banner Card */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerText}>
            A safer marketplace starts with informed choices.
          </Text>
          <Image
            source={require('../../assets/icons/banner_leaves.png')}
            style={styles.bannerLeavesImg}
            resizeMode="contain"
          />
        </View>

        {/* Footer */}
        <Text style={styles.copyrightText}>© 2025 Sensoo. All rights reserved.</Text>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModal({ visible: false, title: '', content: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{detailModal.title}</Text>
              <TouchableOpacity
                onPress={() => setDetailModal({ visible: false, title: '', content: '' })}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalParagraph}>{detailModal.content}</Text>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => setDetailModal({ visible: false, title: '', content: '' })}
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
    paddingTop: 20,
    paddingBottom: 36,
    alignItems: 'center',
  },

  /* Brand Header */
  brandHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 150,
    height: 48,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  brandVersion: {
    fontSize: 12,
    color: '#94A3B8',
  },

  /* Mission Text */
  missionText: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },

  /* List */
  listContainer: {
    width: '100%',
    marginBottom: 28,
  },
  listItemCard: {
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
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconImg: {
    width: 20,
    height: 20,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  /* Footer */
  copyrightText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
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
  bannerCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    lineHeight: 18,
    marginRight: 10,
  },
  bannerLeavesImg: {
    width: 60,
    height: 50,
  },
});
