// Posts sorted by their most recent activity — `updatedDate` if it's later
// than `date`, otherwise `date` itself — so a post edited recently can
// resurface (e.g. on the homepage) even if its original `date` is old.
const activityDate = (post) => {
	const updated = post.data.updatedDate ? new Date(post.data.updatedDate) : null;
	return updated && updated > post.date ? updated : post.date;
};

export default function(eleventyConfig) {
	eleventyConfig.addCollection("postsByActivity", (collectionApi) =>
		collectionApi.getFilteredByTag("posts").sort((a, b) => activityDate(b) - activityDate(a))
	);
};
