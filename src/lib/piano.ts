const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B

const BLACK_KEYS = [
  { pitch: 1, afterWhiteIndex: 0 }, // C♯
  { pitch: 3, afterWhiteIndex: 1 }, // D♯
  { pitch: 6, afterWhiteIndex: 3 }, // F♯
  { pitch: 8, afterWhiteIndex: 4 }, // G♯
  { pitch: 10, afterWhiteIndex: 5 }, // A♯
];

export function renderPiano(
  container: HTMLElement,
): { highlight: (notes: number[]) => void } {
  container.innerHTML = "";
  const piano = document.createElement("div");
  piano.className = "piano";

  const whiteWidth = 100 / WHITE_KEYS.length;

  WHITE_KEYS.forEach((pitch, i) => {
    const key = document.createElement("div");
    key.className = "piano-key white";
    key.dataset.pitch = String(pitch);
    key.style.left = `${i * whiteWidth}%`;
    key.style.width = `${whiteWidth}%`;
    piano.appendChild(key);
  });

  BLACK_KEYS.forEach(({ pitch, afterWhiteIndex }) => {
    const key = document.createElement("div");
    key.className = "piano-key black";
    key.dataset.pitch = String(pitch);
    key.style.left = `${(afterWhiteIndex + 1) * whiteWidth - whiteWidth * 0.3}%`;
    key.style.width = `${whiteWidth * 0.6}%`;
    piano.appendChild(key);
  });

  container.appendChild(piano);

  function highlight(notes: number[]): void {
    piano.querySelectorAll<HTMLElement>(".piano-key").forEach((key) => {
      const pitch = Number(key.dataset.pitch);
      key.classList.toggle("active", notes.includes(pitch));
    });
  }

  return { highlight };
}
