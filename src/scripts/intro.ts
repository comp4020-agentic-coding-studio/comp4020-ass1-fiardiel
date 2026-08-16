import { diatonicTriads, NOTE_NAMES } from "../lib/theory";
import { renderPiano } from "../lib/piano";
import { playChord } from "../lib/audio";

// Fixed to C major — the intro is a guided walk through one key, not a
// second interactive surface. The visitor gets the full 12-key tool right
// after it.
const CHORDS = diatonicTriads(0);

export function initIntro(root: HTMLElement): void {
  const pianoContainer = root.querySelector<HTMLElement>(".intro-piano")!;
  const caption = root.querySelector<HTMLElement>(".intro-caption")!;
  const playButton = root.querySelector<HTMLButtonElement>(".intro-play")!;
  const steps = Array.from(
    root.querySelectorAll<HTMLElement>(".intro-step"),
  );

  const piano = renderPiano(pianoContainer);
  let activeDegree = 0;

  function showDegree(degree: number): void {
    activeDegree = degree;
    const chord = CHORDS[degree];
    piano.highlight(chord.notes);
    caption.textContent = `${chord.romanNumeral} — ${NOTE_NAMES[chord.root]} ${chord.quality}`;
  }

  playButton.addEventListener("click", () => {
    playChord(CHORDS[activeDegree].notes);
  });

  // IntersectionObserver only reports entries whose intersection state
  // just changed, not "everything intersecting right now" — so we track
  // the current set ourselves and, on every update, pick whichever step
  // in it sits closest to the vertical center of the viewport. That's
  // the step driving the pinned piano.
  const intersecting = new Set<HTMLElement>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const step = entry.target as HTMLElement;
        if (entry.isIntersecting) intersecting.add(step);
        else intersecting.delete(step);
      }
      if (intersecting.size === 0) return;

      const viewportCenter = window.innerHeight / 2;
      let closest: HTMLElement | null = null;
      let closestDistance = Infinity;
      for (const step of intersecting) {
        const rect = step.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = step;
        }
      }
      if (closest) showDegree(Number(closest.dataset.degree));
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
  );

  steps.forEach((step) => observer.observe(step));

  showDegree(0);
}

const introRoot = document.querySelector<HTMLElement>(".intro");
if (introRoot) initIntro(introRoot);
