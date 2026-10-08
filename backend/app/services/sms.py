"""Pluggable SMS gateway.

Module 1 ships a console provider (prints to the log) so the OTP flow is fully
testable without a paid gateway. Real providers (SMSMisr, Vodafone, Twilio…)
implement the same ``SmsProvider`` protocol and are selected via ``SMS_PROVIDER``.
"""
from __future__ import annotations

import logging
import re
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
            # SMSMisr returns {"code": "1901"} on success
            try:
                code = resp.json().get("code", resp.text.strip())
            except Exception:
                code = resp.text.strip()
            if code != "1901":
                raise RuntimeError(f"SMSMisr error code {code!r} for {to!r}")
            logger.info("[SMS:smsmisr] sent to=%s code=%s", to, code)


class WhatsAppProvider:
    """WhatsApp Cloud API (Meta) — sends the OTP via an authentication template.

    Free tier (first 1,000 conversations/month). Requires a dedicated number
    added to a Meta WhatsApp Business account (NOT the number running the normal
    WhatsApp app), plus an approved 'authentication' template whose body + copy
    button both take the code as their single parameter.
    """

    def __init__(self, token: str, phone_number_id: str, template: str, lang: str, version: str) -> None:
        self._token = token
        self._phone_number_id = phone_number_id
        self._template = template
        self._lang = lang
        self._url = f"https://graph.facebook.com/{version}/{phone_number_id}/messages"

    def _normalize(self, phone: str) -> str:
        # WhatsApp wants E.164 without the '+', e.g. 201007307666
        return phone[1:] if phone.startswith("+") else phone

    async def send_sms(self, to: str, body: str) -> None:
        # The OTP service passes the full message text; extract the numeric code
        # for the template's body + copy-code button parameters.
        m = re.search(r"\d{4,8}", body)
        code = m.group(0) if m else body.strip()
        payload = {
            "messaging_product": "whatsapp",
            "to": self._normalize(to),
            "type": "template",
            "template": {
                "name": self._template,
                "language": {"code": self._lang},
                "components": [
                    {"type": "body", "parameters": [{"type": "text", "text": code}]},
                    {
                        "type": "button",
                        "sub_type": "url",
                        "index": "0",
                        "parameters": [{"type": "text", "text": code}],
                    },
                ],
            },
        }
        headers = {"Authorization": f"Bearer {self._token}"}
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(self._url, json=payload, headers=headers)
            if resp.status_code >= 400:
                raise RuntimeError(f"WhatsApp API error {resp.status_code}: {resp.text[:300]}")
            logger.info("[SMS:whatsapp] sent to=%s", to)


def get_sms_provider() -> SmsProvider:
    """Factory selecting the configured provider."""
    provider = settings.SMS_PROVIDER.lower()
    if provider == "console":
        return ConsoleSmsProvider()
    if provider == "whatsapp":
        if not settings.WHATSAPP_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
            raise RuntimeError(
                "SMS_PROVIDER=whatsapp requires WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID"
            )
        return WhatsAppProvider(
            token=settings.WHATSAPP_TOKEN,
            phone_number_id=settings.WHATSAPP_PHONE_NUMBER_ID,
            template=settings.WHATSAPP_OTP_TEMPLATE,
            lang=settings.WHATSAPP_OTP_LANG,
            version=settings.WHATSAPP_API_VERSION,
        )
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
