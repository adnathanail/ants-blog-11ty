---
title: Running Miranda on an M1 Mac
heroImg: ./27c18f97-5f54-4354-bccd-793f42171a8b_adlsnb.png
description: Is Miranda a dead language? Who knows, but I have to use it for my university module!
author: alex
date: 2023-01-09
updatedDate: 2025-09-16
---

Is [Miranda](https://www.cs.kent.ac.uk/people/staff/dat/miranda/ "Miranda homepage") a dead language? Who knows, but I have to use it for my university module!

Everything needs to be recompiled to run natively on the new Apple Silicon chips, but Apple released Rosetta 2 which should theoretically be able to emulate Intel hardware to bridge the gap. Unfortunately, this didn't seem to work for Miranda.

Miranda only got 64-bit support in January 2020 so it's not surprising that they don't support Apple Silicon yet (in fact they still support Power PC which was the chip technology used before intel that Rosetta 1 was built for in 2006!)

Luckily they also released the source code for Miranda in 2020 so, thanks to the wonderous longevity of C, we can just compile it from source.

## Compiling Miranda from source

### Check it builds

First, visit the [downloads page](https://www.cs.kent.ac.uk/people/staff/dat/miranda/downloads/ "Miranda downloads page") and click the link that says version `2.066`(I couldn't get this link to work in Chrome for some reason, so if you're struggling try Safari).

Open up the README and you'll find some instructions.

To test whether the build is going to work, run these commands in the shell

```shell
make cleanup
make
./mira
```

You should see something like this

```shell


                        T h e   M i r a n d a   S y s t e m

                     version 2.066 last revised 31 January 2020

                     Copyright Research Software Ltd 1985-2020

                       World Wide Web: http://miranda.org.uk


new file script.m
for help type /h
Miranda 
```

### Build errors?

If this step failed then something is up with `make`.

Firstly, is it installed? [Relevant StackOverflow](https://stackoverflow.com/a/10265766/9261263 "How to install 'make' and GCC on a Mac")

Beyond that? Google it!

### Installing the build

The next part of the README says to run `make install`. This will likely throw an error complaining that you don't have permissions to copy a file to `/usr/bin/mira`.

My friend [Tiago](https://www.tiferrei.com/) figured out to tweak the Makefile so the executable is installed to `/usr/local/bin`.

```diff-makefile
all: mira miralib/menudriver exfiles
#install paths relative to /
#for linux, MacOS X, Cygwin:
-BIN=usr/bin
+BIN=usr/local/bin
-LIB=usr/lib#beware no spaces after LIB
+LIB=usr/local/lib#beware no spaces after LIB
-MAN=usr/share/man/man1
+MAN=usr/local/share/man/man1
...
```

Then run

```shell
make install
````

Reopen your terminal and run

```shell
mira
```

And you should see the same startup screen from earlier!

## IntelliJ plugin

I also put together a very basic plugin for IntelliJ editors for the Miranda language. I did publish it to the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/20871-miranda-language-support), but I haven't updated it for the latest IDE's. However it may still compile [from source](https://github.com/adnathanail/miranda-intellij-plugin)
