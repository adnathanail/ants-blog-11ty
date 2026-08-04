import { z } from "zod";

const baseSchema = z.object({
	// Note that drafts may be skipped in a preprocessor (see eleventy.config.js)
	// when doing a standard build (not --serve or --watch)
	draft: z.coerce.boolean().default(false),
});

const postSchema = baseSchema.extend({
	title: z.string().min(1),
	description: z.string().min(1),
	author: z.string().min(1),
	// YAML unquoted dates parse to Date; quoted parse to string. 11ty accepts both.
	date: z.union([z.string().min(1), z.date()]),
	heroImg: z.string().min(1),
	updatedDate: z.union([z.string().min(1), z.date()]).optional(),
	recommendNoRSS: z.boolean().default(false),
});

export default function() {
	return function(data) {
		const isPost = Array.isArray(data.tags) && data.tags.includes("posts");
		const schema = isPost ? postSchema : baseSchema;
		const result = schema.safeParse(data);

		if (!result.success) {
			const where = data.page?.inputPath ? ` in ${data.page.inputPath}` : "";
			throw new Error(`Invalid front matter${where}: ${z.prettifyError(result.error)}`);
		}

		// Check specified author exists
		if (isPost && !(result.data.author in (data.authors ?? {}))) {
			const where = data.page?.inputPath ? ` in ${data.page.inputPath}` : "";
			const known = Object.keys(data.authors ?? {}).join(", ");
			throw new Error(`Unknown author "${result.data.author}"${where}. Known authors: ${known}`);
		}
	};
}
