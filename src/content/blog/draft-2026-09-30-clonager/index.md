---
title: clonager
description: AI does it all for me
author: alex
heroImg: ./01_clonager_demo.png
date: 2026-09-30
draft: true
---

## NixOS

I love storing state in version control, because I [never trust myself](../2026-08-15-github-verified-linear/), and I want to be able to [configure fearlessly](../2024-12-28-code-fearlessly/).
So I love Django's migration system, automated testing, [OpenTofu](https://opentofu.org) (formerly Terraform), and I was very taken with [NixOS](https://nixos.org).

The promise is a beautiful one: your whole device configuration lives in version controlled text files.
User interface, installed software, app configuration, everything.

![The classic demo everyone seems to show of their NixOS config - NixOS for the impatient](./02_nixos_for_the_impatient.jpg)

I gave it a shot for a month or so, but unfortunately I just wasn't ready for Linux yet.
There were some apps and niceties which I couldn’t find a replacement for quick enough to make the change stick.
Also, managing all the config was a little laborious, and documentation wasn’t amazing.

## nix-darwin

Then I discovered [nix-darwin](https://github.com/nix-darwin/nix-darwin), which brings the same concepts to macOS (with not _quite_ as much able to be configured through it), and thought this might be a happy medium.
It was!

Also, the advances in AI now mean that my config is tended to by my laptop's genie.
I know there are all sorts of ways to have an agent directly control a device, but I’m not brave (stupid?) enough for those.
Instead, I talk to an agent with write permissions scoped to a single folder, review its changes in code, and then decide whether to run them on my laptop.
A perfect workflow!

I started by just listing all the software I wanted installing. CLI tools are nicely configurable through Nix, but lots of GUI apps aren't.
Then I started getting Claude to try managing pulling/pushing settings in/out of app's internal `.plist` files.
I built a very tailored workspace manager config with [SketchyBar](https://github.com/felixkratz/sketchybar), [AeroSpace](https://github.com/nikitabobko/AeroSpace), and [ExtraDock](https://extradock.app).
And, before long, I was resigning un-notarised apps with local certificates, storing secrets in-repo with age keys synced from my 1Password vault, and having Python scripts configure applications through their MCP server (because in 2026 they add AI interfaces, before simple text file configs)!

![Part of my (current) interface](./03_sketchybar.png)

## clonager

The last hurdle to tackle, to make moving laptops a breeze, was my files.
Everything is in Google Drive or git.
That sounds like everything is sorted, but my git repos need a bit of help.

I have about 30 on my laptop currently, and they’re all in various states of un-pushedness.
Some have uncommitted changes, some commits are unpushed, some changes are sitting in stashes waiting to be applied.
I needed a tool which knew about all my repos, and showed me where I had data which only existed locally.

It didn’t exist, so I built it.

I gave Claude the idea and it got a working version very quickly.
I spent about 4h playing with the tool and improving it to be exactly how I like it.
It integrates with [GitButler](https://gitbutler.com) and the [GitHub CLI](https://cli.github.com) to surface lots of different kind of data in a single cohesive interface.

It tells me where there is vulnerable data that I need to push somewhere.
It also tells me when there are old branches which are integrated into main.

It also stores the locations of my different repos in a config file, which it will auto-generate on request, which I can then use to replicate my whole directory structure onto a new machine!
It even has a [Nix flake](https://nixos.wiki/wiki/Flakes), so I can pop it in my config, and exposes hooks which I can use to have the config file be encrypted in my Nis config, whilst allowing the tool to read and modify it.

And, for the first time ever, I have no idea how this all works.
It’s written in Go, a language I have never used.
If I look at a file I can understand what it does, but I’m not familiar with the structure of a Go project, or its best practices.
I’ve also never written a Nix flake before (and I still haven’t).

It’s a very strange feeling.
When I see people in charge of big companies saying that they don’t read the code their AI writes I still think to myself ‘what an idiot’.
But a year ago when I saw people saying they were using what the AI wrote at all, as opposed to reading the slop and using it to motivate their own better solution, I thought similar.
So I’m probably wrong this time.

The AI’s truly can do almost anything better than almost anyone.
In any specific application, there will always(??!) be human experts who will know better.
But across even quite a small surface area of different specialisms, most humans are going to be hard-pushed to compete.

For me, this experience of development was a nice one.
Today I got to be a designer and a product manager, and I got something that I wanted for like £20 of tokens at API prices (in actuality I only pay £20 per month).
Whilst my 'developer' wrote over 3000 lines of a language I don't understand.

![Claude usage on the main session for clonager](./05_claude_usage.png){.img-w-60}

In the larger context of my career, and society as a whole, it is concerning.
But the march of progress inevitably comes for us all.
Just as the systems I built replaced work done on paper by people, the skills I plied have been subsumed into the capabilities of the machine.

I will have to/am reckoning with this truth, and will have to see what I still have to offer for the world.
I have a feeling circus schools are about to become oversubscribed.

{% cta "Try clonager!", "https://github.com/adnathanail/clonager", "github" %}