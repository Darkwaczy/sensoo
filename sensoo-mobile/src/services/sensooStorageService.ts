import * as FileSystem from 'expo-file-system/legacy';
import * as Device from 'expo-device';

export interface StoredScanItem {
  id: string;
  name: string;
  code: string;
  status: 'VERIFIED' | 'COUNTERFEIT' | 'WRONG_REGION';
  statusText: string;
  scenario: 'AUTHENTIC' | 'COUNTERFEIT' | 'ALREADY_PURCHASED' | 'IMPOSSIBLE_TRAVEL' | 'WRONG_REGION';
  time: string;
  timestamp: string;
  location?: string;
  imageUrl?: string;
  category?: string;
  batchId?: string;
  manufacturer?: string;
}

export interface DeviceLinkInfo {
  deviceId: string;
  deviceModel: string;
  deviceName: string;
  osName: string;
  osVersion: string;
  linkedAccount: string;
  linkedAt: string;
  status: 'LINKED' | 'UNLINKED';
}

const SCANS_FILE = `${FileSystem.documentDirectory || ''}sensoo_user_scans.json`;
const DEVICE_FILE = `${FileSystem.documentDirectory || ''}sensoo_device_identity.json`;

// In-memory cache to guarantee instantaneous synchronous returns
let cachedDeviceId: string | null = null;
let cachedScans: StoredScanItem[] = [];

/**
 * Generates or retrieves the permanent hardware-linked device ID for this phone.
 */
export async function getPersistentDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    const fileInfo = await FileSystem.getInfoAsync(DEVICE_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(DEVICE_FILE);
      const data: DeviceLinkInfo = JSON.parse(content);
      if (data && data.deviceId) {
        cachedDeviceId = data.deviceId;
        return data.deviceId;
      }
    }
  } catch (err) {
    console.warn('[Sensoo Storage] Notice reading device file:', err);
  }

  // Generate hardware-fingerprinted persistent ID
  const model = Device.modelName || Device.designName || 'Phone';
  const cleanModel = model.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newDeviceId = `SNS-${cleanModel || 'MOB'}-${randomSuffix}`;

  const linkInfo: DeviceLinkInfo = {
    deviceId: newDeviceId,
    deviceModel: Device.modelName || 'Universal Mobile',
    deviceName: Device.deviceName || 'Personal Device',
    osName: Device.osName || 'Android',
    osVersion: Device.osVersion || '14',
    linkedAccount: 'Ings (Primary Holder)',
    linkedAt: new Date().toISOString(),
    status: 'LINKED',
  };

  try {
    await FileSystem.writeAsStringAsync(DEVICE_FILE, JSON.stringify(linkInfo, null, 2));
  } catch (writeErr) {
    console.warn('[Sensoo Storage] Error saving device identity:', writeErr);
  }

  cachedDeviceId = newDeviceId;
  return newDeviceId;
}

/**
 * Returns full device telemetry & link status for the user profile.
 */
export async function getDeviceLinkInfo(): Promise<DeviceLinkInfo> {
  const deviceId = await getPersistentDeviceId();
  try {
    const fileInfo = await FileSystem.getInfoAsync(DEVICE_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(DEVICE_FILE);
      return JSON.parse(content);
    }
  } catch {
    // fallback
  }

  return {
    deviceId,
    deviceModel: Device.modelName || 'Universal Mobile',
    deviceName: Device.deviceName || 'Personal Device',
    osName: Device.osName || 'Android',
    osVersion: Device.osVersion || '14',
    linkedAccount: 'Ings (Primary Holder)',
    linkedAt: new Date().toISOString(),
    status: 'LINKED',
  };
}

/**
 * Saves a scan into the local device history and dispatches listeners.
 */
export async function saveScanToLocalHistory(item: Omit<StoredScanItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<StoredScanItem> {
  const fullItem: StoredScanItem = {
    id: item.id || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: item.name,
    code: item.code,
    status: item.status,
    statusText: item.statusText,
    scenario: item.scenario,
    time: item.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: item.timestamp || new Date().toISOString(),
    location: item.location || 'Current Location',
    imageUrl: item.imageUrl,
    category: item.category,
    batchId: item.batchId,
    manufacturer: item.manufacturer,
  };

  try {
    const existing = await getStoredScans();
    // Prepend to top, deduplicate identical barcode scans done within last 10 seconds
    const filtered = existing.filter(
      (s) => !(s.code === fullItem.code && Math.abs(new Date(s.timestamp).getTime() - new Date(fullItem.timestamp).getTime()) < 10000)
    );
    const updated = [fullItem, ...filtered].slice(0, 100); // keep up to 100 items

    cachedScans = updated;
    await FileSystem.writeAsStringAsync(SCANS_FILE, JSON.stringify(updated, null, 2));
  } catch (err) {
    console.warn('[Sensoo Storage] Error saving scan to local file:', err);
    cachedScans = [fullItem, ...cachedScans];
  }

  return fullItem;
}

/**
 * Retrieves all stored scans saved on this device.
 */
export async function getStoredScans(): Promise<StoredScanItem[]> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(SCANS_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(SCANS_FILE);
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        cachedScans = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Sensoo Storage] Error reading scans file:', err);
  }

  return cachedScans;
}

/**
 * Clears stored scan history.
 */
export async function clearStoredScans(): Promise<void> {
  try {
    await FileSystem.deleteAsync(SCANS_FILE, { idempotent: true });
    cachedScans = [];
  } catch (err) {
    console.warn('[Sensoo Storage] Error clearing scans:', err);
  }
}
