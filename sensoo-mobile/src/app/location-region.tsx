import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LocationRegionScreen() {
  const router = useRouter();

  const [currentCity, setCurrentCity] = useState('Lagos');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  const handleChangeLocation = () => {
    Alert.alert(
      'Change Location',
      'Select a verified region in Nigeria:',
      [
        { text: 'Lagos, Nigeria', onPress: () => setCurrentCity('Lagos') },
        { text: 'Abuja (FCT)', onPress: () => setCurrentCity('Abuja') },
        { text: 'Port Harcourt (Rivers)', onPress: () => setCurrentCity('Port Harcourt') },
        { text: 'Eket (Akwa Ibom)', onPress: () => setCurrentCity('Eket') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
          <Text style={styles.centerTitle}>Location & Region</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Location Card */}
        <View style={styles.currentLocationCard}>
          <View style={styles.locIconBox}>
            <Image
              source={require('../../assets/icons/icon_profile_location.png')}
              style={styles.locIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.locTextCol}>
            <Text style={styles.locTitle}>Current Location</Text>
            <Text style={styles.locSubtitle}>{currentCity}, Nigeria</Text>
          </View>
          <TouchableOpacity
            style={styles.changeBtn}
            activeOpacity={0.75}
            onPress={handleChangeLocation}
          >
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Region Settings Section */}
        <Text style={styles.sectionHeading}>Region Settings</Text>

        {/* Country */}
        <Text style={styles.inputLabel}>Country</Text>
        <TouchableOpacity
          style={styles.selectorCard}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Country Selection', 'Sensoo is officially operating in Nigeria.')}
        >
          <View style={styles.countryLeft}>
            <Image
              source={require('../../assets/icons/flag_ng.png')}
              style={styles.countryFlag}
              resizeMode="contain"
            />
            <Text style={styles.countryName}>Nigeria</Text>
          </View>
          <Text style={styles.chevronDownText}>⌄</Text>
        </TouchableOpacity>

        {/* City (Optional) */}
        <Text style={styles.inputLabel}>City (Optional)</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.cityTextInput}
            value={currentCity}
            onChangeText={setCurrentCity}
            placeholder="Enter city name"
          />
        </View>

        {/* Use My Current Location Card with Switch */}
        <View style={styles.toggleCard}>
          <View style={styles.radarIconBox}>
            <Image
              source={require('../../assets/icons/icon_radar_green.png')}
              style={styles.radarIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Use my current location</Text>
            <Text style={styles.toggleSubtitle}>
              Allow Sensoo to detect your location for more accurate product verification.
            </Text>
          </View>
          <Switch
            value={useCurrentLocation}
            onValueChange={setUseCurrentLocation}
            trackColor={{ false: '#E2E8F0', true: '#10B981' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* Green Info Callout Banner */}
        <View style={styles.infoBannerCard}>
          <View style={styles.infoCircleBox}>
            <Image
              source={require('../../assets/icons/icon_profile_about.png')}
              style={[styles.infoIconImg, { tintColor: '#059669' }]}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.infoBannerText}>
            Your region helps us verify if a product is intended for your market, based on official distribution records.
          </Text>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCenteredNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backChevronText: {
    fontSize: 34,
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: 36,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerPlaceholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },

  /* Current Location Card */
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  locIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF7EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  locIcon: {
    width: 22,
    height: 22,
  },
  locTextCol: {
    flex: 1,
  },
  locTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  locSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  changeBtn: {
    backgroundColor: '#EAF7EE',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },

  /* Region Settings */
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  countryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryFlag: {
    width: 24,
    height: 18,
    borderRadius: 2,
  },
  countryName: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
  },
  chevronDownText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
  },
  cityTextInput: {
    fontSize: 14.5,
    color: '#111827',
    paddingVertical: 10,
  },

  /* Toggle Card */
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  radarIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF7EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radarIcon: {
    width: 22,
    height: 22,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  /* Info Banner Card */
  infoBannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 14,
    gap: 12,
  },
  infoCircleBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoIconImg: {
    width: 20,
    height: 20,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
    fontWeight: '500',
  },
});
