---
title: information theory
description: Shannon 1948 — the paper that made "information" a measurable thing.
date: 2026-09-21
tags:
  - paper
  - information-theory
---

**cite** — C. E. Shannon, "A Mathematical Theory of Communication," *Bell
System Technical Journal*, 1948. [full text (PDF)](https://bell-labs.com/static/files/infobell/shannon.pdf)

**in one paragraph** — Shannon asks what it *costs* to transmit a message,
abstracted away from meaning entirely. His answer: a source that produces
symbols with probabilities $p_i$ carries $-\sum p_i \log_2 p_i$ bits of
uncertainty per symbol — the entropy, which every message must "pay" to be
communicated. He proves this cost is a hard floor: no encoding can beat it
(his noisy-channel theorem), and no encoding needs to be far above it.
Compression, error correction, and the bit as a unit all fall out of this
one move.

**why it's in here** — before Shannon, "information" was a word; after him,
it's a quantity you can engineer with. Every file you zip, every QR code,
every deep-learning loss function measured in nats or bits traces here.

**connects to** — my working notes live in [[Notes/entropy]]; the
redundancy idea (English at ~1 bit/char) is the same fact that makes
compression and spelling correction possible.
