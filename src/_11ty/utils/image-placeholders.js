// Wrap <picture> elements in blog post HTML output with the placeholder-glow
// markup used elsewhere (see src/_includes/partials/deferred_images.njk). Only
// <picture> is targeted so chrome images (navbar logo, author avatar) are left
// alone — eleventy-img emits <picture> for content images from markdown.
export default function imagePlaceholders(eleventyConfig) {
	eleventyConfig.addTransform("image-placeholders", function (content) {
		if (!this.page?.outputPath?.endsWith?.(".html")) return content;
		if (!this.page?.inputPath?.includes?.("/blog/")) return content;

		return content.replace(/<picture\b[\s\S]*?<\/picture>/g, (pictureHtml) => {
			const withDeferredClass = pictureHtml.replace(/<img\b([^>]*)>/, (imgTag, attrs) => {
				if (/\sclass\s*=\s*"/.test(attrs)) {
					return `<img${attrs.replace(/(\sclass\s*=\s*")([^"]*)(")/, '$1$2 deferred-img$3')}>`;
				}
				return `<img class="deferred-img"${attrs}>`;
			});

			return (
				`<span class="d-inline-block position-relative placeholder-glow deferred-img-batch">` +
					`<span class="placeholder position-absolute top-0 start-0 w-100 h-100 deferred-img-placeholder" style="visibility: hidden" aria-hidden="true"></span>` +
					withDeferredClass +
				`</span>`
			);
		});
	});
}
