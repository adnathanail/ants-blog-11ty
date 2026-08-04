// Render src/assets/img/ants.svg to src/assets/img/ants.png with the brand
// color and a transparent background. The SVG uses currentColor, so we
// substitute it before rasterizing.
//
// Run: node scripts/render-ants-png.mjs

import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SVG_PATH = resolve(SCRIPT_DIR, "../src/assets/img/ants.svg");
const PNG_PATH = resolve(SCRIPT_DIR, "../src/assets/img/ants.png");
const COLOR = "#AD00AD";
const WIDTH = 680;

const svg = readFileSync(SVG_PATH, "utf8").replaceAll("currentColor", COLOR);

const info = await sharp(Buffer.from(svg), { density: 300 })
	.resize({ width: WIDTH })
	.png()
	.toFile(PNG_PATH);

console.log(info);
