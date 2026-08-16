# COMP4020 prototype

Your starter repo for a COMP4020 prototype: a static site in HTML/CSS/TypeScript
that builds to plain HTML/CSS/JS and deploys to GitHub Pages. The deployed site
is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Run `pnpm check` before you push.
- Open the page in a browser and look at it. The rendered page is the truth;
  your mental model of it isn't.
- When a check fails, read its output before you change anything.
- Never commit a red state.

## The checks

`typecheck`, `build`, `deploy`, `spec`, `lint`, `tests`, `evidence`, `links`,
`secrets`. Run `pnpm check`. Read the failure.

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## Facts about this stack that are easy to get wrong

- `pnpm check` does **not** run `check:evidence` — that one only runs in CI,
  and CI's `deploy` job depends on `check:evidence` passing. A green
  `pnpm check` locally does not mean the deploy will happen. Run
  `pnpm check:evidence` yourself before shipping.
- Any test that touches `document` needs `vitest.config.ts` with
  `environment: "jsdom"` set — the default test environment has no DOM at
  all, so a `renderPiano(container)` or a `.click()` test fails immediately
  without it.
- stylelint here enforces modern media-feature range syntax:
  `@media (width <= 480px)`, not `@media (max-width: 480px)`. The old syntax
  is still valid CSS, it just fails this repo's linter.
- `main` has a centered `max-width`, so a section that needs to span the
  full viewport (a full-bleed background, a hero) needs the breakout trick:
  `width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw);`.
- Never assume an element's position in the DOM matches its data. Reordering
  elements visually (e.g. a straight row into a circle) silently breaks any
  code that assumed `array[domIndex]` still equals the thing at that index —
  key logic off a `data-*` attribute instead of position.

## This file is yours

A starting point, not a rulebook. As you learn what your prototype needs --- a
convention the work has to hold to, a sensor that keeps catching you out, a fact
about the stack that is easy to get wrong --- write it down here. Growing this
file is the work.
