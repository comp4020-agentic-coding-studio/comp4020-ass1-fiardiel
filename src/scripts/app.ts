import { diatonicTriads, NOTE_NAMES, type Chord } from "../lib/theory";
import { renderPiano } from "../lib/piano";

export function initApp(root: HTMLElement): void {
  root.innerHTML = `
    <section class="selector-group">
      <h2 id="key-heading">Key</h2>
      <div class="key-selector" role="group" aria-labelledby="key-heading"></div>
    </section>
    <section class="selector-group">
      <h2 id="chord-heading">Chord</h2>
      <div class="chord-selector" role="group" aria-labelledby="chord-heading"></div>
    </section>
    <div class="piano-container"></div>
    <div class="chord-info" aria-live="polite">
      <p class="roman"></p>
      <p class="name"></p>
      <p class="notes"></p>
      <p class="feel"></p>
    </div>
  `;

  const keySelector = root.querySelector<HTMLElement>(".key-selector")!;
  const chordSelector = root.querySelector<HTMLElement>(".chord-selector")!;
  const pianoContainer = root.querySelector<HTMLElement>(".piano-container")!;
  const romanEl = root.querySelector<HTMLElement>(".roman")!;
  const nameEl = root.querySelector<HTMLElement>(".name")!;
  const notesEl = root.querySelector<HTMLElement>(".notes")!;
  const feelEl = root.querySelector<HTMLElement>(".feel")!;

  const piano = renderPiano(pianoContainer);

  let currentKey = 0;
  let currentChords: Chord[] = [];

  function buildKeySelector(): void {
    keySelector.innerHTML = "";
    NOTE_NAMES.forEach((name, pitch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = name;
      btn.classList.toggle("active", pitch === currentKey);
      btn.setAttribute("aria-pressed", pitch === currentKey ? "true" : "false");
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
      btn.title = `${chord.romanNumeral} — ${chord.hint}`;
      btn.addEventListener("click", () => selectChord(i));
      chordSelector.appendChild(btn);
    });
  }

  function selectKey(pitch: number): void {
    currentKey = pitch;
    currentChords = diatonicTriads(currentKey);
    Array.from(keySelector.children).forEach((el, i) => {
      el.classList.toggle("active", i === pitch);
      el.setAttribute("aria-pressed", i === pitch ? "true" : "false");
    });
    renderChordSelector();
    selectChord(0);
  }

  function selectChord(index: number): void {
    const chord = currentChords[index];
    Array.from(chordSelector.children).forEach((el, i) => {
      el.classList.toggle("active", i === index);
      el.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
    piano.highlight(chord.notes);
    romanEl.textContent = chord.romanNumeral;
    nameEl.textContent = chord.name;
    notesEl.textContent = chord.notes.map((pitch) => NOTE_NAMES[pitch]).join(", ");
    feelEl.textContent = chord.feel;
  }

  buildKeySelector();
  selectKey(currentKey);
}

const root = document.getElementById("app");
if (root) initApp(root);
