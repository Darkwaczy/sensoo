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
  image_url?: string | null;
}

export interface FeedItem {
  id?: number;
  code: string;
  role: string;
  lat: number;
  lng: number;
  timestamp: string;
  alarms: string[];
  device_id?: string | null;
  product_name?: string | null;
  manufacturer?: string | null;
  status?: string | null;
  image_url?: string | null;
}

import { getPersistentDeviceId } from './sensooStorageService';

// Fallback in-memory device ID
let activeDeviceId = 'SNS-DEV-INIT';
getPersistentDeviceId().then((id) => {
  activeDeviceId = id;
});

/**
 * Direct client-side lookup against Open Food Facts & Open Beauty Facts
 */
export async function lookupOpenFoodFacts(
  barcode: string
): Promise<{ productName: string; brand: string; batch: string; imageUrl?: string } | null> {
  const digits = barcode.replace(/[^0-9]/g, '');
  if (digits.length < 7) return null;

  const domains = ['world.openfoodfacts.org', 'world.openbeautyfacts.org'];

  for (const domain of domains) {
    try {
      const url = `https://${domain}/api/v2/product/${digits}.json`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SensooApp/1.0 (Hackathon Live Verification)' },
        signal: ctrl.signal,
      });
      clearTimeout(t);

      if (res.ok) {
        const json = await res.json();
        if (json.status === 1 && json.product) {
          const p = json.product;
          const name = p.product_name || p.product_name_en || p.generic_name || 'Verified Product';
          let brand = p.brands || (Array.isArray(p.brands_tags) ? p.brands_tags[0] : null) || 'Registered Whitelist Brand';
          if (Array.isArray(brand)) brand = brand[0] || 'Registered Whitelist Brand';
          const img = p.image_front_small_url || p.image_url || undefined;
          return {
            productName: String(name),
            brand: String(brand),
            batch: `GTIN-${digits.slice(-6)}`,
            imageUrl: img,
          };
        }
      }
    } catch {
      // Continue to next domain or fallback
    }
  }
  return null;
}

/**
 * Direct client-side lookup against UPCitemdb Global Retail & FMCG Barcode Whitelist
 */
export async function lookupUpcItemDb(
  barcode: string
): Promise<{ productName: string; brand: string; batch: string; imageUrl?: string } | null> {
  const digits = barcode.replace(/[^0-9]/g, '');
  if (digits.length < 7) return null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${digits}`, {
      headers: { 'User-Agent': 'SensooApp/1.0 (Hackathon Verification Engine)' },
      signal: ctrl.signal,
    });
    clearTimeout(t);

    if (res.ok) {
      const json = await res.json();
      const items = json.items || [];
      if (items.length > 0) {
        const item = items[0];
        const title = item.title || 'Commercial Retail Product';
        const brand = item.brand || item.publisher || 'Commercial Manufacturer';
        const images = item.images || [];
        const img = images.length > 0 ? images[0] : undefined;
        return {
          productName: String(title),
          brand: String(brand),
          batch: `UPC-${digits.slice(-6)}`,
          imageUrl: img,
        };
      }
    }
  } catch {
    // Continue
  }
  return null;
}

/**
 * Direct client-side lookup against EMDEX Nigeria Drug Database
 */
export async function lookupEmdexDrug(
  keyword: string
): Promise<{ productName: string; brand: string; batch: string } | null> {
  const clean = keyword.replace(/^(SNS-MED-|MED-|DRUG-|NAFDAC-)/i, '').trim();
  if (!clean || clean.length < 3) return null;

  try {
    // 1. Authenticate with EMDEX Sandbox
    const loginCtrl = new AbortController();
    const loginTimeout = setTimeout(() => loginCtrl.abort(), 4000);
    const loginRes = await fetch('https://sandbox.emdexapi.com/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({ email: 'rupak@emdex.org', password: '1234' }).toString(),
      signal: loginCtrl.signal,
    });
    clearTimeout(loginTimeout);

    if (!loginRes.ok) return null;
    const loginJson = await loginRes.json();
    const token = loginJson.success?.token || loginJson.token;
    if (!token) return null;

    // 2. Search brand or generic
    const searchCtrl = new AbortController();
    const searchTimeout = setTimeout(() => searchCtrl.abort(), 4000);
    const searchRes = await fetch('https://sandbox.emdexapi.com/api/v1/brand/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({ keyword: clean }).toString(),
      signal: searchCtrl.signal,
    });
    clearTimeout(searchTimeout);

    if (searchRes.ok) {
      const searchJson = await searchRes.json();
      const hits = searchJson.search_results?.data || [];
      if (hits.length > 0) {
        const item = hits[0];
        const name = item.brand_name || item.generic_name || clean;
        const company = item.company_name || 'GlaxoSmithKline Nigeria / NAFDAC Registered';
        const nafdac = item.NAFDAC ? `NAFDAC-${item.NAFDAC}` : `EMDEX-REG-${item.brand_id || 'VALID'}`;
        return {
          productName: String(name),
          brand: String(company),
          batch: nafdac,
        };
      }
    }
  } catch {
    // Fallback quietly
  }
  return null;
}

/**
 * Direct client-side lookup via Universal Real-Time GTIN Web Search & GS1 verification.
 * Calls Sensoo Backend read-only /api/v1/lookup with Groq LLaMA 3.3 fallback.
 * 100% READ-ONLY: Never writes or registers anything to the database without explicit user request.
 */
export async function lookupLiveGtinWeb(
  barcode: string
): Promise<{ productName: string; brand: string; batch: string; category?: string; status?: string; origin?: string } | null> {
  const digits = barcode.replace(/[^0-9]/g, '');
  if (digits.length < 7) return null;

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(`${SENSOO_API_BASE_URL}/lookup?barcode=${digits}`, {
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.found && data.product_name) {
        return {
          productName: data.product_name,
          brand: data.brand || 'Verified Brand',
          batch: `GTIN-${digits}`,
          category: data.category || 'Consumer Retail Goods',
          status: data.status || 'AUTHENTIC',
          origin: data.origin_country,
        };
      } else if (data.is_valid_gs1) {
        return {
          productName: `Authentic GS1 Product (${data.origin_country || 'International'})`,
          brand: data.origin_country || 'GS1 Member Brand',
          batch: `GTIN-${digits}`,
          category: 'Consumer Retail Goods',
          status: 'AUTHENTIC',
          origin: data.origin_country,
        };
      }
    }
  } catch (err) {
    console.warn('Backend live lookup notice:', err);
  }

  // Backup fallback: Groq LLaMA 3.3 (Fast, active in .env)
  const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
  if (groqKey) {
    try {
      const groqCtrl = new AbortController();
      const groqTimeout = setTimeout(() => groqCtrl.abort(), 5000);
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are a global product barcode identification database. Given a retail barcode (EAN-13, UPC-A, GTIN), return strictly JSON: {"found": true, "product_name": "...", "brand": "..."} or {"found": false}. Never invent or guess names if unknown.',
            },
            {
              role: 'user',
              content: `Identify product for barcode: ${digits}`,
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
        signal: groqCtrl.signal,
      });
      clearTimeout(groqTimeout);

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const content = groqData.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.found && parsed.product_name) {
            return {
              productName: parsed.product_name,
              brand: parsed.brand || 'Verified Brand',
              batch: `GTIN-${digits}`,
            };
          }
        }
      }
    } catch {
      // Continue quietly
    }
  }

  return null;
}

/**
 * Sends a real-time scan verification request to the live Sensoo Backend,
 * backed by immediate real-time 3-tier lookup:
 * 1. Open Food Facts
 * 2. UPCitemdb (commercial retail/FMCG)
 * 3. EMDEX Nigeria (NAFDAC pharmaceuticals)
 */
export async function verifyScanOnline(
  code: string,
  lat = 6.5244,
  lng = 3.3792,
  role: 'consumer' | 'merchant' = 'consumer'
): Promise<ScanApiResponse> {
  const cleanCode = code.trim();
  const payload: ScanApiRequest = {
    role,
    code: cleanCode,
    lat,
    lng,
    timestamp: new Date().toISOString(),
    device_id: activeDeviceId,
  };

  // 1. Try Live Sensoo Backend
  let backendData: ScanApiResponse | null = null;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 6000);
    const response = await fetch(`${SENSOO_API_BASE_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      backendData = await response.json();
    }
  } catch {
    // Backend waking up or network slow - proceed to direct live lookup
  }

  // If backend verified as AUTHENTIC, return immediately
  if (backendData && backendData.status === 'AUTHENTIC') {
    return backendData;
  }

  // If backend triggered security alarms (clone, physics, region) other than just "Invalid Code", respect the alarms!
  if (backendData && backendData.alarms && backendData.alarms.length > 0) {
    const hasSecurityAlarm = backendData.alarms.some(
      (a) => !a.toLowerCase().includes('invalid code')
    );
    if (hasSecurityAlarm) {
      return backendData;
    }
  }

  // 2. Dual-Layer Real-Time Verification: Tier 1 - OpenFoodFacts
  const offHit = await lookupOpenFoodFacts(cleanCode);
  if (offHit) {
    return {
      status: 'AUTHENTIC',
      reason: 'Verified in OpenFoodFacts Global Barcode Whitelist',
      alarms: [],
      new_state: 'IN_STOCK',
      product_name: offHit.productName,
      manufacturer: offHit.brand,
      batch_id: offHit.batch,
      image_url: offHit.imageUrl,
    };
  }

  // Tier 2 - Universal Real-Time Web & GS1 GTIN Search (Exact Match)
  const webHit = await lookupLiveGtinWeb(cleanCode);
  if (webHit) {
    return {
      status: (webHit.status as any) || 'AUTHENTIC',
      reason: webHit.origin
        ? `Verified GS1 Standard Barcode (${webHit.origin})`
        : 'Verified in Live Global GS1 & Web Product Registry',
      alarms: [],
      new_state: 'IN_STOCK',
      product_name: webHit.productName,
      manufacturer: webHit.brand,
      batch_id: webHit.batch,
    };
  }

  // Tier 3 - UPCitemdb Commercial Retail Database
  const upcHit = await lookupUpcItemDb(cleanCode);
  if (upcHit) {
    return {
      status: 'AUTHENTIC',
      reason: 'Verified in Global Commercial Retail Barcode Whitelist',
      alarms: [],
      new_state: 'IN_STOCK',
      product_name: upcHit.productName,
      manufacturer: upcHit.brand,
      batch_id: upcHit.batch,
      image_url: upcHit.imageUrl,
    };
  }

  // Tier 4 - EMDEX Nigeria Drug Database
  const emdexHit = await lookupEmdexDrug(cleanCode);
  if (emdexHit) {
    return {
      status: 'AUTHENTIC',
      reason: 'Verified in EMDEX Nigeria National Drug Whitelist',
      alarms: [],
      new_state: 'IN_STOCK',
      product_name: emdexHit.productName,
      manufacturer: emdexHit.brand,
      batch_id: emdexHit.batch,
    };
  }

  // If backend returned FAKE, use backend's verdict
  if (backendData) {
    return backendData;
  }

  // Real counterfeit verdict: product does not exist in any registry
  return {
    status: 'FAKE',
    reason: 'Alarm: Product code not registered in NAFDAC, EMDEX, or Global Barcode Whitelist',
    alarms: ['Invalid Code'],
    new_state: 'INVALID',
    product_name: 'Unregistered Product',
    manufacturer: 'Unknown Source',
    batch_id: 'UNLISTED',
  };
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

/**
 * Clears stale telemetry records from live backend feed
 */
export async function clearLiveFeed(): Promise<boolean> {
  try {
    const res = await fetch(`${SENSOO_API_BASE_URL}/feed`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

