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
