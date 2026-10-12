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
  pendingUser?: Partial<UserProfile> & { password?: string };
}

const AUTH_FILE = `${FileSystem.documentDirectory || ''}sensoo_auth_session.json`;
const USERS_DB_FILE = `${FileSystem.documentDirectory || ''}sensoo_users_db.json`;

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

async function loadLocalUsers(): Promise<Record<string, any>> {
  try {
    const info = await FileSystem.getInfoAsync(USERS_DB_FILE);
    if (info.exists) {
      const data = await FileSystem.readAsStringAsync(USERS_DB_FILE);
      return JSON.parse(data) || {};
    }
  } catch {}
  return {};
}

async function saveLocalUser(user: { email: string; fullName: string; phone: string; password?: string }): Promise<void> {
  try {
    const users = await loadLocalUsers();
    users[user.email.toLowerCase()] = {
      ...user,
      email: user.email.toLowerCase(),
      updatedAt: new Date().toISOString(),
    };
    await FileSystem.writeAsStringAsync(USERS_DB_FILE, JSON.stringify(users));
  } catch (err) {
    console.warn('[AuthService] Error saving local user:', err);
  }
}

/**
 * Dispatch branded Sensoo verification OTP email via Resend API
 */
async function sendResendEmailDirect(toEmail: string, otpCode: string, userName?: string): Promise<boolean> {
  let fallbackKey = '';
  let fallbackFrom = 'Sensoo <verify@inboxsync.co.uk>';
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

  const cleanCode = String(otpCode).trim();
  const formattedCode =
    cleanCode.length === 6
      ? `${cleanCode.slice(0, 3)} ${cleanCode.slice(3)}`
      : cleanCode.length === 4
      ? `${cleanCode.slice(0, 2)} ${cleanCode.slice(2)}`
      : cleanCode;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Sensoo verification code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  
  <!-- Preheader Snippet for Inbox Preview (Matches Gmail preview pane) -->
  <div style="display: none; font-size: 1px; color: #FFFFFF; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Your Sensoo verification code is ${formattedCode}. Enter this code on Sensoo to complete your signup.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F3F4F3; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main White/Ivory Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: #F7F6F2; border-radius: 20px; overflow: hidden; border: 1px solid #E2E6E2; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
          
          <!-- Inner Content Padding -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              
              <!-- Brand Header Row -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 22px;">
                <tr>
                  <td align="left" valign="middle" style="width: 50%;">
                    <img src="https://raw.githubusercontent.com/mavlon00/sensoo-app-final/main/assets/email/logo.png" alt="Sensoo" width="138" style="display: block; border: 0; width: 138px; height: auto; outline: none;" />
                  </td>
                  <td align="right" valign="middle" style="width: 50%;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10.5px; font-weight: 700; color: #0C3823; letter-spacing: 1.5px; line-height: 1.35; text-transform: uppercase;">
                      TRUSTED PRODUCTS.<br />HEALTHIER PEOPLE.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Hero Row -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="left" valign="middle" style="width: 54%; padding-right: 12px;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #2E7D32; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 8px;">
                      VERIFY YOUR EMAIL
                    </div>
                    <h1 style="margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 27px; font-weight: 800; color: #0B2215; line-height: 1.15; letter-spacing: -0.5px;">
                      Here is your<br />verification code
                    </h1>
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.45; color: #475569;">
                      Enter this code on Sensoo to complete your signup.
                    </p>
                  </td>
                  <td align="right" valign="middle" style="width: 46%;">
                    <img src="https://raw.githubusercontent.com/mavlon00/sensoo-app-final/main/assets/email/hero_clean.png" alt="Sensoo Verification" width="235" style="display: block; border: 0; width: 100%; max-width: 235px; height: auto; border-radius: 18px; outline: none;" />
                  </td>
                </tr>
              </table>

              <!-- OTP Verification Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #E7F0ED; border-radius: 14px; margin-bottom: 14px;">
                <tr>
                  <td style="padding: 16px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 35px; font-weight: 800; color: #0B2215; letter-spacing: 4px; display: inline-block; line-height: 1;">
                            ${formattedCode}
                          </span>
                        </td>
                        <td align="right" valign="middle">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table;">
                            <tr>
                              <td style="background-color: #032B20; border-radius: 8px; padding: 11px 18px; text-align: center;">
                                <span style="color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 600; text-decoration: none; white-space: nowrap; display: inline-block;">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy code
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Expiry / Notice Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F6F2; border: 1px solid #DCE6DF; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="left" valign="middle" style="width: 28px;">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2215" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </td>
                        <td align="left" valign="middle" style="padding-left: 10px;">
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #0B2215; margin-bottom: 2px;">
                            This code will expire in 10 minutes.
                          </div>
                          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #64748B; line-height: 1.35;">
                            If you did not create a Sensoo account, you can safely ignore this email.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 4 Benefit Badges Row (Shield, People, Heart, Pillar) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 12px;">
                <tr>
                  <!-- Badge 1: Safer Consumers -->
                  <td align="center" valign="top" style="width: 25%; padding: 4px 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2215" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto 6px auto;">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 700; color: #0B2215; line-height: 1.25; text-align: center;">
                      Safer<br /><span style="font-weight: 400; color: #334155;">Consumers</span>
                    </div>
                  </td>

                  <!-- Badge 2: Cleaner Markets -->
                  <td align="center" valign="top" style="width: 25%; padding: 4px 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2215" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto 6px auto;">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 700; color: #0B2215; line-height: 1.25; text-align: center;">
                      Cleaner<br /><span style="font-weight: 400; color: #334155;">Markets</span>
                    </div>
                  </td>

                  <!-- Badge 3: Stronger Public Health -->
                  <td align="center" valign="top" style="width: 25%; padding: 4px 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2215" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto 6px auto;">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 700; color: #0B2215; line-height: 1.25; text-align: center;">
                      Stronger<br /><span style="font-weight: 400; color: #334155;">Public Health</span>
                    </div>
                  </td>

                  <!-- Badge 4: Supports Regulators -->
                  <td align="center" valign="top" style="width: 25%; padding: 4px 6px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B2215" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto 6px auto;">
                      <path d="m3 9 9-7 9 7v2H3z"></path>
                      <path d="M4 11v9"></path>
                      <path d="M8 11v9"></path>
                      <path d="M12 11v9"></path>
                      <path d="M16 11v9"></path>
                      <path d="M20 11v9"></path>
                      <path d="M2 20h20"></path>
                    </svg>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 700; color: #0B2215; line-height: 1.25; text-align: center;">
                      Supports<br /><span style="font-weight: 400; color: #334155;">Regulators</span>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Full Width Deep Forest Green Footer Banner -->
          <tr>
            <td style="padding: 0; margin: 0; line-height: 0;">
              <img src="https://raw.githubusercontent.com/mavlon00/sensoo-app-final/main/assets/email/footer.png" alt="Sensoo - Trusted Products. Healthier People." width="580" style="display: block; border: 0; width: 100%; max-width: 580px; height: auto; outline: none; border-radius: 0 0 20px 20px;" />
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

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
        subject: 'Your Sensoo verification code',
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
  const localOtp = `${Math.floor(100000 + Math.random() * 900000)}`;

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

  // Pre-save account credentials into local store for zero-downtime sign-in
  await saveLocalUser({
    email: cleanEmail,
    fullName: cleanName,
    phone: cleanPhone,
    password: pass,
  });

  // If backend is 404 on Render, dispatch directly via Resend API
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
    password: pass,
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
    const localOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
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
      const localUsers = await loadLocalUsers();
      const userObj = localUsers[cleanEmail] || {};
      await sendResendEmailDirect(cleanEmail, localOtp, userObj.fullName || id);
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

    if (loginRes.ok) {
      const data = await loginRes.json();
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
    } else if (loginRes.status !== 404) {
      const data = await loginRes.json().catch(() => ({}));
      return {
        success: false,
        requiresOtp: false,
        message: data.detail || 'Incorrect email or password.',
      };
    }
  } catch (err: any) {
    console.warn('[AuthService] Backend login error:', err);
  }

  // Backend returned 404 (Render deploying): check persistent registered user store
  const localUsers = await loadLocalUsers();
  const existing = localUsers[cleanEmail];

  if (existing) {
    if (existing.password && existing.password !== params.password) {
      return {
        success: false,
        requiresOtp: false,
        message: 'Incorrect password. Please verify and try again.',
      };
    }

    currentAuth.user = {
      id: existing.id || `USR-${Date.now().toString().slice(-6)}`,
      fullName: existing.fullName || 'Sensoo Member',
      email: cleanEmail,
      phone: existing.phone || '',
      isVerified: true,
      role: 'consumer',
      lastLogin: new Date().toISOString(),
    };
    currentAuth.isAuthenticated = true;
    await persistAuth();

    return {
      success: true,
      requiresOtp: false,
      message: 'Signed in successfully!',
    };
  }

  return {
    success: false,
    requiresOtp: false,
    message: 'Account not found. Please create an account first.',
  };
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

  // Check against OTP sent via Resend
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

  // Persist user account and active session
  await saveLocalUser({
    email,
    fullName: newUser.fullName,
    phone: newUser.phone,
    password: pUser.password,
  });
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

  const localOtp = `${Math.floor(100000 + Math.random() * 900000)}`;
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
    const localUsers = await loadLocalUsers();
    const userObj = localUsers[email] || {};
    await sendResendEmailDirect(email, localOtp, userObj.fullName || pUser.fullName);
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
