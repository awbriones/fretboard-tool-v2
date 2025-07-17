import { Scale, FretboardNote, ScaleDegree } from "@/types";

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
  const startIndex = noteNames.indexOf(startNote);
  return noteNames[(startIndex + interval) % 12];
}

export function getSimpleNoteName(fullNoteName: string): string {
  const index = fullNoteNames.indexOf(fullNoteName);
  return index !== -1 ? noteNames[index] : fullNoteName;
}

export function getFullNoteName(simpleNoteName: string): string {
  const index = noteNames.indexOf(simpleNoteName);
  return index !== -1 ? fullNoteNames[index] : simpleNoteName;
}

export function createFretboardNote(
  noteName: string,
  stringIndex: number,
  fret: number,
  rootNote: string,
  scale: Scale
): FretboardNote {
  const noteIndex = noteNames.indexOf(noteName);
  const rootIndex = noteNames.indexOf(rootNote);
  const interval = (noteIndex - rootIndex + 12) % 12;
  const scaleDegreeIndex = scale.intervals.indexOf(interval);

  return {
    name: noteName,
    value: noteIndex,
    interval,
    scaleDegree: scaleDegreeIndex > -1 ? scaleDegreeIndex + 1 : null,
    isColored: scaleDegreeIndex > -1,
    isDimmed: false, // You might want to determine this based on some logic
    isDisplayed: scaleDegreeIndex > -1, // Or based on your display logic
    string: stringIndex,
    fret,
    id: `${stringIndex}-${fret}-${noteName}`,
  };
}
