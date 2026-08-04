#!/usr/bin/env node
// List every tag/collection with its item count. Includes tags added via
// frontmatter, .11tydata.js cascade, preprocessor mutations, and any
// eleventyConfig.addCollection() calls. Skips the built-in `all`.

import Eleventy from "@11ty/eleventy";

const eleventy = new Eleventy("src/content", "_site", {
	configPath: "eleventy.config.js",
	quietMode: true,
	// Use serve mode so drafts aren't skipped — we want to see them in the count.
	runMode: "serve",
});

await eleventy.toJSON();

const collectionsData = eleventy.writer?.templateMap?.collectionsData ?? {};
const entries = Object.entries(collectionsData)
	.filter(([name]) => name !== "all")
	.map(([name, items]) => [name, items.length])
	.sort(([a], [b]) => a.localeCompare(b));

if (entries.length === 0) {
	console.log("(no tags)");
} else {
	const width = Math.max(...entries.map(([t]) => t.length));
	for (const [tag, n] of entries) {
		console.log(`${tag.padEnd(width)}  ${n}`);
	}
}
