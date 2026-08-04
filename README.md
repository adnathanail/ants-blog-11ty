# A.N.T.S. Blog 11ty

Personal blog of Alex Nathanail, based on [this 11ty template](https://github.com/11ty/eleventy-base-blog)

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