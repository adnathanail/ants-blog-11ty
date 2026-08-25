---
title: Hypergraphs and the ZX-calculus
description: Combining two niche things I'd never heard of
author: alex
heroImg: ./img/03-example-circuit-zx.png
date: 2026-08-14
recommendNoRSS: true
draft: true
---

> [!warning]
> This blog post assumes a vague familiarity with the [ZX-calculus](https://zxcalculus.com/).
> If you are unfamiliar, check out my post [Motivating the ZX-calculus](../2026-08-21-motivating-zx/).

## Hypergraphs

### Graphs

The word [graph](https://adacomputerscience.org/concepts/struct_graph) means something very different to mathematicians than it does to most people.
In mathland they are basically a way of showing relationships.

You have a bunch of **nodes** which are often drawn as dots or circles, and **edges** which are lines between nodes.

Essentially, a ZX-diagram looks exactly like a graph.
Our spiders are the nodes, and our wires are the edges.

It's been a while since I showed a pretty diagram so here's one:

{% include "./diag/_02-teleportation.njk" %}

> [!question]
> What famous quantum protocol does this diagram represent?

That ones a bit complicated for my next example so here's another:

{% include "./diag/_03-simple-diagram.njk" %}

A graph is nice visually for humans because we have eyes, but a computer needs a more ergonomic way to work with them.

There are a two main ways a computer can represent a graph; **adjacency lists** make the most sense here. [^adjacency-matrixes]
In this format, each of our nodes has an ID, and then each of our edges is represented by a pair of node IDs.

For the example above, the adjacency list representation (ignoring the node types/phases) might look like this:

```js
{
  "nodes": [0, 1, 2, 3],
  "edges": [
    [0, 1],
    [1, 2],
    [2, 3],
  ]
}
```

[^adjacency-matrixes]: The other option is an adjacency matrix, where you have a sort of table, with each node having both a row and a column. If two nodes are connected, then you follow along their row and column to find the cell in both, and put a 1 there. Adjacency matrices are useful when you have a **dense** graph, i.e. lots of nodes are connected to lots of other nodes. In our diagrams, each node/spider is typically only connected to a few neighbours.

### Hypergraphs

In a hypergraph, an edge can be between more than 2 nodes.
That might sound a little bit insane, but it can be a more ergonomic way to represent some types of relationships.

Imagine a graph of people and their friendships.
You can happily draw lines between pairs of people to accurately display all of the relationships between them.
But you might then want to plan a party with a group of people where everyone knows each other.

This information is absolutely contained within the graph, but it requires a bit of processing to find it.
In fact this question is equivalent to the [clique problem](https://en.wikipedia.org/wiki/Clique_problem), which is NP-complete. [^np-complete]

[^np-complete]: Computer science shorthand for 'we don't have a good algorithm for it'.

If we instead stored our friendships in a hypergraph, where a hyperedge between several people means that they are all friends, then the answer to this question is readily available from our data structure.

> [!note]
> This setup might make other questions longer to answer; this is the fundamental trade-off in selecting the right data structure for the job!

## Hypergraph representations of ZX-diagrams

So why do we care about hypergraphs here?
Clearly a ZX-diagram is laid out like a regular graph, each wire is only between two spiders.

The idea here is to have the wires become the nodes, and the spiders become the hyperedges.
Because each wire/node can necessarily only be connected to 2 spiders/hyperedges, we can visualize our ZX-diagrams as a funny sort of Venn diagram-looking structure.

<!-- TODO make diagram responsive, and rephrase para velow -->
If you click the spiders on the left, you'll see the corresponding blobs (hyperedges) highlight on the right. Similarly, if you click in a blob (or at an intersection of multiple blobs) you'll see the corresponding spider(s) on the left highlight; and, if you click a node on the right, the corresponding wire on the left will highlight.

{% include "./diag/_03a-zx-graph-vs-hyp.njk" %}

But why should we do this?
That is essentially the point of this blog post, and it's sort of an attempt for me to coherently explain it to myself.

<!-- TODO find out the proper explanation -->

In my computer scientist brain, it's about which of spiders and wires should be 'first-class objects'; i.e. which should have unique identifiers, and which should be defined in relation to the first-class object.

### Only connectivity matters

This is the core mantra in the study of [string diagrams](https://zxcalc.github.io/book/html/main_htmlch2.html), of which the ZX-calculus is an example.

It's basically saying that it doesn't matter _where_ your spiders are, so long as they are connected up identically; hence why the viewers let you drag them around.

<!-- TODO don't show labels -->
{% include "./diag/_04-teleportation-ocm.njk" %}

These two diagrams above are entirely equivalent to each other.
We could move any of the spiders and H-boxes anywhere at all, and the diagrams mean the same thing.
The only two nodes for which this is not true are the two black circles: the input and the ouput.

'Input' and 'output' are different because they are the locations at which diagrams can be stuck together.
In fact, implicitly, every spider (with a given number of wires), has implicit input and output nodes on their ends:

<!-- TODO add: = the same diagram rotated, lightning arrow the diagram with spiders on the ends, = that diagram rotated -->
{% include "./diag/_05-simple-ocm.njk" %}

However, because of the specifics of the linear maps that the spiders and H-boxes represent, these inputs/outputs are symmetric in how they are connected.

Comparing this to IO on an arbitrary diagram, it is highly unlikely that the linear map represented is symmetric on its inputs and outputs.
So we need a way of labelling our inputs and outputs.

### Port graphs

In a regular graph, wires exist only in reference to spiders.
The pink wire in the diagram below is represented as `(5, 6)`, i.e. _'this edge connects nodes 5 and 6`_, and that's all we know about the wire.

{% zxDiagram edgeColors={ hadamard: '#ff00aa' }, showLabels=true %}
  {
    "nodes": [
      { "id": 5, "qubit": 0, "col": 1, "type": "spider", "color": "Z" },
      { "id": 6, "qubit": 0, "col": 2, "type": "spider", "color": "X", "phase": "π" }
    ],
    "edges": [
      { "src": 5, "tgt": 6, "kind": "hadamard" }
    ]
  }
{% endzxDiagram %}

If wanted to say that we have an input to node 5, and an output from node 6, there isn't a straightforward way to represent this.
We could say that `(null, 5)` means _'node 5 accepts an input'_, but if we have multiple places accepting inputs/outputs in our diagram, we need a way to refer to them directly.

We could do this by creating a separate list just for input/output, or creating special node types which represent an input/output (or probably several other subtly different structures):

```js
{
  "nodes": [ { "id": 5, "type": "Z", "phase": "0" }, { "id": 6, "type": "X", "phase": "π" } ],
  "edges": [ (5, 6) ],
  "ports": { 0: 5, 1: 6 } // option 1: port 0 -> node 5, port 1 -> node 6
}

{
  "nodes": [
    { "id": 5, "type": "Z", "phase": "0" }, { "id": 6, "type": "X", "phase": "π" },
    { "id": 0, "type": "in" }, { "id": 1, "type": "out" } // option 2
  ],
  "edges": [
    (5, 6),
    (0, 5), (1, 6) // option 2: node 0 (in) -> node 5, node 1 (out) -> node 6
  ],
}
```

These are essentially just different memory representations for this:

{% zxDiagram edgeColors={ hadamard: '#ff00aa' }, showLabels=true %}
  {
    "nodes": [
      { "id": 0, "qubit": 0, "col": 0, "type": "input" },
      { "id": 5, "qubit": 0, "col": 1, "type": "spider", "color": "Z", "phase": "0" },
      { "id": 6, "qubit": 0, "col": 2, "type": "spider", "color": "X", "phase": "π" },
      { "id": 1, "qubit": 0, "col": 3, "type": "output" }
    ],
    "edges": [
      { "src": 0, "tgt": 5 },
      { "src": 5, "tgt": 6, "kind": "hadamard" },
      { "src": 6, "tgt": 1 }
    ]
  }
{% endzxDiagram %}

This concept of defining inputs and outputs on a graph is known as a **port graph** with the inputs and outputs termed **ports**.
This is a perfectly valid approach, but the data structure just isn't as _neat_.
It gives me a feeling of hackiness, which would be nice to avoid.

### Edges as first class objects

The hypergraph representation of the same diagram looks like this:

```js
{
  "nodes": [ { "id": 0 }, { "id": 1 }, { "id": 2 } ], // wires
  "edges": [ (0, 1, "Z", "0"), (1, 2, "X", "π") ],
}
```

{% zxDiagram edgeColors={ hadamard: '#ff00aa' }, showLabels=true, viewMode="both-horizontal" %}
  {
    "nodes": [
      { "id": 0, "qubit": 0, "col": 0, "type": "input" },
      { "id": 5, "qubit": 0, "col": 1, "type": "spider", "color": "Z", "phase": "0" },
      { "id": 6, "qubit": 0, "col": 2, "type": "spider", "color": "X", "phase": "π" },
      { "id": 1, "qubit": 0, "col": 3, "type": "output" }
    ],
    "edges": [
      { "src": 0, "tgt": 5 },
      { "src": 5, "tgt": 6, "kind": "hadamard" },
      { "src": 6, "tgt": 1 }
    ]
  }
{% endzxDiagram %}

Here, the ports attached to the two spiders inherently have names.
The spiders themselves do not, but this doesn't seem to matter.
We still have a way to give them properties like what type of spider they are, or what their phase is.

## ZX-calculus rules as hypergraphs

{% include "./diag/_10-zx-calc-rules-hypergraphs.njk" %}