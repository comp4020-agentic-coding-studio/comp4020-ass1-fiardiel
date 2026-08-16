import { diatonicTriads, NOTE_NAMES, type Chord } from "../lib/theory";
import { renderPiano } from "../lib/piano";
import { playChord } from "../lib/audio";

// Circle of fifths, starting at C and going clockwise: each step is +7
// semitones (mod 12) from the last. Positioning this way — rather than
// chromatically — puts adjacent keys next to each other on screen, which
// is also true harmonically: neighbors on the circle share the most notes.
const FIFTHS_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

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
      <button class="play-chord" type="button">▶ Play chord</button>
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
  const playButton = root.querySelector<HTMLButtonElement>(".play-chord")!;

  const piano = renderPiano(pianoContainer);

  let currentKey = 0;
  let currentChords: Chord[] = [];
  let currentIndex = 0;

  function buildKeySelector(): void {
    keySelector.innerHTML = "";
    FIFTHS_ORDER.forEach((pitch, i) => {
      const angle = (i / FIFTHS_ORDER.length) * 2 * Math.PI - Math.PI / 2;
      const x = 50 + 42 * Math.cos(angle);
      const y = 50 + 42 * Math.sin(angle);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = NOTE_NAMES[pitch];
      btn.dataset.pitch = String(pitch);
      btn.style.left = `${x}%`;
      btn.style.top = `${y}%`;
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
    Array.from(keySelector.children).forEach((el) => {
      const button = el as HTMLElement;
      const isActive = Number(button.dataset.pitch) === pitch;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    renderChordSelector();
    selectChord(0);
  }

  function selectChord(index: number): void {
    currentIndex = index;
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

  playButton.addEventListener("click", () => {
    playChord(currentChords[currentIndex].notes);
  });

  buildKeySelector();
  selectKey(currentKey);
}

const root = document.getElementById("app");
if (root) initApp(root);
