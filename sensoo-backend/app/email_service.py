import logging
from typing import Optional
import httpx

logger = logging.getLogger("sensoo.email")


def generate_otp_email_html(otp_code: str, user_name: Optional[str] = None) -> str:
    display_name = user_name if user_name else "Valued User"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Sensoo Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #E2E8F0;" cellspacing="0" cellpadding="0">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F766E 0%, #00875A 100%); padding: 36px 32px 32px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.18); border-radius: 16px; padding: 12px 20px; margin-bottom: 12px;">
                <span style="font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF;">SENSOO</span>
              </div>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                Anti-Counterfeit &amp; Consumer Trust
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h1 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #0F172A;">
                Identity Verification
              </h1>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
                Hello <strong>{display_name}</strong>,<br>
                Use the one-time verification code below to complete your sign-in to the Sensoo consumer verification platform.
              </p>

              <!-- OTP Box -->
              <div style="background-color: #F0FDF4; border: 2px dashed #00875A; border-radius: 16px; padding: 24px 20px; text-align: center; margin-bottom: 28px;">
                <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #065F46; margin-bottom: 8px;">
                  Your One-Time Passcode
                </span>
                <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #00875A; font-family: monospace;">
                  {otp_code}
                </span>
                <span style="display: block; font-size: 12px; color: #047857; margin-top: 8px;">
                  Valid for 10 minutes &bull; Do not share with anyone
                </span>
              </div>

              <!-- Security Tips -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748B;">
                      🔒 <strong>Security Tip:</strong> Sensoo will never call or ask you for this code. If you did not make this request, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #94A3B8; text-align: center;">
                Need help? Contact the Sensoo Security team at <a href="mailto:support@inboxsync.co.uk" style="color: #0F766E; text-decoration: none;">support@inboxsync.co.uk</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                &copy; 2026 Sensoo Platform &bull; Real-time AI Product Authentication &amp; GS1 Registry.<br>
                Powered by MSFLib FastAPI Framework.
              </p>
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
    sender = from_email or getattr(settings, "RESEND_FROM_EMAIL", "Sensoo Security <verify@inboxsync.co.uk>") or os.getenv("RESEND_FROM_EMAIL", "Sensoo Security <verify@inboxsync.co.uk>")

    if not key or not to_email:
        logger.warning(f"Resend API key or destination email missing: key={bool(key)}, email={to_email}")
        return False

    html_content = generate_otp_email_html(otp_code, user_name)

    payload = {
        "from": sender,
        "to": [to_email.strip()],
        "subject": f"Your Sensoo Verification Code is {otp_code}",
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
