import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ScanFailedScreen() {
  const router = useRouter();
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    setShowManualModal(false);
    router.replace({
      pathname: '/checking',
      params: { code: manualCode.trim() },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Header */}
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
          <Text style={styles.headerTitle}>Scan Product</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Failed Barcode Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Barcode Frame Vector */}
            <View style={styles.barcodeFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />

              {/* Barcode Bars */}
              <View style={styles.barcodeBarsRow}>
                <View style={[styles.bar, { width: 3 }]} />
                <View style={[styles.bar, { width: 1.5, marginHorizontal: 2 }]} />
                <View style={[styles.bar, { width: 4 }]} />
                <View style={[styles.bar, { width: 2, marginHorizontal: 2 }]} />
                <View style={[styles.bar, { width: 5 }]} />
                <View style={[styles.bar, { width: 2, marginHorizontal: 1.5 }]} />
                <View style={[styles.bar, { width: 3.5 }]} />
                <View style={[styles.bar, { width: 1.5, marginHorizontal: 2 }]} />
                <View style={[styles.bar, { width: 4 }]} />
                <View style={[styles.bar, { width: 2, marginHorizontal: 2 }]} />
                <View style={[styles.bar, { width: 3 }]} />
              </View>
            </View>

            {/* Red 'X' Badge */}
            <View style={styles.redXBadge}>
              <Text style={styles.redXSymbol}>✕</Text>
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Scan Failed</Text>
        <Text style={styles.subtitle}>
          We couldn't read the barcode or QR code. Please try again.
        </Text>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsHeading}>Tips for a successful scan:</Text>

          <View style={styles.tipRow}>
            <View style={styles.tipIconCircle}>
              <Text style={styles.tipIconSymbol}>☀️</Text>
            </View>
            <Text style={styles.tipText}>Make sure there is enough light.</Text>
          </View>

          <View style={[styles.tipRow, { marginTop: 14 }]}>
            <View style={styles.tipIconCircle}>
              <Text style={styles.tipIconSymbol}>🎯</Text>
            </View>
            <Text style={styles.tipText}>Keep the barcode or QR code in clear focus.</Text>
          </View>

          <View style={[styles.tipRow, { marginTop: 14 }]}>
            <View style={styles.tipIconCircle}>
              <Text style={styles.tipIconSymbol}>📱</Text>
            </View>
            <Text style={styles.tipText}>Hold your phone steady and try again.</Text>
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.88}
          onPress={() => router.replace('/scanner')}
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryOutlinedButton}
          activeOpacity={0.7}
          onPress={() => setShowManualModal(true)}
        >
          <Text style={styles.secondaryOutlinedText}>Enter Code Manually</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Manual Code Modal */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Code Manually</Text>
            <Text style={styles.modalSubtitle}>
              Type the numbers printed below the barcode or on the package.
            </Text>

            <TextInput
              style={styles.inputField}
              placeholder="e.g. 6971764150130"
              placeholderTextColor="#94A3B8"
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="characters"
              autoFocus
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowManualModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleManualSubmit}
              >
                <Text style={styles.modalSubmitText}>Verify Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backChevronText: {
    fontSize: 32,
    color: '#1E293B',
    lineHeight: 34,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
  },
  outerGlowCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FEE2E2',
    opacity: 0.5,
  },
  innerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  barcodeFrame: {
    width: 80,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#DC2626',
    borderTopLeftRadius: 3,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#DC2626',
    borderTopRightRadius: 3,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#DC2626',
    borderBottomLeftRadius: 3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#DC2626',
    borderBottomRightRadius: 3,
  },
  barcodeBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },
  bar: {
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 1,
  },
  redXBadge: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  redXSymbol: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tipsHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipIconSymbol: {
    fontSize: 13,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
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
  secondaryOutlinedButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0D382B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryOutlinedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D382B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 19,
  },
  inputField: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 20,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#0D382B',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  modalSubmitText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
