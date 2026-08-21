---
eleventyExcludeFromCollections: true
---
Quantikz/TikZit circuits generated with [qzfr](https://github.com/adnathanail/qzfr)

```sh
cd src/content/blog/draft-2026-08-14-hypergraphs-zx-calc/img
export DOCKER_DEFAULT_PLATFORM=linux/amd64  # Only needed for M-series Macs

docker run --rm -v .:/work/data adnathanail/qzfr 05-01-shors.tex
```