export type PitchClass = number; // 0-11, C = 0

export type Quality = "major" | "minor" | "diminished";

export interface Chord {
  root: PitchClass;
  quality: Quality;
  notes: PitchClass[];
  romanNumeral: string;
  name: string;
  hint: string;
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

const HINTS = [
  "Home",
  "Gentle motion",
  "Wistful, unstable",
  "Subdominant",
  "Dominant, tension",
  "Relative minor",
  "Restless, unstable",
];

const FEELS = [
  "Home — the tonic itself, where every tension in the key wants to resolve. Every other chord here is defined by its distance from this one.",
  "A step above home, gently minor — it shares two notes with I, so it rarely feels like a destination, more a quiet stepping stone toward IV or V.",
  "A third above home, minor and unstable — it shares two notes with I and two with V, so it rarely settles anywhere for long.",
  "Subdominant — a fourth above home, the first real step away from the tonic. It sets up tension without creating it outright, often leading toward V.",
  "Dominant — a fifth above home, the note farthest from the tonic in the cycle of fifths. It creates the strongest pull back to I, the tension that makes arriving home feel earned.",
  "The relative minor — a sixth above home, sharing every note with I but cast in a minor light. Home's melancholy twin, often standing in when a phrase wants to feel unresolved.",
  "Diminished — a seventh above home, built from two stacked minor thirds with no perfect fifth to stabilize it. It leans hard back toward I, rarely lingering.",
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
      hint: HINTS[i],
      feel: FEELS[i],
    };
  });
}
