import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const AUTHORS_DIR = "./content/authors";
const AVATAR_URL_PREFIX = "/img/authors";

export default function() {
	const files = fs.readdirSync(AUTHORS_DIR).filter(f => f.endsWith(".md"));
	const authors = {};

	for (const file of files) {
		const slug = path.basename(file, ".md");
		const { data } = matter.read(path.join(AUTHORS_DIR, file));

		let avatar = null;
		if (data.avatar) {
			// Author frontmatter stores avatar as a Tina-style relative path
			// (e.g. "./alex_avatar.png"); rewrite to the passthrough-copied URL.
			avatar = `${AVATAR_URL_PREFIX}/${path.basename(data.avatar)}`;
		}

		authors[slug] = {
			slug,
			name: data.name,
			avatar,
		};
	}

	return authors;
}
