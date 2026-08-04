import nunjucks from "nunjucks";

export default function(eleventyConfig) {
	// Component shortcodes: each component is a .njk file in src/_includes/partials/
	const componentEnv = new nunjucks.Environment(
		new nunjucks.FileSystemLoader("src/_includes/partials")
	);
	eleventyConfig.addShortcode("gistEmbed", (src) =>
		componentEnv.render("gist-embed.njk", { src })
	);
	eleventyConfig.addShortcode("necklaceSimulator", () =>
		componentEnv.render("necklace-simulator.njk")
	);
	eleventyConfig.addShortcode("youtube", (id) =>
		componentEnv.render("youtube.njk", { id })
	);
};
