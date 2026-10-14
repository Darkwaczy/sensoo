from datetime import datetime, timedelta, timezone
import random
from typing import Any, Callable, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select

from msflib.auth.eventbus import EventName
from msflib.auth.models import (
    AccountCreate,
    AccountRead,
    PasswordRecoveryRequest,
    ResetPasswordRequest,
    Token,
    VerifyTokenRequest,
)
from msflib.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)


class LoginJsonRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str


def router(
    get_session: Callable[..., Any],
    get_keystore: Callable[..., Any],
    get_current_account: Callable[..., Any],
    account_type: Any,
    account_read_type: Any = AccountRead,
    settings: Any = None,
    prefix: str = "",
    access_token_response_type: Any = Token,
    access_token_claims_decorator: Optional[Callable[..., Any]] = None,
    access_token_decorator: Optional[Callable[..., Any]] = None,
    **kwargs: Any,
) -> APIRouter:
    auth_rt = APIRouter(prefix=prefix, tags=["Authentication (msflib)"])

    def get_secret_key() -> str:
        if settings is not None:
            if hasattr(settings, "SECRET_KEY"):
                return settings.SECRET_KEY
            if hasattr(settings, "scope") and hasattr(settings.scope("CORE"), "SECRET_KEY"):
                return settings.scope("CORE").SECRET_KEY
        return "sensoo-super-secret-key-msflib-2026"

    def get_expire_minutes() -> int:
        if settings is not None:
            if hasattr(settings, "AUTH_ACCESS_TOKEN_EXPIRE_MINUTES"):
                return int(settings.AUTH_ACCESS_TOKEN_EXPIRE_MINUTES)
            if hasattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES"):
                return int(settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return 30

    @auth_rt.post("/register", response_model=access_token_response_type)
    async def register(
        account_in: AccountCreate,
        request: Request,
        session: Session = Depends(get_session),
    ) -> Any:
        # Check existing account
        clean_email = account_in.email.strip().lower()
        existing = session.exec(
            select(account_type).where(
                (account_type.email == clean_email) | (account_type.email == account_in.email.strip())
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        hashed = get_password_hash(account_in.password)
        account = account_type(
            email=clean_email,
            hashed_password=hashed,
            full_name=account_in.full_name,
            phone=account_in.phone,
            role=account_in.role or "user",
            status="active",
        )
        session.add(account)
        session.commit()
        session.refresh(account)

        # Store initial OTP for email verification
        reg_otp = f"{random.randint(100000, 999999)}"
        keystore = getattr(request.app.state, "keystore", None)
        try:
            from app.main import get_keystore
            ks = get_keystore()
            if ks and hasattr(ks, "set"):
                ks.set(f"otp:{account.email}", reg_otp)
        except Exception:
            pass

        try:
            from app.email_service import send_otp_via_resend
            await send_otp_via_resend(
                to_email=account.email,
                otp_code=reg_otp,
                user_name=account.full_name,
            )
        except Exception as exc:
            import logging
            logging.getLogger("sensoo.auth").error(f"Failed to dispatch registration OTP email: {exc}")

        # Issue access token
        secret_key = get_secret_key()
        expire_minutes = get_expire_minutes()
        token_str = create_access_token(
            subject=account.email,
            secret_key=secret_key,
            expires_delta=timedelta(minutes=expire_minutes),
        )

        account_read = account_read_type.model_validate(account) if hasattr(account_read_type, "model_validate") else account
        response_payload = {
            "access_token": token_str,
            "token_type": "bearer",
            "expires": expire_minutes * 60,
            "account": account_read,
            "user": None,
        }

        # App emitter trigger
        app = request.app
        emitter = getattr(app, "msflib_emitter", None)
        if emitter and hasattr(emitter, "emit"):
            await emitter.emit(EventName.ACCOUNT_LOGGED_IN, account, {"session": session})

        return access_token_response_type(**response_payload)

    @auth_rt.post("/login", response_model=access_token_response_type)
    async def login(
        request: Request,
        session: Session = Depends(get_session),
        keystore: Any = Depends(get_keystore),
    ) -> Any:
        content_type = request.headers.get("content-type", "")
        email = ""
        password = ""

        if "application/json" in content_type:
            data = await request.json()
            email = data.get("username") or data.get("email") or ""
            password = data.get("password") or ""
        else:
            form = await request.form()
            email = str(form.get("username") or form.get("email") or "")
            password = str(form.get("password") or "")

        clean_email = email.strip().lower()
        account = session.exec(
            select(account_type).where(
                (account_type.email == clean_email) | (account_type.email == email.strip())
            )
        ).first()

        if not account or not verify_password(password, account.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password",
            )

        if hasattr(account, "status") and account.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive account",
            )

        # Update last_login_date if field exists
        if hasattr(account, "last_login_date"):
            account.last_login_date = datetime.now(timezone.utc)
            session.add(account)
            session.commit()
            session.refresh(account)

        # Un-revoke account from keystore on fresh login
        if keystore is not None and hasattr(keystore, "delete"):
            keystore.delete(f"revoked:{account.email}")

        secret_key = get_secret_key()
        expire_minutes = get_expire_minutes()

        claims = {}
        if access_token_claims_decorator:
            claims = access_token_claims_decorator(account, {"session": session}) or {}

        token_str = create_access_token(
            subject=account.email,
            secret_key=secret_key,
            expires_delta=timedelta(minutes=expire_minutes),
            claims=claims,
        )

        account_read = account_read_type.model_validate(account) if hasattr(account_read_type, "model_validate") else account
        response_payload = {
            "access_token": token_str,
            "token_type": "bearer",
            "expires": expire_minutes * 60,
            "account": account_read,
            "user": None,
        }

        if access_token_decorator:
            response_payload = access_token_decorator(response_payload, {"session": session})

        # Emit login event
        app = request.app
        emitter = getattr(app, "msflib_emitter", None)
        if emitter and hasattr(emitter, "emit"):
            await emitter.emit(EventName.ACCOUNT_LOGGED_IN, account, {"session": session})

        return access_token_response_type(**response_payload)

    @auth_rt.delete("/logout")
    async def logout(
        account: Any = Depends(get_current_account),
        keystore: Any = Depends(get_keystore),
    ) -> Any:
        if keystore is not None and hasattr(keystore, "set"):
            keystore.set(f"revoked:{account.email}", True)
        return {"ok": True, "detail": "Account token revoked successfully"}

    @auth_rt.post("/password-recovery")
    async def password_recovery(
        req: PasswordRecoveryRequest,
        session: Session = Depends(get_session),
        keystore: Any = Depends(get_keystore),
    ) -> Any:
        account = session.exec(
            select(account_type).where(account_type.email == req.email.strip())
        ).first()
        otp_code = f"{random.randint(100000, 999999)}"
        if keystore is not None and hasattr(keystore, "set"):
            keystore.set(f"otp:{req.email.strip()}", otp_code)

        # Dispatch branded Sensoo verification OTP email via Resend
        email_sent = False
        try:
            from app.email_service import send_otp_via_resend
            email_sent = await send_otp_via_resend(
                to_email=req.email.strip(),
                otp_code=otp_code,
                user_name=getattr(account, "full_name", None) if account else None,
            )
        except Exception as exc:
            import logging
            logging.getLogger("sensoo.auth").error(f"Error dispatching password recovery OTP: {exc}")

        return {
            "ok": True,
            "message": "Verification code has been sent to your email",
            "email_dispatched": email_sent,
            "expires_in": 600,
        }

    @auth_rt.post("/verify-token")
    async def verify_token(
        req: VerifyTokenRequest,
        session: Session = Depends(get_session),
        keystore: Any = Depends(get_keystore),
    ) -> Any:
        email = req.email.strip()
        code = req.token.strip()

        saved_code = keystore.get(f"otp:{email}") if (keystore and hasattr(keystore, "get")) else None
        if saved_code and str(saved_code) == code:
            # Delete verified OTP from keystore
            try:
                if keystore and hasattr(keystore, "delete"):
                    keystore.delete(f"otp:{email}")
            except Exception:
                pass

            # Dispatch the official Welcome Letter now that the OTP is successfully verified!
            try:
                from app.email_service import send_welcome_letter_via_resend
                account = session.exec(select(account_type).where(account_type.email == email)).first() if session else None
                user_name = account.full_name if account else None
                await send_welcome_letter_via_resend(to_email=email, user_name=user_name)
            except Exception as exc:
                import logging
                logging.getLogger("sensoo.auth").error(f"Failed to dispatch welcome letter upon verification: {exc}")

            return {"valid": True, "email": email, "token": code}

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    @auth_rt.post("/reset-password")
    async def reset_password(
        req: ResetPasswordRequest,
        session: Session = Depends(get_session),
        keystore: Any = Depends(get_keystore),
    ) -> Any:
        email = req.email.strip()
        code = req.token.strip()
        saved_code = keystore.get(f"otp:{email}") if (keystore and hasattr(keystore, "get")) else None

        if not saved_code or str(saved_code) != code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        account = session.exec(
            select(account_type).where(account_type.email == email)
        ).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )

        account.hashed_password = get_password_hash(req.new_password)
        session.add(account)
        session.commit()
        session.refresh(account)

        # Clear OTP
        if keystore and hasattr(keystore, "delete"):
            keystore.delete(f"otp:{email}")

        return {"ok": True, "message": "Password has been successfully updated"}

    @auth_rt.get("/me", response_model=account_read_type)
    async def get_me(account: Any = Depends(get_current_account)) -> Any:
        return account

    return auth_rt
