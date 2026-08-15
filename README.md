# A.N.T.S. Blog 11ty

Website for Alex Nathanail Technology Services, based on [this 11ty template](https://github.com/11ty/eleventy-base-blog), directory structure inspired by [this blog post](https://www.webstoemp.com/blog/eleventy-projects-structure/)

## Dev setup

Install npm dependencies
```bash
npm install
```

Start dev server
```bash
npm run start
```

Build locally (uses `.env.dev`)
```bash
npm run build-dev
```

## Production builds

```bash
npm run build
```

## Testing
### Playwright visual regression testing

Fetch the Playwright baseline screenshots (stored in Git LFS). Only needed once after cloning — requires [git-lfs](https://git-lfs.com/) to be installed.
```bash
git lfs pull
```

Test against current baseline and fail on diff
```bash
npm run test:visual
```

Open HTML report for previous run, with side by side diff
```bash
npm run test:visual:report
```

Accept current output as new baseline
```bash
npm run test:visual:update
```

## Licensing

The software in this repo is licensed under the MIT License as listed in [LICENSE](./LICENSE).

The content, including but not limited to all blog posts, is licensed under the the [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
