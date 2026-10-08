import { NextResponse } from "next/server";

// Server-only: fetch the Airbnb iCal feed (token stays on the server) and
// return just the booked/blocked date ranges. Cached for 1 hour.
export const revalidate = 3600;

function icalDate(v: string): string | null {
  // VALUE=DATE => YYYYMMDD ; also tolerate full timestamps YYYYMMDDTHHMMSSZ
  const m = v.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function parseBooked(ics: string): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  // Split into VEVENT blocks
  for (const block of ics.split("BEGIN:VEVENT").slice(1)) {
    const startM = block.match(/DTSTART[^:]*:([0-9TZ]+)/);
    const endM = block.match(/DTEND[^:]*:([0-9TZ]+)/);
    if (!startM || !endM) continue;
    const start = icalDate(startM[1]);
    const end = icalDate(endM[1]); // iCal DTEND is exclusive (checkout day)
    if (start && end) ranges.push({ start, end });
  }
  return ranges.sort((a, b) => a.start.localeCompare(b.start));
}

export async function GET() {
  const url = process.env.AIRBNB_ICAL_BEACHFRONT;
  if (!url) {
    return NextResponse.json({ booked: [], configured: false });
  }
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "WildDixie/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`ical ${res.status}`);
    const ics = await res.text();
    const booked = parseBooked(ics);
    return NextResponse.json({ booked, configured: true, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ booked: [], configured: true, error: true });
  }
}
