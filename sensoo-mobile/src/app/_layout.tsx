import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
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
