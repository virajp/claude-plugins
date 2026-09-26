// node capture.mjs stills 1.2 3.5 ...   -> stills/t-<t>.png
// node capture.mjs video                 -> frames piped to ffmpeg -> video.mp4 (silent)
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const BRAVE =
  "/Users/virajpatel/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const [mode, ...rest] = process.argv.slice(2);
const FPS = 30, DUR = 21;

const browser = await chromium.launch({
  executablePath: BRAVE,
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(new URL("index.html", import.meta.url).href);
await page.evaluate(() => window.ready);

if (mode === "stills") {
  mkdirSync("stills", { recursive: true });
  for (const t of rest) {
    await page.evaluate(t => render(+t), t);
    await page.screenshot({ path: `stills/t-${t}.png` });
  }
}
else {
  const ff = spawn("mise", [
    "x",
    "ffmpeg@9.0.2",
    "--",
    "ffmpeg",
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-framerate",
    String(FPS),
    "-c:v",
    "png",
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "16",
    "-pix_fmt",
    "yuv420p",
    "video.mp4",
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const n = FPS * DUR;
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => render(t), i / FPS);
    const buf = await page.screenshot({ type: "png" });
    if (!ff.stdin.write(buf)) {
      await new Promise(r => ff.stdin.once("drain", r));
    }
    if (i % 90 === 0) {
      console.log(`frame ${i}/${n}`);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
}
await browser.close();
