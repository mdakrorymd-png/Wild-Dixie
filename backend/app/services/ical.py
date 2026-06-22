"""Minimal, dependency-free iCalendar (.ics) parser & generator.

Scoped to what vacation-rental calendar sync needs: all-day VEVENT blocks
(``DTSTART``/``DTEND`` as ``VALUE=DATE``), where ``DTEND`` is the *exclusive*
checkout day — the convention Airbnb / Booking.com exports use.

Kept pure so it can be unit-tested without network or a DB.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone


@dataclass
class IcalEvent:
    uid: str
    start: date
    end: date  # exclusive checkout day
    summary: str = "Reserved"

    def nights(self) -> list[date]:
        """The blocked nights: start (inclusive) .. end (exclusive)."""
        if self.end <= self.start:
            return [self.start]
        days: list[date] = []
        cur = self.start
        while cur < self.end:
            days.append(cur)
            cur += timedelta(days=1)
        return days


# --------------------------------------------------------------------------- #
# Parsing
# --------------------------------------------------------------------------- #
def _unfold(raw: str) -> list[str]:
    """RFC 5545 line unfolding: a line starting with space/tab continues the
    previous one."""
    lines: list[str] = []
    for line in raw.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        if line[:1] in (" ", "\t") and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line)
    return lines


def _parse_date_value(value: str) -> date | None:
    value = value.strip()
    # Date only: 20260620
    if len(value) == 8 and value.isdigit():
        return date(int(value[0:4]), int(value[4:6]), int(value[6:8]))
    # Date-time: 20260620T140000Z -> take the date part.
    if "T" in value and len(value) >= 8 and value[:8].isdigit():
        head = value[:8]
        return date(int(head[0:4]), int(head[4:6]), int(head[6:8]))
    return None


def parse_ical(text: str) -> list[IcalEvent]:
    """Parse VEVENTs out of an iCalendar document. Malformed events are skipped."""
    events: list[IcalEvent] = []
    in_event = False
    cur: dict[str, str] = {}

    for line in _unfold(text):
        stripped = line.strip()
        if stripped == "BEGIN:VEVENT":
            in_event = True
            cur = {}
            continue
        if stripped == "END:VEVENT":
            in_event = False
            ev = _build_event(cur)
            if ev is not None:
                events.append(ev)
            continue
        if not in_event or ":" not in line:
            continue
        name_part, value = line.split(":", 1)
        # Drop any parameters after ';' (e.g. DTSTART;VALUE=DATE).
        name = name_part.split(";", 1)[0].upper()
        cur[name] = value.strip()

    return events


def _build_event(props: dict[str, str]) -> IcalEvent | None:
    if "DTSTART" not in props:
        return None
    start = _parse_date_value(props["DTSTART"])
    if start is None:
        return None
    end = _parse_date_value(props.get("DTEND", "")) if "DTEND" in props else None
    if end is None:
        end = start + timedelta(days=1)
    uid = props.get("UID", f"{start.isoformat()}-{end.isoformat()}")
    summary = props.get("SUMMARY", "Reserved")
    return IcalEvent(uid=uid, start=start, end=end, summary=summary)


# --------------------------------------------------------------------------- #
# Generation
# --------------------------------------------------------------------------- #
def merge_into_ranges(days: list[date]) -> list[tuple[date, date]]:
    """Collapse a set of blocked nights into ``(start, end_exclusive)`` ranges."""
    if not days:
        return []
    ordered = sorted(set(days))
    ranges: list[tuple[date, date]] = []
    run_start = prev = ordered[0]
    for d in ordered[1:]:
        if d == prev + timedelta(days=1):
            prev = d
            continue
        ranges.append((run_start, prev + timedelta(days=1)))
        run_start = prev = d
    ranges.append((run_start, prev + timedelta(days=1)))
    return ranges


def _fmt_date(d: date) -> str:
    return d.strftime("%Y%m%d")


def generate_ical(
    *,
    calendar_name: str,
    blocked_days: list[date],
    uid_namespace: str,
    now: datetime | None = None,
) -> str:
    """Build a VCALENDAR exposing blocked nights as all-day VEVENTs."""
    stamp = (now or datetime.now(timezone.utc)).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Egypt Rentals//Calendar 1.0//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{calendar_name}",
    ]
    for start, end in merge_into_ranges(blocked_days):
        uid = f"{_fmt_date(start)}-{_fmt_date(end)}-{uid_namespace}@egypt-rentals"
        lines += [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{stamp}",
            f"DTSTART;VALUE=DATE:{_fmt_date(start)}",
            f"DTEND;VALUE=DATE:{_fmt_date(end)}",
            "SUMMARY:Reserved",
            "TRANSP:OPAQUE",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"
