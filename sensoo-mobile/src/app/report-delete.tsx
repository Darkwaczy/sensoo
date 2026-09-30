import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportDeleteScreen() {
  const router = useRouter();

  const handleDelete = () => {
    // Navigate back to reports tab / home
    router.replace('/home');
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
          <Text style={styles.headerTitle}>Delete Report</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Trash Can Illustration */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.outerGlowCircle} />
          <View style={styles.innerCircle}>
            {/* Minimalist Red Trash Bin Vector */}
            <View style={styles.trashBinBody}>
              <View style={styles.trashBinLid} />
              <View style={styles.trashBinHandle} />
              <View style={styles.trashLine} />
              <View style={styles.trashLine} />
              <View style={styles.trashLine} />
            </View>
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.mainTitle}>Delete This Report?</Text>
        <Text style={styles.subtitle}>
          This will permanently delete your report and all associated information. You can't undo this action.
        </Text>
      </View>

      {/* Bottom Actions */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']}>
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.88}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  },
  trashBinBody: {
    width: 44,
    height: 52,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    position: 'relative',
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  trashBinLid: {
    position: 'absolute',
    top: -6,
    width: 54,
    height: 6,
    backgroundColor: '#DC2626',
    borderRadius: 3,
  },
  trashBinHandle: {
    position: 'absolute',
    top: -12,
    width: 16,
    height: 6,
    borderWidth: 2,
    borderColor: '#DC2626',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 0,
  },
  trashLine: {
    width: 3,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
    opacity: 0.85,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bottomSafeArea: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 18 : 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#0D382B',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D382B',
  },
});
