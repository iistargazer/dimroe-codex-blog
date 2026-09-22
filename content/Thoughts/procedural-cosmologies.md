---
title: procedural cosmologies
description: Noise functions are tiny cosmologies — what procedural generation teaches about worldbuilding.
date: 2026-09-21
tags:
  - folio
  - gamedev
---

A noise function takes a coordinate and returns a number — deterministically.
Feed the same coordinate, get the same value, forever. That's the whole
trick, and it means a 40-line function contains an *infinite world*: every
terrain you'll ever visit was already there, the moment you wrote the
function. Generation is not creation; it's *cartography of something that
already exists*.

Perlin/simplex noise layers octaves the way Lorrain layered glazes —
broad sweeps first, fine detail last. There's a real kinship to
[painting](../Paintings): both are controlled randomness arranged to feel
inevitable.

The design lesson I keep coming back to: players don't love procedural
games because the worlds are big. They love them because the *rules are
legible* — Outer Wilds is a hand-built solar system, but it feels
procedural in the best sense: completely knowable, completely indifferent.
Determinism plus discovery. Same as [[Notes/entropy]]: the fun is in
resolving uncertainty, and the fun dies the moment the world can't be
learned.
