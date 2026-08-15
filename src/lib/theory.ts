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
