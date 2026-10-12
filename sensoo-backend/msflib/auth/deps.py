from typing import Any, Callable, List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
import jwt

from msflib.core.security import decode_access_token


class AccountDependencies:
    def __init__(
        self,
        AccountModel: Any,
        oauth_token_url: str,
        secret_key: str,
        session_dep: Callable[..., Any],
        keystore_dep: Callable[..., Any],
        active_statuses: Optional[List[str]] = None,
        account_role_attr: str = "role",
    ):
        self.AccountModel = AccountModel
        self.oauth_token_url = oauth_token_url
        self.secret_key = secret_key
        self.session_dep = session_dep
        self.keystore_dep = keystore_dep
        self.active_statuses = active_statuses or ["active", "online"]
        self.account_role_attr = account_role_attr
        self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl=oauth_token_url, auto_error=False)

    async def resolve_account(
        self,
        request: Request,
        token: Optional[str] = None,
        session: Any = None,
        keystore: Any = None,
    ) -> Any:
        # Token can come from oauth2_scheme or Authorization header
        if token is None:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1].strip()

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            payload = decode_access_token(token, self.secret_key)
            email: Optional[str] = payload.get("sub")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check keystore for revocation
        if keystore is not None and hasattr(keystore, "has") and keystore.has(f"revoked:{email}"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Query account from DB
        stmt = select(self.AccountModel).where(self.AccountModel.email == email)
        account = session.exec(stmt).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )

        if hasattr(account, "status") and account.status not in self.active_statuses:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive account",
            )

        return account

    async def get_current_account(
        self,
        request: Request,
        token: Optional[str] = Depends(lambda: None),
        session: Session = Depends(lambda: None),
        keystore: Any = Depends(lambda: None),
    ) -> Any:
        # Replaced at runtime in get_account_dependencies
        pass

    def RoleCheck(self, roles: List[str]) -> Callable[..., Any]:
        async def check(account: Any = Depends(self.get_current_account)) -> Any:
            role_val = getattr(account, self.account_role_attr, None)
            if role_val not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized",
                )
            return account
        return check


def get_account_dependencies(
    AccountModel: Any,
    oauth_token_url: str = "/api/v1/auth/login",
    secret_key: str = "secret",
    session_dep: Optional[Callable[..., Any]] = None,
    keystore_dep: Optional[Callable[..., Any]] = None,
    active_statuses: Optional[List[str]] = None,
    account_role_attr: str = "role",
) -> Any:
    account_deps = AccountDependencies(
        AccountModel=AccountModel,
        oauth_token_url=oauth_token_url,
        secret_key=secret_key,
        session_dep=session_dep,
        keystore_dep=keystore_dep,
        active_statuses=active_statuses,
        account_role_attr=account_role_attr,
    )

    async def get_current_account(
        request: Request,
        token: Optional[str] = Depends(account_deps.oauth2_scheme),
        session: Session = Depends(session_dep),
        keystore: Any = Depends(keystore_dep),
    ) -> Any:
        return await account_deps.resolve_account(
            request=request, token=token, session=session, keystore=keystore
        )

    async def get_current_account_or_none(
        request: Request,
        token: Optional[str] = Depends(account_deps.oauth2_scheme),
        session: Session = Depends(session_dep),
        keystore: Any = Depends(keystore_dep),
    ) -> Optional[Any]:
        if not token and not request.headers.get("Authorization"):
            return None
        return await account_deps.resolve_account(
            request=request, token=token, session=session, keystore=keystore
        )

    account_deps.get_current_account = get_current_account
    account_deps.get_current_account_or_none = get_current_account_or_none
    return account_deps


def get_user_dependencies(
    UserModel: Any,
    WorkspaceModel: Any,
    session_dep: Callable[..., Any],
    account_dependencies: Any,
    workspace_resolver: Any,
) -> Any:
    class UserDependencies:
        async def get_current_workspace(self):
            return None
        async def get_current_workspace_anonymous(self):
            return None
        async def get_current_user(self):
            return None
        async def get_current_active_user(self):
            return None
        def WorkspaceRoleCheck(self, roles: List[str]):
            def check():
                return True
            return check
    return UserDependencies()
