import { describe, expect, it } from "vitest";
import { frequency, voice } from "./audio";

describe("voice", () => {
  it("keeps already-ascending notes in the same octave", () => {
    // C major triad: C E G — already ascending, no wrap needed
    expect(voice([0, 4, 7], 4)).toEqual([
      { pitchClass: 0, octave: 4 },
      { pitchClass: 4, octave: 4 },
      { pitchClass: 7, octave: 4 },
    ]);
  });

  it("bumps the octave when a note wraps past the previous one", () => {
    // A minor triad (vi in C major): A(9) C(0) E(4) — root A, wraps down
    // to C then continues up to E
    expect(voice([9, 0, 4], 4)).toEqual([
      { pitchClass: 9, octave: 4 },
      { pitchClass: 0, octave: 5 },
      { pitchClass: 4, octave: 5 },
    ]);
  });

  it("handles a chord that wraps twice", () => {
    // B diminished (vii° in C major): B(11) D(2) F(5)
    expect(voice([11, 2, 5], 4)).toEqual([
      { pitchClass: 11, octave: 4 },
      { pitchClass: 2, octave: 5 },
      { pitchClass: 5, octave: 5 },
    ]);
  });
});

describe("frequency", () => {
  it("computes A4 as exactly 440Hz", () => {
    expect(frequency(9, 4)).toBe(440);
  });

  it("computes C4 (middle C) close to the standard 261.63Hz", () => {
    expect(frequency(0, 4)).toBeCloseTo(261.63, 1);
  });

  it("doubles frequency exactly one octave up", () => {
    expect(frequency(0, 5)).toBeCloseTo(frequency(0, 4) * 2, 6);
  });
});
