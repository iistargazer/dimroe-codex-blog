---
title: entropy
description: Shannon entropy — the bridge between information, physics, and meaning.
date: 2026-09-21
tags:
  - mathematics
  - information-theory
---

Entropy measures how much *uncertainty* is in a distribution. That single
sentence is doing more work than it looks like.

## The definition

For a discrete random variable $X$ taking values $x_i$ with probabilities
$p_i$:

$$
H(X) = -\sum_{i} p_i \log_2 p_i
$$

The units are **bits** when the log is base 2. A fair coin has
$H = 1$ bit. A coin that lands heads 99% of the time has
$H \approx 0.08$ bits — you already know how it will land, so there is
almost nothing left to learn.

## Why the log?

Two properties force the logarithm, which is the part I find beautiful:

1. Independence should *add*. If two coins are separate experiments,
   $H(X, Y) = H(X) + H(Y)$. Only a log turns multiplication of
   probabilities into addition of information.
2. More options should never mean less uncertainty. $H$ is maximized by
   the uniform distribution: $H = \log_2 n$ for $n$ equally likely outcomes.

## The connection that pays rent

In statistical mechanics, the same form appears as Boltzmann's
$S = -k_B \sum p_i \ln p_i$. Same mathematics, different constant, wildly
different folklore — one about messages and compression, the other about
heat and time's arrow. See [[Papers/information-theory]] for the paper
that started the first thread.

A nice exercise: show that the entropy of English text is around 1 bit
per character, even though each character carries $\log_2 26 \approx 4.7$
bits of raw alphabet uncertainty. The gap is *redundancy* — and it is why
you can tl;dr this page.
