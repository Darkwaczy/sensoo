import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth continuous rotation loop
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    // Auto-advance to onboarding screen after simulated load
    const timer = setTimeout(() => {
      router.replace('/onboarding' as any);
    }, 2500);

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [router]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.container}
      onPress={() => router.replace('/onboarding' as any)}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Center Branding Section: Logo & Elegant Circular Spinner */}
      <View style={styles.centerSection}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Minimalist circular spinner arc matching mockup */}
        <View style={styles.spinnerContainer}>
          <Animated.View style={[styles.spinnerArc, { transform: [{ rotate: spin }] }]} />
        </View>
      </View>

      {/* Bottom Wave Background Graphics */}
      <Image
        source={require('../../assets/bottom_wave.png')}
        style={styles.bottomWave}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Center Section positioned ~39% from the top */
  centerSection: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.38,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  logo: {
    width: Math.min(SCREEN_WIDTH * 0.56, 230),
    height: 72,
    marginBottom: 38,
  },

  /* Spinner: delicate 32px partial circle arc */
  spinnerContainer: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerArc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: '#537A63',
    borderRightColor: '#537A63',
    borderBottomColor: '#537A63',
  },

  /* Bottom Wave covering the lower ~42% of the screen */
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: SCREEN_HEIGHT * 0.42,
    zIndex: 1,
  },
});
