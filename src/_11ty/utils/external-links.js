// Open external links in a new tab. Anything with a scheme (or protocol-relative)
// is treated as external; relative links, fragments and footnote refs are left
// alone so in-site navigation stays in the same tab.
export default function externalLinks(mdLib) {
	const defaultLinkRenderer = mdLib.renderer.rules.link_open
		|| ((tokens, idx, options, env, slf) => slf.renderToken(tokens, idx, options, env));

	mdLib.renderer.rules.link_open = (tokens, idx, options, env, slf) => {
		const token = tokens[idx];
		const href = token.attrGet('href') || '';
		if (/^(https?:)?\/\//i.test(href)) {
			token.attrSet('target', '_blank');
			// noopener stops the new tab reaching back through window.opener;
			// don't clobber a rel set by hand via markdown-it-attrs.
			if (!token.attrGet('rel')) {
				token.attrSet('rel', 'noopener noreferrer');
			}
		}
		return defaultLinkRenderer(tokens, idx, options, env, slf);
	};
	return mdLib;
}
