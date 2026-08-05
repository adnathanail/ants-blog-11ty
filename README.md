# A.N.T.S. Blog 11ty

Website for Alex Nathanail Technology Services, based on [this 11ty template](https://github.com/11ty/eleventy-base-blog), directory structure inspired by [this blog post](https://www.webstoemp.com/blog/eleventy-projects-structure/)

## Dev setup

Install npm dependencies
```bash
npm install
```

Start dev server
```bash
npx @11ty/eleventy --serve
```

## Production builds

```bash
npx @11ty/eleventy
```

## Testing
### Playwright visual regression testing

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