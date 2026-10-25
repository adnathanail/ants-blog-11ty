// Give the <img> inside each <picture>, and each <video>, in blog post HTML
// output the classes that make it show a glowing placeholder until it has
// loaded (see src/_includes/partials/deferred_images.njk). Only these
// elements are targeted so chrome imagery (navbar logo, author avatar) is
// left alone — eleventy-img emits <picture> for content images from
// markdown, and our video-media md plugin emits <video> for content videos.
//
// The placeholder is drawn by the media element itself rather than by a
// wrapper, so sizing classes on it (typically added via markdown-it-attrs)
// resolve against the surrounding <p> as normal.
const PLACEHOLDER_CLASSES = ["deferred-img", "deferred-img-glow"];

export default function imagePlaceholders(eleventyConfig) {
	eleventyConfig.addTransform("image-placeholders", function (content) {
		if (!this.page?.outputPath?.endsWith?.(".html")) return content;
		if (!this.page?.inputPath?.includes?.("/blog/")) return content;

		// The first alternative swallows whole <script>/<style> blocks so we
		// don't accidentally rewrite tag-shaped text inside inlined CSS or JS.
		return content.replace(
			/<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<picture\b[\s\S]*?<\/picture>|<video\b([^>]*)>/g,
			(match, styleOrScript, videoAttrs) => {
				if (styleOrScript) return match;
				if (videoAttrs !== undefined) return `<video${addClasses(videoAttrs)}>`;
				return match.replace(/<img\b([^>]*)>/, (img, attrs) => `<img${addClasses(attrs)}>`);
			}
		);
	});
}

function addClasses(attrs) {
	const classMatch = attrs.match(/\sclass\s*=\s*"([^"]*)"/);
	if (!classMatch) return `${attrs} class="${PLACEHOLDER_CLASSES.join(" ")}"`;
	const classes = [...classMatch[1].split(/\s+/).filter(Boolean), ...PLACEHOLDER_CLASSES];
	return attrs.replace(classMatch[0], ` class="${classes.join(" ")}"`);
}
