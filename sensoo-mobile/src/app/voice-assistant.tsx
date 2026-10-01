import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import {
  getVoiceAssistantSettings,
  updateVoiceAssistantSettings,
  VoiceAssistantSettings,
} from '../services/voiceAssistantService';

export default function VoiceAssistantScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<VoiceAssistantSettings>(getVoiceAssistantSettings());
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  useEffect(() => {
    checkInitialMicPermission();
  }, []);

  const checkInitialMicPermission = async () => {
    try {
      const res = await Camera.getMicrophonePermissionsAsync();
      setMicGranted(res.granted);
    } catch {
      setMicGranted(false);
    }
  };

  const handleRequestMicPermission = async () => {
    try {
      const res = await Camera.requestMicrophonePermissionsAsync();
      setMicGranted(res.granted);
      if (res.granted) {
        Alert.alert('Permission Granted', 'Microphone access is now enabled for Sensoo Voice Commander.');
      } else {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone permissions in your phone settings to use voice features.'
        );
      }
    } catch (err) {
      console.warn('Microphone permission request error:', err);
    }
  };

  const handleToggleMaster = (val: boolean) => {
    const updated = updateVoiceAssistantSettings({ enabled: val });
    setSettings(updated);
  };

  const handleToggleVoiceReply = (val: boolean) => {
    const updated = updateVoiceAssistantSettings({ voiceReplyEnabled: val });
    setSettings(updated);
  };

  const handleToggleVisualGlow = (val: boolean) => {
    const updated = updateVoiceAssistantSettings({ visualGlowEnabled: val });
    setSettings(updated);
  };

  const runTestCommand = (name: string, action: () => void) => {
    setTestNotice(`⚡ Running: "${name}"`);
    setTimeout(() => {
      setTestNotice(null);
      action();
    }, 400);
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
          <Text style={styles.centerTitle}>Voice Assistant</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Feedback Banner */}
        {testNotice && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackBannerText}>{testNotice}</Text>
          </View>
        )}

        {/* Status Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Text style={{ fontSize: 26 }}>🎙️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Sensoo Voice Commander</Text>
            <Text style={styles.heroDesc}>
              Instant voice and 1-tap commands to scan drugs, find clinics, or report fakes without tapping through menus.
            </Text>
          </View>
        </View>

        {/* Master Activation Switch */}
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.switchTitle}>Enable Voice Quick Launcher</Text>
              <Text style={styles.switchSubtitle}>
                Displays the floating voice launcher button on your home dashboard.
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleMaster}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={settings.enabled ? '#059669' : '#F8FAFC'}
            />
          </View>
        </View>

        {/* Microphone Permission Status */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>Microphone Access</Text>
          <View style={styles.micStatusRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.micStatusText}>
                {micGranted
                  ? 'Microphone permission granted ✓'
                  : 'Microphone permission not granted yet'}
              </Text>
              <Text style={styles.micStatusSub}>
                Required for voice input and hands-free commanding.
              </Text>
            </View>
            {!micGranted && (
              <TouchableOpacity
                style={styles.grantMicBtn}
                activeOpacity={0.8}
                onPress={handleRequestMicPermission}
              >
                <Text style={styles.grantMicBtnText}>Grant Access</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Execution Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>Execution Preferences</Text>

          <View style={[styles.switchRow, { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 14 }]}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.switchTitle}>Silent Execution (Recommended)</Text>
              <Text style={styles.switchSubtitle}>
                Executes commands immediately without speaking back or audio interruption.
              </Text>
            </View>
            <Switch
              value={!settings.voiceReplyEnabled}
              onValueChange={(val) => handleToggleVoiceReply(!val)}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={!settings.voiceReplyEnabled ? '#059669' : '#F8FAFC'}
            />
          </View>

          <View style={[styles.switchRow, { paddingTop: 14 }]}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.switchTitle}>Visual Confirmation Banner</Text>
              <Text style={styles.switchSubtitle}>
                Displays a quick top banner showing which action is being launched.
              </Text>
            </View>
            <Switch
              value={settings.visualGlowEnabled}
              onValueChange={handleToggleVisualGlow}
              trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
              thumbColor={settings.visualGlowEnabled ? '#059669' : '#F8FAFC'}
            />
          </View>
        </View>

        {/* Live Command Testing Station */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionTitle}>Interactive Test Station</Text>
          <Text style={styles.cardBodyText}>
            Tap any command below to test instant execution:
          </Text>

          <View style={styles.testButtonsGrid}>
            <TouchableOpacity
              style={styles.testBtn}
              activeOpacity={0.8}
              onPress={() => runTestCommand('Open Camera Scanner', () => router.push('/scanner'))}
            >
              <Text style={styles.testBtnIcon}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.testBtnTitle}>Open Camera Scanner</Text>
                <Text style={styles.testBtnSub}>Launches GS1 / NAFDAC barcode scanner</Text>
              </View>
              <Text style={styles.testBtnChevron}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testBtn}
              activeOpacity={0.8}
              onPress={() =>
                runTestCommand('Find Nearby Clinics', () =>
                  router.push({ pathname: '/agent', params: { initialScreen: 'clinics' } })
                )
              }
            >
              <Text style={styles.testBtnIcon}>🏥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.testBtnTitle}>Find Nearby Clinics</Text>
                <Text style={styles.testBtnSub}>Accredited health facilities & emergency</Text>
              </View>
              <Text style={styles.testBtnChevron}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testBtn}
              activeOpacity={0.8}
              onPress={() =>
                runTestCommand('Report Counterfeit', () =>
                  router.push({ pathname: '/agent', params: { query: 'I bought a fake product' } })
                )
              }
            >
              <Text style={styles.testBtnIcon}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.testBtnTitle}>Report Counterfeit</Text>
                <Text style={styles.testBtnSub}>NAFDAC Sentinel complaint intake</Text>
              </View>
              <Text style={styles.testBtnChevron}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testBtn}
              activeOpacity={0.8}
              onPress={() =>
                runTestCommand('AI Safety Guidance', () =>
                  router.push({ pathname: '/agent', params: { initialScreen: 'safety_guidance' } })
                )
              }
            >
              <Text style={styles.testBtnIcon}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.testBtnTitle}>AI Safety Guidance</Text>
                <Text style={styles.testBtnSub}>Product safety & intake advisory</Text>
              </View>
              <Text style={styles.testBtnChevron}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNoteCard}>
          <Text style={styles.privacyNoteTitle}>🔒 Privacy First Protection</Text>
          <Text style={styles.privacyNoteBody}>
            Sensoo only accesses your microphone when you actively tap voice actions. No audio is recorded or stored in the background.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '300',
    marginTop: -2,
  },
  centerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerPlaceholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  feedbackBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  feedbackBannerText: {
    color: '#A7F3D0',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  cardBodyText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  micStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  micStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  micStatusSub: {
    fontSize: 11,
    color: '#64748B',
  },
  grantMicBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  grantMicBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  testButtonsGrid: {
    gap: 8,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  testBtnIcon: {
    fontSize: 20,
  },
  testBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  testBtnSub: {
    fontSize: 11,
    color: '#64748B',
  },
  testBtnChevron: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
  },
  privacyNoteCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  privacyNoteBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});
