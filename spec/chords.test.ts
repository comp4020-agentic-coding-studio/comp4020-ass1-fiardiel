import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initApp } from "../src/scripts/app";

describe("chord explainer: core interaction", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
    initApp(root);
  });

  afterEach(() => {
    root.remove();
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
    const gButton = Array.from(keyButtons).find(
      (btn) => btn.dataset.pitch === "7",
    )!;
    gButton.click(); // G (pitch class 7) — selecting a key re-selects degree I

    const active = Array.from(
      root.querySelectorAll<HTMLElement>(".piano-key.active"),
    )
      .map((el) => Number(el.dataset.pitch))
      .sort((a, b) => a - b);
    expect(active).toEqual([2, 7, 11]); // I in G major: G B D
    expect(root.querySelector(".name")?.textContent).toBe("G major");
  });
});
