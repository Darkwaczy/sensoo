import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GetStartedScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/home' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header: Brand Logo on Left */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>

      {/* Hero Visual: Full hair headroom, complete table, and 320px progressive gradient blend */}
      <View style={styles.heroWrapper}>
        <Image
          source={require('../../assets/get_started_hero.jpg')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Content Area: transparent background so image gradient melts into pure screen white */}
      <View style={styles.contentContainer}>
        {/* Headings - Reduced refined font size */}
        <Text style={styles.headingBlack}>Know what</Text>
        <Text style={styles.headingGreen}>you’re buying.</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Scan and verify products instantly.</Text>

        {/* Action Button: Get Started → */}
        <TouchableOpacity
          style={styles.getStartedButton}
          activeOpacity={0.85}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.getStartedArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },

  /* Top Safe Area Header */
  topSafeArea: {
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 2,
  },
  logo: {
    width: 125,
    height: 42,
  },

  /* Hero Wrapper */
  heroWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -8,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  /* Bottom Content Area - Transparent so gradient shines through */
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 28 : 36,
    marginTop: -48,
    backgroundColor: 'transparent',
  },
  headingBlack: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0B2215',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  headingGreen: {
    fontSize: 34,
    fontWeight: '800',
    color: '#155E38',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15.5,
    lineHeight: 22,
    color: '#5C7467',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: -0.2,
    marginTop: 8,
  },

  /* Full-width Pill Button */
  getStartedButton: {
    backgroundColor: '#0A2E1A',
    width: '100%',
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#0A2E1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  getStartedArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
});
