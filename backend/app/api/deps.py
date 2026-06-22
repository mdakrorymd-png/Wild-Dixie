"""Shared FastAPI dependencies: DB session, current user, and role guards."""
from __future__ import annotations

import uuid
from collections.abc import Callable, Coroutine
from typing import Annotated, Any

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthError, PermissionError_
from app.core.security import decode_token
from app.models.enums import UserRole
from app.models.user import User
from app.services import auth_service

_bearer = HTTPBearer(auto_error=False)

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> User:
    if credentials is None:
        raise AuthError("Authentication credentials were not provided.")
    try:
        payload = decode_token(credentials.credentials, expected_type="access")
        user_id = uuid.UUID(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise AuthError("Invalid or expired access token.") from exc

    user = await auth_service.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise AuthError("User not found or inactive.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(
    role: UserRole,
) -> Callable[[User], Coroutine[Any, Any, User]]:
    """Dependency factory enforcing that the caller holds ``role``."""

    async def _guard(user: CurrentUser) -> User:
        if not user.has_role(role):
            raise PermissionError_(f"This action requires the '{role.value}' role.")
        return user

    return _guard
