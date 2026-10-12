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

// Default initial state: unauthenticated, real sessions only
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
 * Register a new user via MSFLib FastAPI auth endpoint
 * POST /api/v1/auth/register
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

  const destination = cleanEmail || cleanPhone;
  let authToken: string | undefined = undefined;

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

    const regData = await regRes.json();

    if (!regRes.ok) {
      return {
        success: false,
        destination,
        message: regData.detail || 'Registration failed. Please check your details.',
      };
    }

    authToken = regData.access_token;
  } catch (err: any) {
    return {
      success: false,
      destination,
      message: err.message || 'Network error connecting to Sensoo auth service.',
    };
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
 * Sign in an existing user with email/phone & password or OTP
 * POST /api/v1/auth/login or POST /api/v1/auth/password-recovery
 */
export async function loginUser(params: {
  identifier: string;
  password?: string;
  useOtp?: boolean;
}): Promise<{ success: boolean; requiresOtp: boolean; message: string }> {
  const id = params.identifier.trim();
  const cleanEmail = id.includes('@') ? id.toLowerCase() : `${id.replace(/\s+/g, '')}@sensoo.app`;

  if (params.useOtp) {
    try {
      const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        return {
          success: false,
          requiresOtp: false,
          message: otpData.detail || 'Could not send verification code.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        requiresOtp: false,
        message: err.message || 'Network error requesting OTP code.',
      };
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

  // Password mode: strictly validate entered password
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
 * Verify OTP entered by the user
 * POST /api/v1/auth/verify-token
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

  try {
    const verRes = await fetch(`${SENSOO_API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        token: enteredOtp.trim(),
      }),
    });

    const verData = await verRes.json();

    if (!verRes.ok) {
      return {
        success: false,
        message: verData.detail || 'Invalid or expired verification code.',
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
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error verifying code.',
    };
  }
}

/**
 * Resend OTP code via Resend API
 * POST /api/v1/auth/password-recovery
 */
export async function resendOtpCode(): Promise<{ success: boolean; message: string }> {
  const pUser = currentAuth.pendingUser || {};
  const email = pUser.email || '';
  const dest = currentAuth.pendingOtpDestination || email || 'your email';

  if (!email) {
    return { success: false, message: 'No registered email found to resend code.' };
  }

  try {
    const otpRes = await fetch(`${SENSOO_API_BASE_URL}/auth/password-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await otpRes.json();

    if (!otpRes.ok) {
      return { success: false, message: data.detail || 'Could not resend code.' };
    }

    return {
      success: true,
      message: `A new verification code has been sent to ${dest}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error resending code.',
    };
  }
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
