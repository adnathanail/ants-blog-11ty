import fs from "node:fs";
import path from "node:path";
import * as sass from "sass";

import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { rssPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownItAttrs from "markdown-it-attrs";
import admonitions from "./src/_11ty/utils/admonitions.js";
import videoMedia from "./src/_11ty/utils/video-media.js";
import "./src/_11ty/utils/prism-typst.js";

import pluginFilters from "./src/_11ty/filters/filters.js";
import draftCollection from "./src/_11ty/collections/draft.js";
import dateShortcodes from "./src/_11ty/shortcodes/dates.js";
import componentShortcodes from "./src/_11ty/shortcodes/components.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// Drafts, see also src/_data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		// Give draft posts a draft tag (prepended so it renders first in the badge list)
		if (data.draft && data.tags?.includes("posts")) {
			data.tags = ["draft", ...data.tags];
		}
		// Don't list drafts in production builds
		if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	eleventyConfig.addPlugin(draftCollection);

	// Copy asset folders to the output. SCSS is intentionally excluded — .scss
	// files under src/assets/scss/ are either compiled via addTemplate (below)
	// or inlined via {% include %}, never passed through raw.
	eleventyConfig
		.addPassthroughCopy({
			"./src/assets/fonts/": "/fonts/",
			"./src/assets/img/": "/img/",
			"./src/assets/js/": "/js/",
			"./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "/js/bootstrap.bundle.min.js",
			"./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map": "/js/bootstrap.bundle.min.js.map",
			"./node_modules/bootstrap-icons/font/fonts/": "/fonts/bootstrap-icons/",
			"./node_modules/katex/dist/katex.min.css": "/css/katex.min.css",
			"./node_modules/katex/dist/fonts/": "/css/fonts/",
			"./src/content/authors/*.{png,jpg,jpeg,webp,avif,svg,gif}": "/img/authors/",
			"./src/content/project_links/*.{png,jpg,jpeg,webp,avif,svg,gif}": "/img/project_links/",
		})
		.addPassthroughCopy("./src/content/rss/pretty-atom-feed.xsl")
		.addPassthroughCopy("./src/content/**/*.{mov,mp4,webm,m4v}");

	// bootstrap.scss lives outside the input dir, so register it as a virtual
	// template so the SCSS extension compiles it to /css/bootstrap.css.
	// layout: false skips the content/ cascade that wraps everything in the home layout.
	eleventyConfig.addTemplate(
		"css/bootstrap.scss",
		fs.readFileSync("./src/assets/scss/bootstrap.scss", "utf8"),
		{ layout: false },
	);

	// Compile .scss files with Dart Sass (used for our Bootstrap build)
	eleventyConfig.addTemplateFormats("scss");
	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",
		getData: () => ({ eleventyExcludeFromCollections: true }),
		compile: async function(inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			// Skip Sass partials — they only exist to be @imported
			if (parsed.name.startsWith("_")) {
				return;
			}

			let result = sass.compileString(inputContent, {
				loadPaths: [parsed.dir, "node_modules"],
				style: "compressed",
			});

			this.addDependencies(inputPath, result.loadedUrls);

			return async () => result.css;
		},
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch style files
	eleventyConfig.addWatchTarget("src/assets/scss/**/*.{css,scss}");
	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("src/content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Bundle <style> content and adds a {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		// Add all <style> content to `css` bundle (use <style eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "style",
	});

	// Bundle <script> content and adds a {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
		// Add all <script> content to the `js` bundle (use <script eleventy:ignore> to opt-out)
		// Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "script",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	// Registers date filters (dateToRfc3339, getNewestCollectionItemDate) used by src/content/rss/rss.njk
	eleventyConfig.addPlugin(rssPlugin);

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			}
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	// Shortcodes
	eleventyConfig.addPlugin(dateShortcodes);
	eleventyConfig.addPlugin(componentShortcodes);

	// markdown-it plugins
	eleventyConfig.amendLibrary("md", admonitions);
	eleventyConfig.amendLibrary("md", videoMedia);
	eleventyConfig.amendLibrary("md", md => md.use(markdownItAttrs));
	const { katex } = (await import("@mdit/plugin-katex"));
	eleventyConfig.amendLibrary("md", md => md.use(katex, {output: "htmlAndMathml", macros: {
  "\\nicefrac": "\\raisebox{.5ex}{\\footnotesize #1}/\\raisebox{-.25ex}{\\footnotesize #2}"
}}));

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "src/content",      // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
