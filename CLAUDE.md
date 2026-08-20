# CLAUDE.md

Project-specific conventions for this blog. See also `docs/` for topic notes.

## Committing

Sometimes this repository is managed with GitButler.
Check whether you are on the `gitbutler/workspace` branch; if so, use the `but` CLI to interact with it.
Make changes in new commits, as opposed to modifying existing commits, unless explicitly told to.

**Do not add attributions to yourself in commit messages**

## Building

Use the development build command which includes the `.env.dev` variables with

```bash
npm run build-dev
```

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

## Post styles

`src/_includes/layouts/post.njk` inlines the post stylesheets with `{% include %}` (`post.css`,
`prism-diff.css`, `prism-typst.css`). Nunjucks therefore **parses those files as templates**,
comments included. Never write nunjucks tag or interpolation syntax in them, not even inside a
`/* */` — naming a paired shortcode in a comment makes nunjucks hunt for its closing tag and fail
every post with "unexpected end of file".

## Component assets

A component that needs its own CSS or JS **declares it inline, in its own partial** — do not add
it to `post.css` or the base layout, which would ship it on every page. `eleventy.config.js`
registers `css` and `js` bundles with `bundleHtmlContentFromSelector`, so Eleventy plucks every
`<style>` and every `<script>` **that has inline content** out of the rendered page and into that
page's bundle, emitted once by `{% getBundle "css" %}` / `{% getBundleFileUrl "js" %}` in
`base.njk`. Buckets are a `Set` keyed per page, so **identical content is de-duplicated**: a
partial used ten times contributes its assets once, and a page that never uses it gets nothing.
This is the same idea as a Django widget's `Media` class.

```njk
{# in the partial #}
<style>{{ css | safe }}</style>
<script type="module">import "/js/some-lib.bundle.js";</script>
```

- **An external `<script src="...">` is left alone** — the plucker only takes elements with inline
  content, so N copies of the component means N tags in the HTML. To load a library once, put a
  bare `import` in an inline module script instead, as above.
- **Opt a tag out with `eleventy:ignore`** when it must stay where it is — e.g. per-instance init
  code that references the element next to it.
- **Keep component CSS in its own file** under `src/assets/scss/` and read it in the shortcode
  with `fs.readFileSync`, passing it to the template as a variable. Do not `{% include %}` it:
  the partials render through a plain nunjucks environment whose loader is rooted at
  `src/_includes/partials`, and an include would also parse the CSS as a template.
- **Strip blank lines from a shortcode's output** (`collapseBlankLines` in
  `src/_11ty/shortcodes/components.js`). Inlined CSS usually contains them, and markdown-it ends
  an HTML block at the first blank line, which would render the rest of the component as markdown.

`deferred_images.njk`, `gist-embed.njk`, and `zx-diagram.njk` all follow this.

## Post fragments

A chunk of markup that belongs to one post — a long diagram derivation, a bulky table — can live
in its own file beside `index.md` and be pulled in with `{% include "./_name.njk" %}`. Posts are
preprocessed by nunjucks, so shortcodes inside the fragment run exactly as if they were inline.

**Name the fragment with a leading underscore.** `eleventyConfig.ignores.add("**/_*.njk")` keeps
those files from building pages of their own, and an `addWatchTarget` puts them back in the
watcher, since `ignores` also drops them from it.

A fragment cannot opt out per-file with `permalink: false` instead: anything under `blog/`
inherits `tags: posts`, which subjects it to the strict schema in
`src/_data/eleventyDataSchema.js` — that schema is `.strict()` and knows nothing about Eleventy's
own front matter keys, so any front matter at all fails the build. Fragments therefore carry no
front matter, which is right anyway — nunjucks `include` reads the raw file, so a `---` block
would land verbatim in the post.

## ZX-diagrams

`{% zxDiagram %}` renders a [`zxcc`](https://github.com/adnathanail/zxcc) `<zx-diagram>` from a
JSON body; both shortcodes are registered in `src/_11ty/shortcodes/components.js`, the markup
lives in `src/_includes/partials/zx-diagram.njk`, and the styling in `src/assets/scss/zx.css`,
which reaches the page as a component asset (see above) rather than via `post.css`.

### Presentation options

Anything that is presentation rather than graph structure is passed as nunjucks keyword
arguments, after the relation arguments if there are any. The names are zxcc's own, so its
README is the reference for what each one does:

```markdown
{% zxDiagram showLabels=true, scale=40 %}
  { "nodes": [...], "edges": [...] }
{% endzxDiagram %}

{% zxDiagram "eq", "sp", viewMode="both-horizontal" %}
  { "nodes": [...], "edges": [...] }
{% endzxDiagram %}
```

| Option | Type | Effect |
| --- | --- | --- |
| `showLabels` | boolean | Draws node and wire IDs |
| `scale` | number | Pixels per row/qubit; zxcc derives one if omitted |
| `viewMode` | string | `graph` / `hypergraph` / `both-vertical` / `both-horizontal` |

- **An unknown option name or `viewMode` value fails the build**, as does a value of the wrong
  type — the same treatment as an unknown relation. The accepted `viewMode` values are imported
  from zxcc (`VIEW_MODES` from `@adnathanail/zxcc/constants`) rather than restated, so the check
  cannot drift from the component. That subpath exists because zxcc's main entry is a browser
  bundle that touches `window` on import and cannot be loaded from the Eleventy config.
- **Options are per-diagram**, so a `{% zxGroup %}` whose steps should match needs the same
  arguments on each one.

### Rewrite sequences

Wrap a derivation in `{% zxGroup %}`. The diagrams then flow side by side and wrap onto new lines
as needed, centred, instead of taking a full-width block each.

Give every diagram after the first the relation that justifies it, optionally with the rule
abbreviation to stack above it:

```markdown
{% zxGroup %}
  {% zxDiagram %}
    { "nodes": [...], "edges": [...] }
  {% endzxDiagram %}

  {% zxDiagram "eq", "sp" %}
    { "nodes": [...], "edges": [...] }
  {% endzxDiagram %}

  {% zxDiagram "propto", "eu" %}
    { "nodes": [...], "edges": [...] }
  {% endzxDiagram %}
{% endzxGroup %}
```

Indent the diagrams inside the group — `zxGroup` strips the blank lines between them before
handing the block to markdown-it, so the indentation is cosmetic and does not affect parsing.

- **The relation belongs to the diagram on its right**, matching how a broken LaTeX `align` puts
  the operator at the start of the new line. It is rendered inside that diagram's wrapper, so a
  wrap can never orphan an operator at the end of a row.
- **Steps are numbered automatically** (`1.`, `2.`, …) at the top left of each diagram, by a CSS
  counter that resets per group, so prose can refer to "diagram 3". Diagrams outside a group are
  not numbered.
- **Relations are named, not typed as symbols** — `"eq"` renders `=` and `"propto"` renders `∝`.
  They are plain characters in the output, not KaTeX. Add a key to `ZX_RELATIONS` in
  `src/_11ty/shortcodes/components.js` to introduce another; an unknown name fails the build.
- **A long group can live in its own file.** Posts are preprocessed by nunjucks, so a
  `{% zxGroup %}` block can be moved into a fragment beside the post and pulled back in with
  `{% include "./_name.njk" %}`. Include paths resolve relative to the including template, or
  from the project root (`{% include "src/assets/scss/post.css" %}`). Numbering still resets
  per group — the counter is CSS, and the include is expanded before markdown ever sees it.
  See "Post fragments" below for the naming rule.
- **The rule argument is a bare abbreviation** — `"sp"`, not `"(sp)"`. The parens and bold italic
  are applied for you, matching `img/zx-rules.png`. Omit it for a step that is only a deformation.
