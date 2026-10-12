from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict
from sqlmodel import Field
from msflib.models import ModelBase


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires: int = 1800
    account: Optional[Any] = None
    user: Optional[Any] = None


class Account(ModelBase, table=True):
    __tablename__ = "account"

    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: Optional[str] = Field(default=None)
    phone: Optional[str] = Field(default=None)
    status: str = Field(default="active")
    role: str = Field(default="user")
    current_workspace_id: Optional[int] = Field(default=None)
    last_login_date: Optional[datetime] = Field(default=None)


class AccountCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"


class AccountRead(BaseModel):
    id: Optional[int] = None
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    status: str = "active"
    role: str = "user"
    created_at: Optional[datetime] = None
    last_login_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PasswordRecoveryRequest(BaseModel):
    email: str


class VerifyTokenRequest(BaseModel):
    email: str
    token: str


class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str
