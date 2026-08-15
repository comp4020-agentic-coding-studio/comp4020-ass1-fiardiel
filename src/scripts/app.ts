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
