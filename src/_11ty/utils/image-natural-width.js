// Record each blog post image's real pixel width (--natural-w) and aspect
// ratio (--ratio) as custom properties, so the post CSS can size it without
// waiting for it to load.
//
// - eleventy-img emits srcset with `w` descriptors, and with those the browser
//   takes an image's natural width from `sizes` rather than from the file. A
//   400px screenshot under sizes="… 1084px" would render at 1084px unless
//   capped at --natural-w.
// - Until an image loads it has no natural size at all, and Chrome draws a
//   pending alt="" image as 0x0. A width computed from these properties gives
//   it its final box straight away, so the loading placeholder is visible and
//   nothing shifts when it arrives.
//
// The `width`/`height` attributes eleventy-img writes are those of the largest
// generated width, i.e. the source size (capped at the largest configured width).
// The properties go on the <picture> rather than the <img>: the <img> inherits
// them, and a gallery's flex layout needs them on the <picture>, its flex item.
export default function imageNaturalWidth(eleventyConfig) {
	eleventyConfig.addTransform("image-natural-width", function (content) {
		if (!this.page?.outputPath?.endsWith?.(".html")) return content;
		if (!this.page?.inputPath?.includes?.("/blog/")) return content;

		// The first alternative swallows whole <script>/<style> blocks so we
		// don't accidentally rewrite tag-shaped text inside inlined CSS or JS.
		return content.replace(
			/<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<picture\b[\s\S]*?<\/picture>/g,
			(match, styleOrScript) => {
				if (styleOrScript) return match;
				const imgAttrs = match.match(/<img\b([^>]*)>/)?.[1] ?? "";
				const width = imgAttrs.match(/\swidth\s*=\s*"(\d+)"/)?.[1];
				const height = imgAttrs.match(/\sheight\s*=\s*"(\d+)"/)?.[1];
				if (!width || !height) return match;
				const style = `--natural-w: ${width}px; --ratio: ${+(width / height).toFixed(4)};`;
				return match.replace(/^<picture\b/, `<picture style="${style}"`);
			}
		);
	});
}
