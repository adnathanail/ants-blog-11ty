import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const AUTHORS_DIR = "./src/content/authors";
const AVATAR_URL_PREFIX = "/img/authors";

const authorSchema = z.object({
	name: z.string().min(1),
	avatar: z.string().min(1),
}).strict();

export default function() {
	const files = fs.readdirSync(AUTHORS_DIR).filter(f => f.endsWith(".md"));
	const authors = {};

	for (const file of files) {
		const slug = path.basename(file, ".md");
		const { data } = matter.read(path.join(AUTHORS_DIR, file));

		const result = authorSchema.safeParse(data);
		if (!result.success) {
			throw new Error(`Invalid author front matter in ${file}: ${z.prettifyError(result.error)}`);
		}

		// Check avatar exists
		const avatarPath = path.join(AUTHORS_DIR, result.data.avatar);
		if (!fs.existsSync(avatarPath)) {
			throw new Error(`Author "${slug}" avatar not found: ${avatarPath} (referenced from ${file})`);
		}
		const avatar = `${AVATAR_URL_PREFIX}/${path.basename(result.data.avatar)}`;

		authors[slug] = {
			slug,
			name: result.data.name,
			avatar,
		};
	}

	return authors;
}
