import footnotePlugin from 'markdown-it-footnote';

export default function footnotes(mdLib) {
	mdLib.use(footnotePlugin);

	// Give the footnote list a heading instead of the plugin's bare <hr>, so the
	// section reads as part of the post rather than a stray rule at the bottom.
	// data-ha-exclude keeps @zachleat/heading-anchors from linking it.
	mdLib.renderer.rules.footnote_block_open = () =>
		`<section class="footnotes border-top mt-4 pt-3">
			<h2 class="h5 text-body-secondary" data-ha-exclude>Footnotes</h2>
			<ol class="footnotes-list">`;

	mdLib.renderer.rules.footnote_block_close = () => `</ol></section>`;

	// Backrefs as an icon rather than the default ↩︎ glyph
	mdLib.renderer.rules.footnote_anchor = (tokens, idx, options, env, slf) => {
		let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
		if (tokens[idx].meta.subId > 0) {
			id += `:${tokens[idx].meta.subId}`;
		}
		return ` <a href="#fnref${id}" class="footnote-backref" aria-label="Back to content"><i class="bi bi-arrow-return-left"></i></a>`;
	};

	return mdLib;
}
