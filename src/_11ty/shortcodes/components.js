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

	// Lays a run of {% zxDiagram %} blocks out as a centred, wrapping row instead
	// of one full-width block each. Blank lines are collapsed so markdown-it keeps
	// the whole group as a single HTML block rather than reopening the parser
	// partway through.
	eleventyConfig.addPairedShortcode("zxGroup", (content) =>
		`<div class="zx-group">${content.replace(/\n\s*\n/g, "\n").trim()}</div>`
	);
};
