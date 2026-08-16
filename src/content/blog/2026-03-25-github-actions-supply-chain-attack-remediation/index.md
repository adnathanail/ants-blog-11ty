---
title: "GitHub action hash pinning"
description: Quick remediation guide for the Trivy attack
author: alex
heroImg: ./dependency.png
date: 2026-03-25
tags: ['tooling', 'github']
---

A [recent supply chain attack](https://socket.dev/blog/trivy-under-attack-again-github-actions-compromise) rocked the open-source community.

## Background

[GitHub actions](https://github.com/features/actions) allows easily using other peoples "actions" as steps in a workflow, so people don't have to constantly reinvent the wheel.

Version pinning is commonly done by specifying a [git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging), to try to approximate the [semver](https://semver.org) concepts used by package managers like pip and npm.
However, due to the nature of tools built on top of tools, this caused an issue.

Versions pushed to a package repository like [PyPI](https://pypi.org) are (now) immutable, and the community trusts that these large central repositories are managed responsiblity.
These repositories are still vulnerable to supply chain attacks (e.g. [leftpad](https://en.wikipedia.org/wiki/Npm_left-pad_incident)), but not to the specific issue occurring here.

Essentially, due to git tags being originally designed as an organisational feature for version control, as opposed to immutable references for dependency resolution, they can be changed.
You can push an update to a git repository which changes the code which is attached to a given tag.

This was then abused by a malicious actor, to update all the historic tags for the affected repo, to now point to code containing malware.

## The solution

Git hash pinning.

All Git commits have ([almost always unique](https://github.blog/news-insights/company-news/sha-1-collision-detection-on-github-com/)) [hashes](https://alembic.com.au/blog/the-identity-of-a-git-commit-explained), which we can use to uniquely identify a specific commit.
Pinning to a specific git hash is actually better than trusting a central repository, because the hash entirely depends on the code contained in the commit, so whatever the hash was when you read the code will always only match that code (up to the law of large numbers).

## My approach

I manage lots of repos across several organisations.
One organisation uses 20+ unique actions across various repos, so updating all these will be a pain.

Also, I have [a bot](https://docs.renovatebot.com) which keeps all my dependencies updated for me.
Pinning to git hashes would mean that it would try to update my dependencies every time there is a commit...

Luckily there is a solution for this, which is to put the tag of the commit in a comment after the commit hash.

So the old tagged method looks like this:
```yaml
- uses: actions/checkout@v6
```

And the new hash method looks like this
```yaml
- uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
```

And Renovate now knows that I am pinning not just to that hash, but to `v6.0.1`, and when `v6.0.2` comes out, it will open a pull request for me which updates both the hash and the version comment!

Even better, Renovate has a [config option](https://docs.renovatebot.com/configuration-options/#pindigests) which will do this process of pinning for me!
I just add this to my `renovate.config` in each repo:

```json
{
  ...
  "pinDigests": true,
}
```

My next consideration is how do we prevent new actions files from not using hashes.
The Renovate config will automatically open a PR to fix this, but I want to prevent the bad config ever being pushed.

Enter [zizmor](https://docs.zizmor.sh): a GitHub actions linter which finds security problems.
Their [`unpinned-uses`](https://docs.zizmor.sh/audits/#unpinned-uses) rule checks for this, and they provide a [prek](https://prek.j178.dev) [repo](https://github.com/zizmorcore/zizmor-pre-commit), which automatically runs zizmor every time I commit.

And I also have prek running in my CI, to catch any developer error.

## Summary

This attack could have been devastating if it had entered our supply chain.
It would also have been quite a pain to remediate, if there wasn't adequate tooling around.

But luckily Renovate makes it very easy to switch to the more secure approach, and zizmor will keep us safe moving forward!