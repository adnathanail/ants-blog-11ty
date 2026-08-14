# CLAUDE.md

Project-specific conventions for this blog. See also `docs/` for topic notes.

## Footnotes

Footnotes are provided by [`markdown-it-footnote`](https://github.com/markdown-it/markdown-it-footnote),
registered in `src/_11ty/utils/footnotes.js` and wired up in `eleventy.config.js`.
Styling lives under `/* Footnotes */` in `src/assets/scss/post.css`.

### Syntax

Reference-style, which is the form to use for anything more than a few words:

```markdown
The ZX-calculus is a scaled bialgebra.[^coecke-duncan]

[^coecke-duncan]: Bob Coecke and Ross Duncan, "Interacting Quantum Observables," ...
```

Inline, for short asides where a named key would be noise:

```markdown
Both qubits get a CNOT applied^[which side has the dot matters!].
```

### Conventions

- **Use a descriptive key**, not a number — `[^coecke-duncan]`, not `[^1]`. Numbering is
  generated at render time, so keys only need to be unique and readable in the source.
- **No space before the marker**, and place it *after* any punctuation: `a scaled bialgebra.[^key]`,
  not `a scaled bialgebra. [^key]` or `a scaled bialgebra[^key].` A space renders as a visible
  gap before the superscript.
- **Put the definition just below the paragraph that references it.** markdown-it collects all
  definitions and renders them together at the bottom of the post regardless of where they sit
  in the file, so keeping them local makes the source easier to edit.
- **Referencing the same key twice is fine** — the note gets one backref arrow per reference.
- Footnotes may contain markdown, links, KaTeX, and multiple paragraphs (indent continuation
  paragraphs by four spaces).

### Footnotes vs. inline links

Prefer an inline hyperlink for casual web sources — docs pages, Wikipedia, blog posts. That is
the house style and most of the existing posts do it.

Reserve footnotes for:

- discursive asides that would break the flow of a sentence, and
- proper citations of papers and books, formatted as below.

## Citation style

Citations use **Chicago notes–bibliography**, note form. There is no bibliography section on
posts; the footnote *is* the citation.

A source gets one full note:

```markdown
[^coecke-duncan]: Bob Coecke and Ross Duncan, "Interacting Quantum Observables: Categorical Algebra and Diagrammatics," *New Journal of Physics* 13, no. 4 (2011): 043016, <https://doi.org/10.1088/1367-2630/13/4/043016>.
```

To cite that source again, **reuse the same key**. markdown-it renders one note with a backref
arrow per reference, so Chicago's shortened-note form for repeat citations does not apply —
there is no second note to shorten.

The exception is citing **different locations** in one work, which needs a second key. Give the
first note the full citation and any later ones the short form, with the locator last:

```markdown
[^ck-spiders]: Coecke and Kissinger, *Picturing Quantum Processes*, 214.
```

### Rules

- **Cite the version of record.** If a preprint has been published in a journal, cite the journal
  version and link the DOI, even when the arXiv PDF is the copy actually being read.
- **Cite preprints only when unpublished**, and pin the version, since arXiv versions can differ
  substantially:

  ```markdown
  [^key]: Author Name, "Title," preprint, submitted June 25, 2009, arXiv:0906.4725v3, <https://arxiv.org/abs/0906.4725>.
  ```

- **Headline-style capitalisation for titles**, converting from the original if needed. arXiv and
  many journals use sentence case; Chicago does not.
- **Journal titles in italics**, article titles in double quotes.
- **Angle brackets around bare URLs** (`<https://...>`) so markdown autolinks them.
- **Verify metadata before citing** rather than writing it from memory — the arXiv abstract page
  for authors and title, and `https://api.crossref.org/works/<DOI>` to confirm the DOI, journal,
  volume, issue, and year resolve to the right paper.
