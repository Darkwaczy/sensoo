import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  titleBlack: string;
  titleGreen: string;
  titleGreenSecondLine?: string;
  subtitle: string;
  image: any;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    titleBlack: 'Don’t guess.',
    titleGreen: 'Verify.',
    subtitle: 'Scan any product to know\nif it’s genuine before you\nbuy or use it.',
    image: require('../../assets/onboarding_step1.jpg'),
  },
  {
    id: '2',
    titleBlack: 'Real products.',
    titleGreen: 'Safer lives.',
    subtitle: 'Get instant verification and\ntrusted product information\nin seconds.',
    image: require('../../assets/onboarding_step2.jpg'),
  },
  {
    id: '3',
    titleBlack: 'Spot counterfeits',
    titleGreen: 'before they',
    titleGreenSecondLine: 'spread.',
    subtitle: 'Help stop fake products\nand keep your community\nsafe with real data.',
    image: require('../../assets/onboarding_step3.jpg'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = () => {
    router.replace('/get-started' as any);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/get-started' as any);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header: Brand Logo on Left & Skip on Right */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleSkip}
            hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Carousel FlatList for 1, 2, 3 with fluid swipe physics */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Copy Headings */}
            <View style={styles.copyContainer}>
              <Text style={styles.headingBlack}>{item.titleBlack}</Text>
              <Text style={styles.headingGreen}>{item.titleGreen}</Text>
              {item.titleGreenSecondLine && (
                <Text style={styles.headingGreen}>{item.titleGreenSecondLine}</Text>
              )}
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            {/* Hero 3D Illustration */}
            <View style={styles.heroContainer}>
              <Image
                source={item.image}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      />

      {/* Bottom Bar: Pagination Dots on Left & Circular Arrow Button on Right */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <View style={styles.bottomBar}>
          {/* Pagination Indicators */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  currentIndex === i ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Circular Next Button */}
          <TouchableOpacity
            style={styles.nextCircleButton}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Top Safe Area Header */
  topSafeArea: {
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 8,
  },
  logo: {
    width: 125,
    height: 42,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#496053',
  },

  /* Slide */
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 24,
  },

  /* Headings */
  copyContainer: {
    alignItems: 'flex-start',
    marginTop: 22,
    marginBottom: 0,
  },
  headingBlack: {
    fontSize: 45,
    fontWeight: '800',
    color: '#0B2215',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  headingGreen: {
    fontSize: 45,
    fontWeight: '800',
    color: '#47805F',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    color: '#4E6558',
    fontWeight: '400',
    letterSpacing: -0.2,
    marginTop: 12,
  },

  /* Hero Center Visual: directly under subtitle, with soft bottom gradient blend */
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 72,
    marginHorizontal: -24,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  /* Bottom Controls */
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 18 : 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 9.5,
    height: 9.5,
    borderRadius: 4.75,
    backgroundColor: '#092E19',
  },
  dotInactive: {
    backgroundColor: '#C8D7CD',
  },

  /* Circular Next Button */
  nextCircleButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0A2E1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A2E1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  nextArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
});
