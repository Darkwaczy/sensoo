import os
import sys

# Ensure local msflib extensions are always discovered first (e.g. on Render container builds)
_local_msflib = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "msflib"))
if os.path.exists(_local_msflib):
    _parent_dir = os.path.dirname(_local_msflib)
    if _parent_dir not in sys.path:
        sys.path.insert(0, _parent_dir)
    try:
        import msflib
        if _local_msflib not in msflib.__path__:
            msflib.__path__.insert(0, _local_msflib)
    except Exception:
        pass

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from msflib.api.deps import get_keystore_factory, get_session_factory
from msflib.auth.deps import get_account_dependencies
from msflib.auth.models import Account, AccountRead
from msflib.auth.router import router as auth_router
from msflib.eventbus import bind_app_emitter

from app.db import engine, get_session, init_db
from app.models import ProductCode
from app.router import router
from app.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables (including Account and ProductCode) are initialized
    init_db()
    yield


app = FastAPI(
    title="Sensoo Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Mobile, Web, and Expo clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind MSFLib event emitter to app instance
app_emitter = bind_app_emitter(app)

# Keystore factory for revocation and OTP token management
get_keystore = get_keystore_factory()

# MSFLib Account Dependencies
auth_deps = get_account_dependencies(
    AccountModel=Account,
    oauth_token_url="/api/v1/auth/login",
    secret_key=settings.SECRET_KEY,
    session_dep=get_session,
    keystore_dep=get_keystore,
)

# Wire MSFLib Auth Router
app.include_router(
    auth_router(
        get_session=get_session,
        get_keystore=get_keystore,
        get_current_account=auth_deps.get_current_account,
        account_type=Account,
        account_read_type=AccountRead,
        settings=settings,
        prefix="/api/v1/auth",
    )
)

# Mount main Sensoo business router
app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "Sensoo Backend API is running",
        "auth_engine": "msflib-fastapi",
        "version": "1.0.0",
    }


@app.get("/copy")
@app.get("/api/v1/auth/copy")
def copy_otp_handler(code: str = ""):
    from fastapi.responses import HTMLResponse
    clean_code = str(code).strip()
    return HTMLResponse(content=f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code Copied - Sensoo</title>
  <style>
    body {{
      margin: 0; padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #F3F4F3; color: #0B2215;
      display: flex; align-items: center; justify-content: center; min-height: 90vh;
    }}
    .card {{
      background: #FFFFFF; border-radius: 20px; padding: 36px 28px;
      max-width: 400px; width: 100%; text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #E2E8E4;
    }}
    .badge {{
      display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; background-color: #E7F0ED; border-radius: 50%;
      margin-bottom: 16px; color: #032B20; font-size: 26px; font-weight: bold;
    }}
    .code-box {{
      background-color: #E7F0ED; border-radius: 12px; padding: 14px 20px;
      font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0B2215;
      margin: 18px 0;
    }}
    .status {{
      color: #166534; font-weight: 700; font-size: 14px; margin-bottom: 18px;
    }}
    .btn {{
      display: inline-block; background-color: #032B20; color: #FFFFFF;
      text-decoration: none; padding: 13px 26px; border-radius: 10px;
      font-weight: 600; font-size: 14px;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓</div>
    <h2 style="margin: 0 0 6px 0; font-size: 20px;">Code Copied!</h2>
    <p style="margin: 0; color: #64748B; font-size: 13.5px;">Your Sensoo verification code was copied to clipboard.</p>
    <div class="code-box">{clean_code}</div>
    <div class="status" id="statusMsg">✓ Copied to clipboard</div>
    <a href="sensoo://verify?code={clean_code}" class="btn">Return to Sensoo App</a>
  </div>
  <script>
    const code = "{clean_code}";
    if (code) {{
      navigator.clipboard.writeText(code).then(() => {{
        document.getElementById('statusMsg').innerText = '✓ Copied to clipboard';
      }}).catch(() => {{
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }});
    }}
  </script>
</body>
</html>""")

