// Wrap <picture> and <video> elements in blog post HTML output with the
// placeholder-glow markup used elsewhere (see
// src/_includes/partials/deferred_images.njk). Only these elements are
// targeted so chrome imagery (navbar logo, author avatar) is left alone —
// eleventy-img emits <picture> for content images from markdown, and our
// video-media md plugin emits <video> for content videos.
//
// Any classes on the inner <img> (for <picture>) or on the <video> tag itself
// (typically added via markdown-it-attrs) are hoisted onto the wrapper span
// so width/layout rules resolve against the <p> rather than the auto-sized
// wrapper.
export default function imagePlaceholders(eleventyConfig) {
	eleventyConfig.addTransform("image-placeholders", function (content) {
		if (!this.page?.outputPath?.endsWith?.(".html")) return content;
		if (!this.page?.inputPath?.includes?.("/blog/")) return content;

		// The first alternative swallows whole <script>/<style> blocks so we
		// don't accidentally rewrite tag-shaped text inside inlined CSS or JS.
		return content.replace(
			/<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<picture\b[\s\S]*?<\/picture>|<video\b([^>]*)>([\s\S]*?)<\/video>/g,
			(match, styleOrScript, videoOpenAttrs, videoInner) => {
				if (styleOrScript) return match;

				if (match.startsWith("<picture")) {
					const imgMatch = match.match(/<img\b([^>]*)>/);
					if (!imgMatch) return match;
					const [hoisted, newImgAttrs] = hoistClasses(imgMatch[1]);
					// TEMP: skip placeholder wrapping for images with custom classes.
					if (hoisted.length) return match;
					return wrap(hoisted, match.replace(imgMatch[0], `<img${newImgAttrs}>`));
				}

				const [hoisted, newAttrs] = hoistClasses(videoOpenAttrs);
				// TEMP: skip placeholder wrapping for videos with custom classes.
				if (hoisted.length) return match;
				return wrap(hoisted, `<video${newAttrs}>${videoInner}</video>`);
			}
		);
	});
}

function hoistClasses(attrs) {
	const classMatch = attrs.match(/\sclass\s*=\s*"([^"]*)"/);
	const hoisted = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
	const newAttrs = classMatch
		? attrs.replace(/\sclass\s*=\s*"[^"]*"/, ' class="deferred-img"')
		: `${attrs} class="deferred-img"`;
	return [hoisted, newAttrs];
}

function wrap(hoistedClasses, inner) {
	const wrapperClasses = [
		"d-inline-block", "position-relative", "placeholder-glow", "deferred-img-batch",
		...hoistedClasses,
	].join(" ");
	return (
		`<span class="${wrapperClasses}">` +
			`<span class="placeholder position-absolute top-0 start-0 w-100 h-100 deferred-img-placeholder" style="visibility: hidden" aria-hidden="true"></span>` +
			inner +
		`</span>`
	);
}
