# Diatonic chord explainer — design

Assignment 1 prototype. Interactive explainer: pick a major key, pick a scale
degree, see that chord's notes light up on a piano along with its function
("V — dominant, the tension that wants to resolve home").

## Scope

**MVP (this pass):** the 7 diatonic triads of any major key (I, ii, iii, IV,
V, vi, vii°), one octave, no audio.

**Stretch, only if MVP ships solid first:**
- diatonic seventh chords (Imaj7, iim7, ... vii°m7♭5)
- a small set of borrowed (modal interchange) chords per key — e.g. in C
  major: ♭VII (B♭maj7), iv (Fm), ♭III (E♭maj7) — each tagged with which
  parallel-minor degree it's borrowed from and a feel note ("borrowed iv —
  darkens home without leaving it")

The data model below is shaped so stretch chords are new data, not a
rewrite. If time runs out, MVP alone is a complete, gradeable answer to the
brief — stretch is additive, never a dependency of MVP shipping.

## Data model — `src/lib/theory.ts`

Pure functions, no DOM, fully unit-testable:

```ts
type PitchClass = 0 | 1 | ... | 11; // C=0 .. B=11
type Quality = "major" | "minor" | "diminished";

interface Chord {
  root: PitchClass;
  quality: Quality;
  notes: PitchClass[];        // triad: [root, root+3or4, root+6or7]
  romanNumeral: string;       // "V", "vi", "vii°"
  name: string;               // "G major"
  feel: string;                // one-line, your voice
  borrowed?: { fromDegree: string; note: string }; // stretch only
}

function diatonicTriads(keyRoot: PitchClass): Chord[]
```

`diatonicTriads` derives all 7 chords from one formula (major scale
intervals `[0,2,4,5,7,9,11]`, quality pattern
`[maj,min,min,maj,maj,min,dim]`) — no hardcoded table per key. Extending to
sevenths later is adding a 4th interval to the same generator; borrowed
chords are a second, short hand-authored list per key (not derivable
mechanically — that's a musical/content decision, so it stays explicit
data, not generated).

## Interaction

- Key selector: 12 buttons, C → B
- Chord selector: 7 buttons (roman numerals), driven by `diatonicTriads(key)`
- Selecting a chord: highlights its `notes` on a one-octave chromatic piano
  (12 keys, white + black, absolute pitch classes — not scale-relative
  positions, so the highlight is correct regardless of which key is active),
  and shows roman numeral, chord name, and `feel` text
- Plain TS + DOM, no framework, no audio

## Testing

- `theory.test.ts`: `diatonicTriads` returns correct notes/quality/roman
  numerals for at least 2-3 keys (e.g. C major, G major — covers a key with
  no accidentals and one with a sharp)
- One DOM-level test: selecting a chord button updates the highlighted piano
  keys and the displayed function text — this is the spec's "visitor does
  something that changes what they see" line made concrete

## Explicitly out of scope

- Audio playback
- Minor keys / modes
- Full 88-key or 2-octave piano
