"""Pluggable SMS gateway.

Module 1 ships a console provider (prints to the log) so the OTP flow is fully
testable without a paid gateway. Real providers (SMSMisr, Vodafone, Twilio…)
implement the same ``SmsProvider`` protocol and are selected via ``SMS_PROVIDER``.
"""
from __future__ import annotations

import logging
from typing import Protocol

from app.core.config import settings

logger = logging.getLogger("app.sms")


class SmsProvider(Protocol):
    async def send_sms(self, to: str, body: str) -> None: ...


class ConsoleSmsProvider:
    """Development provider — logs the message instead of sending it."""

    async def send_sms(self, to: str, body: str) -> None:
        logger.info("[SMS:console] to=%s body=%s", to, body)


def get_sms_provider() -> SmsProvider:
    """Factory selecting the configured provider."""
    provider = settings.SMS_PROVIDER.lower()
    if provider == "console":
        return ConsoleSmsProvider()
    # Future: elif provider == "smsmisr": return SmsMisrProvider(...)
    raise RuntimeError(f"Unknown SMS_PROVIDER: {settings.SMS_PROVIDER!r}")
