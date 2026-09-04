// Dedicated short-link domain that shortUrl redirects (see src/content/redirects.njk)
// are scoped to. Unset (e.g. local/dev builds) means no _redirects entries are generated.
export default process.env.SHORT_URL || null;
