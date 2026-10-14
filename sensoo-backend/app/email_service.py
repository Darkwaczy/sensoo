import logging
import os
from typing import Optional
import httpx

logger = logging.getLogger("sensoo.email")


def generate_otp_email_html(otp_code: str, user_name: Optional[str] = None, to_email: Optional[str] = None) -> str:
    clean_code = str(otp_code).strip()

    # Extract receiver's first name
    first_name = "there"
    if user_name and user_name.strip():
        parts = user_name.strip().split()
        if parts and parts[0]:
            first_name = parts[0].capitalize()
    elif to_email and to_email.strip():
        local_part = to_email.strip().split("@")[0]
        cleaned = local_part.replace(".", " ").replace("_", " ").replace("-", " ").split()
        if cleaned and cleaned[0]:
            first_name = cleaned[0].capitalize()

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>{clean_code} is your Sensoo verification code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  
  <!-- Preheader Snippet for Inbox Preview (Matches Gmail preview pane) -->
  <div style="display: none; font-size: 1px; color: #FFFFFF; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    {clean_code} is your Sensoo verification code. Enter this code on Sensoo to complete your verification.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F3F4F3; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main White/Ivory Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: #F7F6F2; border-radius: 20px; overflow: hidden; border: 1px solid #E2E6E2; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
          
          <!-- Inner Content Padding -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              
              <!-- Brand Header Row (100% transparent logo for seamless light/dark mode) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 22px;">
                <tr>
                  <td align="left" valign="middle" style="width: 50%;">
                    <img src="https://raw.githubusercontent.com/mavlon00/sensoo-app-final/main/assets/email/logo_v2.png" alt="Sensoo" width="138" style="display: block; border: 0; width: 138px; height: auto; outline: none;" />
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
                      Hi <strong style="color: #0B2215; font-weight: 700;">{first_name}</strong>, enter this code on Sensoo to complete your verification.
                    </p>
                  </td>
                  <td align="right" valign="middle" style="width: 46%;">
                    <img src="https://raw.githubusercontent.com/mavlon00/sensoo-app-final/main/assets/email/hero_clean.png" alt="Sensoo Verification" width="235" style="display: block; border: 0; width: 100%; max-width: 235px; height: auto; border-radius: 18px; outline: none;" />
                  </td>
                </tr>
              </table>

              <!-- OTP Verification Code Box (Continuous code for Gmail OTP parser & Copy Code chip) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #E7F0ED; border-radius: 14px; margin-bottom: 14px;">
                <tr>
                  <td style="padding: 16px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="left" valign="middle">
                          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 35px; font-weight: 800; color: #0B2215; letter-spacing: 4px; display: inline-block; line-height: 1; user-select: all; -webkit-user-select: all; -moz-user-select: all; cursor: pointer;">
                            {clean_code}
                          </span>
                        </td>
                        <td align="right" valign="middle">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table;">
                            <tr>
                              <td style="background-color: #032B20; border-radius: 8px; padding: 11px 18px; text-align: center;">
                                <span style="color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; display: inline-block;">
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
</html>"""


def generate_welcome_letter_html(user_name: Optional[str] = None, to_email: Optional[str] = None) -> str:
    """Generates an inspiring, personal welcome letter thanking the user for joining the fight against counterfeit goods in Nigeria."""
    first_name = "there"
    if user_name and user_name.strip():
        parts = user_name.strip().split()
        if parts and parts[0]:
            first_name = parts[0].capitalize()
    elif to_email and to_email.strip():
        local_part = to_email.strip().split("@")[0]
        cleaned = local_part.replace(".", " ").replace("_", " ").replace("-", " ").split()
        if cleaned and cleaned[0]:
            first_name = cleaned[0].capitalize()

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Welcome to Sensoo — Thank you for standing up for Nigeria 🇳🇬</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  
  <!-- Preheader Snippet for Inbox Preview -->
  <div style="display: none; font-size: 1px; color: #FFFFFF; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    You are not just a user. You are now a guardian against counterfeit goods in Nigeria.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F3F4F3; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; width: 100%; background-color: #F7F6F2; border-radius: 20px; overflow: hidden; border: 1px solid #E2E6E2; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
          
          <!-- Inner Content Padding -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              
              <!-- Brand Header Row with Official Sensoo Logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 26px;">
                <tr>
                  <td align="left" valign="middle" style="width: 50%;">
                    <img src="https://raw.githubusercontent.com/mavlon00/sensoo-app-final/main/assets/email/logo_v2.png" alt="Sensoo Logo" width="140" style="display: block; border: 0; width: 140px; height: auto; outline: none;" />
                  </td>
                  <td align="right" valign="middle" style="width: 50%;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10.5px; font-weight: 700; color: #0C3823; letter-spacing: 1.5px; line-height: 1.35; text-transform: uppercase;">
                      TRUSTED PRODUCTS.<br />HEALTHIER PEOPLE.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Letter Subheader -->
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #2E7D32; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 8px;">
                OFFICIAL WELCOME &middot; NIGERIA 🇳🇬
              </div>
              <h1 style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 800; color: #0B2215; line-height: 1.25; letter-spacing: -0.4px;">
                Thank you for standing with us.
              </h1>

              <!-- Letter Body Content (No links, pure authentic letter) -->
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: #334155;">
                <p style="margin: 0 0 16px 0; font-weight: 600; color: #0B2215;">
                  Dear {first_name},
                </p>
                
                <p style="margin: 0 0 16px 0;">
                  Welcome to the Sensoo family.
                </p>

                <p style="margin: 0 0 16px 0;">
                  Every single day across our markets and pharmacies, millions of fake medicines, hazardous cosmetics, and substandard everyday goods enter circulation. These counterfeits are not just unauthorized copies; they steal honest Nigerians’ hard-earned money, cause preventable sickness, and take lives that should have been protected.
                </p>

                <p style="margin: 0 0 16px 0;">
                  When you signed up for Sensoo, you did something far bigger than creating an account. <strong style="color: #0B2215;">You took a stand for the safety of our country.</strong>
                </p>

                <!-- Highlight Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #E7F0ED; border-left: 4px solid #0C3823; border-radius: 8px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 16px 20px;">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14.5px; line-height: 1.55; color: #0B2215;">
                        From this moment on, every product barcode or verification code you scan before buying is an act of defense:
                        <ul style="margin: 10px 0 0 0; padding-left: 18px;">
                          <li style="margin-bottom: 8px;"><strong>You protect your family and loved ones</strong> from toxic, unverified formulas.</li>
                          <li style="margin-bottom: 8px;"><strong>You choke off revenue</strong> for criminal counterfeiters who exploit our people.</li>
                          <li style="margin-bottom: 0;"><strong>You help restore integrity to Nigeria’s markets</strong>, proving that our people’s health is not for sale.</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 16px 0;">
                  We built Sensoo so you never have to guess, doubt, or gamble with what you put into your body or bring into your home. Whenever you are in a pharmacy or store, just pull out your phone and let the app verify the product for you.
                </p>

                <p style="margin: 0 0 24px 0;">
                  Thank you for choosing to be part of the solution. Together, we are building a safer Nigeria for our children, our parents, and our communities.
                </p>

                <p style="margin: 0; line-height: 1.5;">
                  With deep respect and gratitude,<br />
                  <strong style="color: #0B2215; font-size: 16px;">The Sensoo Team</strong><br />
                  <span style="font-size: 13px; color: #64748B;">Protecting Lives. Safeguarding Nigeria.</span>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer Banner -->
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
</html>"""


async def send_otp_via_resend(
    to_email: str,
    otp_code: str,
    user_name: Optional[str] = None,
    api_key: Optional[str] = None,
    from_email: Optional[str] = None,
) -> bool:
    """Dispatches a branded Sensoo verification OTP email using Resend API."""
    from app.settings import settings

    key = (
        api_key
        or getattr(settings, "RESEND_API_KEY", "")
        or os.getenv("RESEND_API_KEY", "")
        or os.getenv("EXPO_PUBLIC_RESEND_API_KEY", "")
    )
    if key:
        key = key.strip().strip('"').strip("'")

    sender = (
        from_email
        or getattr(settings, "RESEND_FROM_EMAIL", "")
        or os.getenv("RESEND_FROM_EMAIL", "")
        or os.getenv("EXPO_PUBLIC_RESEND_FROM", "")
        or "Sensoo Security <verify@inboxsync.co.uk>"
    )
    if sender:
        sender = sender.strip().strip('"').strip("'")

    if not key or not to_email:
        logger.warning(f"Resend API key or destination email missing: key_present={bool(key)}, email={to_email}")
        return False

    clean_code = str(otp_code).strip()
    html_content = generate_otp_email_html(clean_code, user_name, to_email=to_email)

    payload = {
        "from": sender,
        "to": [to_email.strip()],
        # Continuous OTP in subject line enables Gmail native Copy-Code Action Chip
        "subject": f"{clean_code} is your Sensoo verification code",
        "html": html_content,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Sensoo-App/1.0",
                },
                json=payload,
            )

            if response.status_code in [200, 201]:
                logger.info(f"Successfully dispatched OTP {clean_code} to {to_email} via Resend")
                return True
            else:
                logger.error(
                    f"Resend API responded with {response.status_code}: {response.text}"
                )
                return False
    except Exception as exc:
        logger.error(f"Failed to deliver OTP via Resend to {to_email}: {exc}")
        return False


async def send_welcome_letter_via_resend(
    to_email: str,
    user_name: Optional[str] = None,
    api_key: Optional[str] = None,
    from_email: Optional[str] = None,
) -> bool:
    """Dispatches the official Sensoo welcome letter to a registered member."""
    from app.settings import settings

    key = (
        api_key
        or getattr(settings, "RESEND_API_KEY", "")
        or os.getenv("RESEND_API_KEY", "")
        or os.getenv("EXPO_PUBLIC_RESEND_API_KEY", "")
    )
    if key:
        key = key.strip().strip('"').strip("'")

    sender = (
        from_email
        or getattr(settings, "RESEND_FROM_EMAIL", "")
        or os.getenv("RESEND_FROM_EMAIL", "")
        or os.getenv("EXPO_PUBLIC_RESEND_FROM", "")
        or "Sensoo Security <verify@inboxsync.co.uk>"
    )
    if sender:
        sender = sender.strip().strip('"').strip("'")

    if not key or not to_email:
        logger.warning(f"Resend API key or destination email missing: key_present={bool(key)}, email={to_email}")
        return False

    html_content = generate_welcome_letter_html(user_name, to_email=to_email)

    payload = {
        "from": sender,
        "to": [to_email.strip()],
        "subject": "Welcome to Sensoo — Thank you for standing up for Nigeria 🇳🇬",
        "html": html_content,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Sensoo-App/1.0",
                },
                json=payload,
            )

            if response.status_code in [200, 201]:
                logger.info(f"Successfully dispatched Welcome Letter to {to_email} via Resend")
                return True
            else:
                logger.error(
                    f"Resend API responded with {response.status_code}: {response.text}"
                )
                return False
    except Exception as exc:
        logger.error(f"Failed to deliver Welcome Letter via Resend to {to_email}: {exc}")
        return False
