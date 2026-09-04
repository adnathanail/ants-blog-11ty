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
import footnotes from "./src/_11ty/utils/footnotes.js";
import externalLinks from "./src/_11ty/utils/external-links.js";
import videoMedia from "./src/_11ty/utils/video-media.js";
import imagePlaceholders from "./src/_11ty/utils/image-placeholders.js";
import "./src/_11ty/utils/prism-typst.js";

import pluginFilters from "./src/_11ty/filters/filters.js";
import draftCollection from "./src/_11ty/collections/draft.js";
import shortUrlCollection from "./src/_11ty/collections/shortUrl.js";
import dateShortcodes from "./src/_11ty/shortcodes/dates.js";
import componentShortcodes from "./src/_11ty/shortcodes/components.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// Drafts, see also src/_data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (!data.draft) {
			return;
		}
		// Don't build drafts at all in production builds
		if (process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
		if (data.tags?.includes("posts")) {
			// Give draft posts a draft tag (prepended so it renders first in the badge list)
			data.tags = ["draft", ...data.tags];
			// Keep drafts out of every collection their tags would put them in — the
			// blog list, the RSS feed, the home page and the tag pages all read those.
			// `src/content/drafts.njk` lists them instead, from the `draft` collection,
			// which is built from a glob and so is unaffected by this. The array form
			// leaves them in `all`, which that glob and the nav both need.
			data.eleventyExcludeFromCollections = [...data.tags];
		}
	});

	eleventyConfig.addPlugin(draftCollection);
	eleventyConfig.addPlugin(shortUrlCollection);

	// README.md files (e.g. notes alongside post assets) are documentation, not content
	eleventyConfig.ignores.add("**/README.md");
	// Underscore-prefixed templates co-located with a post are fragments it {% include %}s,
	// not pages of their own. They can't opt out per-file with `permalink: false` — anything
	// under blog/ inherits tags: posts and is then held to the strict front matter schema in
	// src/_data/eleventyDataSchema.js, which has no room for Eleventy's own keys.
	eleventyConfig.ignores.add("**/_*.njk");
	// ignores also drops them from the watcher, so add them back for the dev server.
	eleventyConfig.addWatchTarget("src/content/**/_*.njk");

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
			"./node_modules/@adnathanail/zxcc/dist/index.bundle.js": "/js/zxcc.bundle.js",
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
				quietDeps: true,
				// bootstrap.scss uses @import deliberately: Bootstrap 5.3 has no
				// @use-based way to merge into its colour maps. See the comment there.
				silenceDeprecations: ["import"],
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

		// Responsive widths, capped at 1920 so phone photos don't ship at 4000px.
		// Sources narrower than 1920 keep their own width as the largest candidate;
		// minimumThreshold defaults to 1.25, which would drop e.g. a 740px original
		// in favour of the 640 step. The browser picks from these via sizes="auto",
		// which eleventy-img emits because loading="lazy" is set below.
		widths: [640, 1280, 1920],
		minimumThreshold: 1,

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

		// Reduce AVIF compression strength to speed up builds
		sharpAvifOptions: { effort: 1 },

		// Collect images together so Netlify can cache them
		outputDir: path.join(eleventyConfig.directories.output, "img/optimized/"),
		urlPath: "/img/optimized/",
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

	// Wraps <picture> elements in blog posts with placeholder-glow markup.
	eleventyConfig.addPlugin(imagePlaceholders);

	// markdown-it plugins
	eleventyConfig.amendLibrary("md", admonitions);
	eleventyConfig.amendLibrary("md", footnotes);
	eleventyConfig.amendLibrary("md", videoMedia);
	eleventyConfig.amendLibrary("md", externalLinks);
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
