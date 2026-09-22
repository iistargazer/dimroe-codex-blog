---
title: attention is all you need
description: Vaswani et al. 2017 — the transformer paper.
date: 2026-09-21
tags:
  - paper
  - machine-learning
---

**cite** — Vaswani et al., "Attention Is All You Need," *NeurIPS*, 2017.
[arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

**in one paragraph** — Machine translation had been run through recurrent
networks that read one word at a time, which is slow and forgetful. This
paper throws out recurrence: each word attends to every other word at once,
with "attention" being a weighted lookup — each token asks a *query*,
every token offers a *key* and a *value*, and the match scores decide what
information flows. Because nothing is sequential, training parallelizes
across the whole sentence. The title's claim was true beyond translation:
this architecture, scaled up, became GPT, BERT, and the modern field.

**why it's in here** — the rare paper whose architecture is *the* industry
standard eight years later. Also the cleanest example I know of a simple
mathematical move (softmax(QKᵀ/√d)·V) reshaping an entire discipline.

**connects to** — [[Notes/entropy]] (the softmax is a probability
distribution; information-theoretic quantities show up all over
interpretability work), and someday: a note on why the √d scaling exists.
