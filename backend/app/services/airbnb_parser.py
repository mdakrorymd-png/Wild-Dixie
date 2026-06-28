"""Pure, dependency-free parser for an Airbnb listing page.

Kept separate from the Playwright fetcher so it can be unit-tested against
saved HTML. Airbnb's markup shifts frequently, so this is deliberately
**best-effort**: it leans on stable OpenGraph meta tags first, then heuristic
scans of the embedded JSON, and reports anything it could not fill in
``missing_fields`` so the creation wizard can prompt the host.
"""
from __future__ import annotations

import re

from app.schemas.airbnb import ImportedListing

_ID_RE = re.compile(r"/rooms/(?:plus/)?(\d+)")
_MUSCACHE_RE = re.compile(r"https://a0\.muscache\.com/im/pictures/[^\"'\\)\s]+")

# Common amenity keywords -> canonical label, scanned across the page text.
_AMENITY_KEYWORDS: dict[str, str] = {
    "wifi": "WiFi",
    "wi-fi": "WiFi",
    "pool": "Pool",
    "air conditioning": "Air conditioning",
    "kitchen": "Kitchen",
    "free parking": "Free parking",
    "parking": "Parking",
    "beach access": "Beach access",
    "sea view": "Sea view",
    "washer": "Washer",
    "dryer": "Dryer",
    "tv": "TV",
    "heating": "Heating",
    "elevator": "Elevator",
    "gym": "Gym",
    "bbq": "BBQ grill",
    "balcony": "Balcony",
}


def _meta_content(html: str, key: str) -> str | None:
    """Read a <meta property|name="key" content="..."> tag (either attr order)."""
    patterns = (
        rf'<meta[^>]+(?:property|name)=["\']{re.escape(key)}["\'][^>]*content=["\']([^"\']*)["\']',
        rf'<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']{re.escape(key)}["\']',
    )
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            return _unescape(m.group(1)).strip() or None
    return None


def _all_meta_content(html: str, key: str) -> list[str]:
    out: list[str] = []
    pat = rf'<meta[^>]+(?:property|name)=["\']{re.escape(key)}["\'][^>]*content=["\']([^"\']+)["\']'
    for m in re.finditer(pat, html, re.IGNORECASE):
        out.append(_unescape(m.group(1)))
    return out


def _unescape(value: str) -> str:
    return (
        value.replace("\\u002F", "/")
        .replace("\\/", "/")
        .replace("&amp;", "&")
        .replace("&#x27;", "'")
        .replace("&quot;", '"')
    )


def _int_before(text: str, word: str) -> int | None:
    # Trailing \b stops e.g. "beds?" from matching inside "bedrooms".
    m = re.search(rf"(\d+)\s*{word}\b", text, re.IGNORECASE)
    return int(m.group(1)) if m else None


def _float_match(html: str, key: str) -> float | None:
    m = re.search(rf'"{key}"\s*:\s*(-?\d+\.\d+)', html)
    return float(m.group(1)) if m else None


def _json_first(html: str, keys: tuple[str, ...]) -> str | None:
    """Find the first ``"key":"value"`` string for any of ``keys`` in the page's
    embedded JSON (Airbnb keeps the listing data in inline <script> JSON)."""
    for key in keys:
        m = re.search(rf'"{key}"\s*:\s*"((?:[^"\\]|\\.)*)"', html)
        if m and m.group(1).strip():
            return _unescape(m.group(1)).strip()
    return None


def _json_int(html: str, keys: tuple[str, ...]) -> int | None:
    for key in keys:
        m = re.search(rf'"{key}"\s*:\s*(\d+)', html)
        if m:
            return int(m.group(1))
    return None


# Junk image paths (favicons, platform UI assets, user avatars) — not listing photos.
_IMG_JUNK = ("airbnb-platform-assets", "favicon", "/user/", "/cdn-cgi/")


def _gallery_images(html: str, limit: int = 30) -> list[str]:
    seen: dict[str, None] = {}
    for url in _MUSCACHE_RE.findall(_unescape(html)):
        if "/im/pictures/" not in url:
            continue
        if any(j in url.lower() for j in _IMG_JUNK):
            continue
        # Dedupe by the photo path, ignoring size/format query params.
        base = url.split("?", 1)[0]
        if base in seen:
            continue
        seen[base] = None
        if len(seen) >= limit:
            break
    return list(seen.keys())


def _scan_amenities(text: str) -> list[str]:
    lowered = text.lower()
    found: dict[str, None] = {}
    for keyword, label in _AMENITY_KEYWORDS.items():
        if keyword in lowered:
            found[label] = None
    return list(found.keys())


# Airbnb serves these generic/anti-bot titles instead of the real listing name.
_GENERIC_TITLE_MARKERS = ("airbnb:", "vacation rentals, cabins", "unique homes")
_JUNK_TITLE_EXACT = {"control", "airbnb", "loading", "untitled"}


def _clean_title(raw: str | None) -> str | None:
    if not raw:
        return None
    lowered = raw.strip().lower()
    if lowered in _JUNK_TITLE_EXACT or len(lowered) < 4:
        return None
    if any(m in lowered for m in _GENERIC_TITLE_MARKERS):
        return None
    return raw


# Airbnb policy boilerplate that sometimes leaks into the JSON description field.
_DESC_BOILERPLATE = ("service animals aren", "emotional support animal", "this content couldn")


def _clean_description(raw: str | None) -> str | None:
    if not raw:
        return None
    cleaned = (
        raw.replace("\\n", "\n")
        .replace("\\u003c", "<")
        .replace("\\u003e", ">")
        .replace("<br/>", "\n")
        .replace("<br>", "\n")
    )
    cleaned = re.sub(r"<[^>]+>", "", cleaned).strip()
    if len(cleaned) < 12 or any(m in cleaned.lower() for m in _DESC_BOILERPLATE):
        return None
    return cleaned


def _best_description(html: str) -> str | None:
    """Pick the richest description available. The og:description meta is only a
    ~160-char teaser, so prefer the full text embedded in Airbnb's page JSON."""
    candidates: list[str] = []
    for raw in (
        _json_first(html, ("localizedDescription",)),
        _json_first(html, ("htmlText",)),
        _json_first(html, ("description",)),
        _meta_content(html, "og:description"),
    ):
        cleaned = _clean_description(raw)
        if cleaned and cleaned not in candidates:
            candidates.append(cleaned)
    if not candidates:
        return None
    # The longest candidate is the real, full listing description.
    return max(candidates, key=len)


def parse_airbnb_html(html: str, source_url: str) -> ImportedListing:
    """Extract a structured ``ImportedListing`` from raw listing HTML."""
    id_match = _ID_RE.search(source_url)
    airbnb_id = id_match.group(1) if id_match else None

    # Prefer a real listing name from the embedded JSON; fall back to og:title.
    # Both are cleaned of Airbnb's generic/anti-bot titles.
    title = _clean_title(
        _json_first(html, ("localizedListingName", "listingTitle", "pdpTitle", "name"))
        or _meta_content(html, "og:title")
    )
    description = _best_description(html)

    _og_images = [
        img.split("?", 1)[0]  # strip resize query params
        for img in _all_meta_content(html, "og:image")
        if "/im/pictures/" in img and not any(j in img.lower() for j in _IMG_JUNK)
    ]
    images: list[str] = list(dict.fromkeys(_og_images))  # dedupe, preserve order
    images.extend(img for img in _gallery_images(html) if img not in images)

    # Capacity: embedded JSON counts are most reliable, then visible text.
    capacity_text = " ".join(filter(None, [title or "", description or "", html[:400_000]]))
    max_guests = _json_int(html, ("personCapacity",)) or _int_before(capacity_text, "guests?")
    bedrooms = _json_int(html, ("bedroomCount", "bedrooms")) or _int_before(capacity_text, "bedrooms?")
    beds = _json_int(html, ("bedCount", "bedLabel")) or _int_before(capacity_text, "beds?")
    bathrooms = _json_int(html, ("bathroomCount", "bathrooms")) or _int_before(capacity_text, "bath(?:room|s)?")

    latitude = _float_match(html, "lat")
    longitude = _float_match(html, "lng")

    # Scan only the title + real description (not the whole page) so we don't
    # pick up amenity keywords that merely appear in Airbnb's UI chrome/scripts.
    amenities = _scan_amenities(" ".join(filter(None, [title or "", description or ""])))

    listing = ImportedListing(
        source_url=source_url,
        airbnb_id=airbnb_id,
        title=title,
        description=description,
        images=images,
        amenities=amenities,
        max_guests=max_guests,
        bedrooms=bedrooms,
        beds=beds,
        bathrooms=bathrooms,
        latitude=latitude,
        longitude=longitude,
    )

    listing.missing_fields = _compute_missing(listing)
    return listing


def _compute_missing(listing: ImportedListing) -> list[str]:
    missing: list[str] = []
    if not listing.title:
        missing.append("title")
    if not listing.description:
        missing.append("description")
    if not listing.images:
        missing.append("images")
    if listing.max_guests is None:
        missing.append("max_guests")
    if listing.bedrooms is None:
        missing.append("bedrooms")
    if not listing.amenities:
        missing.append("amenities")
    # Pricing, area and resort are intentionally always host-supplied (EGP),
    # never imported from Airbnb.
    missing.extend(["base_price_per_night", "area", "resort_id"])
    return missing
