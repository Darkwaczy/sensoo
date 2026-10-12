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

let currentAuth: AuthState = {
  user: null,
  isAuthenticated: false,
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
 * Dispatch branded Sensoo verification OTP email via Resend API
 */
async function sendResendEmailDirect(toEmail: string, otpCode: string, userName?: string): Promise<boolean> {
  let fallbackKey = '';
  let fallbackFrom = 'Sensoo Security <verify@inboxsync.co.uk>';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const local = require('./localResendKey');
    fallbackKey = local.LOCAL_RESEND_KEY || '';
    fallbackFrom = local.LOCAL_RESEND_FROM || fallbackFrom;
  } catch {}

  const key = process.env.EXPO_PUBLIC_RESEND_API_KEY || fallbackKey;
  const from = (process.env.EXPO_PUBLIC_RESEND_FROM || fallbackFrom).replace(/^"|"$/g, '');

  if (!key || !toEmail) {
    console.warn('[AuthService] Resend API key or email missing, key present:', Boolean(key));
    return false;
  }

  const displayName = userName || 'Valued User';
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Sensoo Verification</title></head>
<body style="margin: 0; padding: 24px; background-color: #F8FAFC; font-family: sans-serif; color: #1E293B;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0F766E 0%, #00875A 100%); padding: 28px 24px; text-align: center;">
      <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; letter-spacing: 2px;">SENSOO</h1>
      <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 12px; text-transform: uppercase;">Product Authenticity &amp; Verification</p>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px; font-size: 18px; color: #0F172A;">Verify Your Account</h2>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #475569;">
        Hello <strong>${displayName}</strong>,<br>
        Your 4-digit verification code is:
      </p>
      <div style="background-color: #F0FDF4; border: 2px dashed #00875A; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #00875A; font-family: monospace;">${otpCode}</span>
        <span style="display: block; font-size: 11px; color: #047857; margin-top: 6px;">Valid for 10 minutes</span>
      </div>
      <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
        If you did not make this request, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        to: [toEmail.trim()],
        subject: `Your Sensoo Verification Code is ${otpCode}`,
        html,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[AuthService] Resend direct send failed:', err);
    return false;
  }
}

/**
 * Register a new user
 * Contacts backend or safely uses Resend directly if Render is updating
 */
export async function registerUser(params: {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}): Promise<{ success: boolean; destination: string; message: string }> {
  const cleanName = params.fullName.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPhone = params.phone.trim();
  const pass = params.password ? params.password.trim() : '';

  if (!cleanEmail) {
    return { success: false, destination: cleanEmail, message: 'Email address is required.' };
  }
  if (!pass || pass.length < 6) {
    return { success: false, destination: cleanEmail, message: 'Password must be at least 6 characters.' };
  }

  const destination = cleanEmail;
  let authToken: string | undefined = undefined;
  let backendSuccess = false;
  const localOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

  try {
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
      const regData = await regRes.json();
      authToken = regData.access_token;
      backendSuccess = true;
    } else if (regRes.status !== 404) {
      const regData = await regRes.json().catch(() => ({}));
      if (regData.detail) {
        return {
          success: false,
          destination,
          message: regData.detail,
        };
      }
    }
  } catch (err) {
    console.warn('[AuthService] Backend register fetch error:', err);
  }

  // If backend was 404 (Render deploying), send the email directly via Resend API
  if (!backendSuccess) {
    await sendResendEmailDirect(cleanEmail, localOtp, cleanName);
    currentAuth.pendingOtpCode = localOtp;
  }

  currentAuth.pendingOtpDestination = destination;
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
    destination,
    message: `Verification code sent to ${destination}`,
  };
}

/**
 * Sign in existing user with password or OTP
 */
export async function loginUser(params: {
  identifier: string;
  password?: string;
  useOtp?: boolean;
}): Promise<{ success: boolean; requiresOtp: boolean; message: string }> {
  const id = params.identifier.trim();
  const cleanEmail = id.includes('@') ? id.toLowerCase() : `${id.replace(/\s+/g, '')}@sensoo.app`;

  if (params.useOtp) {
    const localOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    let backendOtpSent = false;

    try {
      const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (otpRes.ok) {
        backendOtpSent = true;
      }
    } catch {}

    if (!backendOtpSent) {
      await sendResendEmailDirect(cleanEmail, localOtp, id);
      currentAuth.pendingOtpCode = localOtp;
    }

    currentAuth.pendingOtpDestination = id;
    currentAuth.pendingUser = {
      fullName: id.includes('@') ? id.split('@')[0] : 'User',
      email: cleanEmail,
      phone: !id.includes('@') ? id : '',
      isVerified: false,
    };

    return {
      success: true,
      requiresOtp: true,
      message: `Verification code sent to ${id}`,
    };
  }

  // Password mode
  if (!params.password) {
    return {
      success: false,
      requiresOtp: false,
      message: 'Please enter your password.',
    };
  }

  try {
    const loginRes = await fetch(`${SENSOO_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        username: cleanEmail,
        password: params.password,
      }),
    });

    const data = await loginRes.json();

    if (!loginRes.ok) {
      return {
        success: false,
        requiresOtp: false,
        message: data.detail || 'Incorrect email or password.',
      };
    }

    const account = data.account || {};
    currentAuth.user = {
      id: String(account.id || `USR-${Date.now().toString().slice(-6)}`),
      fullName: account.full_name || 'Sensoo Member',
      email: account.email || cleanEmail,
      phone: account.phone || '',
      isVerified: true,
      token: data.access_token,
      role: (account.role as any) || 'consumer',
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
  } catch (err: any) {
    return {
      success: false,
      requiresOtp: false,
      message: err.message || 'Network error during sign in.',
    };
  }
}

/**
 * Verify OTP entered by user
 */
export async function verifyOtpCode(
  enteredOtp: string
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  const pUser = currentAuth.pendingUser || {};
  const email = pUser.email || '';

  if (!email) {
    return {
      success: false,
      message: 'No pending verification found. Please request a new code.',
    };
  }

  let isVerified = false;

  try {
    const verRes = await fetch(`${SENSOO_API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        token: enteredOtp.trim(),
      }),
    });

    if (verRes.ok) {
      isVerified = true;
    }
  } catch {}

  // Fallback check against local OTP sent via Resend
  if (!isVerified && currentAuth.pendingOtpCode && enteredOtp.trim() === currentAuth.pendingOtpCode) {
    isVerified = true;
  }

  if (!isVerified) {
    return {
      success: false,
      message: 'Invalid or expired verification code. Please check your email.',
    };
  }

  const newUser: UserProfile = {
    id: pUser.id || `USR-${Date.now().toString().slice(-6)}`,
    fullName: pUser.fullName || 'Sensoo Member',
    email: email,
    phone: pUser.phone || '',
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
 */
export async function resendOtpCode(): Promise<{ success: boolean; message: string }> {
  const pUser = currentAuth.pendingUser || {};
  const email = pUser.email || '';
  const dest = currentAuth.pendingOtpDestination || email || 'your email';

  if (!email) {
    return { success: false, message: 'No registered email found to resend code.' };
  }

  const localOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
  let backendSent = false;

  try {
    const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (otpRes.ok) backendSent = true;
  } catch {}

  if (!backendSent) {
    await sendResendEmailDirect(email, localOtp, pUser.fullName);
    currentAuth.pendingOtpCode = localOtp;
  }

  return {
    success: true,
    message: `A new verification code has been sent to ${dest}`,
  };
}

/**
 * Sign out user
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
