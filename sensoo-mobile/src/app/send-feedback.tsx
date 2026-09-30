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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SendFeedbackScreen() {
  const router = useRouter();

  const [feedbackType, setFeedbackType] = useState('Select an option');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [hasScreenshot, setHasScreenshot] = useState(false);

  const handleSelectFeedbackType = () => {
    Alert.alert(
      'Feedback Type',
      'Choose the category of your feedback:',
      [
        { text: 'Bug Report', onPress: () => setFeedbackType('Bug Report') },
        { text: 'Feature Request', onPress: () => setFeedbackType('Feature Request') },
        { text: 'Counterfeit Report Issue', onPress: () => setFeedbackType('Counterfeit Report Issue') },
        { text: 'General Feedback', onPress: () => setFeedbackType('General Feedback') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddScreenshot = () => {
    setHasScreenshot(true);
    Alert.alert('Screenshot Attached', 'Packaging photo / screenshot attached to feedback.');
  };

  const handleSendFeedback = () => {
    if (feedbackType === 'Select an option') {
      Alert.alert('Incomplete', 'Please select a feedback type.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Incomplete', 'Please enter a feedback subject.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Incomplete', 'Please enter your message.');
      return;
    }

    Alert.alert(
      'Feedback Sent',
      'Thank you! Your feedback has been submitted to the Sensoo safety and engineering team.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

      {/* Top Header */}
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
          <Text style={styles.centerTitle}>Send Feedback</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Illustration */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('../../assets/icons/feedback_hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Hero Headings */}
        <Text style={styles.heroTitle}>We'd love to hear from you</Text>
        <Text style={styles.heroSubtitle}>
          Your feedback helps us make Sensoo better.
        </Text>

        {/* Form: Feedback Type */}
        <Text style={styles.fieldLabel}>Feedback type</Text>
        <TouchableOpacity
          style={styles.dropdownBox}
          activeOpacity={0.75}
          onPress={handleSelectFeedbackType}
        >
          <Text
            style={[
              styles.dropdownText,
              feedbackType !== 'Select an option' && styles.dropdownTextSelected,
            ]}
          >
            {feedbackType}
          </Text>
          <Text style={styles.chevronDownText}>⌄</Text>
        </TouchableOpacity>

        {/* Form: Subject */}
        <Text style={styles.fieldLabel}>Subject</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            value={subject}
            onChangeText={setSubject}
            placeholder="Briefly describe your feedback"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Form: Message */}
        <Text style={styles.fieldLabel}>Your message</Text>
        <View style={styles.multilineBox}>
          <TextInput
            style={styles.multilineInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Add Screenshot Option */}
        <TouchableOpacity
          style={styles.addScreenshotBtn}
          activeOpacity={0.75}
          onPress={handleAddScreenshot}
        >
          <Text style={styles.addScreenshotText}>
            {hasScreenshot ? '✓  Screenshot attached' : '⊕  Add screenshot (optional)'}
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={handleSendFeedback}
        >
          <Text style={styles.submitBtnText}>Send Feedback</Text>
        </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 36,
  },
  heroWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  heroImage: {
    width: 140,
    height: 140,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 14.5,
    color: '#94A3B8',
  },
  dropdownTextSelected: {
    color: '#0F172A',
    fontWeight: '600',
  },
  chevronDownText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 14.5,
    color: '#0F172A',
  },
  multilineBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 110,
    marginBottom: 16,
  },
  multilineInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
  },
  addScreenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 24,
  },
  addScreenshotText: {
    fontSize: 13.5,
    color: '#475569',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
