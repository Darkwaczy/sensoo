import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type SentinelScreen =
  | 'dashboard'
  | 'clusters_list'
  | 'cluster_detail'
  | 'cluster_timeline'
  | 'dossier';

interface ThreatCluster {
  id: string;
  name: string;
  region: string;
  priority: 'High' | 'Medium' | 'Low';
  scansCount: number;
  timeWindow: string;
  cloneIdentities: number;
  locationsCount: number;
  productName: string;
  coordinates: { x: number; y: number };
}

const THREAT_CLUSTERS: ThreatCluster[] = [
  {
    id: 'c1',
    name: 'Idumota Market, Lagos',
    region: 'Lagos',
    priority: 'High',
    scansCount: 17,
    timeWindow: '48 hours',
    cloneIdentities: 3,
    locationsCount: 5,
    productName: 'Paracetamol 500mg',
    coordinates: { x: 55, y: 70 },
  },
  {
    id: 'c2',
    name: 'Ariaria Market, Aba',
    region: 'Aba',
    priority: 'Medium',
    scansCount: 9,
    timeWindow: '3 days',
    cloneIdentities: 2,
    locationsCount: 3,
    productName: 'Cough Syrup 100ml',
    coordinates: { x: 68, y: 78 },
  },
  {
    id: 'c3',
    name: 'Onitsha Main Market',
    region: 'Anambra',
    priority: 'Medium',
    scansCount: 6,
    timeWindow: '4 days',
    cloneIdentities: 2,
    locationsCount: 2,
    productName: 'Amoxicillin 500mg',
    coordinates: { x: 62, y: 74 },
  },
  {
    id: 'c4',
    name: 'Wuse Market, Abuja',
    region: 'Abuja',
    priority: 'Low',
    scansCount: 4,
    timeWindow: '5 days',
    cloneIdentities: 1,
    locationsCount: 2,
    productName: 'Vitamin C 1000mg',
    coordinates: { x: 60, y: 48 },
  },
];

const TIMELINE_EVENTS = [
  {
    time: '10:42 AM',
    location: 'Shop A, Idumota, Lagos',
    title: 'Same product scanned',
    anomaly: null,
  },
  {
    time: '11:15 AM',
    location: 'Shop B, Idumota',
    title: 'Same identity scanned',
    anomaly: 'Duplicate Barcode Scan in close proximity',
  },
  {
    time: '02:03 PM',
    location: 'Shop C, Balogun, Lagos',
    title: 'Same identity scanned',
    anomaly: null,
  },
  {
    time: '07:26 PM',
    location: 'Alaba International, Lagos',
    title: 'Same identity scanned',
    anomaly: 'Impossible Geo-Velocity Anomaly (>140 km/h in city traffic)',
  },
  {
    time: '09:14 AM',
    dateLabel: 'Next Day',
    location: 'Ariaria Market, Aba',
    title: 'Same identity scanned',
    anomaly: 'Concurrently Circulating Counterfeit Clone Detected (600 km gap)',
  },
];

export default function SentinelScreenComponent() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<SentinelScreen>('dashboard');
  const [selectedCluster, setSelectedCluster] = useState<ThreatCluster>(THREAT_CLUSTERS[0]);
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<'Last 7 days' | 'Last 24 hours' | 'Last 30 days'>('Last 7 days');
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);

  const filteredClusters = THREAT_CLUSTERS.filter((c) => {
    if (filterRegion === 'All') return true;
    if (filterRegion === 'High Priority') return c.priority === 'High';
    return c.region.toLowerCase().includes(filterRegion.toLowerCase()) || c.name.toLowerCase().includes(filterRegion.toLowerCase());
  });

  const handleExportPdf = () => {
    Alert.alert(
      'Export Dossier (PDF)',
      'NAFDAC Intelligence Dossier Case #SN-2048 has been generated as a verifiable compliance PDF.',
      [
        { text: 'View Preview', onPress: () => Alert.alert('Preview', 'Displaying cryptographic regulatory signature & hash for Case #SN-2048') },
        { text: 'Share PDF', onPress: () => handleShareDossier() },
      ]
    );
  };

  const handleShareDossier = async () => {
    try {
      await Share.share({
        message: 'NAFDAC Sentinel Counterfeit Intelligence Dossier [Case #SN-2048]: 17 suspicious counterfeit scans detected across Idumota Market, Lagos. Suspected clone ring active.',
        title: 'NAFDAC Intelligence Dossier #SN-2048',
      });
    } catch {
      // Ignored
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" translucent />

      {/* ======================================================== */}
      {/* 1. SENTINEL DASHBOARD SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'dashboard' && (
        <View style={{ flex: 1 }}>
          {/* Top Green Regulatory Header */}
          <SafeAreaView style={styles.dashboardHeaderSafeArea} edges={['top']}>
            <View style={styles.dashboardHeaderRow}>
              <View style={styles.dashboardBrandCol}>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.shieldIconEmoji}>🛡️</Text>
                  <Text style={styles.brandTitleText}>NAFDAC SENTINEL</Text>
                </View>
                <Text style={styles.brandSubtitleText}>Counterfeit Intelligence for Safer Markets</Text>
              </View>

              {/* Time Range Filter Pill */}
              <TouchableOpacity
                style={styles.timeFilterPill}
                activeOpacity={0.8}
                onPress={() => setShowTimeFilterModal(true)}
              >
                <Text style={styles.timeFilterPillText}>{timeFilter}</Text>
                <Text style={styles.timeFilterPillCaret}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Switch to Consumer Mode */}
            <View style={styles.modeSwitchRow}>
              <View style={styles.livePulseDotContainer}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveStatusText}>LIVE CLUSTER TELEMETRY</Text>
              </View>
              <TouchableOpacity
                style={styles.returnToConsumerBtn}
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <Text style={styles.returnToConsumerText}>Exit Sentinel ✕</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.dashboardScrollView}
            contentContainerStyle={styles.dashboardScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 4 Live Metric KPI Cards (2x2 Grid) */}
            <View style={styles.kpiGrid}>
              {/* Metric 1 */}
              <View style={[styles.kpiCard, { borderTopColor: '#EF4444' }]}>
                <Text style={[styles.kpiNumber, { color: '#DC2626' }]}>3</Text>
                <Text style={styles.kpiLabel}>Active Threat Clusters</Text>
              </View>

              {/* Metric 2 */}
              <View style={[styles.kpiCard, { borderTopColor: '#F59E0B' }]}>
                <Text style={[styles.kpiNumber, { color: '#D97706' }]}>17</Text>
                <Text style={styles.kpiLabel}>Suspicious Scans</Text>
              </View>

              {/* Metric 3 */}
              <View style={[styles.kpiCard, { borderTopColor: '#06B6D4' }]}>
                <Text style={[styles.kpiNumber, { color: '#0891B2' }]}>4</Text>
                <Text style={styles.kpiLabel}>Suspected Clone Identities</Text>
              </View>

              {/* Metric 4 */}
              <View style={[styles.kpiCard, { borderTopColor: '#10B981' }]}>
                <Text style={[styles.kpiNumber, { color: '#059669' }]}>2</Text>
                <Text style={styles.kpiLabel}>High-Priority Regions</Text>
              </View>
            </View>

            {/* Interactive Threat Map Visualizer */}
            <View style={styles.mapContainerCard}>
              <View style={styles.mapCardHeaderRow}>
                <Text style={styles.mapCardTitle}>National Incident Distribution</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCurrentScreen('clusters_list')}
                >
                  <Text style={styles.mapCardViewAllLink}>View All Clusters ›</Text>
                </TouchableOpacity>
              </View>

              {/* Styled Vector Map View */}
              <View style={styles.darkMapCanvas}>
                {/* Background Grid Lines */}
                <View style={styles.mapGridLineH1} />
                <View style={styles.mapGridLineH2} />
                <View style={styles.mapGridLineV1} />
                <View style={styles.mapGridLineV2} />

                {/* Country Outline Representation */}
                <View style={styles.mapOutlineShape} />

                {/* Cluster 1: Lagos Hotspot */}
                <TouchableOpacity
                  style={[styles.mapHotspotMarker, { top: '65%', left: '26%' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedCluster(THREAT_CLUSTERS[0]);
                    setCurrentScreen('cluster_detail');
                  }}
                >
                  <View style={[styles.radarWaveOuter, { borderColor: '#EF4444' }]} />
                  <View style={[styles.radarWaveInner, { backgroundColor: '#EF4444' }]} />
                  <View style={styles.hotspotLabelBox}>
                    <Text style={styles.hotspotCityName}>Lagos</Text>
                    <Text style={styles.hotspotSubText}>2 clusters • 17 scans</Text>
                  </View>
                </TouchableOpacity>

                {/* Cluster 2: Abuja Hotspot */}
                <TouchableOpacity
                  style={[styles.mapHotspotMarker, { top: '38%', left: '52%' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedCluster(THREAT_CLUSTERS[3]);
                    setCurrentScreen('cluster_detail');
                  }}
                >
                  <View style={[styles.radarWaveOuter, { borderColor: '#F59E0B' }]} />
                  <View style={[styles.radarWaveInner, { backgroundColor: '#F59E0B' }]} />
                  <View style={styles.hotspotLabelBox}>
                    <Text style={styles.hotspotCityName}>Abuja</Text>
                    <Text style={styles.hotspotSubText}>1 cluster</Text>
                  </View>
                </TouchableOpacity>

                {/* Cluster 3: Ibadan Hotspot */}
                <TouchableOpacity
                  style={[styles.mapHotspotMarker, { top: '56%', left: '33%' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedCluster(THREAT_CLUSTERS[0]);
                    setCurrentScreen('cluster_detail');
                  }}
                >
                  <View style={[styles.radarWaveOuter, { borderColor: '#EF4444' }]} />
                  <View style={[styles.radarWaveInner, { backgroundColor: '#EF4444' }]} />
                  <View style={styles.hotspotLabelBox}>
                    <Text style={styles.hotspotCityName}>Ibadan</Text>
                    <Text style={styles.hotspotSubText}>1 cluster</Text>
                  </View>
                </TouchableOpacity>

                {/* Cluster 4: Port Harcourt */}
                <TouchableOpacity
                  style={[styles.mapHotspotMarker, { top: '78%', left: '56%' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedCluster(THREAT_CLUSTERS[1]);
                    setCurrentScreen('cluster_detail');
                  }}
                >
                  <View style={[styles.radarWaveOuter, { borderColor: '#F59E0B' }]} />
                  <View style={[styles.radarWaveInner, { backgroundColor: '#F59E0B' }]} />
                  <View style={styles.hotspotLabelBox}>
                    <Text style={styles.hotspotCityName}>Port Harcourt</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Map Footer Helper */}
              <View style={styles.mapFooterBar}>
                <Text style={styles.mapFooterText}>
                  🎯 Tap any radar marker to inspect street retail hotspot data.
                </Text>
              </View>
            </View>

            {/* Quick Action CTA */}
            <TouchableOpacity
              style={styles.openClustersBtn}
              activeOpacity={0.88}
              onPress={() => setCurrentScreen('clusters_list')}
            >
              <Text style={styles.openClustersBtnText}>Inspect Threat Clusters List →</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* 2. THREAT CLUSTER LIST SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'clusters_list' && (
        <View style={{ flex: 1 }}>
          <SafeAreaView style={styles.subScreenHeaderSafeArea} edges={['top']}>
            <View style={styles.subScreenHeaderRow}>
              <TouchableOpacity
                style={styles.backBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen('dashboard')}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.subScreenTitle}>Threat Clusters</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Filter Chips Horizontal Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsRow}
            >
              {['All', 'High Priority', 'Lagos', 'Abuja', 'Ibadan'].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.filterChip, filterRegion === chip && styles.filterChipActive]}
                  activeOpacity={0.75}
                  onPress={() => setFilterRegion(chip)}
                >
                  <Text
                    style={[styles.filterChipText, filterRegion === chip && styles.filterChipTextActive]}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>

          <ScrollView
            style={styles.subScrollView}
            contentContainerStyle={styles.subScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredClusters.map((cluster) => {
              const isHigh = cluster.priority === 'High';
              const isMed = cluster.priority === 'Medium';
              return (
                <TouchableOpacity
                  key={cluster.id}
                  style={styles.clusterItemCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setSelectedCluster(cluster);
                    setCurrentScreen('cluster_detail');
                  }}
                >
                  {/* Pin Icon */}
                  <View
                    style={[
                      styles.clusterPinBox,
                      isHigh && { backgroundColor: '#FEE2E2' },
                      isMed && { backgroundColor: '#FEF3C7' },
                      !isHigh && !isMed && { backgroundColor: '#DCFCE7' },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>📍</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.clusterMetaCol}>
                    <Text style={styles.clusterItemTitle}>{cluster.name}</Text>
                    <Text style={styles.clusterItemSub}>
                      {cluster.scansCount} suspicious scans • {cluster.timeWindow}
                    </Text>
                  </View>

                  {/* Priority Badge */}
                  <View
                    style={[
                      styles.priorityPill,
                      isHigh && styles.priorityPillHigh,
                      isMed && styles.priorityPillMedium,
                      !isHigh && !isMed && styles.priorityPillLow,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityPillText,
                        isHigh && { color: '#DC2626' },
                        isMed && { color: '#D97706' },
                        !isHigh && !isMed && { color: '#059669' },
                      ]}
                    >
                      {cluster.priority}
                    </Text>
                  </View>

                  <Text style={styles.clusterChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* 3. CLUSTER DETAIL SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'cluster_detail' && (
        <View style={{ flex: 1 }}>
          <SafeAreaView style={styles.subScreenHeaderSafeArea} edges={['top']}>
            <View style={styles.subScreenHeaderRow}>
              <TouchableOpacity
                style={styles.backBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen('clusters_list')}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.subScreenTitle}>{selectedCluster.name}</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Priority & Scan Tag */}
            <View style={styles.clusterDetailHeaderMeta}>
              <View style={[styles.priorityPill, styles.priorityPillHigh]}>
                <Text style={[styles.priorityPillText, { color: '#DC2626' }]}>
                  {selectedCluster.priority} Priority
                </Text>
              </View>
              <Text style={styles.clusterDetailScansBadge}>
                {selectedCluster.scansCount} suspicious scans
              </Text>
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.subScrollView}
            contentContainerStyle={styles.subScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 3 Key Stats Row */}
            <View style={styles.statsThreeRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{selectedCluster.timeWindow}</Text>
                <Text style={styles.statLabel}>Time window</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{selectedCluster.cloneIdentities}</Text>
                <Text style={styles.statLabel}>Clone identities</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{selectedCluster.locationsCount}</Text>
                <Text style={styles.statLabel}>Locations</Text>
              </View>
            </View>

            {/* Hotspot Street Map View */}
            <View style={styles.clusterDetailMapCard}>
              <View style={styles.streetMapCanvas}>
                {/* Concentric Threat Heat Radii */}
                <View style={styles.heatCircleOuter} />
                <View style={styles.heatCircleMiddle} />
                <View style={styles.heatCircleInner}>
                  <Text style={styles.heatCircleText}>Idumota Market</Text>
                </View>

                {/* Street Markers */}
                <View style={[styles.streetMarker, { top: '30%', left: '25%' }]}>
                  <Text style={styles.streetMarkerIcon}>📍</Text>
                  <Text style={styles.streetMarkerName}>Mile 12</Text>
                </View>

                <View style={[styles.streetMarker, { top: '65%', left: '35%' }]}>
                  <Text style={styles.streetMarkerIcon}>📍</Text>
                  <Text style={styles.streetMarkerName}>CMS</Text>
                </View>

                <View style={[styles.streetMarker, { top: '75%', left: '65%' }]}>
                  <Text style={styles.streetMarkerIcon}>📍</Text>
                  <Text style={styles.streetMarkerName}>Ebute-Metta</Text>
                </View>
              </View>
            </View>

            {/* 2 Navigation Buttons */}
            <TouchableOpacity
              style={styles.clusterActionSolidBtn}
              activeOpacity={0.88}
              onPress={() => setCurrentScreen('cluster_timeline')}
            >
              <Text style={styles.clusterActionSolidBtnText}>View Scan Timeline →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clusterActionOutlineBtn}
              activeOpacity={0.8}
              onPress={() => setCurrentScreen('dossier')}
            >
              <Text style={styles.clusterActionOutlineBtnText}>Open Intelligence Dossier</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* 4. CLUSTER TIMELINE SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'cluster_timeline' && (
        <View style={{ flex: 1 }}>
          <SafeAreaView style={styles.subScreenHeaderSafeArea} edges={['top']}>
            <View style={styles.subScreenHeaderRow}>
              <TouchableOpacity
                style={styles.backBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen('cluster_detail')}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.subScreenTitle}>Scan Timeline</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.subScrollView}
            contentContainerStyle={styles.subScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Timeline Vertical Track */}
            <View style={styles.timelineContainer}>
              <View style={styles.timelineVerticalLine} />

              {TIMELINE_EVENTS.map((item, idx) => (
                <View key={idx} style={styles.timelineEventRow}>
                  {/* Timeline Dot */}
                  <View style={[styles.timelineDot, item.anomaly ? styles.timelineDotRed : styles.timelineDotNormal]} />

                  {/* Event Details Card */}
                  <View style={styles.timelineEventCard}>
                    <View style={styles.timelineTimeRow}>
                      <Text style={styles.timelineTimeText}>{item.time}</Text>
                      {item.dateLabel && (
                        <View style={styles.timelineDateBadge}>
                          <Text style={styles.timelineDateBadgeText}>{item.dateLabel}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.timelineEventTitle}>{item.title}</Text>
                    <Text style={styles.timelineLocationText}>{item.location}</Text>

                    {item.anomaly && (
                      <View style={styles.anomalyFlagBadge}>
                        <Text style={styles.anomalyFlagIcon}>⚡</Text>
                        <Text style={styles.anomalyFlagText}>{item.anomaly}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Jump to Dossier Button */}
            <TouchableOpacity
              style={[styles.clusterActionSolidBtn, { marginTop: 14 }]}
              activeOpacity={0.88}
              onPress={() => setCurrentScreen('dossier')}
            >
              <Text style={styles.clusterActionSolidBtnText}>Open Case Intelligence Dossier →</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ======================================================== */}
      {/* 5. INTELLIGENCE DOSSIER SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'dossier' && (
        <View style={{ flex: 1 }}>
          <SafeAreaView style={styles.subScreenHeaderSafeArea} edges={['top']}>
            <View style={styles.subScreenHeaderRow}>
              <TouchableOpacity
                style={styles.backBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen('cluster_detail')}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.subScreenTitle}>Intelligence Dossier</Text>
              {/* PDF Export Button */}
              <TouchableOpacity
                style={styles.pdfExportHeaderBtn}
                activeOpacity={0.8}
                onPress={handleExportPdf}
              >
                <Text style={styles.pdfExportText}>📄 PDF</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.subScrollView}
            contentContainerStyle={styles.subScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Case Dossier Card */}
            <View style={styles.dossierMainCard}>
              <View style={styles.dossierCaseHeader}>
                <Text style={styles.dossierCaseId}>Case #SN-2048</Text>
                <View style={styles.dossierConfidencePill}>
                  <Text style={styles.dossierConfidenceText}>● High Confidence</Text>
                </View>
              </View>

              {/* Data Table */}
              <View style={styles.dossierDataRow}>
                <Text style={styles.dossierDataLabel}>Product</Text>
                <Text style={styles.dossierDataValue}>Paracetamol 500mg</Text>
              </View>

              <View style={styles.dossierDataRow}>
                <Text style={styles.dossierDataLabel}>Manufacturer</Text>
                <Text style={styles.dossierDataValue}>Generic Pharma Ltd.</Text>
              </View>

              <View style={styles.dossierDataRow}>
                <Text style={styles.dossierDataLabel}>Threat</Text>
                <Text style={[styles.dossierDataValue, { color: '#DC2626' }]}>
                  Suspected cloned product identity
                </Text>
              </View>

              <View style={styles.dossierDataRow}>
                <Text style={styles.dossierDataLabel}>Time Window</Text>
                <Text style={styles.dossierDataValue}>17 scans over 48 hours</Text>
              </View>

              <View style={styles.dossierDataRow}>
                <Text style={styles.dossierDataLabel}>Locations</Text>
                <Text style={styles.dossierDataValue}>5 unique locations</Text>
              </View>

              <View style={[styles.dossierDataRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.dossierDataLabel}>Clone Identities</Text>
                <Text style={styles.dossierDataValue}>3 linked identities</Text>
              </View>

              {/* Key Findings Section */}
              <View style={styles.keyFindingsBox}>
                <Text style={styles.keyFindingsHeading}>Key Findings</Text>
                <Text style={styles.keyFindingBullet}>• Repeated scans in close geographic area</Text>
                <Text style={styles.keyFindingBullet}>• Impossible geo-velocity detected (&gt;900 km/h anomaly)</Text>
                <Text style={styles.keyFindingBullet}>• Multiple retail points with same product identity</Text>
                <Text style={styles.keyFindingBullet}>• Consumer reports and photos attached</Text>
              </View>

              {/* Investigation Map Perimeter */}
              <View style={styles.investigationAreaBox}>
                <Text style={styles.investigationAreaTitle}>Investigation Perimeter</Text>
                <View style={styles.investigationCanvas}>
                  <View style={styles.investigationPerimeterPolygon} />
                  <View style={[styles.investigationPin, { top: '35%', left: '30%' }]}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                  </View>
                  <View style={[styles.investigationPin, { top: '48%', left: '55%' }]}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                  </View>
                  <View style={[styles.investigationPin, { top: '65%', left: '42%' }]}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.dossierActionsBottomRow}>
              <TouchableOpacity
                style={styles.reviewCaseBtn}
                activeOpacity={0.88}
                onPress={() => {
                  Alert.alert(
                    'Review Case',
                    'Case #SN-2048 has been queued for field inspection dispatch with Lagos State Task Force.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.reviewCaseBtnText}>Review Case</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareDossierBtn}
                activeOpacity={0.8}
                onPress={handleShareDossier}
              >
                <Text style={styles.shareDossierBtnText}>🔗 Share with Team</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Time Filter Modal */}
      <Modal visible={showTimeFilterModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowTimeFilterModal(false)}
        >
          <View style={styles.filterModalCard}>
            <Text style={styles.filterModalTitle}>Select Time Horizon</Text>
            {(['Last 24 hours', 'Last 7 days', 'Last 30 days'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.filterModalOption, timeFilter === opt && styles.filterModalOptionActive]}
                onPress={() => {
                  setTimeFilter(opt);
                  setShowTimeFilterModal(false);
                }}
              >
                <Text style={[styles.filterModalOptionText, timeFilter === opt && styles.filterModalOptionTextActive]}>
                  {opt}
                </Text>
                {timeFilter === opt && <Text style={{ color: '#059669', fontWeight: '800' }}>✓</Text>}
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
    backgroundColor: '#0F172A',
  },

  /* Dashboard Header */
  dashboardHeaderSafeArea: {
    backgroundColor: '#064E3B',
    paddingBottom: 10,
  },
  dashboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
  },
  dashboardBrandCol: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIconEmoji: {
    fontSize: 20,
  },
  brandTitleText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitleText: {
    fontSize: 11.5,
    color: '#A7F3D0',
    marginTop: 2,
    fontWeight: '500',
  },
  timeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  timeFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeFilterPillCaret: {
    fontSize: 12,
    color: '#A7F3D0',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  livePulseDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  liveStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.8,
  },
  returnToConsumerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  returnToConsumerBtn: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  /* Dashboard Scroll */
  dashboardScrollView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  dashboardScrollContent: {
    padding: 16,
    paddingBottom: 36,
  },

  /* 4 KPI Grid */
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderTopWidth: 3,
  },
  kpiNumber: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    lineHeight: 16,
  },

  /* Map Container Card */
  mapContainerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mapCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  mapCardViewAllLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#34D399',
  },
  darkMapCanvas: {
    height: 240,
    backgroundColor: '#0B132B',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  mapGridLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mapGridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mapGridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mapGridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mapOutlineShape: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.18)',
    borderRadius: 24,
    backgroundColor: 'rgba(6, 78, 59, 0.12)',
  },

  /* Hotspot Markers */
  mapHotspotMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarWaveOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarWaveInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  hotspotLabelBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hotspotCityName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hotspotSubText: {
    fontSize: 8.5,
    color: '#94A3B8',
  },
  mapFooterBar: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  mapFooterText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },

  /* Open Clusters Button */
  openClustersBtn: {
    backgroundColor: '#059669',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  openClustersBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Sub Screens Common Header */
  subScreenHeaderSafeArea: {
    backgroundColor: '#064E3B',
    paddingBottom: 8,
  },
  subScreenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 34,
  },
  subScreenTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filterChipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D1FAE5',
  },
  filterChipTextActive: {
    color: '#064E3B',
  },

  subScrollView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  subScrollContent: {
    padding: 16,
    paddingBottom: 36,
  },

  /* Cluster Item Card */
  clusterItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  clusterPinBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clusterMetaCol: {
    flex: 1,
  },
  clusterItemTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  clusterItemSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityPillHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityPillMedium: {
    backgroundColor: '#FEF3C7',
  },
  priorityPillLow: {
    backgroundColor: '#DCFCE7',
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clusterChevron: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Cluster Detail */
  clusterDetailHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  clusterDetailScansBadge: {
    fontSize: 13,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  statsThreeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  clusterDetailMapCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  streetMapCanvas: {
    height: 220,
    backgroundColor: '#0B132B',
    borderRadius: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heatCircleOuter: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  heatCircleMiddle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  heatCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  heatCircleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  streetMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  streetMarkerIcon: {
    fontSize: 16,
  },
  streetMarkerName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#CBD5E1',
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  clusterActionSolidBtn: {
    backgroundColor: '#059669',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  clusterActionSolidBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clusterActionOutlineBtn: {
    borderWidth: 1.5,
    borderColor: '#475569',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  clusterActionOutlineBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#CBD5E1',
  },

  /* Timeline */
  timelineContainer: {
    position: 'relative',
    paddingLeft: 20,
    marginBottom: 10,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 27,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: '#334155',
  },
  timelineEventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#0F172A',
    marginRight: 14,
    marginTop: 4,
  },
  timelineDotNormal: {
    backgroundColor: '#059669',
  },
  timelineDotRed: {
    backgroundColor: '#EF4444',
  },
  timelineEventCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timelineTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
  },
  timelineDateBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timelineDateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  timelineEventTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  timelineLocationText: {
    fontSize: 12.5,
    color: '#94A3B8',
  },
  anomalyFlagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#450A0A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  anomalyFlagIcon: {
    fontSize: 12,
  },
  anomalyFlagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCA5A5',
    flex: 1,
  },

  /* Dossier */
  pdfExportHeaderBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pdfExportText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dossierMainCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dossierCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 10,
  },
  dossierCaseId: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  dossierConfidencePill: {
    backgroundColor: '#450A0A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dossierConfidenceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F87171',
  },
  dossierDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dossierDataLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dossierDataValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'right',
  },
  keyFindingsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  keyFindingsHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#34D399',
    marginBottom: 8,
  },
  keyFindingBullet: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 4,
  },
  investigationAreaBox: {
    marginTop: 14,
  },
  investigationAreaTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  investigationCanvas: {
    height: 140,
    backgroundColor: '#0B132B',
    borderRadius: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  investigationPerimeterPolygon: {
    position: 'absolute',
    width: 160,
    height: 90,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    transform: [{ rotate: '12deg' }],
  },
  investigationPin: {
    position: 'absolute',
  },
  dossierActionsBottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewCaseBtn: {
    flex: 1,
    backgroundColor: '#059669',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCaseBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shareDossierBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#475569',
    backgroundColor: '#1E293B',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareDossierBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  filterModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  filterModalOptionActive: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  filterModalOptionText: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  filterModalOptionTextActive: {
    color: '#34D399',
    fontWeight: '700',
  },
});
