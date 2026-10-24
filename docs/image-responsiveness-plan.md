# Plan: responsive post images

Goal: an image dropped into a post with plain `![](./file.png)` should be centred, never overflow
the column, and never take up an unreasonable share of the screen, with no per-image classes.
Multi-image rows and full-screen viewing are opt-in on top of that.

## Current state and problems

Sizing is spread across three places:

- `src/assets/scss/bootstrap.scss` — `.post-content img, video { width: auto; max-height: 40/50/60vh }`
  by breakpoint.
- `src/assets/scss/post.css` — centring, the grey padded background on `p:has(img)`,
  `overflow-x: auto`, and the `.img-w-20` … `.img-w-100` / `.no-center` classes, which rely on
  `font-size: 0` on the parent and `calc(N% - rem)` widths to fit several images on one line.
- `src/assets/scss/index.css` — `.mh-30vh`.

Problems:

1. **`sizes="auto"`** (eleventy-img emits it because `loading="lazy"` is set, introduced in
   `899c848`). Browsers apply `contain: size; contain-intrinsic-size: 300px 150px` to
   `img[sizes=auto]`, so the image's natural size is ignored. Combined with `width: auto`, which
   also overrides the `width` attribute, the rendered width falls back to the placeholder size.
   `sizes="auto"` only behaves when CSS gives the image a definite width. Most likely cause of
   the vh rules appearing to stop working — confirm in devtools first (step 0).
2. **No `max-width: 100%`.** Wide images overflow their paragraph; `overflow-x: auto` hides this
   behind a scrollbar.
3. **The placeholder wrapper** in `src/_11ty/utils/image-placeholders.js` is a
   `d-inline-block` span, which shrink-wraps its content, so a percentage width on the inner
   `<img>` has nothing to resolve against. This is why classes are hoisted onto the wrapper, why
   images with classes currently skip the wrapper entirely (the `TEMP` branches), and why the
   width classes need the `font-size: 0` trick.

Usages of the custom classes: 13 files under `src/` (`grep -rlE "\{\.img-w|\{\.no-center|mh-30vh" src`).

## Step 0 — confirm the diagnosis

On a built post (`npm run build-dev`), e.g. `2024-12-26-advent-of-code-2024` and
`2025-11-11-moving-to-typst`, inspect an `<img>` in devtools:

- check whether `contain: size` is applied from the UA stylesheet;
- toggle `sizes` to an explicit value and see whether the vh cap starts working.

## Step 1 — a single base rule

Replace the rule in `bootstrap.scss` with:

```scss
.post-content img, .post-content video {
	display: block;
	margin-inline: auto;
	max-width: 100%;
	width: auto;
	height: auto; // required: with a height attribute present, max-width alone distorts the image
	max-height: var(--max-h, 40vh);

	@include media-breakpoint-up(md) { max-height: var(--max-h, 50vh); }
	@include media-breakpoint-up(xl) { max-height: var(--max-h, 60vh); }
}
```

With both `max-width` and `max-height` and `height: auto`, replaced elements keep their aspect
ratio, so no `object-fit` is needed.

Remove `overflow-x: auto` from `p:has(img)` in `post.css`; nothing should overflow any more.

## Step 2 — explicit `sizes`

Replace `sizes="auto"` with a value derived from the post column width, set via
`htmlOptions.imgAttributes.sizes` in the `eleventyImageTransformPlugin` options in
`eleventy.config.js`, e.g.

```js
sizes: "(min-width: 1200px) 800px, (min-width: 992px) 720px, 100vw",
```

Measure the actual column width at each Bootstrap breakpoint before settling the numbers. Check
that eleventy-img uses a configured `sizes` instead of emitting `auto` when `loading="lazy"`.
Images inside a gallery (step 4) are narrower, so the gallery transform can override `sizes` on
its children.

## Step 3 — remove the placeholder wrapper span

eleventy-img writes `width` and `height` attributes, so with `height: auto` the browser already
reserves the correct box before the image loads. The wrapper span is then only providing the
shimmer, which can move onto the media element itself:

- Rework `image-placeholders.js` to add a class (e.g. `deferred-img`) to the `<img>`/`<video>`
  rather than wrapping it.
- Restyle `.deferred-img` in `src/_includes/partials/deferred_images.njk` so the placeholder is
  a background/animation on the element, cleared when the reveal script runs.
- Update the reveal script, which currently looks up `.placeholder-glow` /
  `.deferred-img-placeholder` ancestors and `.deferred-img-batch` groups. Batch grouping can key
  off the gallery container (step 4) or the parent paragraph instead.
- Delete the `TEMP` skip branches and `hoistClasses`.

## Step 4 — `{% gallery %}` for side-by-side images

A paired shortcode, following the `zxGroup` pattern in `src/_11ty/shortcodes/components.js`
(strip blank lines from the body; markup in a partial under `src/_includes/partials/`; CSS in its
own file under `src/assets/scss/`, inlined as a component asset — see "Component assets" in
`CLAUDE.md`).

```markdown
{% gallery %}
![](./first_latex_1.png)
![](./first_latex_2.png)
![](./first_latex_3.png)
{% endgallery %}
```

Layout: a flex row with a gap, where each item gets `flex: <width / height> 1 0`. Every image in
the row then renders at exactly the same height and the row fills the column, whatever the mix of
aspect ratios. The ratios come from the `width`/`height` attributes eleventy-img writes, so this
needs a small transform that runs after the image transform and sets the `flex` value as an
inline style on each gallery item. Inside a gallery the base `max-height` should be lifted (or
applied to the row instead), otherwise a tall image caps the row height and the row stops
filling the width.

Below the `md` breakpoint, allow wrapping, or stack images, so a row of three does not become
three thumbnails on a phone. Possibly a `cols=` argument to choose the wrap point per gallery.

## Step 5 — one per-image override

Instead of the width classes, use the `--max-h` custom property from step 1 for the rare image
that needs a different cap:

```markdown
![](./diagram.png){style="--max-h: 25vh"}
```

If a named class reads better in posts, add at most two (e.g. `.small`, `.full`) that only set
`--max-h`.

## Step 6 — migrate posts and delete old CSS

- Convert multi-image paragraphs to `{% gallery %}`; drop single-image width classes and check
  each image looks right without them.
- Delete `.img-w-*`, `.no-center`, the `font-size: 0` rules and the margin rules from
  `post.css`; delete `.mh-30vh` from `index.css` if it is no longer used outside posts
  (`grep` templates as well as content).
- Check every touched post at phone, tablet and desktop widths.

## Step 7 — full-screen viewing with PhotoSwipe

[PhotoSwipe v5](https://photoswipe.com/) — MIT, no dependencies, pinch-zoom, swiping between
images in a gallery. Its zoom levels match the desired toggle:

- `initialZoomLevel: "fit"` — the whole image inside the viewport;
- `secondaryZoomLevel: "fill"` (or `"vFill"`) — one dimension fills the viewport and the other
  pans. Click/tap switches between them.

Integration:

- A transform wraps each post `<picture>` in
  `<a href="<largest source>" data-pswp-width="…" data-pswp-height="…">`, taking the values from
  the eleventy-img output.
- Initialise with `PhotoSwipeLightbox` over `.post-content`, with `children: "a[data-pswp-width]"`
  so a gallery's images page between each other.
- Load the library once per page using the inline-module-import pattern from "Component assets"
  in `CLAUDE.md`, and only on pages that contain images.
- Decide whether every image opens the lightbox, or whether small images opt out.

Alternatives considered: medium-zoom (minimal, no fit/fill toggle), GLightbox (weaker zoom),
Fancybox (v5 is GPL or commercial), a hand-rolled `<dialog>` (feasible, ~50 lines, but no pinch
zoom or swipe).

## Afterwards

Document the image conventions (plain images, `{% gallery %}`, `--max-h`, lightbox behaviour)
in `CLAUDE.md` alongside the footnote and ZX-diagram sections.
