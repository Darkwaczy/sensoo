import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { startRenderKeepAlive } from '../services/renderKeepAliveService';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    startRenderKeepAlive();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="get-started" />
        <Stack.Screen name="home" />
        <Stack.Screen name="scanner" />
        <Stack.Screen name="checking" />
        <Stack.Screen name="result" />
        <Stack.Screen name="report-product" />
        <Stack.Screen name="product-not-found" />
        <Stack.Screen name="scan-failed" />
        <Stack.Screen name="camera-permission" />
        <Stack.Screen name="location-permission" />
        <Stack.Screen name="verification-unavailable" />
        <Stack.Screen name="report-submitted" />
        <Stack.Screen name="report-details" />
        <Stack.Screen name="report-status" />
        <Stack.Screen name="report-edit" />
        <Stack.Screen name="report-delete" />
        <Stack.Screen name="report-updated" />
        <Stack.Screen name="report-review-complete" />
        <Stack.Screen name="report-closed" />
        <Stack.Screen name="saved-to-history" />
        <Stack.Screen name="scan-history" />
        <Stack.Screen name="regional-info" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="personal-info" />
        <Stack.Screen name="location-region" />
        <Stack.Screen name="privacy-security" />
        <Stack.Screen name="about-sensoo" />
        <Stack.Screen name="how-it-works" />
        <Stack.Screen name="help-support" />
        <Stack.Screen name="send-feedback" />
        <Stack.Screen name="terms-of-service" />
        <Stack.Screen name="privacy-policy" />
        <Stack.Screen name="acknowledgements" />
      </Stack>
    </ThemeProvider>
  );
}
