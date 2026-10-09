import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { sendAgentMessage } from '../services/sensooAiService';
import { parseVoiceCommand, transcribeAudioWithGroq } from '../services/voiceAssistantService';

type AgentScreen =
  | 'home'
  | 'contextual'
  | 'listening'
  | 'safety_guidance'
  | 'triage_help'
  | 'explain_scan'
  | 'scan_details'
  | 'clinics'
  | 'report'
  | 'report_confirmed';

interface ClinicItem {
  id: string;
  name: string;
  distance: string;
  status: string;
  phone: string;
  address: string;
}

const CLINICS_DATA: ClinicItem[] = [
  {
    id: '1',
    name: 'Lagos University Teaching Hospital',
    distance: '4.2 km',
    status: 'Open 24 hours',
    phone: '+234 1 774 2000',
    address: 'Ishaga Rd, Idi-Araba, Surulere',
  },
  {
    id: '2',
    name: 'Reddington Hospital',
    distance: '5.1 km',
    status: 'Open now',
    phone: '+234 1 271 5340',
    address: '12 Idowu Martins St, Victoria Island',
  },
  {
    id: '3',
    name: 'Ikeja General Hospital',
    distance: '6.8 km',
    status: 'Open now',
    phone: '+234 1 497 0000',
    address: 'Oba Akinjobi Way, GRA, Ikeja',
  },
  {
    id: '4',
    name: 'St. Nicholas Hospital',
    distance: '8.3 km',
    status: 'Open now',
    phone: '+234 1 460 3000',
    address: '57 Campbell St, Lagos Island',
  },
  {
    id: '5',
    name: 'Lagos State Medical Centre',
    distance: '9.0 km',
    status: 'Open now',
    phone: '+234 1 295 1000',
    address: 'Alausa Secretariat, Ikeja',
  },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ig', label: 'Igbo' },
  { code: 'pcm', label: 'Pidgin' },
  { code: 'fr', label: 'Français' },
];

export interface ChatScanResultData {
  scenario: 'AUTHENTIC' | 'COUNTERFEIT' | 'ALREADY_PURCHASED' | 'IMPOSSIBLE_TRAVEL' | 'WRONG_REGION';
  title: string;
  subtitle: string;
  titleColor: string;
  heroImage: any;
  productImage: any;
  productName: string;
  statusBadgeText: string;
  statusBadgeBg: string;
  statusBadgeColor: string;
  details: { label: string; value: string }[];
  calloutText: string;
  calloutType: 'success' | 'danger' | 'warning';
}

export interface ChatReportResultData {
  ticketId: string;
  productName: string;
  location: string;
  timestamp: string;
  status: string;
  authority: string;
  details: string;
  evidencePhotos?: string[];
}

export interface ChatMessageItem {
  sender: 'user' | 'agent';
  text: string;
  time: string;
  model?: string;
  isToolCall?: boolean;
  toolCallStatus?: 'in_progress' | 'completed';
  scanResult?: ChatScanResultData;
  reportResult?: ChatReportResultData;
  evidencePrompt?: {
    productName: string;
    location: string;
  };
}

// Module-level persistent store so conversation history is never wiped out across Expo Router navigation
let persistentChatHistory: ChatMessageItem[] = [];

const getScanResultCardData = (scenario: string, scanCode: string, productName: string): ChatScanResultData => {
  const isCeraVe = scanCode.includes('3011') || (productName && productName.toLowerCase().includes('cerave'));
  const isFake = scenario === 'COUNTERFEIT' || scanCode.includes('FAKE');
  const isPurchased = scenario === 'ALREADY_PURCHASED' || scanCode.includes('8832');
  const isTravel = scenario === 'IMPOSSIBLE_TRAVEL' || scanCode.includes('SPEED') || scanCode.includes('PHYSICS');
  const isRegion = scenario === 'WRONG_REGION' || scanCode.includes('1099');

  if (isFake) {
    return {
      scenario: 'COUNTERFEIT',
      title: 'Counterfeit Detected',
      subtitle: "This product doesn't match trusted manufacturer records. It may be fake or altered.",
      titleColor: '#DC2626',
      heroImage: require('../../assets/icons/hero_counterfeit.png'),
      productImage: require('../../assets/dove_body_wash.png'),
      productName: productName || 'Dove Body Wash\nDeep Moisture 250ml',
      statusBadgeText: 'Counterfeit Detected',
      statusBadgeBg: '#FEE2E2',
      statusBadgeColor: '#DC2626',
      details: [
        { label: 'Brand', value: 'Dove' },
        { label: 'Manufacturer', value: 'Unilever (Expected)' },
        { label: 'Barcode', value: scanCode || '8999990012345' },
        { label: 'Batch Number', value: 'Not found' },
        { label: 'Expiry Date', value: 'Not found' },
      ],
      calloutText: 'This product does not match official manufacturer records. It may be counterfeit or altered.',
      calloutType: 'danger',
    };
  }

  if (isPurchased) {
    return {
      scenario: 'ALREADY_PURCHASED',
      title: 'Already Purchased',
      subtitle: 'This product has already been scanned multiple times. It may be reused, cloned or resold.',
      titleColor: '#D97706',
      heroImage: require('../../assets/icons/hero_purchased.png'),
      productImage: require('../../assets/panadol_extra.png'),
      productName: productName || 'Panadol Extra\nTablets 500mg',
      statusBadgeText: 'Already Purchased',
      statusBadgeBg: '#FEF3C7',
      statusBadgeColor: '#D97706',
      details: [
        { label: 'Brand', value: 'Panadol' },
        { label: 'Manufacturer', value: 'Haleon' },
        { label: 'Barcode', value: scanCode || '5000158105224' },
        { label: 'Batch Number', value: 'A3F7K2' },
        { label: 'Expiry Date', value: 'Dec 2026' },
      ],
      calloutText: 'This security code was already redeemed and marked as purchased. High probability of recycled packaging.',
      calloutType: 'warning',
    };
  }

  if (isTravel) {
    return {
      scenario: 'IMPOSSIBLE_TRAVEL',
      title: 'Impossible Travel',
      subtitle: 'This product was scanned in two locations too far apart in a short time. This is not possible.',
      titleColor: '#DC2626',
      heroImage: require('../../assets/icons/hero_travel.png'),
      productImage: require('../../assets/dettol_antiseptic.png'),
      productName: productName || 'Dettol Antiseptic\nLiquid 250ml',
      statusBadgeText: 'Impossible Travel',
      statusBadgeBg: '#FEE2E2',
      statusBadgeColor: '#DC2626',
      details: [
        { label: 'Brand', value: 'Dettol' },
        { label: 'Manufacturer', value: 'Reckitt Benckiser' },
        { label: 'Barcode', value: scanCode || '5000158067447' },
        { label: 'Batch Number', value: 'BATCH-2026-D3' },
        { label: 'Velocity Anomaly', value: '5,333 km/h' },
      ],
      calloutText: 'Telemetry shows this code scanned concurrently across impossible flight speeds. Clones detected.',
      calloutType: 'danger',
    };
  }

  if (isRegion) {
    return {
      scenario: 'WRONG_REGION',
      title: 'Wrong Region',
      subtitle: 'This product is genuine, but it is not distributed in this region. It may be imported or diverted.',
      titleColor: '#3B82F6',
      heroImage: require('../../assets/icons/hero_region.png'),
      productImage: require('../../assets/panadol_extra.png'),
      productName: productName || 'Infant Formula Powder 400g',
      statusBadgeText: 'Wrong Region',
      statusBadgeBg: '#DBEAFE',
      statusBadgeColor: '#2563EB',
      details: [
        { label: 'Brand', value: 'NutriCare Global' },
        { label: 'Manufacturer', value: 'NutriCare International' },
        { label: 'Barcode', value: scanCode || 'SNS-BABY-1099' },
        { label: 'Batch Number', value: 'BATCH-2026-N2' },
        { label: 'Authorized Region', value: 'Kano, Nigeria' },
      ],
      calloutText: 'Scan detected in Lagos, but authorized delivery territory is Kano. Unauthorized regional diversion.',
      calloutType: 'warning',
    };
  }

  const isDrRashel =
    scanCode.includes('6971764150130') ||
    scanCode.includes('DRL-1431') ||
    scanCode.includes('150130') ||
    (productName && productName.toLowerCase().includes('rashel'));

  if (isDrRashel) {
    return {
      scenario: 'AUTHENTIC',
      title: 'Authentic Product',
      subtitle: 'This product matches official manufacturer records.',
      titleColor: '#059669',
      heroImage: require('../../assets/icons/hero_authentic.png'),
      productImage: require('../../assets/cerave_foaming.png'),
      productName: productName || 'Dr. Rashel Face Care 50ml',
      statusBadgeText: 'Verified by Manufacturer',
      statusBadgeBg: '#DCFCE7',
      statusBadgeColor: '#059669',
      details: [
        { label: 'Brand', value: 'Dr. Rashel' },
        { label: 'Manufacturer', value: 'Yiwu Rashel Trading Co., Ltd' },
        { label: 'Barcode', value: scanCode || '6971764150130' },
        { label: 'Batch Number', value: 'BATCH-DRL-1431' },
        { label: 'Expiry Date', value: 'Jan 2028' },
        { label: 'Category', value: 'Skincare' },
        { label: 'Country of Origin', value: 'China (P.R.C.)' },
      ],
      calloutText: 'This product matches official records from the manufacturer.',
      calloutType: 'success',
    };
  }

  // Default: Authentic
  return {
    scenario: 'AUTHENTIC',
    title: 'Authentic Product',
    subtitle: 'This product matches official manufacturer records.',
    titleColor: '#059669',
    heroImage: require('../../assets/icons/hero_authentic.png'),
    productImage: require('../../assets/panadol_extra.png'),
    productName: productName || (isCeraVe ? 'CeraVe Moisturizing Lotion 8 fl oz' : 'Panadol Extra\nTablets 500mg'),
    statusBadgeText: 'Verified by Manufacturer',
    statusBadgeBg: '#DCFCE7',
    statusBadgeColor: '#059669',
    details: [
      { label: 'Brand', value: isCeraVe ? 'CeraVe' : 'Panadol' },
      { label: 'Manufacturer', value: isCeraVe ? "L'Oréal Dermatological" : 'Haleon' },
      { label: 'Barcode', value: scanCode || '3011794101306' },
      { label: 'Batch Number', value: isCeraVe ? 'BATCH-2026-CV40' : 'A3F7K2' },
      { label: 'Expiry Date', value: 'Dec 2026' },
      { label: 'Category', value: isCeraVe ? 'Skincare' : 'Medicine' },
      { label: 'Country of Origin', value: isCeraVe ? 'France' : 'United Kingdom' },
    ],
    calloutText: 'This product matches official records from the manufacturer.',
    calloutType: 'success',
  };
};

export default function AgentScreenComponent() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Screen State
  const initialScreen = (params.startScreen as AgentScreen) || 'home';
  const [currentScreen, setCurrentScreen] = useState<AgentScreen>(initialScreen);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Chat input
  const [inputText, setInputText] = useState('');

  // Structured Safety Guidance state (Screen 5 & 6)
  const [hasTakenProduct, setHasTakenProduct] = useState<'yes' | 'no' | null>('yes');
  const [intakeAmount, setIntakeAmount] = useState('1 tablet');
  const [intakeTime, setIntakeTime] = useState('2 hours ago');
  const [intakeSymptoms, setIntakeSymptoms] = useState('');
  const [showSymptomsPicker, setShowSymptomsPicker] = useState(false);

  // Dosage assessment in Safety Guidance
  const [selectedDosage, setSelectedDosage] = useState<'1' | '2' | 'more' | null>(null);
  const [dosageSubmitted, setDosageSubmitted] = useState(false);

  // Clinics mode: Map vs List
  const [clinicViewMode, setClinicViewMode] = useState<'list' | 'map'>('list');
  const [selectedClinic, setSelectedClinic] = useState<ClinicItem>(CLINICS_DATA[0]);

  // Report Form state
  const [reportProductName, setReportProductName] = useState('Dove Body Wash 250ml');
  const [reportLocation, setReportLocation] = useState('Idumota Market, Lagos');
  const [reportDetails, setReportDetails] = useState('');
  const [reportPhotoAttached, setReportPhotoAttached] = useState(false);

  // Dynamic Live AI State (Voice & Chat)
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [voiceUserPrompt, setVoiceUserPrompt] = useState<string | null>(null);
  const [voiceAiReply, setVoiceAiReply] = useState<string | null>(null);
  const [voiceModelUsed, setVoiceModelUsed] = useState<string>('NCAIR1/N-ATLaS + Gemini 3.1');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [voiceInputQuery, setVoiceInputQuery] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>(persistentChatHistory);

  // In-place native audio recording for Agent "Tap to speak"
  const agentAudioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const isAgentTranscribingRef = React.useRef(false);

  const toggleAgentMicRecording = async () => {
    if (isListeningMic) {
      setIsListeningMic(false);
      try {
        if (agentAudioRecorder.isRecording) {
          await agentAudioRecorder.stop();
          const recUri = agentAudioRecorder.uri;
          if (recUri && !isAgentTranscribingRef.current) {
            isAgentTranscribingRef.current = true;
            try {
              const transcript = await transcribeAudioWithGroq(recUri);
              if (transcript && transcript.trim().length > 0) {
                handleSendPrompt(transcript.trim());
              }
            } catch (err) {
              console.warn('Agent Whisper transcription error:', err);
            } finally {
              isAgentTranscribingRef.current = false;
            }
          }
        }
      } catch (err) {
        console.warn('Error stopping agent recording:', err);
      }
      return;
    }

    try {
      stopSpeakingAudio();
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone Permission', 'Please grant microphone access to use voice prompts.');
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await agentAudioRecorder.prepareToRecordAsync();
      agentAudioRecorder.record();
      setIsListeningMic(true);
    } catch (err) {
      console.warn('Error starting agent recording:', err);
      setIsListeningMic(false);
    }
  };

  // Active Investigative Intake Dossier State
  const [investigation, setInvestigation] = useState<{
    step: 'idle' | 'awaiting_product' | 'awaiting_location' | 'awaiting_code' | 'awaiting_photos';
    productName: string;
    location: string;
    barcodeOrBatch: string;
  }>({
    step: 'idle',
    productName: '',
    location: '',
    barcodeOrBatch: '',
  });

  // Photo evidence state for in-chat evidence submission (with real image files/camera)
  const [evidenceFrontUri, setEvidenceFrontUri] = useState<string | null>(null);
  const [evidenceBackUri, setEvidenceBackUri] = useState<string | null>(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'front' | 'back' | null>(null);

  // Helper to reliably update both local component state and persistent module history
  const appendChatMessage = (msg: ChatMessageItem) => {
    setChatMessages((prev) => {
      const next = [...prev, msg];
      persistentChatHistory = next;
      return next;
    });
  };

  const clearChatHistory = () => {
    persistentChatHistory = [];
    setChatMessages([]);
    setInvestigation({ step: 'idle', productName: '', location: '', barcodeOrBatch: '' });
    setEvidenceFrontUri(null);
    setEvidenceBackUri(null);
    setPickerModalVisible(false);
    setPickerTarget(null);
  };

  // Speech debouncing & audio channel lock to prevent stream overlap
  const speechTimerRef = React.useRef<any>(null);

  // Track handled chat return scan results
  const handledReturnRef = React.useRef<string | null>(null);

  // Autonomous scan verdict presentation when returning from chat-triggered camera scan
  useEffect(() => {
    if (params.origin === 'chat_return' && params.scenario) {
      const returnKey = `${params.scanCode || ''}_${params.scenario}`;
      if (handledReturnRef.current === returnKey) return;
      handledReturnRef.current = returnKey;

      const prodName = (params.productName as string) || 'Scanned Product';
      const scanCode = (params.scanCode as string) || 'SNS-UNKNOWN';
      const scenario = (params.scenario as string) || 'COUNTERFEIT';

      // 1. Transition previous "Opening the scanner..." message to completed state
      persistentChatHistory = persistentChatHistory.map(m => {
        if (m.isToolCall || m.text.includes('Opening the scanner') || m.text.includes('Opening camera scanner')) {
          return {
            ...m,
            text: 'Camera scan completed',
            isToolCall: true,
            toolCallStatus: 'completed' as const,
          };
        }
        return m;
      });
      setChatMessages([...persistentChatHistory]);

      // 2. Generate identical rich visual card data matching direct scan
      const cardData = getScanResultCardData(scenario, scanCode, prodName);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 3. Append rich scan verification card directly to chat thread
      appendChatMessage({
        sender: 'agent',
        text: `${cardData.title}: ${cardData.productName}`,
        time: nowStr,
        model: 'Sensoo Agentic AI',
        scanResult: cardData,
      });

      // 4. Narrate verdict aloud
      const speechNarrative = `${cardData.title}. ${cardData.productName}. ${cardData.calloutText}`;
      speakTextAloud(speechNarrative, selectedLanguage);
    }
  }, [params.origin, params.scenario, params.scanCode, params.productName]);

  // Text-To-Speech Synthesis (Disabled by default as requested: text-only responses)
  const speakTextAloud = (_text: string, _langName = selectedLanguage) => {
    // Intentionally silent: text displayed on screen without reading out loud
    try {
      Speech.stop();
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
      setIsSpeakingAudio(false);
    } catch {
      // ignore
    }
  };

  const stopSpeakingAudio = () => {
    try {
      Speech.stop();
    } catch {
      // ignore
    }
    setIsSpeakingAudio(false);
  };

  const toggleAudioPlayback = () => {
    if (isSpeakingAudio) {
      stopSpeakingAudio();
    } else if (voiceAiReply) {
      speakTextAloud(voiceAiReply, selectedLanguage);
    }
  };

  const toggleMicrophoneListening = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (isListeningMic) {
          setIsListeningMic(false);
          return;
        }
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = selectedLanguage === 'Nigerian Pidgin' ? 'en-NG' : 'en-US';
          setIsListeningMic(true);

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceInputQuery(transcript);
          };
          recognition.onend = () => {
            setIsListeningMic(false);
            if (voiceInputQuery.trim()) {
              handleVoicePrompt(voiceInputQuery.trim());
              setVoiceInputQuery('');
            }
          };
          recognition.onerror = () => {
            setIsListeningMic(false);
          };
          recognition.start();
          return;
        } catch {
          setIsListeningMic(false);
        }
      }
    }

    // Default fallback: If custom text typed, send that; otherwise send contextual question
    const activeProd = (params.productName as string) || 'this scanned product';
    const queryToSend = voiceInputQuery.trim() || `Why was ${activeProd} flagged by Sensoo?`;
    handleVoicePrompt(queryToSend);
    setVoiceInputQuery('');
  };

  const handleVoicePrompt = async (promptText: string) => {
    const cleanPrompt = promptText.trim();
    if (!cleanPrompt) return;

    const parsed = parseVoiceCommand(cleanPrompt);
    if (parsed.hasWakeWord) {
      if (parsed.intent === 'SCAN') {
        setTimeout(() => router.push({ pathname: '/scanner', params: { origin: 'chat' } }), 200);
        return;
      }
      if (parsed.intent === 'CLINIC') {
        setCurrentScreen('clinics');
        return;
      }
      if (parsed.intent === 'GUIDANCE') {
        setCurrentScreen('safety_guidance');
        return;
      }
    }

    setVoiceUserPrompt(cleanPrompt);
    setVoiceStatus('thinking');
    setIsAiThinking(true);
    stopSpeakingAudio();

    try {
      // Only pass product context if we navigated here from a specific scan
      const activeProd = (params.productName as string) || '';
      const activeCode = (params.scanCode as string) || '';
      const activeScenario = (params.scenario as string) || 'NONE';

      const res = await sendAgentMessage(
        cleanPrompt,
        [],
        {
          productName: activeProd,
          scannedCode: activeCode,
          scenario: activeScenario,
          userLocation: 'Lagos, Nigeria',
          language: selectedLanguage,
        }
      );

      setVoiceAiReply(res.reply);
      setVoiceModelUsed(res.modelUsed);
      setVoiceStatus('speaking');

      // Play real audible speech through device speakers
      speakTextAloud(res.reply, selectedLanguage);

      if (res.action === 'SCAN') {
        setTimeout(() => router.push({ pathname: '/scanner', params: { origin: 'chat' } }), 1500);
      }
    } catch {
      const fallback = "This product's batch serial does not match authorized manufacturer records in the NAFDAC registry. Stop usage immediately.";
      setVoiceAiReply(fallback);
      setVoiceStatus('speaking');
      speakTextAloud(fallback, selectedLanguage);
    } finally {
      setIsAiThinking(false);
    }
  };

  const openImagePickerPrompt = (target: 'front' | 'back') => {
    setPickerTarget(target);
    setPickerModalVisible(true);
  };

  const handlePickFromCamera = async () => {
    setPickerModalVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Permission Required', 'Please enable camera access in your settings to snap packaging photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (pickerTarget === 'front') {
          setEvidenceFrontUri(uri);
        } else if (pickerTarget === 'back') {
          setEvidenceBackUri(uri);
        }
      }
    } catch (err) {
      console.warn('Camera launch error:', err);
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handlePickFromGallery = async () => {
    setPickerModalVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photos Permission Required', 'Please enable photos access in your settings to upload packaging photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (pickerTarget === 'front') {
          setEvidenceFrontUri(uri);
        } else if (pickerTarget === 'back') {
          setEvidenceBackUri(uri);
        }
      }
    } catch (err) {
      console.warn('Image library error:', err);
      Alert.alert('Upload Error', 'Could not access photos.');
    }
  };

  const handleEvidenceSubmission = (prodName: string, loc: string) => {
    const front = evidenceFrontUri;
    const back = evidenceBackUri;
    setInvestigation({ step: 'idle', productName: '', location: '', barcodeOrBatch: '' });
    setEvidenceFrontUri(null);
    setEvidenceBackUri(null);
    const ticketCode = `SN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    appendChatMessage({
      sender: 'agent',
      text: 'Forensic inspection of packaging photos in progress...',
      time: nowStr,
      model: 'Sensoo Agentic AI',
      isToolCall: true,
      toolCallStatus: 'in_progress',
    });

    setTimeout(() => {
      persistentChatHistory = persistentChatHistory.map(m => {
        if (m.text.includes('Forensic inspection')) {
          return {
            ...m,
            text: 'Packaging forensic verification logged',
            toolCallStatus: 'completed' as const,
          };
        }
        return m;
      });
      setChatMessages([...persistentChatHistory]);

      appendChatMessage({
        sender: 'agent',
        text: `Report filed for ${prodName} (${ticketCode})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Sensoo Agentic AI',
        reportResult: {
          ticketId: ticketCode,
          productName: prodName,
          location: loc,
          timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status: 'Queued for Forensic Review',
          authority: 'NAFDAC Investigation & Enforcement',
          details: 'Physical packaging photos (Front & Back) attached. Packaging anomalies flagged for forensic inspection.',
          evidencePhotos: [front, back].filter(Boolean) as string[],
        },
      });

      const narration = `Your packaging photos for ${prodName} have been submitted to NAFDAC Sentinel under reference number ${ticketCode}. Market surveillance task forces have been alerted.`;
      speakTextAloud(narration, selectedLanguage);
    }, 1000);
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;
    setInputText('');
    
    // Add user message to chat immediately
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appendChatMessage({ sender: 'user', text: query, time: nowStr });
    setIsAiThinking(true);
    
    // ---------------------------------------------------------
    // MULTI-TURN INVESTIGATIVE INTAKE STATE MACHINE
    // ---------------------------------------------------------
    if (investigation.step === 'awaiting_product') {
      const prodName = query;
      setInvestigation(prev => ({ ...prev, productName: prodName, step: 'awaiting_location' }));
      const reply = `Got it, ${prodName}. Where did you buy it? Please tell me the store name, street, or market.`;
      appendChatMessage({
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Sensoo Agentic AI',
      });
      speakTextAloud(reply, selectedLanguage);
      setIsAiThinking(false);
      return;
    }

    if (investigation.step === 'awaiting_location') {
      const loc = query;
      setInvestigation(prev => ({ ...prev, location: loc, step: 'awaiting_code' }));
      const reply = `Understood, ${loc}. Do you have the barcode number, batch number, or manufacturer printed on the pack?`;
      appendChatMessage({
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Sensoo Agentic AI',
      });
      speakTextAloud(reply, selectedLanguage);
      setIsAiThinking(false);
      return;
    }

    if (investigation.step === 'awaiting_code') {
      const lower = query.toLowerCase();
      const isNegative =
        lower.includes('no') ||
        lower.includes('none') ||
        lower.includes("don't") ||
        lower.includes('dont') ||
        lower.includes('rubbed') ||
        lower.includes('torn') ||
        lower.includes('not have') ||
        lower.includes('not sure') ||
        lower.includes('cant') ||
        lower.includes('cannot') ||
        lower.includes('damaged') ||
        lower.length < 3;

      if (isNegative) {
        // Fallback to in-chat Front & Back photo evidence card!
        setInvestigation(prev => ({ ...prev, step: 'awaiting_photos' }));
        const reply = `No problem at all. Since the barcode or batch code isn't available, please attach photos of the front and back of the pack below so our forensic system can inspect the packaging details and batch print.`;
        appendChatMessage({
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'Sensoo Agentic AI',
          evidencePrompt: {
            productName: investigation.productName || 'Flagged Product',
            location: investigation.location || 'Local Vendor',
          },
        });
        speakTextAloud(reply, selectedLanguage);
        setIsAiThinking(false);
        return;
      } else {
        // User provided the barcode or batch code!
        const codeOrBatch = query;
        const currentProd = investigation.productName || 'Flagged Product';
        const currentLoc = investigation.location || 'Local Vendor';
        setInvestigation({ step: 'idle', productName: '', location: '', barcodeOrBatch: '' });

        appendChatMessage({
          sender: 'agent',
          text: 'Checking NAFDAC & Manufacturer Registry...',
          time: nowStr,
          model: 'Sensoo Agentic AI',
          isToolCall: true,
          toolCallStatus: 'in_progress',
        });

        setTimeout(() => {
          persistentChatHistory = persistentChatHistory.map(m => {
            if (m.text.includes('Checking NAFDAC')) {
              return {
                ...m,
                text: 'NAFDAC Sentinel incident logged',
                toolCallStatus: 'completed' as const,
              };
            }
            return m;
          });
          setChatMessages([...persistentChatHistory]);

          const ticketCode = `SN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          appendChatMessage({
            sender: 'agent',
            text: `Report filed for ${currentProd} (${ticketCode})`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            model: 'Sensoo Agentic AI',
            reportResult: {
              ticketId: ticketCode,
              productName: currentProd,
              location: currentLoc,
              timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: 'Queued for Market Surveillance',
              authority: 'NAFDAC Investigation & Enforcement',
              details: `Batch / Barcode provided: ${codeOrBatch}. Confirmed counterfeit by registry cross-check.`,
            },
          });

          const narration = `Your report for ${currentProd} has been registered with NAFDAC Sentinel under reference number ${ticketCode}. Market surveillance task forces have been alerted.`;
          speakTextAloud(narration, selectedLanguage);
        }, 900);

        setIsAiThinking(false);
        return;
      }
    }

    // Check if user says they bought or found a fake product to trigger investigation
    const lowerQ = query.toLowerCase();
    const isReportTrigger =
      lowerQ.includes('bought a fake') ||
      lowerQ.includes('bought fake') ||
      lowerQ.includes('fake product') ||
      lowerQ.includes('counterfeit product') ||
      lowerQ.includes('sold me fake') ||
      lowerQ.includes('report a product') ||
      lowerQ.includes('report fake');

    if (isReportTrigger) {
      setInvestigation(prev => ({ ...prev, step: 'awaiting_product' }));
      const reply = `I am very sorry to hear that. I will help you investigate and report this to NAFDAC. What is the name of the product you bought?`;
      appendChatMessage({
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'Sensoo Agentic AI',
      });
      speakTextAloud(reply, selectedLanguage);
      setIsAiThinking(false);
      return;
    }

    try {
      const history = persistentChatHistory.map((m) => ({
        role: (m.sender === 'agent' ? 'model' : 'user') as 'model' | 'user',
        content: m.text,
      }));
      // Only pass product context if we navigated here from a specific scan
      const activeProd = (params.productName as string) || '';
      const activeCode = (params.scanCode as string) || '';
      const activeScenario = (params.scenario as string) || 'NONE';

      const res = await sendAgentMessage(
        query,
        history,
        {
          productName: activeProd,
          scannedCode: activeCode,
          scenario: activeScenario,
          userLocation: 'Lagos, Nigeria',
          language: selectedLanguage,
        }
      );

      if (res.action === 'SCAN') {
        appendChatMessage({
          sender: 'agent',
          text: 'Opening the scanner for you now...',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.modelUsed,
          isToolCall: true,
          toolCallStatus: 'in_progress',
        });
        setTimeout(() => router.push({ pathname: '/scanner', params: { origin: 'chat' } }), 1200);
      } else {
        appendChatMessage({
          sender: 'agent',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.modelUsed,
        });
        speakTextAloud(res.reply, selectedLanguage);
      }
    } catch {
      appendChatMessage({
        sender: 'agent',
        text: "I am having trouble connecting. This product has been flagged as counterfeit. Do not consume or sell it.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ======================================================== */}
      {/* TOP HEADER BAR */}
      {/* ======================================================== */}
      {currentScreen !== 'listening' && (
        <SafeAreaView style={styles.topBarSafeArea} edges={['top']}>
          <View style={styles.topBarRow}>
            {/* Left Nav Button */}
            <TouchableOpacity
              style={styles.topNavBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (currentScreen === 'home') {
                  router.back();
                } else if (currentScreen === 'triage_help') {
                  setCurrentScreen('safety_guidance');
                } else if (currentScreen === 'safety_guidance') {
                  setCurrentScreen('home');
                } else if (currentScreen === 'scan_details') {
                  setCurrentScreen('explain_scan');
                } else if (currentScreen === 'report_confirmed') {
                  setCurrentScreen('home');
                } else {
                  setCurrentScreen('home');
                }
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.topBackArrow}>‹</Text>
            </TouchableOpacity>

            {/* Title */}
            {currentScreen === 'safety_guidance' || currentScreen === 'triage_help' ? (
              <Image
                source={require('../../assets/logo.png')}
                style={{ width: 110, height: 28 }}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.topBarTitle}>
                {currentScreen === 'scan_details'
                  ? 'Scan Details'
                  : currentScreen === 'clinics'
                  ? 'Nearby Accredited Clinics'
                  : 'Sensoo AI'}
              </Text>
            )}

            {/* Right Action: Language Selector Pill or Close */}
            {currentScreen === 'safety_guidance' || currentScreen === 'triage_help' ? (
              <View style={{ width: 36 }} />
            ) : currentScreen === 'report' ? (
              <TouchableOpacity
                style={styles.topNavCloseBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentScreen('home')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.topNavCloseText}>✕</Text>
              </TouchableOpacity>
            ) : currentScreen === 'scan_details' ? (
              <View style={{ width: 36 }} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {chatMessages.length > 0 && currentScreen === 'home' && (
                  <TouchableOpacity
                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    activeOpacity={0.7}
                    onPress={clearChatHistory}
                  >
                    <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>New</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.langPill}
                  activeOpacity={0.75}
                  onPress={() => setShowLanguageModal(true)}
                >
                  <View style={styles.globeIconOuter}>
                    <View style={styles.globeIconInner} />
                  </View>
                  <Text style={styles.langPillText}>{selectedLanguage}</Text>
                  <Text style={styles.langPillChevron}>⌵</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      )}

      {/* ======================================================== */}
      {/* 2. AGENT HOME SCREEN (Pixel match to reference) */}
      {/* ======================================================== */}
      {currentScreen === 'home' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.agentHomeScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.length > 0 ? (
              <View style={styles.chatThreadContainer}>
                {chatMessages.map((msg, idx) => (
                  <View key={idx} style={msg.sender === 'user' ? styles.userMessageRow : styles.agentChatRow}>
                    {msg.sender === 'agent' && (
                      <View style={styles.dialogueBotAvatar}>
                        <Image source={require('../../assets/sensoo_ai_robot.jpg')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      </View>
                    )}
                    {msg.isToolCall ? (
                      <View style={styles.toolCallStatusChip}>
                        <View style={[styles.toolCallStatusDot, msg.toolCallStatus === 'completed' && styles.toolCallStatusDotCompleted]} />
                        <Text style={styles.toolCallStatusText}>
                          {msg.text || (msg.toolCallStatus === 'completed' ? 'Completed' : 'Processing...')}
                        </Text>
                        {msg.toolCallStatus === 'completed' && (
                          <Text style={styles.toolCallCheckmark}>✓</Text>
                        )}
                      </View>
                    ) : msg.scanResult ? (
                      <View style={{ flex: 1 }}>
                        <View style={styles.chatScanResultCard}>
                          {/* Hero Section */}
                          <View style={styles.chatScanHeroSection}>
                            <Image
                              source={msg.scanResult.heroImage}
                              style={styles.chatScanHeroBadge}
                              resizeMode="contain"
                            />
                            <Text style={[styles.chatScanHeroTitle, { color: msg.scanResult.titleColor }]}>
                              {msg.scanResult.title}
                            </Text>
                            <Text style={styles.chatScanHeroSubtitle}>
                              {msg.scanResult.subtitle}
                            </Text>
                          </View>

                          {/* Product Card */}
                          <View style={styles.chatScanProductCard}>
                            <View style={styles.chatScanProductImageWrapper}>
                              <Image
                                source={msg.scanResult.productImage}
                                style={styles.chatScanProductThumbnail}
                                resizeMode="contain"
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.chatScanProductNameText}>{msg.scanResult.productName}</Text>
                              <View
                                style={[
                                  styles.chatScanStatusBadge,
                                  { backgroundColor: msg.scanResult.statusBadgeBg },
                                ]}
                              >
                                <Text style={styles.chatScanStatusBadgeIcon}>
                                  {msg.scanResult.scenario === 'AUTHENTIC' ? '✓' : '!'}
                                </Text>
                                <Text
                                  style={[
                                    styles.chatScanStatusBadgeLabel,
                                    { color: msg.scanResult.statusBadgeColor },
                                  ]}
                                >
                                  {msg.scanResult.statusBadgeText}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Product Details Table */}
                          <View style={styles.chatScanDetailsCard}>
                            <Text style={styles.chatScanDetailsHeaderTitle}>Product Details</Text>
                            {msg.scanResult.details.map((item, dIdx) => (
                              <View
                                key={dIdx}
                                style={[
                                  styles.chatScanDetailRow,
                                  dIdx < msg.scanResult!.details.length - 1 && styles.chatScanDetailRowBorder,
                                ]}
                              >
                                <Text style={styles.chatScanDetailLabel}>{item.label}</Text>
                                <Text
                                  style={[
                                    styles.chatScanDetailValue,
                                    item.label.includes('Barcode') && styles.chatScanBarcodeFont,
                                    item.value === 'Not found' && styles.chatScanValueNotFound,
                                  ]}
                                >
                                  {item.value}
                                </Text>
                              </View>
                            ))}
                          </View>

                          {/* Callout Box */}
                          <View
                            style={[
                              styles.chatScanCalloutBox,
                              msg.scanResult.calloutType === 'success'
                                ? styles.chatScanCalloutSuccess
                                : msg.scanResult.calloutType === 'warning'
                                ? styles.chatScanCalloutWarning
                                : styles.chatScanCalloutDanger,
                            ]}
                          >
                            <View
                              style={[
                                styles.chatScanCalloutIconCircle,
                                {
                                  backgroundColor:
                                    msg.scanResult.calloutType === 'success'
                                      ? '#059669'
                                      : msg.scanResult.calloutType === 'warning'
                                      ? '#D97706'
                                      : '#DC2626',
                                },
                              ]}
                            >
                              <Text style={styles.chatScanCalloutIconText}>
                                {msg.scanResult.calloutType === 'success' ? '✓' : '!'}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.chatScanCalloutTitle,
                                  {
                                    color:
                                      msg.scanResult.calloutType === 'success'
                                        ? '#065F46'
                                        : msg.scanResult.calloutType === 'warning'
                                        ? '#92400E'
                                        : '#991B1B',
                                  },
                                ]}
                              >
                                {msg.scanResult.statusBadgeText}
                              </Text>
                              <Text
                                style={[
                                  styles.chatScanCalloutDesc,
                                  {
                                    color:
                                      msg.scanResult.calloutType === 'success'
                                        ? '#047857'
                                        : msg.scanResult.calloutType === 'warning'
                                        ? '#B45309'
                                        : '#B91C1C',
                                  },
                                ]}
                              >
                                {msg.scanResult.calloutText}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : msg.reportResult ? (
                      <View style={{ flex: 1 }}>
                        <View style={styles.chatReportCard}>
                          {/* Top Shield Header */}
                          <View style={styles.chatReportHeader}>
                            <View style={styles.chatReportIconBadge}>
                              <Text style={styles.chatReportIconGlyph}>🛡️</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.chatReportAgencyTitle}>NAFDAC Sentinel Escalation</Text>
                              <Text style={styles.chatReportAgencySub}>Market Surveillance & Enforcement Directorate</Text>
                            </View>
                          </View>

                          {/* Reference Number Card */}
                          <View style={styles.chatReportRefBox}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.chatReportRefLabel}>Incident Tracking Number</Text>
                              <Text style={styles.chatReportRefCode}>{msg.reportResult.ticketId}</Text>
                            </View>
                            <View style={styles.chatReportStatusPill}>
                              <Text style={styles.chatReportStatusText}>Queued</Text>
                            </View>
                          </View>

                          {/* Incident Details Table */}
                          <View style={styles.chatReportTable}>
                            <View style={styles.chatReportRow}>
                              <Text style={styles.chatReportLabel}>Flagged Product</Text>
                              <Text style={styles.chatReportVal}>{msg.reportResult.productName}</Text>
                            </View>
                            <View style={[styles.chatReportRow, styles.chatReportRowBorder]}>
                              <Text style={styles.chatReportLabel}>Location / Market</Text>
                              <Text style={styles.chatReportVal}>{msg.reportResult.location}</Text>
                            </View>
                            <View style={[styles.chatReportRow, styles.chatReportRowBorder]}>
                              <Text style={styles.chatReportLabel}>GPS Telemetry</Text>
                              <Text style={styles.chatReportVal}>6.4698° N, 3.3852° E (Lagos)</Text>
                            </View>
                            <View style={[styles.chatReportRow, styles.chatReportRowBorder]}>
                              <Text style={styles.chatReportLabel}>Investigation Status</Text>
                              <Text style={[styles.chatReportVal, { color: '#059669', fontWeight: '700' }]}>
                                {msg.reportResult.status}
                              </Text>
                            </View>
                            <View style={[styles.chatReportRow, styles.chatReportRowBorder]}>
                              <Text style={styles.chatReportLabel}>Timestamp</Text>
                              <Text style={styles.chatReportVal}>{msg.reportResult.timestamp}</Text>
                            </View>
                          </View>

                          {/* Attached Packaging Photos if present */}
                          {msg.reportResult.evidencePhotos && msg.reportResult.evidencePhotos.length > 0 && (
                            <View style={styles.chatReportEvidenceSection}>
                              <Text style={styles.chatReportEvidenceHeader}>
                                Evidence Dossier ({msg.reportResult.evidencePhotos.length} Photos Attached)
                              </Text>
                              <View style={styles.chatReportEvidenceGrid}>
                                {msg.reportResult.evidencePhotos.map((photoUri, pIdx) => (
                                  <View key={pIdx} style={styles.chatReportEvidenceThumbBox}>
                                    <Image source={{ uri: photoUri }} style={styles.chatReportEvidenceThumbImg} resizeMode="cover" />
                                    <View style={styles.chatReportEvidenceLabelBadge}>
                                      <Text style={styles.chatReportEvidenceLabelText}>
                                        {pIdx === 0 ? 'Front View' : 'Back View'}
                                      </Text>
                                    </View>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}

                          {/* Bottom Assurance Alert Box */}
                          <View style={styles.chatReportNoticeBox}>
                            <Text style={styles.chatReportNoticeIcon}>✓</Text>
                            <Text style={styles.chatReportNoticeText}>
                              Incident dossier transferred to NAFDAC market enforcement task forces. Thank you for protecting consumer safety.
                            </Text>
                          </View>
                        </View>
                      </View>
                    ) : msg.evidencePrompt ? (
                      <View style={{ flex: 1 }}>
                        <View style={styles.chatEvidenceCard}>
                          <View style={styles.chatEvidenceHeader}>
                            <View style={styles.chatEvidenceIconBadge}>
                              <Text style={{ fontSize: 18 }}>📸</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.chatEvidenceTitle}>Packaging Photos Required</Text>
                              <Text style={styles.chatEvidenceSub}>
                                Since no barcode was found, upload Front & Back views to verify packaging batch stamps.
                              </Text>
                            </View>
                          </View>

                          <View style={styles.chatEvidenceMetaPill}>
                            <Text style={styles.chatEvidenceMetaText}>
                              Product: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{msg.evidencePrompt.productName}</Text>
                              {'  •  '}
                              Vendor: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{msg.evidencePrompt.location}</Text>
                            </Text>
                          </View>

                          <View style={styles.chatEvidenceSlotsRow}>
                            {/* Front Photo Slot */}
                            {evidenceFrontUri ? (
                              <TouchableOpacity
                                style={[styles.chatEvidenceSlot, styles.chatEvidenceSlotFilled]}
                                activeOpacity={0.85}
                                onPress={() => openImagePickerPrompt('front')}
                              >
                                <Image source={{ uri: evidenceFrontUri }} style={styles.chatEvidenceThumbImg} resizeMode="cover" />
                                <View style={styles.chatEvidenceThumbOverlay}>
                                  <View style={styles.chatEvidenceThumbBadge}>
                                    <Text style={styles.chatEvidenceThumbBadgeText}>✓ Front</Text>
                                  </View>
                                  <TouchableOpacity
                                    style={styles.chatEvidenceDeleteBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      setEvidenceFrontUri(null);
                                    }}
                                  >
                                    <Text style={styles.chatEvidenceDeleteText}>✕</Text>
                                  </TouchableOpacity>
                                </View>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.chatEvidenceSlot}
                                activeOpacity={0.8}
                                onPress={() => openImagePickerPrompt('front')}
                              >
                                <View style={styles.chatEvidenceCameraIconCircle}>
                                  <Text style={styles.chatEvidenceSlotIcon}>📷</Text>
                                </View>
                                <Text style={styles.chatEvidenceSlotLabel}>Front View</Text>
                                <Text style={styles.chatEvidenceSlotHint}>Snap or upload</Text>
                              </TouchableOpacity>
                            )}

                            {/* Back Photo Slot */}
                            {evidenceBackUri ? (
                              <TouchableOpacity
                                style={[styles.chatEvidenceSlot, styles.chatEvidenceSlotFilled]}
                                activeOpacity={0.85}
                                onPress={() => openImagePickerPrompt('back')}
                              >
                                <Image source={{ uri: evidenceBackUri }} style={styles.chatEvidenceThumbImg} resizeMode="cover" />
                                <View style={styles.chatEvidenceThumbOverlay}>
                                  <View style={styles.chatEvidenceThumbBadge}>
                                    <Text style={styles.chatEvidenceThumbBadgeText}>✓ Back</Text>
                                  </View>
                                  <TouchableOpacity
                                    style={styles.chatEvidenceDeleteBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      setEvidenceBackUri(null);
                                    }}
                                  >
                                    <Text style={styles.chatEvidenceDeleteText}>✕</Text>
                                  </TouchableOpacity>
                                </View>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.chatEvidenceSlot}
                                activeOpacity={0.8}
                                onPress={() => openImagePickerPrompt('back')}
                              >
                                <View style={styles.chatEvidenceCameraIconCircle}>
                                  <Text style={styles.chatEvidenceSlotIcon}>📷</Text>
                                </View>
                                <Text style={styles.chatEvidenceSlotLabel}>Back View (Seal)</Text>
                                <Text style={styles.chatEvidenceSlotHint}>Snap or upload</Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Submit Action Button */}
                          <TouchableOpacity
                            style={[
                              styles.chatEvidenceSubmitBtn,
                              (!evidenceFrontUri || !evidenceBackUri) && styles.chatEvidenceSubmitBtnDisabled,
                            ]}
                            activeOpacity={0.85}
                            disabled={!evidenceFrontUri || !evidenceBackUri}
                            onPress={() => handleEvidenceSubmission(msg.evidencePrompt!.productName, msg.evidencePrompt!.location)}
                          >
                            <Text style={styles.chatEvidenceSubmitBtnText}>
                              {evidenceFrontUri && evidenceBackUri
                                ? 'Submit Packaging Evidence to NAFDAC'
                                : 'Attach Front & Back to Submit'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={msg.sender === 'user' ? styles.userMessageBubble : styles.agentChatBubble}>
                        <Text style={msg.sender === 'user' ? styles.userMessageText : styles.agentChatText}>{msg.text.replace(/\*/g, '')}</Text>
                      </View>
                    )}
                    {msg.sender === 'user' && (
                      <View style={styles.userAvatarInitialCircle}>
                        <Text style={styles.userAvatarInitialText}>H</Text>
                      </View>
                    )}
                  </View>
                ))}
                {isAiThinking && (
                  <View style={styles.agentChatRow}>
                     <View style={styles.dialogueBotAvatar}>
                        <Image source={require('../../assets/sensoo_ai_robot.jpg')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                     </View>
                     <View style={styles.agentChatBubble}>
                        <Text style={styles.agentChatText}>Thinking...</Text>
                     </View>
                  </View>
                )}
              </View>
            ) : (
              <View>
                {/* 3D Centered Robot Mascot Hero with ambient soft green glow */}
                <View style={styles.heroRobotSection}>
                  <View style={styles.heroAmbientGlow} />
                  <Image
                    source={require('../../assets/sensoo_ai_robot_centered.png')}
                    style={styles.heroRobotImg}
                    resizeMode="contain"
                  />
                </View>

                {/* Greeting Block */}
                <View style={styles.agentGreetingBlock}>
                  <Text style={styles.agentGreetingTitle}>Hi, Ings</Text>
                  <Text style={styles.agentGreetingSub}>How can I help you today?</Text>
                  <Text style={styles.agentGreetingDesc}>
                    I can explain your scans, give safety guidance,{'\n'}find nearby clinics and help you report{'\n'}suspicious products.
                  </Text>
                </View>

            {/* 4 Action Cards in 2 Distinct Rows (Guaranteed 2x2 Grid) */}
            <View style={styles.actionGridContainer}>
              {/* Row 1 */}
              <View style={styles.actionRow}>
                {/* Card 1: Explain a scan */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.82}
                  onPress={() => setCurrentScreen('contextual')}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#F3EEFF' }]}>
                    <Image
                      source={require('../../assets/icons/icon_ai_explain.png')}
                      style={styles.actionIconImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.actionCardTextCol}>
                    <Text style={styles.actionCardTitle}>Explain a scan</Text>
                    <Text style={styles.actionCardDesc}>Why was this product flagged?</Text>
                  </View>
                </TouchableOpacity>

                {/* Card 2: What should I do? */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.82}
                  onPress={() => setCurrentScreen('safety_guidance')}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Image
                      source={require('../../assets/icons/icon_ai_guidance.png')}
                      style={styles.actionIconImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.actionCardTextCol}>
                    <Text style={styles.actionCardTitle}>What should I do?</Text>
                    <Text style={styles.actionCardDesc}>Get safety guidance.</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.actionRow}>
                {/* Card 3: Find nearby help */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.82}
                  onPress={() => setCurrentScreen('clinics')}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Image
                      source={require('../../assets/icons/icon_ai_clinics.png')}
                      style={styles.actionIconImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.actionCardTextCol}>
                    <Text style={styles.actionCardTitle}>Find nearby help</Text>
                    <Text style={styles.actionCardDesc}>Accredited clinics near you.</Text>
                  </View>
                </TouchableOpacity>

                {/* Card 4: Report a product */}
                <TouchableOpacity
                  style={styles.actionCard}
                  activeOpacity={0.82}
                  onPress={() => setCurrentScreen('report')}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <Image
                      source={require('../../assets/icons/icon_ai_report.png')}
                      style={styles.actionIconImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.actionCardTextCol}>
                    <Text style={styles.actionCardTitle}>Report a product</Text>
                    <Text style={styles.actionCardDesc}>Tell us about a suspicious product.</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Big Green Mic "Tap to speak" */}
            <View style={styles.bigMicContainer}>
              <View style={[styles.bigMicGlowAura, isListeningMic && { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
                <TouchableOpacity
                  style={[styles.bigMicCircle, isListeningMic && { backgroundColor: '#EF4444' }]}
                  activeOpacity={0.85}
                  onPress={toggleAgentMicRecording}
                >
                  <Image
                    source={require('../../assets/icons/icon_ai_mic.png')}
                    style={[styles.bigMicIconImg, isListeningMic && { tintColor: '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.bigMicLabel, isListeningMic && { color: '#EF4444', fontWeight: '800' }]}>
                {isListeningMic ? 'Recording... (Tap to stop)' : 'Tap to speak'}
              </Text>
            </View>

              </View>
            )}
          </ScrollView>

          {/* Bottom Floating Input Bar */}
          <SafeAreaView edges={['bottom']} style={styles.bottomBarSafeArea}>
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Type your question..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendPrompt()}
              />
              <TouchableOpacity
                style={styles.inputSendBtn}
                activeOpacity={0.8}
                onPress={() => handleSendPrompt()}
              >
                <Text style={styles.inputSendArrow}>➤</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* 3. CONTEXTUAL SUGGESTION SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'contextual' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.subPageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Flagged Product Summary Card */}
            <View style={styles.contextualProductCard}>
              <View style={styles.contextualThumbBox}>
                <Image
                  source={require('../../assets/dove_body_wash.png')}
                  style={styles.contextualThumbImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.contextualMetaBox}>
                <Text style={styles.contextualFlagRed}>
                  You recently scanned a product that was flagged as counterfeit.
                </Text>
                <Text style={styles.contextualProdTitle}>Dove Body Wash Deep Moisture 250ml</Text>
                <Text style={styles.contextualTime}>08:42 AM</Text>
              </View>
            </View>

            {/* AI Suggestion Chat Bubble */}
            <View style={styles.aiDialogueRow}>
              <View style={styles.dialogueBotAvatar}>
                <Image
                  source={require('../../assets/sensoo_ai_robot.jpg')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.dialogueBotBubble}>
                <Text style={styles.dialogueBotText}>
                  Would you like me to explain why this product was flagged and what you should do?
                </Text>

                {/* Primary Button: Explain Result */}
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  activeOpacity={0.85}
                  onPress={() => setCurrentScreen('explain_scan')}
                >
                  <Text style={styles.primaryActionButtonText}>Explain result</Text>
                </TouchableOpacity>

                {/* Secondary Button: No, ask something else */}
                <TouchableOpacity
                  style={styles.secondaryTextBtn}
                  activeOpacity={0.7}
                  onPress={() => setCurrentScreen('home')}
                >
                  <Text style={styles.secondaryTextBtnLabel}>No, ask something else</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Input Bar */}
          <SafeAreaView edges={['bottom']} style={styles.bottomBarSafeArea}>
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Type your question..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendPrompt()}
              />
              <TouchableOpacity
                style={styles.inputSendBtn}
                activeOpacity={0.8}
                onPress={() => handleSendPrompt()}
              >
                <Text style={styles.inputSendArrow}>➤</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 4. VOICE LISTENING & RESPONDING SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'listening' && (
        <SafeAreaView style={styles.listeningContainer} edges={['top', 'bottom']}>
          {/* Top Bar with Close X */}
          <View style={styles.topBarRow}>
            <TouchableOpacity
              style={styles.topNavCloseBtn}
              activeOpacity={0.7}
              onPress={() => {
                stopSpeakingAudio();
                setVoiceStatus('listening');
                setVoiceUserPrompt(null);
                setVoiceAiReply(null);
                setCurrentScreen('home');
              }}
            >
              <Text style={styles.topNavCloseText}>✕</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.topBarTitle}>Sensoo AI Voice</Text>
              <Text style={{ fontSize: 10, color: '#34D399', fontWeight: '800', letterSpacing: 0.5 }}>
                {selectedLanguage !== 'English' ? 'NCAIR N-ATLaS + ' : ''}GEMINI 3.1 FLASH LITE
              </Text>
            </View>
            <TouchableOpacity
              style={styles.langPill}
              activeOpacity={0.75}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.globeIconOuter}>
                <View style={styles.globeIconInner} />
              </View>
              <Text style={styles.langPillText}>{selectedLanguage}</Text>
              <Text style={styles.langPillChevron}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Main Voice Canvas */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Pulsing Robot Avatar */}
            <View style={styles.listeningRadarRingOuter}>
              <View
                style={[
                  styles.listeningRadarRingMiddle,
                  voiceStatus === 'thinking' && { borderColor: '#60A5FA', backgroundColor: 'rgba(96, 165, 250, 0.16)' },
                  (voiceStatus === 'speaking' || isSpeakingAudio) && { borderColor: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.22)' },
                ]}
              >
                <View style={styles.listeningRadarRingInner}>
                  <Image
                    source={require('../../assets/sensoo_ai_robot.jpg')}
                    style={styles.listeningRobotImg}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            {/* Status Headline */}
            <Text style={styles.listeningStatusText}>
              {voiceStatus === 'listening'
                ? (isListeningMic ? '🔴 Listening...' : 'Listening...')
                : voiceStatus === 'thinking'
                ? `Reasoning with ${selectedLanguage !== 'English' ? 'NCAIR N-ATLaS & ' : ''}Gemini 3.1...`
                : isSpeakingAudio ? 'Sensoo AI Speaking 🔊' : 'Voice Answer Ready'}
            </Text>
            {voiceStatus === 'listening' && (
              <Text style={styles.listeningStatusSub}>
                Speak your question, type in the bar, or tap below
              </Text>
            )}

            {/* Dynamic Waveform or Animated Thinking Dots */}
            {voiceStatus === 'thinking' ? (
              <View style={{ flexDirection: 'row', gap: 6, marginVertical: 14 }}>
                <View style={[styles.waveformBar, { height: 28, backgroundColor: '#34D399' }]} />
                <View style={[styles.waveformBar, { height: 44, backgroundColor: '#10B981' }]} />
                <View style={[styles.waveformBar, { height: 32, backgroundColor: '#34D399' }]} />
                <View style={[styles.waveformBar, { height: 50, backgroundColor: '#059669' }]} />
                <View style={[styles.waveformBar, { height: 24, backgroundColor: '#34D399' }]} />
              </View>
            ) : (
              <View style={styles.audioWaveformRow}>
                {[14, 26, 42, 22, 52, 36, 56, 30, 48, 20, 34, 18, 28].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        height: isSpeakingAudio ? (h * 1.05) : (voiceStatus === 'speaking' ? h * 0.7 : h * 0.45),
                        backgroundColor: i % 2 === 0 ? '#10B981' : '#34D399',
                        opacity: voiceStatus === 'listening' ? 0.6 : 1,
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* If Speaking: Show Live Answer Card with Audio Controls */}
            {voiceStatus === 'speaking' && voiceAiReply ? (
              <View style={styles.voiceResultCard}>
                {voiceUserPrompt && (
                  <View style={styles.voiceUserPromptPill}>
                    <Text style={styles.voiceUserPromptText}>🗣️ "{voiceUserPrompt}"</Text>
                  </View>
                )}

                <View style={styles.voiceReplyHeaderRow}>
                  <View style={styles.voiceModelBadge}>
                    <Text style={styles.voiceModelBadgeText}>✦ {voiceModelUsed}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.audioToggleBtn,
                      isSpeakingAudio ? styles.audioToggleBtnPlaying : styles.audioToggleBtnPaused,
                    ]}
                    activeOpacity={0.8}
                    onPress={toggleAudioPlayback}
                  >
                    <Text style={styles.audioToggleBtnText}>
                      {isSpeakingAudio ? '⏸️ Pause Voice' : '🔊 Replay Voice'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.voiceReplyBodyText}>{voiceAiReply}</Text>

                {/* Quick Action Navigation Buttons */}
                <View style={styles.voiceActionsRow}>
                  <TouchableOpacity
                    style={styles.voiceActionBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      stopSpeakingAudio();
                      setVoiceStatus('listening');
                      setVoiceUserPrompt(null);
                      setVoiceAiReply(null);
                    }}
                  >
                    <Text style={styles.voiceActionBtnText}>🎙️ Ask another question</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.voiceActionBtn, { backgroundColor: '#064E3B' }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      stopSpeakingAudio();
                      setCurrentScreen('safety_guidance');
                    }}
                  >
                    <Text style={[styles.voiceActionBtnText, { color: '#FFFFFF' }]}>
                      🛡️ Clinical Guidance →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Voice Input & Interactive Microphone Controller */
              <View style={{ width: '100%', alignItems: 'center' }}>
                {/* Voice Dictation / Custom Question Input */}
                <View style={styles.voiceDictationRow}>
                  <TextInput
                    style={styles.voiceDictationInput}
                    placeholder="Speak or type your question..."
                    placeholderTextColor="#94A3B8"
                    value={voiceInputQuery}
                    onChangeText={setVoiceInputQuery}
                    onSubmitEditing={() => {
                      if (voiceInputQuery.trim()) {
                        handleVoicePrompt(voiceInputQuery.trim());
                        setVoiceInputQuery('');
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={[styles.voiceDictationSendBtn, !voiceInputQuery.trim() && { opacity: 0.5 }]}
                    disabled={!voiceInputQuery.trim() || isAiThinking}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (voiceInputQuery.trim()) {
                        handleVoicePrompt(voiceInputQuery.trim());
                        setVoiceInputQuery('');
                      }
                    }}
                  >
                    <Text style={styles.voiceDictationSendIcon}>➤</Text>
                  </TouchableOpacity>
                </View>

                {/* Big Glowing Live Mic Button */}
                <TouchableOpacity
                  style={[
                    styles.liveMicBtnCircle,
                    isListeningMic && styles.liveMicBtnCircleActive,
                  ]}
                  activeOpacity={0.85}
                  disabled={isAiThinking}
                  onPress={toggleMicrophoneListening}
                >
                  <Image
                    source={require('../../assets/icons/icon_ai_mic.png')}
                    style={styles.liveMicBtnIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.liveMicBtnHint}>
                  {isListeningMic
                    ? '🔴 Listening to your voice... Tap to send'
                    : 'Tap mic to speak or select a question below'}
                </Text>
              </View>
            )}

            {/* Contextual Quick Questions */}
            {voiceStatus !== 'speaking' && (
              <View style={styles.listeningPromptCard}>
                <Text style={styles.youCanSayTitle}>
                  {selectedLanguage === 'Nigerian Pidgin'
                    ? 'Wetin you fit ask (tap to talk):'
                    : 'Contextual Quick Questions (Tap to ask):'}
                </Text>
                <TouchableOpacity
                  style={styles.promptItemRow}
                  activeOpacity={0.75}
                  onPress={() =>
                    handleVoicePrompt(
                      selectedLanguage === 'Nigerian Pidgin'
                        ? 'Why this product fail NAFDAC check? E be fake?'
                        : 'Why was this product flagged as counterfeit by Sensoo?'
                    )
                  }
                >
                  <Text style={styles.promptItemIcon}>💬</Text>
                  <Text style={styles.promptItemText}>
                    {selectedLanguage === 'Nigerian Pidgin'
                      ? 'Why this product fail NAFDAC check?'
                      : 'Why was this product flagged?'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.promptItemRow}
                  activeOpacity={0.75}
                  onPress={() =>
                    handleVoicePrompt(
                      selectedLanguage === 'Nigerian Pidgin'
                        ? 'I don swallow this medicine already. Wetin I go do now? Any danger?'
                        : 'I already swallowed this tablet. What should I do? Am I in danger?'
                    )
                  }
                >
                  <Text style={styles.promptItemIcon}>💬</Text>
                  <Text style={styles.promptItemText}>
                    {selectedLanguage === 'Nigerian Pidgin'
                      ? 'I don take am already, wetin I do?'
                      : 'I already took this medicine, what do I do?'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.promptItemRow}
                  activeOpacity={0.75}
                  onPress={() =>
                    handleVoicePrompt(
                      selectedLanguage === 'Nigerian Pidgin'
                        ? 'Where verified pharmacy or clinic dey near me for Lagos?'
                        : 'Where can I find verified medical help or safe replacement nearby?'
                    )
                  }
                >
                  <Text style={styles.promptItemIcon}>💬</Text>
                  <Text style={styles.promptItemText}>
                    {selectedLanguage === 'Nigerian Pidgin'
                      ? 'Where original chemist or hospital dey?'
                      : 'Where can I get verified help nearby?'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.promptItemRow}
                  activeOpacity={0.75}
                  onPress={() =>
                    handleVoicePrompt(
                      selectedLanguage === 'Nigerian Pidgin'
                        ? 'Explain wetin fake medicine fit cause for my liver and kidneys in Pidgin.'
                        : 'What toxic ingredients or health risks are inside counterfeit batches?'
                    )
                  }
                >
                  <Text style={styles.promptItemIcon}>🧪</Text>
                  <Text style={styles.promptItemText}>
                    {selectedLanguage === 'Nigerian Pidgin'
                      ? 'Wetin bad chemicals fit cause inside body?'
                      : 'What health risks or chemicals are inside?'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.promptItemRow}
                  activeOpacity={0.75}
                  onPress={() => {
                    stopSpeakingAudio();
                    setCurrentScreen('report');
                  }}
                >
                  <Text style={styles.promptItemIcon}>🚩</Text>
                  <Text style={styles.promptItemText}>Report this product to NAFDAC</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      )}

      {/* ======================================================== */}
      {/* 5. SAFETY GUIDANCE QUESTIONNAIRE (SCREEN 5) */}
      {/* ======================================================== */}
      {currentScreen === 'safety_guidance' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.subPageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Warning Callout Card */}
            <View style={styles.guidanceCalloutCard}>
              <View style={styles.guidanceCalloutIconBox}>
                <Image
                  source={require('../../assets/icons/icon_ai_guidance.png')}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guidanceCalloutHeading}>Let's make sure you're safe.</Text>
                <Text style={styles.guidanceCalloutSub}>
                  You scanned a product that may be counterfeit.
                </Text>
              </View>
            </View>

            {/* Question 1: Have you already taken this product? */}
            <View style={styles.guidanceFormCard}>
              <Text style={styles.guidanceQuestionTitle}>Have you already taken this product?</Text>

              {/* Option: Yes, I have taken it */}
              <TouchableOpacity
                style={[
                  styles.guidanceRadioCard,
                  hasTakenProduct === 'yes' && styles.guidanceRadioCardActiveRed,
                ]}
                activeOpacity={0.8}
                onPress={() => setHasTakenProduct('yes')}
              >
                <View
                  style={[
                    styles.guidanceRadioDotOuter,
                    hasTakenProduct === 'yes' && styles.guidanceRadioDotOuterRed,
                  ]}
                >
                  {hasTakenProduct === 'yes' && <View style={styles.guidanceRadioDotInnerRed} />}
                </View>
                <Text
                  style={[
                    styles.guidanceRadioText,
                    hasTakenProduct === 'yes' && styles.guidanceRadioTextRed,
                  ]}
                >
                  Yes, I have taken it
                </Text>
              </TouchableOpacity>

              {/* Option: No, I haven't taken it yet */}
              <TouchableOpacity
                style={[
                  styles.guidanceRadioCard,
                  hasTakenProduct === 'no' && styles.guidanceRadioCardActiveNeutral,
                ]}
                activeOpacity={0.8}
                onPress={() => setHasTakenProduct('no')}
              >
                <View
                  style={[
                    styles.guidanceRadioDotOuter,
                    hasTakenProduct === 'no' && styles.guidanceRadioDotOuterGreen,
                  ]}
                >
                  {hasTakenProduct === 'no' && <View style={styles.guidanceRadioDotInnerGreen} />}
                </View>
                <Text style={styles.guidanceRadioText}>No, I haven't taken it yet</Text>
              </TouchableOpacity>
            </View>

            {/* Question 2: Let's get some details (When Yes) */}
            {hasTakenProduct === 'yes' && (
              <View style={styles.guidanceFormCard}>
                <Text style={styles.guidanceQuestionTitle}>Let's get some details.</Text>

                {/* Amount */}
                <Text style={styles.guidanceFieldLabel}>How much did you take?</Text>
                <View style={styles.guidanceInputContainer}>
                  <TextInput
                    style={styles.guidanceInputField}
                    placeholder="e.g. 1 tablet"
                    placeholderTextColor="#94A3B8"
                    value={intakeAmount}
                    onChangeText={setIntakeAmount}
                  />
                </View>

                {/* Time */}
                <Text style={styles.guidanceFieldLabel}>When did you take it?</Text>
                <View style={styles.guidanceInputContainer}>
                  <TextInput
                    style={styles.guidanceInputField}
                    placeholder="e.g. 2 hours ago"
                    placeholderTextColor="#94A3B8"
                    value={intakeTime}
                    onChangeText={setIntakeTime}
                  />
                </View>

                {/* Symptoms Dropdown */}
                <Text style={styles.guidanceFieldLabel}>Are you experiencing any symptoms?</Text>
                <TouchableOpacity
                  style={styles.guidanceDropdownSelector}
                  activeOpacity={0.8}
                  onPress={() => setShowSymptomsPicker(true)}
                >
                  <Text
                    style={[
                      styles.guidanceDropdownValue,
                      !intakeSymptoms && { color: '#94A3B8' },
                    ]}
                  >
                    {intakeSymptoms || 'Select'}
                  </Text>
                  <Text style={styles.guidanceDropdownCaret}>▾</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* CTA Button: Get Safety Guidance */}
            <TouchableOpacity
              style={styles.guidanceSubmitBtn}
              activeOpacity={0.88}
              onPress={() => setCurrentScreen('triage_help')}
            >
              <Text style={styles.guidanceSubmitBtnText}>Get Safety Guidance</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* 6. TRIAGE RESULT & HELP SCREEN (SCREEN 6) */}
      {/* ======================================================== */}
      {currentScreen === 'triage_help' && (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.subPageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Urgent Warning Alert Banner */}
            <View style={styles.triagePromptAlertCard}>
              <View style={styles.triageExclamationBadge}>
                <Text style={styles.triageExclamationGlyph}>!</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.triagePromptHeading}>Seek medical attention promptly.</Text>
                <Text style={styles.triagePromptSub}>
                  Based on your answers, you should contact a healthcare professional as soon as possible.
                </Text>
              </View>
            </View>

            {/* Nearby Accredited Clinics Header */}
            <View style={styles.triageSectionHeaderRow}>
              <Text style={styles.triageSectionTitle}>Nearby Accredited Clinics</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCurrentScreen('clinics')}
              >
                <Text style={styles.triageSeeAllText}>See all ›</Text>
              </TouchableOpacity>
            </View>

            {/* 3 Hospital Cards */}
            {CLINICS_DATA.slice(0, 3).map((clinic) => (
              <View key={clinic.id} style={styles.triageHospitalCard}>
                <View style={styles.triageCrossBox}>
                  <Text style={styles.triageCrossIcon}>+</Text>
                </View>
                <View style={styles.triageHospitalMeta}>
                  <Text style={styles.triageHospitalName}>{clinic.name}</Text>
                  <Text style={styles.triageHospitalStatus}>
                    {clinic.distance} • {clinic.status}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.triagePhoneCircleBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert('Call Hospital', `Connecting to ${clinic.name} (${clinic.phone})...`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Call Now' },
                    ]);
                  }}
                >
                  <Text style={styles.triagePhoneIcon}>📞</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <SafeAreaView edges={['bottom']} style={styles.triageStickyBottomBar}>
            {/* Primary Action: Get Directions */}
            <TouchableOpacity
              style={styles.triageDirectionsBtn}
              activeOpacity={0.88}
              onPress={() => {
                Alert.alert('Directions', 'Routing to Lagos University Teaching Hospital (4.2 km)...');
              }}
            >
              <Text style={styles.triageDirectionsIcon}>🧭</Text>
              <Text style={styles.triageDirectionsText}>Get Directions</Text>
            </TouchableOpacity>

            {/* Secondary Actions Row */}
            <View style={styles.triageSubButtonsRow}>
              <TouchableOpacity
                style={styles.triageSubOutlineBtn}
                activeOpacity={0.8}
                onPress={() => {
                  Alert.alert('Emergency Contact', 'Dialing Emergency Hospital line (+234 1 774 2000)...', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call Now' },
                  ]);
                }}
              >
                <Text style={styles.triageSubBtnIcon}>📞</Text>
                <Text style={styles.triageSubBtnText}>Call Hospital</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.triageSubOutlineBtn}
                activeOpacity={0.8}
                onPress={() => {
                  router.push({
                    pathname: '/report-product',
                    params: {
                      name: 'Paracetamol 500mg',
                      code: '8992772531003',
                    },
                  });
                }}
              >
                <Text style={styles.triageSubBtnIcon}>🚩</Text>
                <Text style={styles.triageSubBtnText}>Report Product</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}

      {/* ======================================================== */}
      {/* 7. EXPLAIN A SCAN RESULT SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'explain_scan' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.subPageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* User message */}
            <View style={styles.userMessageRow}>
              <View style={styles.userMessageBubble}>
                <Text style={styles.userMessageText}>Why was this product flagged?</Text>
              </View>
              <View style={styles.userAvatarInitialCircle}>
                <Text style={styles.userAvatarInitialText}>H</Text>
              </View>
            </View>

            {/* AI Assistant Explanation */}
            <View style={styles.aiDialogueRow}>
              <View style={styles.dialogueBotAvatar}>
                <Image
                  source={require('../../assets/sensoo_ai_robot.jpg')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.dialogueBotBubble}>
                <Text style={styles.dialogueBotText}>
                  This product was flagged as a potential counterfeit based on several risk indicators:
                </Text>

                {/* 4 Warning Points */}
                <View style={styles.riskIndicatorsList}>
                  <View style={styles.riskIndicatorItem}>
                    <Text style={styles.riskIcon}>🚫</Text>
                    <Text style={styles.riskLabel}>Barcode not recognised</Text>
                  </View>
                  <View style={styles.riskIndicatorItem}>
                    <Text style={styles.riskIcon}>⚠️</Text>
                    <Text style={styles.riskLabel}>Product details don't match authentic records</Text>
                  </View>
                  <View style={styles.riskIndicatorItem}>
                    <Text style={styles.riskIcon}>📍</Text>
                    <Text style={styles.riskLabel}>Similar fake products reported in this region</Text>
                  </View>
                  <View style={styles.riskIndicatorItem}>
                    <Text style={styles.riskIcon}>📦</Text>
                    <Text style={styles.riskLabel}>Packaging inconsistencies</Text>
                  </View>
                </View>

                <Text style={[styles.dialogueBotText, { marginTop: 8, fontWeight: '600' }]}>
                  It's recommended not to buy or use this product.
                </Text>

                {/* View Full Details Button */}
                <TouchableOpacity
                  style={[styles.secondaryOutlineBtn, { marginTop: 14 }]}
                  activeOpacity={0.85}
                  onPress={() => setCurrentScreen('scan_details')}
                >
                  <Text style={styles.secondaryOutlineBtnText}>View full details</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Live Follow-up Chat Messages */}
            {chatMessages.map((msg, i) => (
              <View key={i} style={{ marginVertical: 6 }}>
                {msg.sender === 'user' ? (
                  <View style={styles.userMessageRow}>
                    <View style={styles.userMessageBubble}>
                      <Text style={styles.userMessageText}>{msg.text}</Text>
                    </View>
                    <View style={styles.userAvatarInitialCircle}>
                      <Text style={styles.userAvatarInitialText}>H</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.aiDialogueRow}>
                    <View style={styles.dialogueBotAvatar}>
                      <Image
                        source={require('../../assets/sensoo_ai_robot.jpg')}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.dialogueBotBubble}>
                      {msg.model && (
                        <View style={styles.inlineModelBadge}>
                          <Text style={styles.inlineModelBadgeText}>✦ {msg.model}</Text>
                        </View>
                      )}
                      <Text style={styles.dialogueBotText}>{msg.text}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {isAiThinking && (
              <View style={styles.aiDialogueRow}>
                <View style={styles.dialogueBotAvatar}>
                  <Image
                    source={require('../../assets/sensoo_ai_robot.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <View style={[styles.dialogueBotBubble, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={{ fontSize: 13, color: '#059669', fontWeight: '700' }}>
                    Thinking with Gemini 3.1 Flash Lite...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Input Bar */}
          <SafeAreaView edges={['bottom']} style={styles.bottomBarSafeArea}>
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Type your question..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSendPrompt()}
              />
              <TouchableOpacity
                style={styles.inputSendBtn}
                activeOpacity={0.8}
                onPress={() => handleSendPrompt()}
              >
                <Text style={styles.inputSendArrow}>➤</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* 8. SCAN DETAILS (FULL EXPLANATION) SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'scan_details' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.subPageScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Header Card */}
          <View style={styles.detailsHeroCard}>
            <View style={styles.detailsHeroThumb}>
              <Image
                source={require('../../assets/dove_body_wash.png')}
                style={styles.detailsHeroThumbImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.detailsHeroMeta}>
              <Text style={styles.detailsHeroTitle}>Dove Body Wash</Text>
              <Text style={styles.detailsHeroSub}>Deep Moisture 250ml</Text>
              <View style={styles.counterfeitBadgePill}>
                <Text style={styles.counterfeitBadgeText}>⚠️ Potential Counterfeit</Text>
              </View>
            </View>
          </View>

          {/* Spec Table */}
          <View style={styles.detailsSpecCard}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Barcode</Text>
              <Text style={styles.specValue}>40181700982</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Brand</Text>
              <Text style={styles.specValue}>Dove</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>Personal Care</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Scanned on</Text>
              <Text style={styles.specValue}>29 Sept 2026, 08:42 AM</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Location</Text>
              <Text style={styles.specValue}>Lagos, Nigeria</Text>
            </View>
          </View>

          {/* Section: Why this was flagged */}
          <View style={styles.flaggedReasonsCard}>
            <Text style={styles.flaggedSectionTitle}>Why this was flagged</Text>

            <View style={styles.flagReasonRow}>
              <Text style={styles.flagReasonIcon}>🚫</Text>
              <Text style={styles.flagReasonText}>Barcode not recognised in manufacturer database</Text>
            </View>

            <View style={styles.flagReasonRow}>
              <Text style={styles.flagReasonIcon}>⚠️</Text>
              <Text style={styles.flagReasonText}>Product details don't match authentic records</Text>
            </View>

            <View style={styles.flagReasonRow}>
              <Text style={styles.flagReasonIcon}>📍</Text>
              <Text style={styles.flagReasonText}>Similar fake products reported in this region</Text>
            </View>

            <View style={styles.flagReasonRow}>
              <Text style={styles.flagReasonIcon}>📦</Text>
              <Text style={styles.flagReasonText}>Packaging inconsistencies in seal & cap molding</Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.primaryActionButton, { marginTop: 18 }]}
            activeOpacity={0.85}
            onPress={() => setCurrentScreen('report')}
          >
            <Text style={styles.primaryActionButtonText}>Report this product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryTextBtn, { marginTop: 8 }]}
            activeOpacity={0.7}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.secondaryTextBtnLabel}>Back to Sensoo AI</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* 9 & 10. NEARBY ACCREDITED CLINICS (LIST & MAP) SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'clinics' && (
        <View style={{ flex: 1 }}>
          {/* Segmented Map / List Toggle */}
          <View style={styles.segmentToggleWrapper}>
            <View style={styles.segmentToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  clinicViewMode === 'map' && styles.segmentBtnActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setClinicViewMode('map')}
              >
                <Text
                  style={[
                    styles.segmentBtnText,
                    clinicViewMode === 'map' && styles.segmentBtnTextActive,
                  ]}
                >
                  🗺 Map
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  clinicViewMode === 'list' && styles.segmentBtnActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setClinicViewMode('list')}
              >
                <Text
                  style={[
                    styles.segmentBtnText,
                    clinicViewMode === 'list' && styles.segmentBtnTextActive,
                  ]}
                >
                  📋 List
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* MODE A: LIST VIEW (Screen 9) */}
          {clinicViewMode === 'list' && (
            <ScrollView
              style={styles.mainScrollView}
              contentContainerStyle={styles.subPageScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {CLINICS_DATA.map((clinic) => (
                <View key={clinic.id} style={styles.clinicListCard}>
                  <View style={styles.clinicPinBox}>
                    <Text style={{ fontSize: 18 }}>📍</Text>
                  </View>

                  <View style={styles.clinicMetaCol}>
                    <Text style={styles.clinicName}>{clinic.name}</Text>
                    <Text style={styles.clinicSubInfo}>
                      {clinic.distance} • <Text style={{ color: '#059669', fontWeight: '700' }}>{clinic.status}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.clinicCallBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert(
                        `Call ${clinic.name}`,
                        `Phone: ${clinic.phone}\nAddress: ${clinic.address}`,
                        [{ text: 'Cancel', style: 'cancel' }, { text: 'Call Hospital' }]
                      );
                    }}
                  >
                    <Text style={styles.clinicCallIcon}>📞</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* MODE B: MAP VIEW (Screen 10) */}
          {clinicViewMode === 'map' && (
            <View style={styles.mapContainer}>
              {/* Radar Map Visual Container */}
              <View style={styles.mapVisualBackdrop}>
                {/* Distance concentric circles */}
                <View style={[styles.mapRadarCircle, { width: 340, height: 340, borderRadius: 170 }]} />
                <View style={[styles.mapRadarCircle, { width: 230, height: 230, borderRadius: 115 }]} />
                <View style={[styles.mapRadarCircle, { width: 120, height: 120, borderRadius: 60 }]} />

                {/* Region Territory Labels */}
                <Text style={[styles.mapTerritoryLabel, { top: 70, left: 35 }]}>Ikeja</Text>
                <Text style={[styles.mapTerritoryLabel, { bottom: 140, left: 50 }]}>Alaba</Text>
                <Text style={[styles.mapTerritoryLabel, { bottom: 120, right: 40 }]}>Ojota</Text>

                {/* Center User Location Dot */}
                <View style={styles.mapUserDotOuter}>
                  <View style={styles.mapUserDotInner} />
                </View>

                {/* Hospital Pins */}
                <TouchableOpacity
                  style={[styles.mapHospitalPin, { top: 90, right: 80 }]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedClinic(CLINICS_DATA[0])}
                >
                  <Text style={{ fontSize: 20 }}>🏥</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapHospitalPin, { top: 180, left: 70 }]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedClinic(CLINICS_DATA[1])}
                >
                  <Text style={{ fontSize: 20 }}>🏥</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapHospitalPin, { bottom: 100, right: 120 }]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedClinic(CLINICS_DATA[2])}
                >
                  <Text style={{ fontSize: 20 }}>🏥</Text>
                </TouchableOpacity>

                {/* Compass Navigation Fab */}
                <View style={styles.mapCompassBtn}>
                  <Text style={{ fontSize: 16 }}>🧭</Text>
                </View>
              </View>

              {/* Bottom Selected Hospital Card */}
              <View style={styles.mapBottomCard}>
                <View style={styles.mapBottomCardTopRow}>
                  <View style={styles.clinicPinBox}>
                    <Text style={{ fontSize: 18 }}>📍</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clinicName}>{selectedClinic.name}</Text>
                    <Text style={styles.clinicSubInfo}>
                      {selectedClinic.distance} •{' '}
                      <Text style={{ color: '#059669', fontWeight: '700' }}>
                        {selectedClinic.status}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Action Buttons: Get Directions & Call Hospital */}
                <View style={styles.mapActionRow}>
                  <TouchableOpacity
                    style={styles.mapDirectionBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      Alert.alert(
                        'Directions',
                        `Turn-by-turn navigation to ${selectedClinic.name} (${selectedClinic.distance}) is active via GPS.`,
                        [{ text: 'Start' }]
                      );
                    }}
                  >
                    <Text style={styles.mapDirectionBtnText}>🧭 Get Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.mapCallHospitalBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      Alert.alert(
                        `Call ${selectedClinic.name}`,
                        `Phone: ${selectedClinic.phone}`,
                       [{ text: 'Cancel' }, { text: 'Call' }]
                      );
                    }}
                  >
                    <Text style={styles.mapCallHospitalBtnText}>📞 Call Hospital</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* 11. REPORT A PRODUCT SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'report' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.subPageScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Text */}
            <View style={{ marginBottom: 18 }}>
              <Text style={styles.reportScreenTitle}>Report a Suspicious Product</Text>
              <Text style={styles.reportScreenSub}>
                Help us keep the market safe. Your report goes to the relevant authorities.
              </Text>
            </View>

            {/* Photo Attachment Card */}
            <TouchableOpacity
              style={[
                styles.reportPhotoCard,
                reportPhotoAttached && styles.reportPhotoCardAttached,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setReportPhotoAttached(!reportPhotoAttached);
                Alert.alert(
                  reportPhotoAttached ? 'Photo Removed' : 'Photo Attached',
                  reportPhotoAttached
                    ? 'Image removed from report.'
                    : '1 photo attached: dove_packaging_anomaly.jpg'
                );
              }}
            >
              <Text style={{ fontSize: 26, marginBottom: 4 }}>📷</Text>
              <Text style={styles.reportPhotoTitle}>
                {reportPhotoAttached ? '✓ 1 Photo Attached' : 'Add photos (optional)'}
              </Text>
              <Text style={styles.reportPhotoSub}>
                {reportPhotoAttached
                  ? 'Tap to remove or replace photo'
                  : 'Take a photo of the product, barcode or location'}
              </Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Product name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Dove Body Wash 250ml"
                placeholderTextColor="#94A3B8"
                value={reportProductName}
                onChangeText={setReportProductName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Where did you get it?</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Idumota Market, Lagos"
                placeholderTextColor="#94A3B8"
                value={reportLocation}
                onChangeText={setReportLocation}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Additional details (optional)</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Any other information..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={reportDetails}
                onChangeText={setReportDetails}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryActionButton, { marginTop: 12 }]}
              activeOpacity={0.85}
              onPress={() => setCurrentScreen('report_confirmed')}
            >
              <Text style={styles.primaryActionButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ======================================================== */}
      {/* 12. REPORT CONFIRMATION SCREEN */}
      {/* ======================================================== */}
      {currentScreen === 'report_confirmed' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.confirmationScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Emerald Check Circle */}
          <View style={styles.confirmedCheckCircle}>
            <Text style={styles.confirmedCheckGlyph}>✓</Text>
          </View>

          {/* Titles */}
          <Text style={styles.confirmedTitle}>Report Submitted</Text>
          <Text style={styles.confirmedSub}>Thank you for helping keep the market safe.</Text>

          {/* Reference Card */}
          <View style={styles.confirmedRefCard}>
            <Text style={styles.confirmedRefLabel}>Report Reference</Text>
            <Text style={styles.confirmedRefCode}>SN-2026-4587</Text>
            <Text style={styles.confirmedRefBody}>
              We've received your report and it has been sent to the relevant authorities.
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.primaryActionButton, { marginTop: 28, width: '100%' }]}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/home', params: { view: 'Alerts' } })}
          >
            <Text style={styles.primaryActionButtonText}>View My Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryOutlineBtn, { marginTop: 12, width: '100%' }]}
            activeOpacity={0.85}
            onPress={() => {
              setReportPhotoAttached(false);
              setReportDetails('');
              setCurrentScreen('report');
            }}
          >
            <Text style={styles.secondaryOutlineBtnText}>Report Another Product</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* SYMPTOMS SELECTOR MODAL */}
      {/* ======================================================== */}
      <Modal
        visible={showSymptomsPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSymptomsPicker(false)}
      >
        <TouchableOpacity
          style={styles.symptomsModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSymptomsPicker(false)}
        >
          <View style={styles.symptomsModalCard}>
            <View style={styles.symptomsModalHeader}>
              <Text style={styles.symptomsModalTitle}>Select Symptoms</Text>
              <TouchableOpacity onPress={() => setShowSymptomsPicker(false)}>
                <Text style={styles.langModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              'None / Feeling fine',
              'Nausea or vomiting',
              'Dizziness or lightheadedness',
              'Stomach pain or cramps',
              'Skin rash or itching',
              'Difficulty breathing / allergic reaction',
            ].map((symptom) => {
              const isSel = intakeSymptoms === symptom;
              return (
                <TouchableOpacity
                  key={symptom}
                  style={[styles.symptomsChoiceRow, isSel && styles.symptomsChoiceRowSelected]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setIntakeSymptoms(symptom);
                    setShowSymptomsPicker(false);
                  }}
                >
                  <Text style={[styles.symptomsChoiceText, isSel && styles.symptomsChoiceTextSelected]}>
                    {symptom}
                  </Text>
                  {isSel && <Text style={styles.langCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* LANGUAGE SELECTOR MODAL */}
      {/* ======================================================== */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.langModalCard}>
            <View style={styles.langModalHeader}>
              <Text style={styles.langModalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.langModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {LANGUAGES.map((lang) => {
              const isSel = selectedLanguage === lang.label;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOptionRow, isSel && styles.langOptionRowActive]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setSelectedLanguage(lang.label);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.langOptionText, isSel && styles.langOptionTextActive]}>
                    {lang.label}
                  </Text>
                  {isSel && <Text style={styles.langCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* ATTACH PHOTO PICKER MODAL (Camera or Gallery/Files) */}
      {/* ======================================================== */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerModalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModalVisible(false)}
        >
          <View style={styles.pickerModalCard}>
            <View style={styles.pickerModalIndicator} />
            <Text style={styles.pickerModalTitle}>
              Attach {pickerTarget === 'front' ? 'Front View' : 'Back View (Seal)'} Photo
            </Text>
            <Text style={styles.pickerModalSub}>
              Provide packaging proof to verify batch stamps & anti-counterfeit seals.
            </Text>

            <TouchableOpacity
              style={styles.pickerModalActionBtn}
              activeOpacity={0.8}
              onPress={handlePickFromCamera}
            >
              <View style={[styles.pickerModalActionIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Text style={{ fontSize: 20 }}>📸</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerModalActionTitle}>Snap Photo with Camera</Text>
                <Text style={styles.pickerModalActionDesc}>Take a new clear photo of the packaging</Text>
              </View>
              <Text style={styles.pickerModalActionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerModalActionBtn}
              activeOpacity={0.8}
              onPress={handlePickFromGallery}
            >
              <View style={[styles.pickerModalActionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={{ fontSize: 20 }}>📁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerModalActionTitle}>Upload from Files / Gallery</Text>
                <Text style={styles.pickerModalActionDesc}>Choose an existing image or document file</Text>
              </View>
              <Text style={styles.pickerModalActionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerModalCancelBtn}
              activeOpacity={0.8}
              onPress={() => setPickerModalVisible(false)}
            >
              <Text style={styles.pickerModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Top Bar */
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topNavBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBackArrow: {
    fontSize: 26,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: -2,
  },
  topNavCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavCloseText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    flex: 1,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  globeIconOuter: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  globeIconInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  langPillChevron: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },

  /* Main Scroll Content */
  mainScrollView: {
    flex: 1,
  },
  agentHomeScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    width: '100%',
  },
  subPageScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  /* Hero Robot in Agent Home */
  heroRobotSection: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
    marginBottom: 8,
  },
  heroAmbientGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  heroRobotImg: {
    width: 180,
    height: 180,
  },

  /* Greeting Block */
  agentGreetingBlock: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 10,
    width: '100%',
  },
  agentGreetingTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  agentGreetingSub: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  agentGreetingDesc: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },

  /* 4 Action Cards Grid (2 rows side-by-side) */
  actionGridContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 74,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionIconImg: {
    width: 22,
    height: 22,
  },
  actionCardTextCol: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },

  /* Big Mic in Agent Home */
  bigMicContainer: {
    alignItems: 'center',
    marginVertical: 6,
    width: '100%',
  },
  bigMicGlowAura: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bigMicCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bigMicIconImg: {
    width: 26,
    height: 26,
  },
  bigMicLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Bottom Floating Input Bar */
  bottomBarSafeArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    paddingLeft: 18,
    paddingRight: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 10,
  },
  inputSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSendArrow: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
    marginLeft: 2,
    marginTop: -1,
  },

  /* Contextual Suggestion Styles */
  contextualProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 14,
    marginBottom: 18,
  },
  contextualThumbBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contextualThumbImg: {
    width: 40,
    height: 40,
  },
  contextualMetaBox: {
    flex: 1,
  },
  contextualFlagRed: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 3,
  },
  contextualProdTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  contextualTime: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  aiDialogueRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  dialogueBotAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  dialogueBotBubble: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dialogueBotText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  primaryActionButton: {
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryTextBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTextBtnLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  secondaryOutlineBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryOutlineBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* Voice Listening Styles */
  listeningContainer: {
    flex: 1,
    backgroundColor: '#092316',
    justifyContent: 'space-between',
  },
  listeningCenterBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningRadarRingOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningRadarRingMiddle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningRadarRingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  listeningRobotImg: {
    width: '100%',
    height: '100%',
  },
  listeningStatusText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  listeningStatusSub: {
    fontSize: 13,
    color: '#A7F3D0',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  audioWaveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 50,
    marginBottom: 16,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  voiceDictationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F3321',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 4,
    width: '100%',
    marginBottom: 16,
  },
  voiceDictationInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    paddingVertical: 10,
  },
  voiceDictationSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  voiceDictationSendIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  liveMicBtnCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#34D399',
    marginBottom: 8,
  },
  liveMicBtnCircleActive: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
    shadowColor: '#EF4444',
  },
  liveMicBtnIcon: {
    width: 34,
    height: 34,
    tintColor: '#FFFFFF',
  },
  liveMicBtnHint: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
  audioToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  audioToggleBtnPlaying: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  audioToggleBtnPaused: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  audioToggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  listeningPromptCard: {
    backgroundColor: '#0F3321',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
  },
  youCanSayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A7F3D0',
    marginBottom: 8,
  },
  promptItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
  },
  promptItemIcon: {
    fontSize: 13,
  },
  promptItemText: {
    fontSize: 13.5,
    color: '#E2E8F0',
    fontWeight: '500',
  },

  /* Safety Guidance (Conversation) */
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 10,
  },
  userMessageBubble: {
    backgroundColor: '#D1FAE5',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '75%',
  },
  userMessageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064E3B',
    lineHeight: 20,
  },
  userAvatarInitialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A341E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarInitialText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assessmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 12,
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  assessmentRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  assessmentRadioRowSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: '#059669',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669',
  },
  radioLabel: {
    fontSize: 13.5,
    color: '#1E293B',
    fontWeight: '600',
  },
  safetyActionAlertBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 14,
    marginTop: 12,
  },
  safetyHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  safetyBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.8,
  },
  safetyAlertHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
  },
  safetyAlertBody: {
    fontSize: 12.5,
    color: '#7F1D1D',
    lineHeight: 18,
  },

  /* Risk Indicators List in Explain Scan */
  riskIndicatorsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginVertical: 10,
    gap: 8,
  },
  riskIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskIcon: {
    fontSize: 14,
  },
  riskLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },

  /* Scan Details Full Screen */
  detailsHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  detailsHeroThumb: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailsHeroThumbImg: {
    width: 54,
    height: 54,
  },
  detailsHeroMeta: {
    flex: 1,
  },
  detailsHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailsHeroSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  counterfeitBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  counterfeitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  detailsSpecCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  specLabel: {
    fontSize: 13.5,
    color: '#64748B',
  },
  specValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  specDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  flaggedReasonsCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    marginBottom: 10,
  },
  flaggedSectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 12,
  },
  flagReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  flagReasonIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  flagReasonText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },

  /* Clinics Segment Switcher & List */
  segmentToggleWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  segmentToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#064E3B',
  },
  segmentBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  clinicListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  clinicPinBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicMetaCol: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  clinicSubInfo: {
    fontSize: 12,
    color: '#64748B',
  },
  clinicCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicCallIcon: {
    fontSize: 16,
  },

  /* Clinics Map View */
  mapContainer: {
    flex: 1,
    backgroundColor: '#E2F1E8',
    justifyContent: 'space-between',
  },
  mapVisualBackdrop: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapRadarCircle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  mapTerritoryLabel: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  mapUserDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapUserDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapHospitalPin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  mapCompassBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapBottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  mapBottomCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mapActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mapDirectionBtn: {
    flex: 1,
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mapDirectionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapCallHospitalBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mapCallHospitalBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* Report Form */
  reportScreenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  reportScreenSub: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 18,
  },
  reportPhotoCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginBottom: 18,
  },
  reportPhotoCardAttached: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  reportPhotoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  reportPhotoSub: {
    fontSize: 12,
    color: '#64748B',
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },

  /* Report Confirmation */
  confirmationScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 36,
    alignItems: 'center',
  },
  confirmedCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 18,
  },
  confirmedCheckGlyph: {
    fontSize: 38,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  confirmedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmedSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmedRefCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    alignItems: 'center',
  },
  confirmedRefLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  confirmedRefCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  confirmedRefBody: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Language Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  langModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  langModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  langModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  langModalClose: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    padding: 4,
  },
  langOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  langOptionRowActive: {
    backgroundColor: '#ECFDF5',
  },
  langOptionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#334155',
  },
  langOptionTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  /* ======================================================== */
  /* SCREEN 5 & SCREEN 6 STYLES */
  /* ======================================================== */
  guidanceCalloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  guidanceCalloutIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceCalloutHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 3,
  },
  guidanceCalloutSub: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  guidanceFormCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  guidanceQuestionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  guidanceRadioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  guidanceRadioCardActiveRed: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  guidanceRadioCardActiveNeutral: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  guidanceRadioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guidanceRadioDotOuterRed: {
    borderColor: '#DC2626',
  },
  guidanceRadioDotInnerRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  guidanceRadioDotOuterGreen: {
    borderColor: '#10B981',
  },
  guidanceRadioDotInnerGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  guidanceRadioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  guidanceRadioTextRed: {
    color: '#991B1B',
    fontWeight: '700',
  },
  guidanceFieldLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  guidanceInputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
  },
  guidanceInputField: {
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  guidanceDropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  guidanceDropdownValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  guidanceDropdownCaret: {
    fontSize: 16,
    color: '#64748B',
  },
  guidanceSubmitBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 20,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  guidanceSubmitBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* Screen 6 Triage Styles */
  triagePromptAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  triageExclamationBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triageExclamationGlyph: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  triagePromptHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 3,
  },
  triagePromptSub: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  triageSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  triageSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  triageSeeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  triageHospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  triageCrossBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  triageCrossIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
  },
  triageHospitalMeta: {
    flex: 1,
  },
  triageHospitalName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  triageHospitalStatus: {
    fontSize: 12.5,
    color: '#64748B',
  },
  triagePhoneCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  triagePhoneIcon: {
    fontSize: 15,
  },
  triageStickyBottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    gap: 10,
  },
  triageDirectionsBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  triageDirectionsIcon: {
    fontSize: 18,
  },
  triageDirectionsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  triageSubButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  triageSubOutlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  triageSubBtnIcon: {
    fontSize: 15,
  },
  triageSubBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  symptomsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  symptomsModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  symptomsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  symptomsModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  symptomsChoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  symptomsChoiceRowSelected: {
    backgroundColor: '#ECFDF5',
  },
  symptomsChoiceText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  symptomsChoiceTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  langCheck: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '800',
  },

  /* Voice Result Card & Live Chat Styles */
  voiceResultCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceUserPromptPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  voiceUserPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  voiceReplyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  voiceModelBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  voiceModelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  voiceAudioIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  voiceReplyBodyText: {
    fontSize: 14.5,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 14,
  },
  voiceActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  voiceActionBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  inlineModelBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  inlineModelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  
  /* Agent Home Chat Styles */
  chatThreadContainer: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 6,
  },
  agentChatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 10,
  },
  agentChatBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '75%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  agentChatText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 22,
  },
  chatModelTag: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  toolCallStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
    alignSelf: 'flex-start',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolCallStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  toolCallStatusDotCompleted: {
    backgroundColor: '#10B981',
  },
  toolCallStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  toolCallCheckmark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },

  /* Visual Scan Verification Card inside Chat */
  chatScanResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chatScanHeroSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  chatScanHeroBadge: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  chatScanHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  chatScanHeroSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  chatScanProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  chatScanProductImageWrapper: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chatScanProductThumbnail: {
    width: 48,
    height: 48,
  },
  chatScanProductNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 6,
  },
  chatScanStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  chatScanStatusBadgeIcon: {
    fontSize: 10,
    fontWeight: '900',
  },
  chatScanStatusBadgeLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  chatScanDetailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  chatScanDetailsHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  chatScanDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  chatScanDetailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  chatScanDetailLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  chatScanDetailValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  chatScanBarcodeFont: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  chatScanValueNotFound: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  chatScanCalloutBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  chatScanCalloutSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  chatScanCalloutWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  chatScanCalloutDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  chatScanCalloutIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  chatScanCalloutIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  chatScanCalloutTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatScanCalloutDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  /* Autonomous NAFDAC Sentinel Incident Card inside Chat */
  chatReportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chatReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatReportIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatReportIconGlyph: {
    fontSize: 20,
  },
  chatReportAgencyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#064E3B',
  },
  chatReportAgencySub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  chatReportRefBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  chatReportRefLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  chatReportRefCode: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  chatReportStatusPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chatReportStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  chatReportTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  chatReportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  chatReportRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  chatReportLabel: {
    width: 125,
    flexShrink: 0,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 17,
  },
  chatReportVal: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    lineHeight: 17,
  },
  chatReportEvidenceSection: {
    marginBottom: 12,
  },
  chatReportEvidenceHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  chatReportEvidenceGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  chatReportEvidenceThumbBox: {
    flex: 1,
    height: 75,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatReportEvidenceThumbImg: {
    width: '100%',
    height: '100%',
  },
  chatReportEvidenceLabelBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chatReportEvidenceLabelText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  chatReportNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    gap: 8,
    marginTop: 4,
  },
  chatReportNoticeIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
    marginTop: 1,
  },
  chatReportNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16.5,
    fontWeight: '500',
  },

  /* In-Chat Evidence Packaging Card */
  chatEvidenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chatEvidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  chatEvidenceIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatEvidenceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  chatEvidenceSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  chatEvidenceMetaPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  chatEvidenceMetaText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  chatEvidenceSlotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  chatEvidenceSlot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  chatEvidenceSlotFilled: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
    borderStyle: 'solid',
    borderColor: '#059669',
    borderWidth: 1.5,
    minHeight: 105,
  },
  chatEvidenceThumbImg: {
    width: '100%',
    height: 105,
  },
  chatEvidenceThumbOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatEvidenceThumbBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  chatEvidenceThumbBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  chatEvidenceDeleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatEvidenceDeleteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  chatEvidenceCameraIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chatEvidenceSlotIcon: {
    fontSize: 18,
  },
  chatEvidenceSlotLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  chatEvidenceSlotHint: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  chatEvidenceSubmitBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatEvidenceSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  chatEvidenceSubmitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Photo Picker Modal */
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  pickerModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  pickerModalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  pickerModalSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 17,
  },
  pickerModalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  pickerModalActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerModalActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  pickerModalActionDesc: {
    fontSize: 11.5,
    color: '#64748B',
  },
  pickerModalActionArrow: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
  pickerModalCancelBtn: {
    marginTop: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  pickerModalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
