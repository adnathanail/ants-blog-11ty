// Prepare the images and videos in blog post HTML output. Only the <img> inside
// each <picture>, and each <video>, is touched, so chrome imagery (navbar logo,
// author avatar) is left alone: eleventy-img emits <picture> for content images
// from markdown, and our video-media md plugin emits <video> for content videos.
//
// Placeholders: each gets the classes that make it show a glowing placeholder
// until it has loaded (see src/_includes/partials/deferred_images.njk). The
// placeholder is drawn by the media element itself rather than by a wrapper, so
// sizing classes on it (typically added via markdown-it-attrs) resolve against
// the surrounding <p> as normal.
//
// Sizes: each <picture> gets its image's real pixel width (--natural-w) and
// aspect ratio (--ratio) as custom properties, so the post CSS can size it
// without waiting for it to load. video-media.js does the same for videos.
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
const PLACEHOLDER_CLASSES = ["deferred-img", "deferred-img-glow"];

// The inline style that carries a media element's size to the post CSS
// (bootstrap.scss and gallery.css). Also used by video-media.js.
export function mediaSizeStyle(width, height) {
	return `--natural-w: ${width}px; --ratio: ${+(width / height).toFixed(4)};`;
}

export default function postMedia(eleventyConfig) {
	eleventyConfig.addTransform("post-media", function (content) {
		if (!this.page?.outputPath?.endsWith?.(".html")) return content;
		if (!this.page?.inputPath?.includes?.("/blog/")) return content;

		// The first alternative swallows whole <script>/<style> blocks so we
		// don't accidentally rewrite tag-shaped text inside inlined CSS or JS.
		return content.replace(
			/<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<picture\b[\s\S]*?<\/picture>|<video\b([^>]*)>/g,
			(match, styleOrScript, videoAttrs) => {
				if (styleOrScript) return match;
				if (videoAttrs !== undefined) return `<video${addClasses(videoAttrs)}>`;
				const picture = match.replace(/<img\b([^>]*)>/, (img, attrs) => `<img${addClasses(attrs)}>`);
				return addSize(picture);
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

function addSize(picture) {
	const imgAttrs = picture.match(/<img\b([^>]*)>/)?.[1] ?? "";
	const width = imgAttrs.match(/\swidth\s*=\s*"(\d+)"/)?.[1];
	const height = imgAttrs.match(/\sheight\s*=\s*"(\d+)"/)?.[1];
	if (!width || !height) return picture;
	return picture.replace(/^<picture\b/, `<picture style="${mediaSizeStyle(width, height)}"`);
}
