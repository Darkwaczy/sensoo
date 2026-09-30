import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SavedToHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    code?: string;
  }>();

  const productName = params.name || 'Dove Body Wash\nDeep Moisture 250ml';
  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      <View style={styles.content}>
        {/* Celebration / Success Badge Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />

          {/* Floating celebratory particle dots */}
          <View style={[styles.particleDot, styles.particle1]} />
          <View style={[styles.particleDot, styles.particle2]} />
          <View style={[styles.particleDot, styles.particle3]} />
          <View style={[styles.particleDot, styles.particle4]} />

          <View style={styles.innerCircle}>
            <View style={styles.successCheckBadge}>
              <Text style={styles.checkMarkSymbol}>✓</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Saved to History</Text>
        <Text style={styles.subtitle}>
          This product has been saved to your scan history.
        </Text>

        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productThumbContainer}>
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
            <Text style={styles.productNameText} numberOfLines={2}>
              {productName}
            </Text>
            <Text style={styles.productTimestamp}>Scanned today, {formattedTime}</Text>
          </View>
        </View>

        {/* Notification Banner */}
        <View style={styles.notificationBanner}>
          <View style={styles.bannerCheckCircle}>
            <Text style={styles.bannerCheckSymbol}>✓</Text>
          </View>
          <Text style={styles.bannerText}>
            You can view this scan in your history anytime.
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() =>
            router.push({
              pathname: '/scan-history',
              params: { code: params.code },
            })
          }
        >
          <Text style={styles.primaryButtonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryTextButton}
          activeOpacity={0.7}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DCFCE7',
    opacity: 0.5,
  },
  particleDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  particle1: {
    top: 14,
    left: 28,
    width: 8,
    height: 8,
    backgroundColor: '#FDE047',
  },
  particle2: {
    top: 24,
    right: 22,
    width: 6,
    height: 6,
    backgroundColor: '#34D399',
  },
  particle3: {
    bottom: 24,
    left: 20,
    width: 6,
    height: 6,
    backgroundColor: '#60A5FA',
  },
  particle4: {
    bottom: 18,
    right: 26,
    width: 7,
    height: 7,
    backgroundColor: '#F472B6',
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  checkMarkSymbol: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  productCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  productThumbContainer: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productThumb: {
    width: 44,
    height: 44,
  },
  productMeta: {
    flex: 1,
  },
  productNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 4,
  },
  productTimestamp: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  notificationBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  bannerCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerCheckSymbol: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  bottomSafeArea: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 18 : 8,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryTextButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0D382B',
  },
});
