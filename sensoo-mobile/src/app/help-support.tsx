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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const TOPICS = [
    {
      id: 't1',
      title: 'How to scan a product',
      icon: require('../../assets/barcode_icon.png'),
      iconBg: '#EAF7EE',
      content:
        'Point your camera at the barcode or QR code on the packaging. Ensure the code is clear, well-lit, and aligned inside the camera guide box.',
    },
    {
      id: 't2',
      title: 'Understanding your results',
      icon: require('../../assets/icons/icon_doc_purple.png'),
      iconBg: '#EFF6FF',
      content:
        'Verified means genuine manufacturer records match. Counterfeit warns of invalid codes. Reused flags cloned packaging. Wrong Region alerts you to unauthorized diverted batches.',
    },
    {
      id: 't3',
      title: 'Product not found',
      icon: require('../../assets/icons/icon_profile_about.png'),
      iconBg: '#FEF3C7',
      content:
        'If a product is not registered in our manufacturer database, avoid consumption and file a quick report through the Report Product screen.',
    },
    {
      id: 't4',
      title: 'Location and region alerts',
      icon: require('../../assets/icons/icon_notif_globe.png'),
      iconBg: '#F3E8FF',
      content:
        'Sensoo checks that the product batch was officially allocated for distribution in your Nigerian state or territory.',
    },
    {
      id: 't5',
      title: 'Reporting a suspicious product',
      icon: require('../../assets/icons/icon_notif_counterfeit.png'),
      iconBg: '#FEE2E2',
      content:
        'Tapping Report Product immediately logs fraudulent packaging to health authorities and flags the barcode for other consumers.',
    },
    {
      id: 't6',
      title: 'Account and settings',
      icon: require('../../assets/icons/icon_notif_gear.png'),
      iconBg: '#EAF7EE',
      content:
        'Manage your profile, change regional preferences, and configure notification alerts inside your Profile settings.',
    },
  ];

  const filteredTopics = TOPICS.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.centerTitle}>Help & Support</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for help..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Popular Topics */}
        <Text style={styles.sectionHeading}>Popular Topics</Text>
        <View style={styles.topicsList}>
          {filteredTopics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              activeOpacity={0.75}
              onPress={() => Alert.alert(topic.title, topic.content)}
            >
              <View style={[styles.topicIconBox, { backgroundColor: topic.iconBg }]}>
                <Image source={topic.icon} style={styles.topicIconImg} resizeMode="contain" />
              </View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Still Need Help Section */}
        <Text style={[styles.sectionHeading, { marginTop: 14 }]}>Still need help?</Text>
        <Text style={styles.helpSubtitle}>
          You can contact our support team or check our FAQs.
        </Text>

        {/* Contact Support Button */}
        <TouchableOpacity
          style={styles.contactSupportBtn}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              'Contact Support',
              'Email us at support@sensoo.app or call toll-free at +234 800-SENSOO (736766).'
            )
          }
        >
          <Text style={styles.contactSupportBtnText}>💬  Contact Support</Text>
        </TouchableOpacity>

        {/* View FAQs */}
        <TouchableOpacity
          style={styles.linkCard}
          activeOpacity={0.75}
          onPress={() =>
            Alert.alert('FAQs', 'Frequently asked questions: Verification works offline and updates when reconnected.')
          }
        >
          <Text style={styles.linkIconText}>📋</Text>
          <Text style={styles.linkCardTitle}>View FAQs</Text>
          <Text style={styles.extIcon}>↗</Text>
        </TouchableOpacity>

        {/* Help Center Online */}
        <TouchableOpacity
          style={styles.linkCard}
          activeOpacity={0.75}
          onPress={() =>
            Alert.alert('Help Center', 'Visit our online knowledge base at https://help.sensoo.app')
          }
        >
          <Text style={styles.linkIconText}>🌐</Text>
          <Text style={styles.linkCardTitle}>Help Center (Online)</Text>
          <Text style={styles.extIcon}>↗</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchIconText: {
    fontSize: 15,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#111827',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  topicsList: {
    marginBottom: 16,
  },
  topicCard: {
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
  topicIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  topicIconImg: {
    width: 20,
    height: 20,
  },
  topicTitle: {
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
  helpSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  contactSupportBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  contactSupportBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  linkIconText: {
    fontSize: 16,
    marginRight: 12,
  },
  linkCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  extIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
