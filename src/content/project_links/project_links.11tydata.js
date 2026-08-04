export default {
	// The `_data/projectLinks.js` global reads these files directly; we don't want
	// Eleventy to also render them as (empty) pages.
	permalink: false,
	eleventyExcludeFromCollections: true,
};
