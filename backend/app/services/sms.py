"""Pluggable SMS gateway.

Module 1 ships a console provider (prints to the log) so the OTP flow is fully
testable without a paid gateway. Real providers (SMSMisr, Vodafone, Twilio…)
implement the same ``SmsProvider`` protocol and are selected via ``SMS_PROVIDER``.
"""
from __future__ import annotations

import logging
from typing import Protocol

import httpx

from app.core.config import settings

logger = logging.getLogger("app.sms")


class SmsProvider(Protocol):
    async def send_sms(self, to: str, body: str) -> None: ...


class ConsoleSmsProvider:
    """Development provider — logs the message instead of sending it."""

    async def send_sms(self, to: str, body: str) -> None:
        logger.info("[SMS:console] to=%s body=%s", to, body)


class SmsMisrProvider:
    """Egyptian SMS gateway — https://www.smsmisr.com/"""

    _API_URL = "https://smsmisr.com/api/SMS/"

    def __init__(self, username: str, password: str, sender: str) -> None:
        self._username = username
        self._password = password
        self._sender = sender

    def _normalize(self, phone: str) -> str:
        """Convert +201XXXXXXXX → 201XXXXXXXX (SMSMisr format)."""
        if phone.startswith("+"):
            return phone[1:]
        return phone

    async def send_sms(self, to: str, body: str) -> None:
        payload = {
            "Username": self._username,
            "password": self._password,
            "language": "2",   # 2 = Unicode (supports Arabic + digits)
            "sender": self._sender,
            "Mobile": self._normalize(to),
            "message": body,
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(self._API_URL, data=payload)
            resp.raise_for_status()
            # SMSMisr returns a numeric code; "4901" means sent successfully.
            code = resp.text.strip()
            if code != "4901":
                raise RuntimeError(f"SMSMisr error code {code!r} for {to!r}")
            logger.info("[SMS:smsmisr] sent to=%s code=%s", to, code)


def get_sms_provider() -> SmsProvider:
    """Factory selecting the configured provider."""
    provider = settings.SMS_PROVIDER.lower()
    if provider == "console":
        return ConsoleSmsProvider()
    if provider == "smsmisr":
        if not settings.SMSMISR_USERNAME or not settings.SMSMISR_PASSWORD:
            raise RuntimeError(
                "SMS_PROVIDER=smsmisr requires SMSMISR_USERNAME and SMSMISR_PASSWORD"
            )
        return SmsMisrProvider(
            username=settings.SMSMISR_USERNAME,
            password=settings.SMSMISR_PASSWORD,
            sender=settings.SMSMISR_SENDER,
        )
    raise RuntimeError(f"Unknown SMS_PROVIDER: {settings.SMS_PROVIDER!r}")
