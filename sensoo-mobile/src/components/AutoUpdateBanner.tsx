import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';

export default function AutoUpdateBanner() {
  const [downloading, setDownloading] = useState(false);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Updates only work in standalone builds (preview/production APKs)
    if (!Updates.isEnabled) return;

    checkAndFetchUpdate();

    // Check again whenever user returns to the app from background
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAndFetchUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkAndFetchUpdate = async () => {
    if (!Updates.isEnabled || downloading) return;

    try {
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        setDownloading(true);
        const fetchResult = await Updates.fetchUpdateAsync();
        if (fetchResult.isNew) {
          setIsUpdateReady(true);
          setDismissed(false);
        }
      }
    } catch (err) {
      console.log('[AutoUpdate] Check skipped or unavailable:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleRestart = async () => {
    try {
      await Updates.reloadAsync();
    } catch (err) {
      console.warn('[AutoUpdate] Reload failed:', err);
    }
  };

  if (!isUpdateReady || dismissed) {
    return null;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeContainer} pointerEvents="box-none">
      <View style={styles.banner}>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.titleText}>Update Ready</Text>
          </View>
          <Text style={styles.subText}>A new version is downloaded.</Text>
        </View>

        <TouchableOpacity
          style={styles.restartBtn}
          activeOpacity={0.8}
          onPress={handleRestart}
        >
          <Text style={styles.restartBtnText}>Restart Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.7}
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999999,
  },
  banner: {
    marginHorizontal: 14,
    marginTop: 6,
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  subText: {
    color: '#A7F3D0',
    fontSize: 11,
  },
  restartBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  restartBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#A7F3D0',
    fontSize: 14,
    fontWeight: '600',
  },
});
