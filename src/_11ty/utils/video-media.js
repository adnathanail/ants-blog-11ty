// Render ![](foo.mov) as a <video> instead of an <img>. Any classes from
// markdown-it-attrs (e.g. `.no-center`) are passed through.
//
// A video beside the post also gets its pixel width (--natural-w) and aspect
// ratio (--ratio), the same properties image-natural-width.js gives images, so
// the post CSS can size it before it loads. A video that cannot be read gets
// neither, and is sized once its metadata loads instead.
import path from "node:path";
import videoDimensions from "./video-dimensions.js";

function sizeStyle(src, env) {
	const inputPath = env?.page?.inputPath;
	if (!inputPath || /^([a-z]+:|\/)/i.test(src)) return null;
	let filePath;
	try {
		filePath = path.resolve(path.dirname(inputPath), decodeURIComponent(src));
	} catch {
		return null;
	}
	const dimensions = videoDimensions(filePath);
	if (!dimensions) return null;
	const { width, height } = dimensions;
	return `--natural-w: ${width}px; --ratio: ${+(width / height).toFixed(4)};`;
}

export default function videoMedia(mdLib) {
	const defaultImageRenderer = mdLib.renderer.rules.image;
	mdLib.renderer.rules.image = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		const src = token.attrGet('src') || '';
		if (/\.(mov|mp4|webm|m4v)$/i.test(src)) {
			const classAttr = token.attrGet('class');
			const style = sizeStyle(src, env);
			const attrs = [
				`src="${mdLib.utils.escapeHtml(src)}"`,
				classAttr && `class="${mdLib.utils.escapeHtml(classAttr)}"`,
				style && `style="${style}"`,
				'autoplay', 'playsinline', 'muted', 'loop',
			].filter(Boolean).join(' ');
			return `<video ${attrs}></video>`;
		}
		return defaultImageRenderer(tokens, idx, options, env, slf);
	};
	return mdLib;
}
