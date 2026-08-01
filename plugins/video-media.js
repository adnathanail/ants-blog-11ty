// Render ![](foo.mov) as a <video> instead of an <img>. Any classes from
// markdown-it-attrs (e.g. `.img-w-20`) are passed through.
export default function videoMedia(mdLib) {
	const defaultImageRenderer = mdLib.renderer.rules.image;
	mdLib.renderer.rules.image = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		const src = token.attrGet('src') || '';
		if (/\.(mov|mp4|webm|m4v)$/i.test(src)) {
			const classAttr = token.attrGet('class');
			const attrs = [
				`src="${mdLib.utils.escapeHtml(src)}"`,
				classAttr && `class="${mdLib.utils.escapeHtml(classAttr)}"`,
				'autoplay', 'playsinline', 'muted', 'loop',
			].filter(Boolean).join(' ');
			return `<video ${attrs}></video>`;
		}
		return defaultImageRenderer(tokens, idx, options, env, slf);
	};
	return mdLib;
}
