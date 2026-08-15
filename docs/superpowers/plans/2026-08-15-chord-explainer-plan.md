# Diatonic Chord Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Assignment 1 prototype — pick a major key, pick one of
its 7 diatonic triads, see the notes light up on a piano and read what the
chord does (home, tension, subdominant, ...).

**Architecture:** Three plain TypeScript modules with no framework: a pure
music-theory module (`theory.ts`) that generates chords from a key, a
piano-rendering module (`piano.ts`) that owns the DOM for the keyboard and
exposes a `highlight(notes)` call, and an app module (`app.ts`) that wires
key/chord selection to both. Astro's `src/pages/index.astro` just mounts
a container div and loads `app.ts` as a page script — the same pattern the
starter's `main.ts` already used (query an element, guard on null).

**Tech Stack:** Astro (already converted), plain TypeScript + DOM, Vitest +
jsdom for tests. No new runtime dependencies; `jsdom` is already a
devDependency.

**Spec:** `docs/superpowers/specs/2026-08-15-chord-explainer-design.md`

## Global Constraints

- Static, client-side only — no server, no build-time data fetching.
- No audio (explicit MVP scope decision — see design doc).
- No framework — plain TypeScript + DOM only.
- Piano is one octave, chromatic (absolute pitch classes 0–11), not
  scale-relative — correct regardless of which key is selected.
- Must work at both marking viewports: desktop and phone.
- Deployed and live at its GitHub Pages URL by **Mon 17 Aug 2026, 12:00
  noon** (assignment deadline) — not a code constraint but the reason this
  plan stays to MVP scope only.

---

### Task 1: Music theory module

**Files:**
- Create: `src/lib/theory.ts`
- Test: `src/lib/theory.test.ts`

**Interfaces:**
- Produces: `PitchClass` (`number`, 0–11, C=0), `Quality`
  (`"major" | "minor" | "diminished"`), `Chord` interface
  (`{ root: PitchClass; quality: Quality; notes: PitchClass[]; romanNumeral: string; name: string; feel: string }`),
  `NOTE_NAMES: string[]` (12 entries, C first), `diatonicTriads(keyRoot: PitchClass): Chord[]`
  — later tasks import all of these from `../lib/theory`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/theory.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { diatonicTriads } from "./theory";

describe("diatonicTriads", () => {
  it("generates the 7 diatonic triads of C major", () => {
    const chords = diatonicTriads(0);
    expect(chords).toHaveLength(7);
    expect(chords.map((c) => c.romanNumeral)).toEqual([
      "I", "ii", "iii", "IV", "V", "vi", "vii°",
    ]);
    expect(chords[0].notes).toEqual([0, 4, 7]); // I: C major — C E G
    expect(chords[0].quality).toBe("major");
    expect(chords[4].notes).toEqual([7, 11, 2]); // V: G major — G B D
    expect(chords[4].quality).toBe("major");
    expect(chords[4].name).toBe("G major");
    expect(chords[6].notes).toEqual([11, 2, 5]); // vii°: B diminished — B D F
    expect(chords[6].quality).toBe("diminished");
  });

  it("generates the 7 diatonic triads of G major, including a sharp", () => {
    const chords = diatonicTriads(7);
    expect(chords[2].notes).toEqual([11, 2, 6]); // iii: B minor — B D F♯
    expect(chords[2].name).toBe("B minor");
    expect(chords[6].root).toBe(6); // vii°: F♯ diminished
    expect(chords[6].name).toBe("F♯ diminished");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/theory.test.ts`
Expected: FAIL — `./theory` has no exported member `diatonicTriads` (module
doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/theory.ts`:

```ts
export type PitchClass = number; // 0-11, C = 0

export type Quality = "major" | "minor" | "diminished";

export interface Chord {
  root: PitchClass;
  quality: Quality;
  notes: PitchClass[];
  romanNumeral: string;
  name: string;
  feel: string;
}

export const NOTE_NAMES = [
  "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B",
];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

const DEGREE_QUALITIES: Quality[] = [
  "major", "minor", "minor", "major", "major", "minor", "diminished",
];

const ROMAN_NUMERALS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

const FEELS = [
  "Home. Where the tension resolves.",
  "A gentle passing chord, softly minor.",
  "Wistful and unstable — rarely lingers long.",
  "Subdominant — steps away from home without leaving it.",
  "Dominant — the pull, the tension that wants to resolve home.",
  "The relative minor — home's melancholy twin.",
  "Diminished and restless — leans hard back toward home.",
];

const TRIAD_INTERVALS: Record<Quality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
};

export function diatonicTriads(keyRoot: PitchClass): Chord[] {
  return MAJOR_SCALE_INTERVALS.map((interval, i) => {
    const root = (keyRoot + interval) % 12;
    const quality = DEGREE_QUALITIES[i];
    const notes = TRIAD_INTERVALS[quality].map((iv) => (root + iv) % 12);
    return {
      root,
      quality,
      notes,
      romanNumeral: ROMAN_NUMERALS[i],
      name: `${NOTE_NAMES[root]} ${quality}`,
      feel: FEELS[i],
    };
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/theory.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/theory.ts src/lib/theory.test.ts
git commit -m "feat: add diatonic triad generator"
```

---

### Task 2: Piano rendering module

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/piano.ts`
- Test: `src/lib/piano.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1 (pure DOM module, takes plain
  `number[]` pitch classes — no dependency on `theory.ts`'s `Chord` type).
- Produces: `renderPiano(container: HTMLElement): { highlight: (notes: number[]) => void }`
  — Task 3's `app.ts` imports this from `../lib/piano`.

**Why the vitest config first:** the repo's existing DOM test
(`spec/invariants.test.ts`) manually builds a `JSDOM` instance per file
because there's no global `document`. This task's tests use `document`
directly (matching how `piano.ts` will run in the browser), so vitest needs
a global jsdom environment. This doesn't change how `invariants.test.ts`
runs — it builds its own isolated `JSDOM` instances regardless of the
global environment.

- [ ] **Step 1: Add the jsdom test environment**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/piano.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { renderPiano } from "./piano";

describe("renderPiano", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
  });

  it("renders 12 keys: 7 white and 5 black", () => {
    renderPiano(container);
    expect(container.querySelectorAll(".piano-key.white")).toHaveLength(7);
    expect(container.querySelectorAll(".piano-key.black")).toHaveLength(5);
  });

  it("highlights exactly the given pitch classes", () => {
    const { highlight } = renderPiano(container);
    highlight([0, 4, 7]);
    const active = Array.from(
      container.querySelectorAll<HTMLElement>(".piano-key.active"),
    )
      .map((el) => Number(el.dataset.pitch))
      .sort((a, b) => a - b);
    expect(active).toEqual([0, 4, 7]);
  });

  it("clears the previous highlight when highlighting a new chord", () => {
    const { highlight } = renderPiano(container);
    highlight([0, 4, 7]);
    highlight([7, 11, 2]);
    const active = Array.from(
      container.querySelectorAll<HTMLElement>(".piano-key.active"),
    )
      .map((el) => Number(el.dataset.pitch))
      .sort((a, b) => a - b);
    expect(active).toEqual([2, 7, 11]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/lib/piano.test.ts`
Expected: FAIL — `./piano` has no exported member `renderPiano` (module
doesn't exist yet).

- [ ] **Step 4: Write the implementation**

Create `src/lib/piano.ts`:

```ts
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B

const BLACK_KEYS = [
  { pitch: 1, afterWhiteIndex: 0 }, // C♯
  { pitch: 3, afterWhiteIndex: 1 }, // D♯
  { pitch: 6, afterWhiteIndex: 3 }, // F♯
  { pitch: 8, afterWhiteIndex: 4 }, // G♯
  { pitch: 10, afterWhiteIndex: 5 }, // A♯
];

export function renderPiano(
  container: HTMLElement,
): { highlight: (notes: number[]) => void } {
  container.innerHTML = "";
  const piano = document.createElement("div");
  piano.className = "piano";

  const whiteWidth = 100 / WHITE_KEYS.length;

  WHITE_KEYS.forEach((pitch, i) => {
    const key = document.createElement("div");
    key.className = "piano-key white";
    key.dataset.pitch = String(pitch);
    key.style.left = `${i * whiteWidth}%`;
    key.style.width = `${whiteWidth}%`;
    piano.appendChild(key);
  });

  BLACK_KEYS.forEach(({ pitch, afterWhiteIndex }) => {
    const key = document.createElement("div");
    key.className = "piano-key black";
    key.dataset.pitch = String(pitch);
    key.style.left = `${(afterWhiteIndex + 1) * whiteWidth - whiteWidth * 0.3}%`;
    key.style.width = `${whiteWidth * 0.6}%`;
    piano.appendChild(key);
  });

  container.appendChild(piano);

  function highlight(notes: number[]): void {
    piano.querySelectorAll<HTMLElement>(".piano-key").forEach((key) => {
      const pitch = Number(key.dataset.pitch);
      key.classList.toggle("active", notes.includes(pitch));
    });
  }

  return { highlight };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run src/lib/piano.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/lib/piano.ts src/lib/piano.test.ts
git commit -m "feat: add piano rendering with highlight"
```

---

### Task 3: App wiring, page markup, and the spec test

**Files:**
- Create: `src/scripts/app.ts`
- Modify: `src/pages/index.astro` (full file — replace lines 1–20)
- Delete: `src/scripts/main.ts`
- Delete: `spec/starter.test.ts`
- Test: `spec/chords.test.ts`

**Interfaces:**
- Consumes: `diatonicTriads`, `NOTE_NAMES`, `type Chord` from
  `../lib/theory` (Task 1); `renderPiano` from `../lib/piano` (Task 2).
- Produces: `initApp(root: HTMLElement): void` — mounts the whole widget
  inside `root`. `spec/chords.test.ts` imports this directly; the page
  script self-bootstraps against `#app`, same guarded pattern the starter's
  `main.ts` used.

This is the task that turns the spec line *"the visitor does something
that changes what they see"* into a real, checkable test.

- [ ] **Step 1: Write the failing spec test**

Delete `spec/starter.test.ts` first — it asserts against
`[data-testid="intro"]`, which this task removes from the page.

```bash
rm spec/starter.test.ts
```

Create `spec/chords.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { initApp } from "../src/scripts/app";

describe("chord explainer: core interaction", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
    initApp(root);
  });

  it("selecting a chord highlights its notes and shows its function", () => {
    const chordButtons = root.querySelectorAll<HTMLButtonElement>(
      ".chord-selector button",
    );
    expect(chordButtons).toHaveLength(7);

    chordButtons[4].click(); // V, default key C major → G major

    const active = Array.from(
      root.querySelectorAll<HTMLElement>(".piano-key.active"),
    )
      .map((el) => Number(el.dataset.pitch))
      .sort((a, b) => a - b);
    expect(active).toEqual([2, 7, 11]); // G B D

    expect(root.querySelector(".roman")?.textContent).toBe("V");
    expect(root.querySelector(".feel")?.textContent).toContain("tension");
  });

  it("changing key regenerates the chords and updates the piano", () => {
    const keyButtons = root.querySelectorAll<HTMLButtonElement>(
      ".key-selector button",
    );
    keyButtons[7].click(); // G (pitch class 7) — selecting a key re-selects degree I

    const active = Array.from(
      root.querySelectorAll<HTMLElement>(".piano-key.active"),
    )
      .map((el) => Number(el.dataset.pitch))
      .sort((a, b) => a - b);
    expect(active).toEqual([2, 7, 11]); // I in G major: G B D
    expect(root.querySelector(".name")?.textContent).toBe("G major");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run spec/chords.test.ts`
Expected: FAIL — `../src/scripts/app` has no exported member `initApp`
(module doesn't exist yet).

- [ ] **Step 3: Write app.ts**

Create `src/scripts/app.ts`:

```ts
import { diatonicTriads, NOTE_NAMES, type Chord } from "../lib/theory";
import { renderPiano } from "../lib/piano";

export function initApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="key-selector" role="group" aria-label="Choose a key"></div>
    <div class="chord-selector" role="group" aria-label="Choose a chord"></div>
    <div class="piano-container"></div>
    <div class="chord-info">
      <p class="roman"></p>
      <p class="name"></p>
      <p class="feel"></p>
    </div>
  `;

  const keySelector = root.querySelector<HTMLElement>(".key-selector")!;
  const chordSelector = root.querySelector<HTMLElement>(".chord-selector")!;
  const pianoContainer = root.querySelector<HTMLElement>(".piano-container")!;
  const romanEl = root.querySelector<HTMLElement>(".roman")!;
  const nameEl = root.querySelector<HTMLElement>(".name")!;
  const feelEl = root.querySelector<HTMLElement>(".feel")!;

  const piano = renderPiano(pianoContainer);

  let currentKey = 0;
  let currentChords: Chord[] = [];

  function renderKeySelector(): void {
    keySelector.innerHTML = "";
    NOTE_NAMES.forEach((name, pitch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = name;
      btn.classList.toggle("active", pitch === currentKey);
      btn.addEventListener("click", () => selectKey(pitch));
      keySelector.appendChild(btn);
    });
  }

  function renderChordSelector(): void {
    chordSelector.innerHTML = "";
    currentChords.forEach((chord, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = chord.romanNumeral;
      btn.addEventListener("click", () => selectChord(i));
      chordSelector.appendChild(btn);
    });
  }

  function selectKey(pitch: number): void {
    currentKey = pitch;
    currentChords = diatonicTriads(currentKey);
    renderKeySelector();
    renderChordSelector();
    selectChord(0);
  }

  function selectChord(index: number): void {
    const chord = currentChords[index];
    Array.from(chordSelector.children).forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });
    piano.highlight(chord.notes);
    romanEl.textContent = chord.romanNumeral;
    nameEl.textContent = chord.name;
    feelEl.textContent = chord.feel;
  }

  selectKey(currentKey);
}

const root = document.getElementById("app");
if (root) initApp(root);
```

- [ ] **Step 4: Update the page markup**

Replace the full contents of `src/pages/index.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="Chords in context">
  <header>
    <nav aria-label="Primary">
      <a href="./">Home</a>
    </nav>
  </header>
  <main>
    <h1>Chords in context</h1>
    <p>
      Pick a key, then a chord. See which notes it uses, and what it does —
      home, tension, or somewhere in between.
    </p>
    <div id="app"></div>
  </main>
  <script src="../scripts/app.ts"></script>
</Layout>
```

- [ ] **Step 5: Remove the old script**

```bash
rm src/scripts/main.ts
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run spec/chords.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Run the full check**

Run: `pnpm check`
Expected: typecheck, build, lint, stylelint, and all tests (including
`spec/invariants.test.ts`) PASS. The invariants run against `dist/`, so
this also confirms the built page still satisfies them (nav landmark, one
`h1`, viewport meta, etc.) with the new content.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire up chord explainer interaction, replace starter page"
```

---

### Task 4: Styling pass

**Files:**
- Modify: `src/styles/global.css` (append — file currently ends at line 16)

**Interfaces:**
- Consumes: the class names `app.ts` and `piano.ts` already emit
  (`.key-selector`, `.chord-selector`, button `.active`, `.piano`,
  `.piano-key`, `.piano-key.white/.black/.active`, `.chord-info`,
  `.roman`, `.name`, `.feel`) — no new markup, styling only.

- [ ] **Step 1: Append the styles**

Add to the end of `src/styles/global.css`:

```css
.key-selector,
.chord-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.key-selector button,
.chord-selector button {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  cursor: pointer;
}

.key-selector button.active,
.chord-selector button.active {
  background: #0b5fff;
  color: #fff;
  border-color: #0b5fff;
}

.piano-container {
  margin: 1.5rem 0;
}

.piano {
  position: relative;
  width: 100%;
  max-width: 28rem;
  height: 8rem;
}

.piano-key {
  position: absolute;
  top: 0;
  box-sizing: border-box;
}

.piano-key.white {
  height: 100%;
  background: #fff;
  border: 1px solid #333;
}

.piano-key.black {
  height: 60%;
  background: #222;
  z-index: 2;
}

.piano-key.active {
  background: #ffd54f;
}

.chord-info {
  margin-top: 1rem;
}

.chord-info .roman {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.chord-info .name {
  color: #555;
  margin: 0.25rem 0;
}

@media (max-width: 480px) {
  .piano {
    height: 6rem;
  }
}
```

- [ ] **Step 2: Run the full check**

Run: `pnpm check`
Expected: PASS — stylelint included.

- [ ] **Step 3: Manual viewport check**

Run: `pnpm dev`, open the served URL in a browser. Using devtools' device
toolbar (or resizing the window), check at a desktop width (~1280px) and a
phone width (~375px):
- no horizontal scroll/overflow
- all 12 key buttons and all 7 chord buttons are reachable and tappable
- the piano stays legible (keys don't collapse to zero width)

Fix anything that breaks before committing.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style: layout and responsive styling for chord explainer"
```

---

## After this plan

MVP is done and gradeable at this point. If time remains before the
deadline, the design doc's stretch section (seventh chords, borrowed
chords) is additive — new data and a couple more UI states, not a
rewrite. That's a separate follow-up plan, not part of this one.

Two things this plan doesn't cover because they're not code: filling in
`PROCESS.md` (3–4 real moments, 400–600 words) and
`reflections/assignment-1.md` as the work actually happens, and running
`ship`/`preflight` before the deadline.
