import nunjucks from "nunjucks";

export default function(eleventyConfig) {
	// Component shortcodes: each component is a .njk file in src/_includes/partials/
	const componentEnv = new nunjucks.Environment(
		new nunjucks.FileSystemLoader("src/_includes/partials")
	);
	eleventyConfig.addShortcode("gistEmbed", (embedCode, directLink) =>
		componentEnv.render("gist-embed.njk", { embedCode, directLink })
	);
	eleventyConfig.addShortcode("necklaceSimulator", () =>
		componentEnv.render("necklace-simulator.njk")
	);
	eleventyConfig.addShortcode("youtube", (id) =>
		componentEnv.render("youtube.njk", { id })
	);

	let zxIdCounter = 0;
	eleventyConfig.addPairedShortcode("zxDiagram", (content) => {
		JSON.parse(content);
		return componentEnv.render("zx-diagram.njk", {
			id: `zx-${++zxIdCounter}`,
			diagram: content,
		});
	});
};
