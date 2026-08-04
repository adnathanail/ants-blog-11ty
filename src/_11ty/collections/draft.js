export default function(eleventyConfig) {
	// Create draft collection, because dynamic 'draft' tag is added after auto collection creation
	eleventyConfig.addCollection("draft", (collectionApi) =>
		collectionApi.getFilteredByGlob("./src/content/blog/**/*.md").filter(item => item.data.draft)
	);
};
