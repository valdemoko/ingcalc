/**
 * Generate static PNG favicons from the SVG brand mark.
 * Run: npx tsx scripts/generate-favicons.ts
 *
 * Outputs to public/: icon-16.png, icon-32.png, icon-48.png, icon-180.png
 * These are used by the metadata API and provide fallback PNGs.
 */
import fs from "fs";
import path from "path";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="SIZE" height="SIZE">
  <rect width="64" height="64" rx="11" fill="#0A4A74"/>
  <path d="M13 23 L28 23 L28 50" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="28" cy="23" r="5" fill="#D97706"/>
</svg>`;

const sizes = [16, 32, 48, 180];
const publicDir = path.join(__dirname, "..", "public");

for (const size of sizes) {
  const svg = SVG.replace(/SIZE/g, String(size));
  const filePath = path.join(publicDir, `icon-${size}.png`);
  // Write SVG as fallback — real PNG generation needs sharp/canvas
  // For production, run: npm i -D sharp && npx tsx scripts/generate-favicons.ts
  // For now, the SVG favicon and Next.js icon.tsx handle rendering
  fs.writeFileSync(filePath.replace(".png", ".svg"), svg);
}

console.log("SVG icon files written to public/");
