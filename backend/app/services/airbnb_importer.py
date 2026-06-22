"""Fetch an Airbnb listing page with a stealth-configured headless browser.

The actual extraction lives in ``airbnb_parser`` (pure & testable). This module
only handles the network/automation concern. Playwright is an optional
dependency: a clear error is raised if it (or its browser) is not installed.
"""
from __future__ import annotations

import logging
import random
from urllib.parse import urlparse

from app.core.config import settings
from app.core.exceptions import ExternalServiceError
from app.schemas.airbnb import ImportedListing
from app.services.airbnb_parser import parse_airbnb_html

logger = logging.getLogger("app.airbnb")

# Rotate through realistic desktop User-Agents to look less like a bot.
_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

# Fallback navigator/automation masking if playwright-stealth is unavailable.
_STEALTH_INIT_SCRIPT = """
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'ar'] });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
window.chrome = { runtime: {} };
"""


def _proxy_config() -> dict[str, str] | None:
    """Parse SCRAPER_PROXY into Playwright's proxy dict, if configured."""
    raw = settings.SCRAPER_PROXY.strip()
    if not raw:
        return None
    parsed = urlparse(raw)
    server = f"{parsed.scheme}://{parsed.hostname}"
    if parsed.port:
        server += f":{parsed.port}"
    cfg: dict[str, str] = {"server": server}
    if parsed.username:
        cfg["username"] = parsed.username
    if parsed.password:
        cfg["password"] = parsed.password
    return cfg


async def _apply_stealth(page) -> None:
    """Apply playwright-stealth if installed; otherwise the manual init script."""
    try:
        from playwright_stealth import Stealth

        await Stealth().apply_stealth_async(page)
    except Exception:  # noqa: BLE001 - library optional / API drift
        await page.add_init_script(_STEALTH_INIT_SCRIPT)


async def _humanize(page) -> None:
    """Human-like scrolling so lazy content (images, amenities) loads."""
    for _ in range(random.randint(3, 5)):
        await page.mouse.wheel(0, random.randint(600, 1100))
        await page.wait_for_timeout(random.randint(350, 800))
    # Try to open the full amenities modal to capture the complete list.
    for label in ("Show all amenities", "Show all", "عرض جميع وسائل الراحة"):
        try:
            btn = page.get_by_text(label, exact=False).first
            if await btn.is_visible(timeout=1500):
                await btn.click(timeout=2500)
                await page.wait_for_timeout(1200)
                break
        except Exception:  # noqa: BLE001 - best effort
            continue


async def _fetch_html(url: str, *, timeout_ms: int = 30_000) -> tuple[str, str]:
    """Return ``(html, final_url)`` — final_url is after any share-link redirect."""
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:
        raise ExternalServiceError(
            "Airbnb importer requires Playwright. Install it with: "
            "`pip install playwright` then `playwright install chromium`."
        ) from exc

    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=True,
                proxy=_proxy_config(),
                args=[
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                ],
            )
            try:
                context = await browser.new_context(
                    user_agent=random.choice(_USER_AGENTS),
                    locale="en-US",
                    # Slightly randomized viewport to vary the fingerprint.
                    viewport={
                        "width": random.randint(1280, 1500),
                        "height": random.randint(820, 960),
                    },
                )
                page = await context.new_page()
                await _apply_stealth(page)
                # goto follows redirects, so short share links resolve here.
                await page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
                await page.wait_for_timeout(random.randint(1_800, 2_800))
                await _humanize(page)
                return await page.content(), page.url
            finally:
                await browser.close()
    except ExternalServiceError:
        raise
    except Exception as exc:  # noqa: BLE001 - normalize any Playwright failure
        logger.warning("Airbnb fetch failed for %s: %s", url, exc)
        raise ExternalServiceError(
            "Could not fetch the Airbnb listing. The link may be invalid or "
            "temporarily blocked. Please try again or enter the details manually."
        ) from exc


# Junk titles Airbnb serves on its anti-bot "challenge" page.
_JUNK_TITLES = {"control", "airbnb", ""}


def _looks_blocked(listing: ImportedListing) -> bool:
    """A good listing page has a real title, several photos, and a capacity."""
    title = (listing.title or "").strip().lower()
    if title in _JUNK_TITLES or len(title) < 4:
        return True
    if len(listing.images) < 3:
        return True
    if listing.max_guests is None:
        return True
    return False


def _completeness(listing: ImportedListing) -> int:
    """Score how much we extracted, to keep the best attempt across retries."""
    fields = [
        listing.title and listing.title.strip().lower() not in _JUNK_TITLES,
        listing.description,
        len(listing.images) >= 3,
        listing.max_guests,
        listing.bedrooms,
        listing.bathrooms,
        listing.latitude,
        listing.amenities,
    ]
    return sum(1 for f in fields if f)


async def import_from_airbnb(url: str, *, max_attempts: int | None = None) -> ImportedListing:
    """Scrape an Airbnb listing fully automatically.

    Airbnb sometimes serves a degraded anti-bot page. We retry with a fresh
    browser fingerprint until we get a complete listing, keeping the best
    attempt as a fallback so the host never sees an empty result.
    """
    attempts = max_attempts or settings.SCRAPER_MAX_ATTEMPTS
    best: ImportedListing | None = None
    for attempt in range(1, attempts + 1):
        html, final_url = await _fetch_html(url)
        listing = parse_airbnb_html(html, final_url)
        listing.source_url = url

        if not _looks_blocked(listing):
            logger.info("Airbnb import succeeded on attempt %s for %s", attempt, url)
            return listing

        if best is None or _completeness(listing) > _completeness(best):
            best = listing
        logger.info("Airbnb attempt %s/%s looked blocked for %s; retrying.", attempt, attempts, url)

    if best is None or (best.title is None and not best.images):
        raise ExternalServiceError(
            "Airbnb blocked the request after several tries. Please paste the "
            "details manually, or try again in a moment."
        )
    return best
