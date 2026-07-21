# Wild Dixie — TikTok Owner-Acquisition Ad (fully animated, no footage)

15-second, 1080×1920 (9:16), 30fps MP4 targeting **chalet owners in Ain Sokhna**,
asking them to list their unit on [wilddixie.com](https://wilddixie.com) for full
rental management. Arabic-first, full RTL, Cairo font (bundled locally in
`assets/fonts/` — renders offline).

The whole ad is a single HTML/CSS animation (`ad.html`) on one 15s master
timeline. A Playwright script pauses every CSS animation and seeks
`document.getAnimations()[i].currentTime` frame by frame, so the capture is
**deterministic** — identical output on any machine, regardless of speed.

## Scene breakdown

| Time | Scene | On screen |
|------|-------|-----------|
| 0–2s | HOOK | «شاليهك في السخنة فاضي طول السنة؟» — calendar fills with red «فاضي» stamps |
| 2–6s | FLIP | same calendar flips day-by-day into gold booked nights with price tags — «خلّيه يشتغل لحسابك» |
| 6–11s | HOW | 3 tiles: بنصوّر ونسوّق (camera) · بنستقبل الضيوف ونتابع النظافة (key) · وأنت بتستلم أرباحك (wallet) |
| 11–15s | CTA | «سجّل شاليهك على wilddixie.com» + placeholder terms line, sun setting into calm waves, pulsing CTA |

## Render

```bash
cd marketing/tiktok-owner-ad
npm install          # installs Playwright (uses the system Chromium, no browser download)
npm run render       # captures 450 frames + encodes everything
```

Outputs land in `output/`:

- `wild-dixie-owner-ad.mp4` — final ad (H.264, yuv420p, faststart)
- `thumbnail.png` — final frame (CTA with domain)
- `storyboard.png` — 3 key frames tiled (hook / flipped calendar / services)

Options:

- `node capture.mjs --keep-frames` — keep the raw PNG frames in `frames/`
- `CHROMIUM_PATH=/path/to/chrome node capture.mjs` — explicit browser binary
  (otherwise auto-detected under `$PLAYWRIGHT_BROWSERS_PATH` / `/opt/pw-browsers`)

Requires `ffmpeg` with `libx264` on PATH (`apt-get install ffmpeg`).

### Manual ffmpeg commands (what the script runs)

```bash
# MP4
ffmpeg -y -framerate 30 -i frames/frame_%04d.png \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  output/wild-dixie-owner-ad.mp4

# Thumbnail = last frame
cp frames/frame_0449.png output/thumbnail.png

# 3-frame storyboard
ffmpeg -y -i frames/frame_0045.png -i frames/frame_0141.png -i frames/frame_0290.png \
  -filter_complex "[0:v][1:v][2:v]hstack=inputs=3,scale=1800:-1" output/storyboard.png
```

## Preview / QA in a browser

- Open `ad.html` — the 15s timeline plays in real time (zoom out; the stage is a fixed 1080×1920).
- Open `ad.html?safe` — overlays TikTok safe-zone guides (bottom 250px / right 120px). All text sits inside them; only the decorative waves enter the bottom margin.

## Before publishing — REQUIRED edits

**No numbers in this ad are real, by design.** Fabricated occupancy/earnings
claims to property owners are legal exposure, so every figure is a placeholder:

1. `#cta-terms` in `ad.html` — replace `[PLACEHOLDER: سطر العمولة / شروط التعاقد]`
   with the actual commission/terms line (or delete the box after legal review).
2. The per-night price tags on booked calendar days intentionally read
   «ــــ ج.م» (dashes). Leave them as-is, or put a *real, defensible* nightly
   price in `.price-tag` inside `ad.html`'s calendar builder.
3. Do **not** add occupancy %, earnings figures, or "X owners trust us" counts
   unless they are documented and verifiable.

Re-run `npm run render` after any edit.

## Design notes

- Palette: deep navy `#0C2A3E`, sand `#EADFC8`, white, gold `#E0A83E` —
  investment/trust cues, not vacation coral. Matches the Wild Dixie sun-and-waves mark.
- Pacing is deliberately calmer than consumer TikTok (audience 35–60):
  one idea per scene, each headline stays up long enough to read twice.
- "Empty" days use muted terracotta (`#DE6A5A`), not alarm red.
