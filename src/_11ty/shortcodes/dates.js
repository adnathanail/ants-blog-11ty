export default function(eleventyConfig) {
	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});
	eleventyConfig.addShortcode("currentYear", () => {
		return (new Date()).getFullYear();
	});
};
