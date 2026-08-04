import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const PROJECT_LINKS_DIR = "./content/project_links";
const THUMBNAIL_URL_PREFIX = "/img/project_links";

const projectLinkSchema = z.object({
	name: z.string().min(1),
	loc: z.number().int().nonnegative(),
	url: z.url(),
	blurbText: z.string().min(1),
	thumbnailImg: z.string().min(1),
}).strict();

export default function() {
	const files = fs.readdirSync(PROJECT_LINKS_DIR).filter(f => f.endsWith(".md"));
	const links = [];

	for (const file of files) {
		const slug = path.basename(file, ".md");
		const { data } = matter.read(path.join(PROJECT_LINKS_DIR, file));

		const result = projectLinkSchema.safeParse(data);
		if (!result.success) {
			throw new Error(`Invalid project link front matter in ${file}: ${z.prettifyError(result.error)}`);
		}

		// Check thumbnail exists
		const thumbnailPath = path.join(PROJECT_LINKS_DIR, result.data.thumbnailImg);
		if (!fs.existsSync(thumbnailPath)) {
			throw new Error(`Project link "${slug}" thumbnail not found: ${thumbnailPath} (referenced from ${file})`);
		}
		const thumbnailImg = `${THUMBNAIL_URL_PREFIX}/${path.basename(result.data.thumbnailImg)}`;

		links.push({
			slug,
			...result.data,
			thumbnailImg,
		});
	}

	links.sort((a, b) => a.loc - b.loc);

	return links;
}
