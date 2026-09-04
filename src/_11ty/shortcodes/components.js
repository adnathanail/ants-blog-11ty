import { VIEW_MODES } from "@adnathanail/zxcc/constants";
import fs from "node:fs";
import nunjucks from "nunjucks";

import shortUrlDomain from "../../_data/shortUrlDomain.js";

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

// Presentation options for a diagram, passed as nunjucks keyword arguments:
// {% zxDiagram "eq", "sp", showLabels=true, scale=40 %}. They mirror zxcc's own
// attributes and properties (see its README), so the names are its names.
//
// showLabels / scale / viewMode become attributes; edgeColors has no attribute form
// in zxcc, so it is assigned as a property by the diagram's init script.
//
// The accepted viewMode values come from zxcc itself, so the list here cannot drift from
// what the component supports. They arrive via its `constants` entry point rather than its
// main one, which is a browser bundle that touches `window` at import time and so cannot
// be loaded from a config file running in Node.
function zxOptions(opts) {
	const { showLabels, scale, viewMode, edgeColors, ...rest } = opts;

	const unknown = Object.keys(rest).filter(k => k !== "__keywords");
	if (unknown.length) {
		throw new Error(
			`zxDiagram: unknown option${unknown.length > 1 ? "s" : ""} ${unknown.join(", ")}. `
			+ "Expected one of: showLabels, scale, viewMode, edgeColors"
		);
	}

	const attrs = [];
	if (showLabels !== undefined) {
		if (typeof showLabels !== "boolean") {
			throw new Error(`zxDiagram: showLabels must be true or false, got ${JSON.stringify(showLabels)}`);
		}
		// A boolean attribute: present means true, so false is simply left off.
		if (showLabels) attrs.push("show-labels");
	}
	if (scale !== undefined) {
		if (typeof scale !== "number" || !Number.isFinite(scale) || scale <= 0) {
			throw new Error(`zxDiagram: scale must be a positive number, got ${JSON.stringify(scale)}`);
		}
		attrs.push(`scale="${scale}"`);
	}
	if (viewMode !== undefined) {
		if (!VIEW_MODES.includes(viewMode)) {
			throw new Error(
				`zxDiagram: unknown viewMode ${JSON.stringify(viewMode)}. `
				+ `Expected one of: ${VIEW_MODES.join(", ")}`
			);
		}
		attrs.push(`view-mode="${viewMode}"`);
	}

	if (edgeColors !== undefined) {
		const bad = typeof edgeColors !== "object" || edgeColors === null || Array.isArray(edgeColors)
			|| Object.values(edgeColors).some(v => typeof v !== "string");
		if (bad) {
			throw new Error(
				"zxDiagram: edgeColors must be an object mapping edge kinds to colour strings, "
				+ `got ${JSON.stringify(edgeColors)}`
			);
		}
	}

	return {
		attrs: attrs.length ? ` ${attrs.join(" ")}` : "",
		// Inlined into a <script>, so a closing tag in a colour string must not end it early.
		edgeColors: edgeColors === undefined ? null : JSON.stringify(edgeColors).replace(/</g, "\\u003c"),
	};
}

export default function(eleventyConfig) {
	// Component shortcodes: each component is a .njk file in src/_includes/partials/
	const componentEnv = new nunjucks.Environment(
		new nunjucks.FileSystemLoader("src/_includes/partials")
	);

	// Component stylesheets are read rather than {% include %}d, so they are never
	// parsed as nunjucks templates. Re-read per render so edits are picked up by the
	// dev server's rebuild.
	const componentCss = (name) => fs.readFileSync(`src/assets/scss/${name}.css`, "utf8");

	eleventyConfig.addShortcode("gistEmbed", (embedCode, directLink) =>
		componentEnv.render("gist-embed.njk", { embedCode, directLink })
	);
	eleventyConfig.addShortcode("necklaceSimulator", () =>
		componentEnv.render("necklace-simulator.njk")
	);
	eleventyConfig.addShortcode("youtube", (id) =>
		componentEnv.render("youtube.njk", { id })
	);
	eleventyConfig.addShortcode("cta", (text, url, icon) =>
		componentEnv.render("cta.njk", { text, url, icon })
	);
	// When the post has a shortUrl and SHORT_URL is configured (see src/content/redirects.njk,
	// which gates on the same two conditions), the button copies that instead of the canonical
	// long URL.
	eleventyConfig.addShortcode("shareButton", (postShortUrl) => {
		const shortLink = postShortUrl && shortUrlDomain ? `${shortUrlDomain}/${postShortUrl}` : null;
		return collapseBlankLines(componentEnv.render("share-button.njk", {
			css: componentCss("share-button"),
			// Embedded into a <script>, so a closing tag inside it must not end it early.
			shortLink: JSON.stringify(shortLink).replace(/</g, "\\u003c"),
		}));
	});

	// `rel`/`rule` render a rewrite step's justification to the LEFT of the diagram,
	// e.g. {% zxDiagram "eq", "sp" %}. Keeping it inside the diagram's own wrapper means
	// a step never gets orphaned from its operator when the group wraps onto a new line.
	//
	// Presentation is set with keyword arguments after those, e.g.
	// {% zxDiagram "eq", "sp", scale=40 %} or {% zxDiagram viewMode="hypergraph" %} —
	// see zxOptions above.
	let zxIdCounter = 0;
	eleventyConfig.addPairedShortcode("zxDiagram", (content, ...args) => {
		// Nunjucks hands keyword arguments over as a trailing object tagged __keywords,
		// which lands in `rel` when a diagram is given options but no relation.
		const last = args[args.length - 1];
		const opts = last && typeof last === "object" && last.__keywords ? args.pop() : {};
		const [rel, rule] = args;

		JSON.parse(content);
		const { attrs, edgeColors } = zxOptions(opts);
		return collapseBlankLines(componentEnv.render("zx-diagram.njk", {
			id: `zx-${++zxIdCounter}`,
			diagram: content,
			relation: rel ? zxRelation(rel, rule) : null,
			attrs,
			edgeColors,
			css: componentCss("zx"),
		}));
	});

	// Lays a run of {% zxDiagram %} blocks out as a centred, wrapping row instead
	// of one full-width block each.
	eleventyConfig.addPairedShortcode("zxGroup", (content) =>
		`<div class="zx-group">${collapseBlankLines(content)}</div>`
	);
};
