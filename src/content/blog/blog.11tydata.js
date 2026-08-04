export default {
	tags: [
		"posts"
	],
	"layout": "layouts/post.njk",
	eleventyComputed: {
		// Resolve the `author` slug from frontmatter into the full author object
		// from _data/authors.js, so templates can use `post.data.author.name` etc.
		author: (data) => data.authors?.[data.author],
	},
};
