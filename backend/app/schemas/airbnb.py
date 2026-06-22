"""Schemas for the Airbnb importer.

The import endpoint returns structured data to *populate the creation wizard*;
it does not create a listing directly.
"""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class AirbnbImportRequest(BaseModel):
    url: str = Field(..., examples=["https://www.airbnb.com/rooms/12345678"])

    @field_validator("url")
    @classmethod
    def _must_be_airbnb(cls, v: str) -> str:
        v = v.strip()
        lowered = v.lower()
        if not lowered.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        # Accept full listing URLs (airbnb.com/rooms/<id>) AND short share links
        # (abnb.me/..., airbnb.com/h/...), which redirect to the listing.
        is_airbnb_host = any(h in lowered for h in ("airbnb.", "abnb.me"))
        if not is_airbnb_host:
            raise ValueError("Expected an Airbnb link (e.g. airbnb.com/rooms/<id> or an abnb.me share link).")
        return v


class ImportedListing(BaseModel):
    """Best-effort structured data scraped from an Airbnb listing page."""

    source_url: str
    airbnb_id: str | None = None
    title: str | None = None
    description: str | None = None
    images: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    max_guests: int | None = None
    bedrooms: int | None = None
    beds: int | None = None
    bathrooms: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    # Fields the scraper could not confidently fill, so the wizard can prompt.
    missing_fields: list[str] = Field(default_factory=list)
