/**
 * Renders ad.html into a 15s 1080x1920 30fps MP4.
 *
 * How it works: every animation in ad.html is a CSS animation on one 15s
 * master timeline. We pause all of them via document.getAnimations() and
 * seek currentTime frame by frame — capture is fully deterministic and
 * independent of machine speed.
 *
 * Usage:  node capture.mjs [--keep-frames]
 * Env:    CHROMIUM_PATH  — explicit Chromium binary (otherwise auto-detected)
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const DURATION = 15;            // seconds
const WIDTH = 1080;
const HEIGHT = 1920;
const TOTAL_FRAMES = FPS * DURATION; // 450

const framesDir = resolve(__dirname, 'frames');
const outDir = resolve(__dirname, 'output');
const keepFrames = process.argv.includes('--keep-frames');

// Storyboard frames: hook w/ stamped calendar, flipped/booked calendar, services.
// (The CTA scene is covered by the final-frame thumbnail.)
const STORYBOARD_FRAMES = [45, 141, 290];

const frame = (n) => resolve(framesDir, `frame_${String(n).padStart(4, '0')}.png`);

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    for (const dir of readdirSync(base)) {
      if (/^chromium-\d+$/.test(dir)) {
        const bin = resolve(base, dir, 'chrome-linux', 'chrome');
        if (existsSync(bin)) return bin;
      }
    }
  } catch { /* fall through to playwright's own resolution */ }
  return undefined;
}

rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const executablePath = findChromium();
console.log(`chromium: ${executablePath ?? '(playwright default)'}`);

const browser = await chromium.launch({
  executablePath,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars'],
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});

await page.goto('file://' + resolve(__dirname, 'ad.html'));
await page.evaluate(() => document.fonts.ready);
// two rAFs so the calendar built at load and all animations are registered
await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

const count = await page.evaluate(() => {
  const anims = document.getAnimations();
  anims.forEach(a => a.pause());
  return anims.length;
});
console.log(`paused ${count} animations; capturing ${TOTAL_FRAMES} frames…`);

for (let f = 0; f < TOTAL_FRAMES; f++) {
  const ms = (f / FPS) * 1000;
  await page.evaluate((t) => {
    document.getAnimations().forEach(a => { a.currentTime = t; });
  }, ms);
  await page.screenshot({ path: frame(f) });
  if (f % 30 === 0) console.log(`  frame ${f}/${TOTAL_FRAMES} (t=${(f / FPS).toFixed(1)}s)`);
}
await browser.close();
console.log('frames captured. encoding…');

const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

// 1) final MP4 (H.264, yuv420p for maximum player compatibility)
ff([
  '-framerate', String(FPS),
  '-i', resolve(framesDir, 'frame_%04d.png'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  resolve(outDir, 'wild-dixie-owner-ad.mp4'),
]);

// 2) thumbnail = final frame (CTA with domain on screen)
copyFileSync(frame(TOTAL_FRAMES - 1), resolve(outDir, 'thumbnail.png'));

// 3) 3-frame storyboard, tiled horizontally
ff([
  '-i', frame(STORYBOARD_FRAMES[0]),
  '-i', frame(STORYBOARD_FRAMES[1]),
  '-i', frame(STORYBOARD_FRAMES[2]),
  '-filter_complex', '[0:v][1:v][2:v]hstack=inputs=3,scale=1800:-1',
  resolve(outDir, 'storyboard.png'),
]);

if (!keepFrames) rmSync(framesDir, { recursive: true, force: true });

console.log('done:');
console.log('  output/wild-dixie-owner-ad.mp4');
console.log('  output/thumbnail.png');
console.log('  output/storyboard.png');
