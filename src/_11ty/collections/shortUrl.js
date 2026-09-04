export default function(eleventyConfig) {
	// Fails the build if two posts declare the same shortUrl (see src/content/redirects.njk)
	eleventyConfig.addCollection("shortUrlCheck", (collectionApi) => {
		const seenBy = new Map();
		for (const post of collectionApi.getFilteredByTag("posts")) {
			const shortUrl = post.data.shortUrl;
			if (!shortUrl) continue;
			const previousInputPath = seenBy.get(shortUrl);
			if (previousInputPath) {
				throw new Error(`Duplicate shortUrl "${shortUrl}" in ${post.inputPath} and ${previousInputPath}`);
			}
			seenBy.set(shortUrl, post.inputPath);
		}
		return [];
	});
};
