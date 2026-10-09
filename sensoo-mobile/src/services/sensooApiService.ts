const DEFAULT_BASE_URL = 'https://sensoo-app-final-2.onrender.com/api/v1';

export const SENSOO_API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL
).replace(/\/+$/, '');

export interface ScanApiRequest {
  role: 'consumer' | 'merchant';
  code: string;
  lat: number;
  lng: number;
  timestamp?: string;
  device_id?: string;
}

export interface ScanApiResponse {
  status: 'AUTHENTIC' | 'FAKE';
  reason: string;
  alarms: string[];
  new_state: string | null;
  product_name: string | null;
  manufacturer: string | null;
  batch_id: string | null;
}

export interface FeedItem {
  code: string;
  role: string;
  lat: number;
  lng: number;
  timestamp: string;
  alarms: string[];
  device_id?: string | null;
}

// Generate a lightweight persistent device ID for cross-phone clone telemetry
const getDeviceId = (): string => {
  try {
    return 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  } catch {
    return 'DEV-SENSOO-CLIENT';
  }
};

const DEFAULT_DEVICE_ID = getDeviceId();

/**
 * Sends a real-time scan verification request to the live Sensoo Backend.
 */
export async function verifyScanOnline(
  code: string,
  lat = 6.5244,
  lng = 3.3792,
  role: 'consumer' | 'merchant' = 'consumer'
): Promise<ScanApiResponse> {
  const payload: ScanApiRequest = {
    role,
    code: code.trim(),
    lat,
    lng,
    timestamp: new Date().toISOString(),
    device_id: DEFAULT_DEVICE_ID,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const response = await fetch(`${SENSOO_API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data: ScanApiResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Sensoo API request failed or timed out:', error);
    throw error;
  }
}

/**
 * Fetches recent scans for NAFDAC-style live monitoring feed.
 */
export async function fetchLiveFeed(limit = 20): Promise<FeedItem[]> {
  try {
    const res = await fetch(`${SENSOO_API_BASE_URL}/feed?limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Health check for Sensoo API
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SENSOO_API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
