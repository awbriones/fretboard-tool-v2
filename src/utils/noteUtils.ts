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
  const intervalStr = distance(fromNote, toNote);
  if (typeof intervalStr === "string") {
    return Interval.semitones(intervalStr) || 0;
  }
  return 0;
}

export function formatIntervalName(intervalName: string): string {
  // Convert Tonal.js interval names to more user-friendly notation
  const conversions: Record<string, string> = {
    "1P": "1",
    "2m": "b2",
    "2M": "2",
    "3m": "b3",
    "3M": "3",
    "4P": "4",
    "4A": "#4",
    "5d": "b5",
    "5P": "5",
    "6m": "b6",
    "6M": "6",
    "7m": "b7",
    "7M": "7",
  };
  return conversions[intervalName] || intervalName;
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
