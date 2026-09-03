// Wrap a paragraph that contains nothing but a single image (or video, see
// video-media.js — both parse as an "image" token) in <figure>/<figcaption>
// when it has alt text, e.g. `![The lighthouse at dusk](lighthouse.png)`.
// Images with no alt text keep rendering as a plain <p><img></p>, so existing
// posts are unaffected.
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
			: `<figcaption>${mdLib.utils.escapeHtml(caption)}</figcaption></figure>`;
	};

	return mdLib;
}

// Returns the caption text for the paragraph opening at `openIdx`, or null if
// that paragraph isn't a lone captioned image/video.
function captionFor(tokens, openIdx, mdLib, options, env) {
	const inline = tokens[openIdx + 1];
	if (!inline || inline.type !== 'inline') return null;
	const children = inline.children;
	if (!children || children.length !== 1 || children[0].type !== 'image') return null;
	const alt = mdLib.renderer.renderInlineAsText(children[0].children, options, env).trim();
	return alt || null;
}
