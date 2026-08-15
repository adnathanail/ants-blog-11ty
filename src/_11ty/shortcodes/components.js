import fs from "node:fs";
import nunjucks from "nunjucks";

// Relation symbols a ZX rewrite step can be justified by. Keyed by what an author
// types in the shortcode, so the awkward-to-type characters have a word spelling too.
const ZX_RELATIONS = {
	"eq": "=",
	"propto": "∝",
};

// markdown-it ends an HTML block at the first blank line, so component markup must not
// contain one — otherwise the parser reopens partway through and renders the remainder
// (inlined CSS included) as markdown.
function collapseBlankLines(html) {
	return html.replace(/\n\s*\n/g, "\n").trim();
}

function escapeHtml(str) {
	return str.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// Renders the relation between two ZX-diagrams, with the rule abbreviation stacked on
// top — bold italic in parens, matching how the standard rule-set figure labels them.
// The label is a separate element that CSS lifts out of the flow, so it adds no height
// and the symbol stays on the midline of the diagram it sits next to.
function zxRelation(rel, rule) {
	const symbol = ZX_RELATIONS[rel];
	if (!symbol) {
		throw new Error(
			`zxDiagram: unknown relation "${rel}". Expected one of: ${Object.keys(ZX_RELATIONS).join(", ")}`
		);
	}
	const label = rule
		? `<span class="zx-rel-rule">(<b>${escapeHtml(rule)}</b>)</span>`
		: "";
	return `${label}<span class="zx-rel-symbol">${symbol}</span>`;
}

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

	// Read rather than {% include %}d, so the stylesheet is never parsed as a nunjucks
	// template. Re-read per render so edits are picked up by the dev server's rebuild.
	const zxCss = () => fs.readFileSync("src/assets/scss/zx.css", "utf8");

	// `rel`/`rule` render a rewrite step's justification to the LEFT of the diagram,
	// e.g. {% zxDiagram "eq", "sp" %}. Keeping it inside the diagram's own wrapper means
	// a step never gets orphaned from its operator when the group wraps onto a new line.
	let zxIdCounter = 0;
	eleventyConfig.addPairedShortcode("zxDiagram", (content, rel, rule) => {
		JSON.parse(content);
		return collapseBlankLines(componentEnv.render("zx-diagram.njk", {
			id: `zx-${++zxIdCounter}`,
			diagram: content,
			relation: rel ? zxRelation(rel, rule) : null,
			css: zxCss(),
		}));
	});

	// Lays a run of {% zxDiagram %} blocks out as a centred, wrapping row instead
	// of one full-width block each.
	eleventyConfig.addPairedShortcode("zxGroup", (content) =>
		`<div class="zx-group">${collapseBlankLines(content)}</div>`
	);
};
