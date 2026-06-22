"""Enumerations shared across models and schemas."""
import enum


class UserRole(str, enum.Enum):
    """A single account may hold several roles (e.g. both GUEST and HOST)."""

    GUEST = "guest"
    HOST = "host"
    ADMIN = "admin"


class OtpPurpose(str, enum.Enum):
    PHONE_VERIFICATION = "phone_verification"
    PASSWORD_RESET = "password_reset"
    LOGIN = "login"


class PropertyType(str, enum.Enum):
    CHALET = "chalet"
    VILLA = "villa"
    APARTMENT = "apartment"
    STUDIO = "studio"
    CABIN = "cabin"
    ROOM = "room"


class PropertyStatus(str, enum.Enum):
    """Lifecycle: draft -> pending_review -> published | rejected.

    ``suspended`` lets an admin pull a live listing without deleting it.
    """

    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class ListingSource(str, enum.Enum):
    MANUAL = "manual"
    AIRBNB_IMPORT = "airbnb_import"


class DayStatus(str, enum.Enum):
    """Status of a single calendar night. AVAILABLE is implicit (no stored row)."""

    AVAILABLE = "available"
    BLOCKED = "blocked"
    BOOKED = "booked"


class BlockSource(str, enum.Enum):
    HOST_MANUAL = "host_manual"
    EXTERNAL_ICAL = "external_ical"
    INTERNAL_BOOKING = "internal_booking"


class BookingStatus(str, enum.Enum):
    PENDING_PAYMENT = "pending_payment"  # dates held, awaiting payment
    PENDING_APPROVAL = "pending_approval"  # manual receipt uploaded, awaiting admin
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"  # hold window elapsed without payment
    COMPLETED = "completed"


class PaymentMethod(str, enum.Enum):
    CARD = "card"
    INSTAPAY = "instapay"
    VODAFONE_CASH = "vodafone_cash"


class PaymentKind(str, enum.Enum):
    FULL = "full"
    DOWN_PAYMENT = "down_payment"  # العربون
    BALANCE = "balance"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    AWAITING_REVIEW = "awaiting_review"  # manual receipt submitted
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    REFUNDED = "refunded"


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"


class DisputeStatus(str, enum.Enum):
    OPEN = "open"
    RESOLVED = "resolved"
    REJECTED = "rejected"
