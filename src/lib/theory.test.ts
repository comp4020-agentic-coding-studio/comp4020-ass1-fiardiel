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
