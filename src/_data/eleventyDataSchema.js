import matter from "gray-matter";
import { z } from "zod";

import tagStyles from "./tagStyles.js";

const baseSchema = z.object({
	// Note that drafts may be skipped in a preprocessor (see eleventy.config.js)
	// when doing a standard build (not --serve or --watch)
	draft: z.coerce.boolean().default(false),
});

// Every tag must be defined in _data/tagStyles.js, which supplies its colour,
// icon and display capitalization. Checked on the union rather than each string,
// so the message survives (union errors collapse to a bare "Invalid input").
const knownTags = Object.keys(tagStyles());
const tagsSchema = z.union([z.string().min(1), z.array(z.string().min(1))])
	.superRefine((tags, ctx) => {
		const unknown = [].concat(tags).filter(tag => !knownTags.includes(tag));
		if (unknown.length) {
			ctx.addIssue({
				code: "custom",
				message: `Unknown tag${unknown.length > 1 ? "s" : ""} ${unknown.map(tag => `"${tag}"`).join(", ")}. `
					+ `Known tags: ${knownTags.join(", ")} (define new ones in _data/tagStyles.js)`,
			});
		}
	});

// Strict schema validated against the raw post frontmatter (not the merged
// cascade, which is stuffed with page/collections/layout/etc from Eleventy).
const postFrontMatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	author: z.string().min(1),
	// YAML unquoted dates parse to Date; quoted parse to string. 11ty accepts both.
	date: z.union([z.string().min(1), z.date()]),
	heroImg: z.string().min(1),
	updatedDate: z.union([z.string().min(1), z.date()]).optional(),
	recommendNoRSS: z.boolean().optional(),
	draft: z.boolean().optional(),
	tags: tagsSchema.optional(),
	// Redirects from /<shortUrl> to the post, generated into _redirects (see src/content/_redirects.njk)
	shortUrl: z.string().regex(/^[a-z0-9-]+$/, "shortUrl must be lowercase letters, numbers and hyphens only").optional(),
}).strict();

export default function() {
	return function(data) {
		// Check 'draft' key is Boolean on all objects
		const baseResult = baseSchema.safeParse(data);
		if (!baseResult.success) {
			const where = data.page?.inputPath ? ` in ${data.page.inputPath}` : "";
			throw new Error(`Invalid front matter${where}: ${z.prettifyError(baseResult.error)}`);
		}

		// Check post schema strictly
		const isPost = Array.isArray(data.tags) && data.tags.includes("posts");
		if (!isPost) return;
		const { data: frontMatter } = matter.read(data.page.inputPath);
		const result = postFrontMatterSchema.safeParse(frontMatter);
		if (!result.success) {
			throw new Error(`Invalid front matter in ${data.page.inputPath}: ${z.prettifyError(result.error)}`);
		}
		// Check author exists
		if (!(result.data.author in (data.authors ?? {}))) {
			const known = Object.keys(data.authors ?? {}).join(", ");
			throw new Error(`Unknown author "${result.data.author}" in ${data.page.inputPath}. Known authors: ${known}`);
		}
	};
}
