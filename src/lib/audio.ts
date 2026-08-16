import type { PitchClass } from "./theory";

interface VoicedNote {
  pitchClass: PitchClass;
  octave: number;
}

// Stacks pitch classes into ascending frequencies by bumping the octave
// whenever a note would otherwise sit below the one before it — turns a
// chord's raw [root, third, fifth] pitch classes into a real voicing.
export function voice(notes: PitchClass[], baseOctave = 4): VoicedNote[] {
  const voiced: VoicedNote[] = [];
  let octave = baseOctave;
  let previous = -1;
  for (const pitchClass of notes) {
    if (pitchClass <= previous) octave += 1;
    voiced.push({ pitchClass, octave });
    previous = pitchClass;
  }
  return voiced;
}

// A4 = 440Hz is MIDI note 69; C4 (middle C) starts each octave at pitch
// class 0, so MIDI = (octave + 1) * 12 + pitchClass.
export function frequency(pitchClass: PitchClass, octave: number): number {
  const midi = (octave + 1) * 12 + pitchClass;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

const DURATION = 3.2;

export function playChord(notes: PitchClass[]): void {
  const ctx = getContext();
  const now = ctx.currentTime;

  for (const { pitchClass, octave } of voice(notes)) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = frequency(pitchClass, octave);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.setValueAtTime(0.18, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + DURATION);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + DURATION + 0.05);
  }
}
