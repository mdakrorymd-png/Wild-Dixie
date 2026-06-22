"""Application configuration, loaded once from the environment / .env file."""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # ---- Application ----
    PROJECT_NAME: str = "Egypt Vacation Rentals API"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # ---- Database ----
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def _force_asyncpg(cls, v: str) -> str:
        """Cloud providers (Neon/Render/Railway/Heroku) hand out a ``postgres://``
        or ``postgresql://`` URL — rewrite it to the async driver our app needs,
        and drop libpq-only query params (``sslmode``/``channel_binding``) that
        asyncpg rejects. TLS is re-applied through ``db_connect_args``."""
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        if "?" in v:
            v = v.split("?", 1)[0]
        return v

    # ---- Security / JWT ----
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ---- OTP ----
    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60

    # ---- SMS ----
    SMS_PROVIDER: str = "console"

    # ---- Airbnb scraper ----
    SCRAPER_MAX_ATTEMPTS: int = 3
    # Optional proxy to bypass IP-level blocks, e.g.
    #   http://user:pass@gate.smartproxy.com:7000  (residential proxy recommended)
    SCRAPER_PROXY: str = ""

    # ---- iCal calendar sync ----
    ENABLE_ICAL_SCHEDULER: bool = True
    ICAL_SYNC_INTERVAL_MINUTES: int = 15
    ICAL_FETCH_TIMEOUT_SECONDS: int = 20
    # Used to build absolute iCal export URLs handed to Airbnb.
    PUBLIC_BASE_URL: str = "http://localhost:8000"

    # ---- Booking & payments ----
    BOOKING_HOLD_MINUTES: int = 60  # InstaPay/wallet verification window
    PLATFORM_COMMISSION_PERCENT: float = 20.0
    PLATFORM_INSTAPAY_ADDRESS: str = "egyptrentals@instapay"
    PLATFORM_WALLET_NUMBER: str = "01000000000"

    # ---- Strict cancellation policy (short Egyptian summer season) ----
    CANCELLATION_WINDOW_DAYS: int = 7  # cancelling within this window forfeits...
    CANCELLATION_FEE_PERCENT: int = 100  # ...this % of the amount paid

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def db_connect_args(self) -> dict:
        """asyncpg connect args. Remote managed Postgres (Neon/Render/Railway)
        requires TLS; localhost dev does not. Applied in both the app engine and
        the Alembic engine."""
        from urllib.parse import urlparse

        host = urlparse(self.DATABASE_URL).hostname or ""
        if host not in {"localhost", "127.0.0.1", "::1", ""}:
            return {"ssl": True}
        return {}


@lru_cache
def get_settings() -> Settings:
    """Cached accessor so the .env file is parsed only once per process."""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
