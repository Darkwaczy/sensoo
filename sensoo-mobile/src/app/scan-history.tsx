import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCurrentUserLocation } from '../services/clinicService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ScanHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    name?: string;
    imageUrl?: string;
  }>();

  const [currentCity, setCurrentCity] = useState('Current Location');

  useEffect(() => {
    getCurrentUserLocation().then((loc) => {
      if (loc.city && loc.city !== 'Current Location') {
        setCurrentCity(loc.city);
      }
    });
  }, []);

  const productName = params.name || (params.code ? `Product (${params.code})` : 'Scanned Product');
  const barcode = params.code || 'UNLISTED';
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const timelineData = [
    {
      id: 't1',
      time: `Today, ${now}`,
      location: currentCity,
      status: 'Scanned',
    },
    {
      id: 't2',
      time: 'Earlier today',
      location: 'Port Harcourt, Nigeria',
      status: 'Scanned',
    },
    {
      id: 't3',
      time: 'Yesterday',
      location: 'Kano, Nigeria',
      status: 'Scanned',
    },
    {
      id: 't4',
      time: '3 days ago',
      location: 'Abuja, Nigeria',
      status: 'Scanned',
    },
    {
      id: 't5',
      time: 'Last week',
      location: 'Enugu, Nigeria',
      status: 'Scanned',
    },
  ];

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
          <Text style={styles.headerTitle}>Scan History</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productThumbWrapper}>
            <Image
              source={
                params.imageUrl
                  ? { uri: params.imageUrl }
                  : require('../../assets/barcode_icon.png')
              }
              style={styles.productThumb}
              resizeMode="contain"
            />
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productBarcode}>Barcode: {barcode}</Text>
            <View style={styles.scansBadge}>
              <Text style={styles.scansBadgeIcon}>✓</Text>
              <Text style={styles.scansBadgeText}>Multiple scans detected</Text>
            </View>
          </View>
        </View>

        {/* Scan Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineHeading}>Scan Timeline</Text>
          <Text style={styles.timelineSubheading}>
            This barcode has been scanned multiple times.
          </Text>

          <View style={styles.timelineList}>
            {timelineData.map((item, index) => {
              const isLast = index === timelineData.length - 1;
              return (
                <View key={item.id} style={styles.timelineRow}>
                  {/* Left Column: Dot & Connecting Line */}
                  <View style={styles.indicatorCol}>
                    <View style={styles.greenDot} />
                    {!isLast && <View style={styles.verticalLine} />}
                  </View>

                  {/* Middle Column: Time & Location */}
                  <View style={styles.infoCol}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <View style={styles.locRow}>
                      <Text style={styles.locPinIcon}>📍</Text>
                      <Text style={styles.locText}>{item.location}</Text>
                    </View>
                  </View>

                  {/* Right Column: Status Tag */}
                  <View style={styles.scannedPill}>
                    <Text style={styles.scannedPillText}>{item.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Info Callout Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <Text style={styles.infoCardText}>
            Multiple scans can indicate that this product may be reused, cloned or resold. Always buy from trusted sellers.
          </Text>
        </View>
      </ScrollView>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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

  /* Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },

  /* Product Card */
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productThumbWrapper: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  productThumb: {
    width: 60,
    height: 60,
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  scansBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  scansBadgeIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  scansBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  /* Scan Timeline */
  timelineSection: {
    marginBottom: 24,
  },
  timelineHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  timelineSubheading: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 18,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    minHeight: 52,
  },
  indicatorCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginTop: 5,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: -8,
  },
  infoCol: {
    flex: 1,
  },
  timeText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locPinIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  scannedPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'center',
  },
  scannedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  /* Info Card */
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 16,
  },
  infoIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
  },
});
