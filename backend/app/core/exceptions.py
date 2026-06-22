"""Domain-level exceptions and the FastAPI handlers that translate them to HTTP.

Keeping these separate from the web layer means services can raise meaningful
errors without importing FastAPI.
"""
from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base class for all expected, user-facing application errors."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "app_error"
    message: str = "An error occurred."

    def __init__(self, message: str | None = None) -> None:
        if message is not None:
            self.message = message
        super().__init__(self.message)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"
    message = "Resource not found."


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"
    message = "Resource already exists."


class AuthError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"
    message = "Authentication failed."


class PermissionError_(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"
    message = "You do not have permission to perform this action."


class ValidationError_(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    code = "validation_error"
    message = "Invalid input."


class RateLimitError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "rate_limited"
    message = "Too many requests. Please slow down."


class ExternalServiceError(AppError):
    status_code = status.HTTP_502_BAD_GATEWAY
    code = "external_service_error"
    message = "An upstream service failed."


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
        )
