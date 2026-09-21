---
title: vectors and eigenthings
description: Why eigenvectors are the load-bearing idea of both machine learning and quantum mechanics.
date: 2026-09-21
tags:
  - mathematics
  - quire
---

A matrix is a *transformation*. Most vectors get knocked off their line
when you apply one. The special ones — eigenvectors — stay on their line;
they only get stretched. The stretch factor is the eigenvalue.

$$
A v = \lambda v
$$

## why ML cares

A dataset is a cloud of points; its covariance matrix describes how the
cloud stretches. Its eigenvectors *are* the principal axes of the data —
PCA is just "keep the top few eigenvalues." The kernel trick, spectral
clustering, PageRank (the web's adjacency matrix, ranked by eigenvector),
and word embeddings all ride the same idea: find the directions a system
naturally lives in.

## why quantum cares

In quantum mechanics, *everything measurable is an eigenvalue question*.
States are vectors; measurements are matrices; the possible outcomes of a
measurement are exactly that matrix's eigenvalues, and after measuring
the state *is* the eigenvector you landed on. When you hear "a qubit is
in a superposition," it means: a vector that isn't (yet) an eigenvector
of the thing you're about to measure.

## the bridge

Both fields ask the same question — *what does this system look like in
its own natural coordinates?* — and both answer it with the spectral
theorem. This is also exactly the machinery behind
[[Notes/quantum-key-distribution]]: measuring in the wrong basis
destroys the state, which is a feature when you're building a lock out
of physics.
