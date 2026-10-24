// Record each blog post image's real pixel width as a --natural-w custom
// property, so the post CSS can stop an image growing past it.
//
// eleventy-img emits srcset with `w` descriptors, and with those the browser
// takes an image's natural width from `sizes` rather than from the file. A
// 400px screenshot under sizes="… 1084px" would therefore render at 1084px.
// The `width` attribute eleventy-img writes is the largest generated width,
// i.e. the source width (capped at the largest configured width).
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
				return match.replace(/<img\b([^>]*)>/, (img, attrs) => {
					const width = attrs.match(/\swidth\s*=\s*"(\d+)"/)?.[1];
					if (!width) return img;
					const prop = `--natural-w: ${width}px;`;
					const styled = /\sstyle\s*=\s*"/.test(attrs)
						? attrs.replace(/\sstyle\s*=\s*"/, (s) => `${s}${prop} `)
						: `${attrs} style="${prop}"`;
					return `<img${styled}>`;
				});
			}
		);
	});
}
