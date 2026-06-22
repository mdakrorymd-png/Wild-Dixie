"""Egypt-specific validation & normalization helpers.

These power the local-market requirements: the 14-digit National ID and
Egyptian mobile numbers. They raise ``ValueError`` on bad input so they can be
reused directly inside Pydantic ``field_validator``s.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date

# --------------------------------------------------------------------------- #
# Egyptian mobile numbers
# --------------------------------------------------------------------------- #
# Local form (without country code): 1 + carrier digit (0/1/2/5) + 8 digits.
#   010 -> Vodafone, 011 -> Etisalat, 012 -> Orange, 015 -> WE
_LOCAL_MOBILE_RE = re.compile(r"^1[0125]\d{8}$")


def normalize_egyptian_phone(raw: str) -> str:
    """Normalize a variety of Egyptian mobile formats to E.164 (``+20…``).

    Accepts: ``01012345678``, ``+201012345678``, ``00201012345678``,
    ``201012345678``, and the same with spaces / dashes.
    """
    if not raw:
        raise ValueError("Phone number is required.")

    digits = re.sub(r"\D", "", raw)

    if digits.startswith("0020"):
        digits = digits[4:]
    elif digits.startswith("20"):
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]

    if not _LOCAL_MOBILE_RE.match(digits):
        raise ValueError(
            "Invalid Egyptian mobile number. Expected an 010/011/012/015 number."
        )
    return f"+20{digits}"


# --------------------------------------------------------------------------- #
# Egyptian National ID (14 digits)
# --------------------------------------------------------------------------- #
# Layout: C YYMMDD GG SSSS K
#   C    century   (2 -> 1900s, 3 -> 2000s)
#   YYMMDD         date of birth
#   GG   governorate code
#   SSSS serial    (3rd serial digit: odd -> male, even -> female)
#   K    check digit
_NATIONAL_ID_RE = re.compile(r"^\d{14}$")

GOVERNORATE_CODES: dict[str, str] = {
    "01": "Cairo", "02": "Alexandria", "03": "Port Said", "04": "Suez",
    "11": "Damietta", "12": "Dakahlia", "13": "Sharqia", "14": "Qalyubia",
    "15": "Kafr El Sheikh", "16": "Gharbia", "17": "Monufia", "18": "Beheira",
    "19": "Ismailia", "21": "Giza", "22": "Beni Suef", "23": "Fayoum",
    "24": "Minya", "25": "Asyut", "26": "Sohag", "27": "Qena", "28": "Aswan",
    "29": "Luxor", "31": "Red Sea", "32": "New Valley", "33": "Matrouh",
    "34": "North Sinai", "35": "South Sinai", "88": "Born abroad",
}


@dataclass(frozen=True)
class NationalIdInfo:
    """Structured data decoded from a valid National ID."""

    national_id: str
    birth_date: date
    governorate: str
    gender: str  # "male" | "female"


def parse_national_id(raw: str) -> NationalIdInfo:
    """Validate and decode an Egyptian National ID.

    Validates structure, century digit, a real birth date, and a known
    governorate code. Raises ``ValueError`` if any check fails.
    """
    nid = (raw or "").strip()
    if not _NATIONAL_ID_RE.match(nid):
        raise ValueError("National ID must be exactly 14 digits.")

    century_digit = nid[0]
    if century_digit not in ("2", "3"):
        raise ValueError("Invalid National ID: unsupported century digit.")
    century = 1900 if century_digit == "2" else 2000

    yy, mm, dd = int(nid[1:3]), int(nid[3:5]), int(nid[5:7])
    try:
        birth_date = date(century + yy, mm, dd)
    except ValueError as exc:
        raise ValueError("Invalid National ID: embedded birth date is not valid.") from exc

    gov_code = nid[7:9]
    governorate = GOVERNORATE_CODES.get(gov_code)
    if governorate is None:
        raise ValueError("Invalid National ID: unknown governorate code.")

    gender = "male" if int(nid[12]) % 2 == 1 else "female"

    return NationalIdInfo(
        national_id=nid,
        birth_date=birth_date,
        governorate=governorate,
        gender=gender,
    )


def validate_national_id(raw: str) -> str:
    """Convenience wrapper returning just the normalized ID string."""
    return parse_national_id(raw).national_id
