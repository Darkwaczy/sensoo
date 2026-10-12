import logging
from typing import Optional
import httpx

logger = logging.getLogger("sensoo.email")


def generate_otp_email_html(otp_code: str, user_name: Optional[str] = None) -> str:
    clean_code = str(otp_code).strip()
    if len(clean_code) == 6:
        formatted_code = f"{clean_code[:3]} {clean_code[3:]}"
    elif len(clean_code) == 4:
        formatted_code = f"{clean_code[:2]} {clean_code[2:]}"
    else:
        formatted_code = clean_code

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Sensoo verification code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  
  <!-- Preheader Snippet for Inbox Preview (Matches Gmail preview pane) -->
  <div style="display: none; font-size: 1px; color: #FFFFFF; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Your Sensoo verification code is {formatted_code}. Enter this code on Sensoo to complete your signup.
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
                            {formatted_code}
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

    import os
    key = api_key or getattr(settings, "RESEND_API_KEY", "") or os.getenv("RESEND_API_KEY", "")
    sender = from_email or getattr(settings, "RESEND_FROM_EMAIL", "Sensoo <verify@inboxsync.co.uk>") or os.getenv("RESEND_FROM_EMAIL", "Sensoo <verify@inboxsync.co.uk>")

    if not key or not to_email:
        logger.warning(f"Resend API key or destination email missing: key={bool(key)}, email={to_email}")
        return False

    html_content = generate_otp_email_html(otp_code, user_name)

    payload = {
        "from": sender,
        "to": [to_email.strip()],
        "subject": "Your Sensoo verification code",
        "html": html_content,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

            if response.status_code in [200, 201]:
                logger.info(f"Successfully dispatched OTP {otp_code} to {to_email} via Resend")
                return True
            else:
                logger.error(
                    f"Resend API responded with {response.status_code}: {response.text}"
                )
                return False
    except Exception as exc:
        logger.error(f"Failed to deliver OTP via Resend to {to_email}: {exc}")
        return False
