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
