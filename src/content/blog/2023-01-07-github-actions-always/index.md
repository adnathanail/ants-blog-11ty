---
title: GitHub Actions always() isn't useful
heroImg: ./44036562_xohc8h.png
description: The `always()` expression on GitHub actions doesn't do what you think it does
author: alex
date: 2023-01-07
---

I use GitHub Actions quite a lot, for both personal and professional projects, and I often have multiple separate checks that I want to happen, such as linting, testing, building, and benchmarking.

One way to do this is to create separate jobs on GitHub Actions, which will all run in parallel, and one failing won't affect the rest. However, I typically have a bit of common setup code for the separate jobs, and I don't really need them to happen in parallel, so I usually just have them as sequencial steps in the same job.

But what if one of these steps fails? What if my first step (e.g. a lint) fails? Then the rest of the steps won't be run. So I fix the lint, and then the build fails, and the whole CI has to run again. Wouldn't it be handy if all the steps would run, even if a previous step failed?

A quick Google search will bring up [this](https://stackoverflow.com/a/58859404/9261263) StackOverflow post, which give the headline to add `if: always()` to your steps, meaning a step will always run even if a previous step fails.

I have been blindly doing this for several months.

Entirely separately (to the point that I didn't put it together until I was cancelling 20 or so jobs in a row) I started noticing that jobs wouldn't cancel properly.

Scrolling down to the bottom of that StackOverflow answer I then found:

> Additionally, as pointed out below, putting always() will cause the function to run even if the build is canceled.

To achieve my desired behaviour (running a step on previous step failure, but still respecting suite cancellation) you should add `if: success() || failure()` to a step.

I think my use-case is quite common, as discussed in [this GitHub community discussion](https://github.com/orgs/community/discussions/26303), so I thought I would make a post to highlight this.

I'm not sure why `always()` is still at the top of that accepted answer (with 256 upvotes) on StackOverflow!

Here is a quick example of a full Rust CI suite in GitHub actions:

{% raw %}
```yaml
name: Lint, build, & test

on: [ push ]

concurrency:
  # Cancel if I push to the same branch
  cancel-in-progress: true
  # Don't cancel on master
  group: ${{ github.ref == 'refs/heads/master' && format('ci-master-{0}', github.sha) || format('ci-{0}', github.ref) }}

env:
  CARGO_TERM_COLOR: always

jobs:
  lint-build-and-test:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Install rust
      run: rustup toolchain install stable --profile minimal
    - name: Cache cargo dependencies
      uses: Swatinem/rust-cache@v2
    - name: Lint
      run: cargo clippy --all-targets --all-features -- -D warnings
    - name: Build
      if: ${{ success() || failure() }}
      run: cargo build
    - name: Test
      if: ${{ success() || failure() }}
      run: cargo test
```
{% endraw %}
