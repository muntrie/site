import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url);

const read = (path) => readFileSync(new URL(path, root), "utf8");
const exists = (path) => existsSync(new URL(path, root));
const sizeOf = (path) => statSync(new URL(path, root)).size;

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const runtimeFiles = [
  "index.html",
  "about.html",
  "support.html",
  "privacy.html",
  "terms.html",
  "privacy-embedded.html",
  "terms-embedded.html",
  "styles.css",
  "home.css",
  "content.js",
  "script.js",
];

const runtimeText = runtimeFiles.map((path) => [path, read(path)]);

for (const [path, text] of runtimeText) {
  assert(
    !/assets\/images\/[^"')\s]+\.jpg/.test(text),
    `${path} still references original large JPG runtime assets`,
  );
}

for (const [path, text] of runtimeText.filter(([path]) => path.endsWith(".html"))) {
  const body = text.replace(/<meta[^>]+property="og:image"[^>]*>/g, "");
  assert(
    !body.includes("assets/icons/brand-icon.png"),
    `${path} still uses the 1024px brand PNG in visible markup`,
  );
}

const optimizedImages = [
  "assets/images/optimized/scene-british-columbia-1200.webp",
  "assets/images/optimized/scene-british-columbia-1800.webp",
  "assets/images/optimized/scene-mist-1200.webp",
  "assets/images/optimized/scene-mist-1800.webp",
  "assets/images/optimized/hero-ocean-1200.webp",
  "assets/images/optimized/hero-ocean-1800.webp",
  "assets/images/optimized/scene-forest-1200.webp",
  "assets/images/optimized/scene-forest-1800.webp",
];

for (const path of optimizedImages) {
  assert(exists(path), `${path} is missing`);
  if (exists(path)) {
    assert(sizeOf(path) <= 320_000, `${path} is larger than 320KB`);
  }
}

for (const path of [
  "assets/icons/brand-icon-96.webp",
  "assets/icons/brand-icon-192.webp",
]) {
  assert(exists(path), `${path} is missing`);
  if (exists(path)) {
    assert(sizeOf(path) <= 12_000, `${path} is larger than 12KB`);
  }
}

const script = read("script.js");
const syncPreviewAudioStart = script.indexOf("function syncPreviewAudio(");
const togglePreviewSoundStart = script.indexOf("async function togglePreviewSound");
assert(syncPreviewAudioStart !== -1, "syncPreviewAudio() is missing");
assert(togglePreviewSoundStart !== -1, "togglePreviewSound() is missing");

if (syncPreviewAudioStart !== -1 && togglePreviewSoundStart !== -1) {
  const syncPreviewAudioBody = script.slice(syncPreviewAudioStart, togglePreviewSoundStart);
  assert(
    !/\.load\(\)/.test(syncPreviewAudioBody),
    "syncPreviewAudio() should not call load() before the user enables sound",
  );
}

if (failures.length) {
  console.error(`Performance checks failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Performance checks passed");
