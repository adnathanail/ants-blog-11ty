`draft` is a field, conceptually included in the base template, with validation on all objects to ensure that it is a Boolean value.

For posts, custom processing is done in `eleventy.config.js` to make draft posts have a special tag.

The tag is added dynamically to posts in the `eleventyConfig.addPreprocessor("drafts", ...)`, and then a draft collection is created in the `eleventyConfig.addCollection("draft", ...)`, because the dynamic tag is created after the automatically generated collections are formed.