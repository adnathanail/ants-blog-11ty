---
eleventyExcludeFromCollections: true
---
Quantikz/TikZit circuits generated with [qzfr](https://github.com/adnathanail/qzfr)

```sh
cd src/content/blog/2026-08-21-motivating-zx/img
export DOCKER_DEFAULT_PLATFORM=linux/amd64  # Only needed for M-series Macs

docker run --rm -v .:/work/data adnathanail/qzfr 05-01-shors.tex
```