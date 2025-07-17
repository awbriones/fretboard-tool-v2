import { Scale, FretboardNote } from "@/types";
import { Note, Interval, distance } from "@tonaljs/tonal";

// Keep legacy arrays for backward compatibility if needed
export const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const fullNoteNames = [
  "C",
  "C♯/D♭",
  "D",
  "D♯/E♭",
  "E",
  "F",
  "F♯/G♭",
  "G",
  "G♯/A♭",
  "A",
  "A♯/B♭",
  "B",
];

export function getNoteFromInterval(startNote: string, interval: number): string {
  return Note.transpose(startNote, Interval.fromSemitones(interval));
}

export function getSimpleNoteName(fullNoteName: string): string {
  const index = fullNoteNames.indexOf(fullNoteName);
  return index !== -1 ? noteNames[index] : fullNoteName;
}

export function getFullNoteName(simpleNoteName: string): string {
  const index = noteNames.indexOf(simpleNoteName);
  return index !== -1 ? fullNoteNames[index] : simpleNoteName;
}

export function getNoteInterval(fromNote: string, toNote: string): number {
  const semitones = distance(fromNote, toNote);
  return typeof semitones === "number" ? semitones : 0;
}

export function createFretboardNote(
  noteName: string,
  stringIndex: number,
  fret: number,
  rootNote: string,
  scale: Scale
): FretboardNote {
  const interval = getNoteInterval(rootNote, noteName);
  const scaleDegreeIndex = scale.intervals.indexOf(interval);
  const noteInfo = Note.get(noteName);
  const simplifiedName = noteInfo.pc || noteName;

  return {
    name: simplifiedName,
    value: noteInfo.chroma || 0,
    interval,
    scaleDegree: scaleDegreeIndex > -1 ? scaleDegreeIndex + 1 : null,
    isColored: scaleDegreeIndex > -1,
    isDimmed: false,
    isDisplayed: scaleDegreeIndex > -1,
    string: stringIndex,
    fret,
    id: `${stringIndex}-${fret}-${simplifiedName}`,
  };
}
