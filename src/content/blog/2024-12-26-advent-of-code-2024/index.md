---
title: Advent of Code 2024
description: The culmination of a 10-year problem solving journey
author: alex
heroImg: ./advent_of_code_hero.jpg
date: 2024-12-26
tags: ['coding', 'project', 'theory']
---

[Advent of Code](https://adventofcode.com/) is an absolute festive treat, created by [Eric Wastl](https://was.tl/), providing daily coding problems throughout the lead-up to Christmas.

I came across it in 2017, and have engaged in the years since at varying degrees, irritating my friends on Instagram by posting daily about each challenge!

This year, 2024, is the 10-year anniversary of the project, and also the first year that I have completed all 49[*](#:~:text=Day%2025%3A%20Code%20Chronicle) problems, and received all 50 stars, so I have compiled all of my 2024 Instagram stories into 1 blog post.

I've marked my favourites with a little star ⭐️, and add some additional notes and context where I saw fit.

> [!info]
> Sadly when I exported my stories from Instagram they removed the songs I put on them, which is fine for a blog format really, but it has left little the little album images on the screenshot so just FYI that's why they're there!

## Day 0

![](./day%200/day%200.jpg){.no-center .img-w-20}

## Day 1: Historian Hysteria [Problem](https://adventofcode.com/2024/day/1) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day01)

![](./day%201/day%201%201.jpg){.no-center .img-w-20}
![](./day%201/day%201%202.jpg){.no-center .img-w-20}

## Day 2: Red-Nosed Reports [Problem](https://adventofcode.com/2024/day/2) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day02)

![](./day%202/day%202.jpg){.no-center .img-w-20}

## ⭐️ Day 3: Mull It Over [Problem](https://adventofcode.com/2024/day/3) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day03)

Pleased my memory of my undergrad compilers module is strong enough to still hand-roll a really simple parser.

> [!note]
> It's a little overly complex, wasting recursion depth looking for non-branching chains of characters in separate functions (e.g. separate functions `"n"`, `"'"`, `"t"`, as opposed to just chunking `"n't"`).

![](./day%203/day%203%201.jpg){.no-center .img-w-20}
![](./day%203/day%203%202.jpg){.no-center .img-w-20}

## Day 4: Ceres Search [Problem](https://adventofcode.com/2024/day/4) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day04)

![](./day%204/day%204%201.jpg){.no-center .img-w-20}
![](./day%204/day%204%202.jpg){.no-center .img-w-20}

## Day 5: Print Queue [Problem](https://adventofcode.com/2024/day/5) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day05)

![](./day%205/day%205.jpg){.no-center .img-w-20}

## Day 6: Guard Gallivant [Problem](https://adventofcode.com/2024/day/6) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day06)

I resisted the urge to use Python's gorgeous [networkx](https://networkx.org/) library here, but this was the first opportunity of many this year, and it made my graph manipulation a breeze in later problems.

![](./day%206/day%206.jpg){.no-center .img-w-20}

## Day 7: Bridge Repair [Problem](https://adventofcode.com/2024/day/7) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day07)

![](./day%207/day%207.jpg){.no-center .img-w-20}

## Day 8: Resonant Collinearity [Problem](https://adventofcode.com/2024/day/8) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day08)

![](./day%208/day%208.jpg){.no-center .img-w-20}

## Day 9: Disk Fragmenter [Problem](https://adventofcode.com/2024/day/9) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day09)

I really love being pushed to try implementing something I know exists and vaguely understand (like disk defragmentation), but haven't ever fully dug into, lovely learning opportunity!

![](./day%209/day%209.jpg){.no-center .img-w-20}

## Day 10: Hoof It [Problem](https://adventofcode.com/2024/day/10) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day10)

![](./day%2010/day%2010.jpg){.no-center .img-w-20}

## ⭐️ Day 11: Plutonian Pebbles [Problem](https://adventofcode.com/2024/day/11) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day11)

Not sure if this is quite dynamic programming, but its definitely using [memoisation](https://en.wikipedia.org/wiki/Memoization) which is an invaluable technique for these type of exercises, one I've been exposed to and experimented with gradually over the years of AoC, and I was pleased how quickly my solution came together for this problem.

![](./day%2011/day%2011.jpg){.no-center .img-w-20}

## Day 12: Garden Groups [Problem](https://adventofcode.com/2024/day/12) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day12)

![](./day%2012/day%2012.jpg){.no-center .img-w-20}

## Day 13: Claw Contraption [Problem](https://adventofcode.com/2024/day/13) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day13)

![](./day%2013/day%2013%201.jpg){.no-center .img-w-20}
![](./day%2013/day%2013%202.jpg){.no-center .img-w-20}

## ⭐️ Day 14: Restroom Redoubt [Problem](https://adventofcode.com/2024/day/14) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day14)

Part 2 was such a unique and interesting problem! I solved it very simply, visually inspecting thousands of images until I spotted the Christmas tree, but there were some genius solutions on the subreddit including [someone who found the entropy of the drones positions](https://www.reddit.com/r/adventofcode/comments/1hf3qdw/2024_day_14_part_2_entropy_visualized/), using the size of the compressed images, and the most compressable image had the tree!

![](./day%2014/day%2014%201.jpg){.no-center .img-w-20}
![](./day%2014/day%2014%202.jpg){.no-center .img-w-20}

## Day 15: Warehouse Woes [Problem](https://adventofcode.com/2024/day/15) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day15)

![](./day%2015/day%2015.jpg){.no-center .img-w-20}

## Day 16: Reindeer Maze [Problem](https://adventofcode.com/2024/day/16) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day16)

![](./day%2016/day%2016.jpg){.no-center .img-w-20}

## ⭐️ Day 17: Chronospatial Computer [Problem](https://adventofcode.com/2024/day/17) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day17)

This is where problems started taking a very long time this year. It took me at least 4 hours, the only problem where I ended up using Rust to try to achieve some speed gains, only to eventually solve it practically by hand by just thinking more carefully about the problem.

![](./day%2017/day%2017%201.jpg){.img-w-20}
![](./day%2017/day%2017%202.jpg){.img-w-20}
![](./day%2017/day%2017%203.jpg){.img-w-20}
![](./day%2017/day%2017%204.jpg){.img-w-20}
![](./day%2017/day%2017%205.jpg){.img-w-20}

## Day 18: RAM Run [Problem](https://adventofcode.com/2024/day/18) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day18)

![](./day%2018/day%2018.jpg){.no-center .img-w-20}

## Day 19: Linen Layout [Problem](https://adventofcode.com/2024/day/19) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day19)

![](./day%2019/day%2019.jpg){.no-center .img-w-20}

## Day 20: Race Condition [Problem](https://adventofcode.com/2024/day/20) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day20)

![](./day%2020/day%2020.jpg){.no-center .img-w-20}

## Day 21: Keypad Conundrum [Problem](https://adventofcode.com/2024/day/21) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day21)

This was the problem that took me the longest by far, 3 days and probably over 12 cumulative hours. I actually ended up using some [hints from the Reddit](https://www.reddit.com/r/adventofcode/comments/1hja685/2024_day_21_here_are_some_examples_and_hints_for/) (the only problem that I did this for). In the end it was a satisfying win because of the time I sunk into it, but not a ⭐️ favourite problem.

![](./day%2021/day%2021.jpg){.no-center .img-w-20}

## Day 22: Monkey Market [Problem](https://adventofcode.com/2024/day/22) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day22)

![](./day%2022/day%2022.jpg){.no-center .img-w-20}

## ⭐️ Day 23: LAN Party [Problem](https://adventofcode.com/2024/day/23) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day23)

Similar to Day 9, this was an interesting opportunity to play with a well-known computer science problem.

> [!note]
> Unfortunately, despite what I implied in the story below, I didn't revolutionise computer science, the size of the input was just small enough that my `O(n!)`(?) code still ran in reasonable time!

![](./day%2023/day%2023%201.jpg){.no-center .img-w-20}
![](./day%2023/day%2023%202.jpg){.no-center .img-w-20}

## ⭐️ Day 24: Crossed Wires [Problem](https://adventofcode.com/2024/day/24) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day24)

Such a cool problem; maybe my favourite. I feel like I basically followed the exact process I would if I were debugging a physical 45-bit adder circuit.

I also think it really lent itself to giving non-coders quite a deep insight into the problem. Explaining lines of code can only go so far, but being able to show people the visualisation I used, and hopefully understand exactly how I found the dodgy wires, felt really satisfying.

> [!info]
> The software I used here, and in lots of the graph manipulation problems, to visualise graphs is called [GraphViz](https://graphviz.org/) and it's fantastically useful. Lots of things will output their graph representations in GraphViz (AKA dot), including the Python graph manipulation library networkx. And [this handy website](https://dreampuf.github.io/GraphvizOnline/) visualises the graphs for you online without having to setup any software.

![](./day%2024/day%2024%201.jpg){.img-w-20}
![](./day%2024/day%2024%202.jpg){.img-w-20}
![](./day%2024/day%2024%203.jpg){.img-w-20}
![](./day%2024/day%2024%204.mov){.img-w-20}
![](./day%2024/day%2024%205.jpg){.img-w-20}

![](./day%2024/day%2024%206.jpg){.no-center .img-w-20}
![](./day%2024/day%2024%207.jpg){.no-center .img-w-20}
![](./day%2024/day%2024%208.jpg){.no-center .img-w-20}

## Day 25: Code Chronicle [Problem](https://adventofcode.com/2024/day/25) [Solution](https://github.com/adnathanail/aoc/tree/master/2024/day25)

![](./day%2025/day%2025%201.mov){.no-center .img-w-20}
![](./day%2025/day%2025%202.jpg){.no-center .img-w-20}
![](./day%2025/day%2025%203.mov){.no-center .img-w-20}

_There was no part 2 for this problem, it just said I'd got enough stars to "Deliver The Chronicle", took me to the end of the story (below), and gave me the 50th for free!_

![](./day%2025/day%2025%204.png){.no-center}
