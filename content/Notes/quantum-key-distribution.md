---
title: quantum key distribution
description: How the no-cloning theorem becomes a lock — BB84 and the physics of paranoia.
date: 2026-09-21
tags:
  - folio
  - quantum
  - cryptography
---

Classical cryptography assumes the adversary is bad at math. Quantum key
distribution assumes the adversary is *omnipotent* — and wins anyway,
because the security comes from physics, not computational difficulty.

## the trick (BB84, in three sentences)

Alice sends qubits randomly prepared in one of two bases (say,
rectilinear or diagonal). Bob measures each in a randomly chosen basis.
Afterward they compare bases over a public channel — keeping only the
rounds where they happened to agree, which becomes the shared key.

## the one equation

A state $v$ under a measurement $A$ collapses to an eigenvector with
outcome $\lambda$:

$$
A v = \lambda v
$$

Measure in the right basis and you learn something cleanly. Measure in
the wrong one and you've *replaced* the state. Everything below is this
line of math wearing a trench coat.

## why eavesdropping is fatal

An eavesdropper (Eve) must measure to learn the qubits, but she doesn't
know the basis, and [[Notes/vectors-and-eigenthings]] explains what
happens when you measure in the wrong basis: the state collapses to an
eigenvector of *her* measurement, irreversibly disturbing it. Worse, the
**no-cloning theorem** says she can't copy the qubit and measure later.
So her presence shows up as a measurable error rate on the qubits they
kept. If the error rate is too high, Alice and Bob throw the key away.

This is the philosophical punchline: for the first time, *noticing that
someone read your letter* is a theorem.

## the fine print

- Photons get lost; real devices leak (detector blinding attacks are a
  whole literature); distance is limited by fiber absorption.
- QKD solves *key exchange*, not encryption — you still pair it with a
  one-time pad or AES.
- Shor's algorithm (running on a future quantum computer) breaks RSA by
  finding eigenperiods with the quantum Fourier transform — the same
  spectral machinery, pointed the other way.

Related: [[Notes/entropy]] (the key's entropy *is* its security),
[[Papers/information-theory]] (Shannon's perfect secrecy is the
criterion QKD actually achieves in the limit).
