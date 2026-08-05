// Wrap <picture> elements in blog post HTML output with the placeholder-glow
// markup used elsewhere (see src/_includes/partials/deferred_images.njk). Only
// <picture> is targeted so chrome images (navbar logo, author avatar) are left
// alone — eleventy-img emits <picture> for content images from markdown.
//
// Any classes on the inner <img> (typically added via markdown-it-attrs) are
// hoisted onto the wrapper span so width/layout rules resolve against the <p>
// rather than the auto-sized wrapper.
export default function imagePlaceholders(eleventyConfig) {
	eleventyConfig.addTransform("image-placeholders", function (content) {
		if (!this.page?.outputPath?.endsWith?.(".html")) return content;
		if (!this.page?.inputPath?.includes?.("/blog/")) return content;

		return content.replace(/<picture\b[\s\S]*?<\/picture>/g, (pictureHtml) => {
			const imgMatch = pictureHtml.match(/<img\b([^>]*)>/);
			if (!imgMatch) return pictureHtml;

			const imgAttrs = imgMatch[1];
			const classMatch = imgAttrs.match(/\sclass\s*=\s*"([^"]*)"/);
			const hoisted = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];

			const newImgAttrs = classMatch
				? imgAttrs.replace(/\sclass\s*=\s*"[^"]*"/, ' class="deferred-img"')
				: `${imgAttrs} class="deferred-img"`;
			const newPictureHtml = pictureHtml.replace(imgMatch[0], `<img${newImgAttrs}>`);

			const wrapperClasses = [
				"d-inline-block", "position-relative", "placeholder-glow", "deferred-img-batch",
				...hoisted,
			].join(" ");

			return (
				`<span class="${wrapperClasses}">` +
					`<span class="placeholder position-absolute top-0 start-0 w-100 h-100 deferred-img-placeholder" style="visibility: hidden" aria-hidden="true"></span>` +
					newPictureHtml +
				`</span>`
			);
		});
	});
}
