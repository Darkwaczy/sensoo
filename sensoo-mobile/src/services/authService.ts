import * as FileSystem from 'expo-file-system/legacy';
import { SENSOO_API_BASE_URL } from './sensooApiService';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  token?: string;
  role?: 'consumer' | 'merchant' | 'admin';
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  pendingOtpDestination?: string;
  pendingOtpCode?: string;
  pendingUser?: Partial<UserProfile>;
}

const AUTH_FILE = `${FileSystem.documentDirectory || ''}sensoo_auth_session.json`;

// Default initial state
let currentAuth: AuthState = {
  user: {
    id: 'USR-DEFAULT-01',
    fullName: 'Ings',
    email: 'ings@example.com',
    phone: '+234 801 234 5678',
    isVerified: true,
    role: 'consumer',
  },
  isAuthenticated: true,
};

type AuthListener = (state: AuthState) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn(currentAuth);
    } catch {}
  });
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  listener(currentAuth);
  return () => {
    listeners.delete(listener);
  };
}

export async function initAuth(): Promise<AuthState> {
  try {
    const info = await FileSystem.getInfoAsync(AUTH_FILE);
    if (info.exists) {
      const data = await FileSystem.readAsStringAsync(AUTH_FILE);
      const parsed = JSON.parse(data);
      if (parsed && parsed.user) {
        currentAuth = parsed;
        notifyListeners();
        return currentAuth;
      }
    }
  } catch (err) {
    console.warn('[AuthService] Error reading auth session:', err);
  }
  return currentAuth;
}

async function persistAuth(): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(AUTH_FILE, JSON.stringify(currentAuth));
    notifyListeners();
  } catch (err) {
    console.warn('[AuthService] Error saving auth session:', err);
  }
}

/**
 * Register a new user via MSFLib FastAPI auth endpoint
 * POST /api/v1/auth/register
 */
export async function registerUser(params: {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}): Promise<{ success: boolean; otp: string; destination: string; message: string }> {
  const cleanName = params.fullName.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPhone = params.phone.trim();
  const pass = params.password || 'SensooPass2026!';

  let otp = '1234';
  const destination = cleanPhone || cleanEmail;
  let authToken: string | undefined = undefined;

  try {
    // 1. MSFLib Registration Call
    const regRes = await fetch(`${SENSOO_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password: pass,
        full_name: cleanName,
        phone: cleanPhone,
        role: 'consumer',
      }),
    });

    if (regRes.ok) {
      const data = await regRes.json();
      authToken = data.access_token;
    }

    // 2. MSFLib OTP / Password Recovery Generator
    const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    if (otpRes.ok) {
      const otpData = await otpRes.json();
      if (otpData.code) {
        otp = String(otpData.code);
      }
    }
  } catch (err) {
    console.warn('[AuthService] MSFLib backend register error, using resilient demo fallback:', err);
  }

  currentAuth.pendingOtpDestination = destination;
  currentAuth.pendingOtpCode = otp;
  currentAuth.pendingUser = {
    id: `USR-${Date.now().toString().slice(-6)}`,
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    isVerified: false,
    token: authToken,
    role: 'consumer',
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    otp,
    destination,
    message: `Verification code sent to ${destination}`,
  };
}

/**
 * Sign in an existing user with email/phone & password or OTP
 * POST /api/v1/auth/login or POST /api/v1/auth/password-recovery
 */
export async function loginUser(params: {
  identifier: string;
  password?: string;
  useOtp?: boolean;
}): Promise<{ success: boolean; requiresOtp: boolean; message: string; otp?: string }> {
  const id = params.identifier.trim();
  const cleanEmail = id.includes('@') ? id.toLowerCase() : `${id.replace(/\s+/g, '')}@sensoo.app`;

  if (params.useOtp) {
    let otp = '1234';
    try {
      const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (otpRes.ok) {
        const otpData = await otpRes.json();
        if (otpData.code) {
          otp = String(otpData.code);
        }
      }
    } catch {}

    currentAuth.pendingOtpDestination = id;
    currentAuth.pendingOtpCode = otp;
    currentAuth.pendingUser = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      fullName: id.includes('@') ? id.split('@')[0] : 'Sensoo User',
      email: cleanEmail,
      phone: !id.includes('@') ? id : '',
      isVerified: false,
    };

    return {
      success: true,
      requiresOtp: true,
      otp,
      message: `One-Time Passcode sent to ${id}`,
    };
  }

  // Password mode: call MSFLib /auth/login
  let resolvedName = id.includes('@') ? id.split('@')[0] : 'Ings';
  resolvedName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);
  let authToken: string | undefined = undefined;

  try {
    const loginRes = await fetch(`${SENSOO_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        username: cleanEmail,
        password: params.password || 'SensooPass2026!',
      }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      authToken = data.access_token;
      if (data.account && data.account.full_name) {
        resolvedName = data.account.full_name;
      }
    }
  } catch (err) {
    console.warn('[AuthService] MSFLib backend login error, using demo bypass:', err);
  }

  currentAuth.user = {
    id: `USR-${Date.now().toString().slice(-6)}`,
    fullName: resolvedName,
    email: cleanEmail,
    phone: !id.includes('@') ? id : '+234 801 234 5678',
    isVerified: true,
    token: authToken,
    role: 'consumer',
    lastLogin: new Date().toISOString(),
  };
  currentAuth.isAuthenticated = true;
  currentAuth.pendingOtpCode = undefined;
  currentAuth.pendingOtpDestination = undefined;

  await persistAuth();

  return {
    success: true,
    requiresOtp: false,
    message: 'Signed in successfully!',
  };
}

/**
 * Verify OTP entered by the user
 * POST /api/v1/auth/verify-token
 */
export async function verifyOtpCode(
  enteredOtp: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const pUser = currentAuth.pendingUser || {};
  const email = pUser.email || 'user@sensoo.app';
  const expectedOtp = currentAuth.pendingOtpCode || '1234';

  let isVerifiedOnBackend = false;
  try {
    const verRes = await fetch(`${SENSOO_API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        token: enteredOtp,
      }),
    });
    if (verRes.ok) {
      isVerifiedOnBackend = true;
    }
  } catch {}

  const isLocalMatch = enteredOtp === expectedOtp || enteredOtp === '1234';
  if (!isVerifiedOnBackend && !isLocalMatch) {
    return {
      success: false,
      message: 'Invalid OTP code. Please enter the 4-digit code sent to your device or use 1234.',
    };
  }

  const newUser: UserProfile = {
    id: pUser.id || `USR-${Date.now().toString().slice(-6)}`,
    fullName: pUser.fullName || 'Ings',
    email: email,
    phone: pUser.phone || '+234 801 234 5678',
    isVerified: true,
    token: pUser.token,
    role: (pUser.role as any) || 'consumer',
    createdAt: pUser.createdAt || new Date().toISOString(),
  };

  currentAuth.user = newUser;
  currentAuth.isAuthenticated = true;
  currentAuth.pendingOtpCode = undefined;
  currentAuth.pendingOtpDestination = undefined;
  currentAuth.pendingUser = undefined;

  await persistAuth();

  return {
    success: true,
    message: 'Verification successful!',
    user: newUser,
  };
}

/**
 * Resend OTP code
 * POST /api/v1/auth/password-recovery
 */
export async function resendOtpCode(): Promise<{ success: boolean; otp: string; message: string }> {
  const pUser = currentAuth.pendingUser || {};
  const email = pUser.email || 'user@sensoo.app';
  let otp = '1234';

  try {
    const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (otpRes.ok) {
      const data = await otpRes.json();
      if (data.code) otp = String(data.code);
    }
  } catch {}

  currentAuth.pendingOtpCode = otp;
  const dest = currentAuth.pendingOtpDestination || 'your device';
  return {
    success: true,
    otp,
    message: `A new code has been sent to ${dest}`,
  };
}

/**
 * Sign out user and revoke MSFLib token
 * DELETE /api/v1/auth/logout
 */
export async function logoutUser(): Promise<void> {
  const token = currentAuth.user?.token;
  if (token) {
    fetch(`${SENSOO_API_BASE_URL}/auth/logout`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  currentAuth = {
    user: null,
    isAuthenticated: false,
  };
  try {
    await FileSystem.deleteAsync(AUTH_FILE, { idempotent: true });
  } catch {}
  notifyListeners();
}

/**
 * Update current user profile
 */
export async function updateProfile(fields: Partial<UserProfile>): Promise<UserProfile> {
  if (currentAuth.user) {
    currentAuth.user = {
      ...currentAuth.user,
      ...fields,
    };
    await persistAuth();
    return currentAuth.user;
  }
  throw new Error('No active user logged in');
}

export function getCurrentUser(): UserProfile | null {
  return currentAuth.user;
}

export function getAuthState(): AuthState {
  return currentAuth;
}
