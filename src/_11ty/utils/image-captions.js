// Wrap a paragraph that contains nothing but a single image (or video, see
// video-media.js — both parse as an "image" token) in <figure>/<figcaption>
// when it has alt text, e.g. `![The lighthouse at dusk](lighthouse.png)`.
// The caption is rendered as inline markdown, so it can hold links, emphasis
// etc. (`![[XKCD 356](https://xkcd.com/356/)](comic.png)`); the alt attribute
// is still the plain-text version.
// Images with no alt text keep rendering as a plain <p><img></p>, so existing
// posts are unaffected.
// A gallery's images are left alone even with alt text: their alt is only alt
// text, and a gallery takes one caption for the whole row instead (see the
// gallery shortcode in src/_11ty/shortcodes/components.js).
export default function imageCaptions(mdLib) {
	const defaultParagraphOpen = mdLib.renderer.rules.paragraph_open ||
		((tokens, idx, options, env, slf) => slf.renderToken(tokens, idx, options));
	const defaultParagraphClose = mdLib.renderer.rules.paragraph_close ||
		((tokens, idx, options, env, slf) => slf.renderToken(tokens, idx, options));

	mdLib.renderer.rules.paragraph_open = (tokens, idx, options, env, slf) => {
		const caption = captionFor(tokens, idx, mdLib, options, env);
		return caption === null ? defaultParagraphOpen(tokens, idx, options, env, slf) : '<figure>';
	};

	mdLib.renderer.rules.paragraph_close = (tokens, idx, options, env, slf) => {
		const caption = captionFor(tokens, idx - 2, mdLib, options, env);
		return caption === null
			? defaultParagraphClose(tokens, idx, options, env, slf)
			: `<figcaption>${slf.renderInline(caption, options, env)}</figcaption></figure>`;
	};

	return mdLib;
}

// Returns the caption's inline tokens for the paragraph opening at `openIdx`,
// or null if that paragraph isn't a lone image/video with non-empty alt text.
function captionFor(tokens, openIdx, mdLib, options, env) {
	if (isGalleryContent(tokens, openIdx)) return null;
	const inline = tokens[openIdx + 1];
	if (!inline || inline.type !== 'inline') return null;
	const children = inline.children;
	if (!children || children.length !== 1 || children[0].type !== 'image') return null;
	const alt = mdLib.renderer.renderInlineAsText(children[0].children, options, env).trim();
	return alt ? children[0].children : null;
}

// The gallery shortcode emits its opening tag as the end of the HTML block just
// before the paragraph holding its images.
function isGalleryContent(tokens, openIdx) {
	const prev = tokens[openIdx - 1];
	return prev?.type === 'html_block' && /<(div|figure) class="gallery">\s*$/.test(prev.content);
}
