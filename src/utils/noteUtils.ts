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
    "1P": "1st",
    "2m": "♭2nd",
    "2M": "2nd",
    "3m": "♭3rd",
    "3M": "3rd",
    "4P": "4th",
    "4A": "♯4th",
    "5d": "♭5th",
    "5P": "5th",
    "6m": "♭6th",
    "6M": "6th",
    "7m": "♭7th",
    "7M": "7th",
  };
  return conversions[intervalName] || intervalName;
}

// Individual note name arrays for different accidental preferences
export const sharpNoteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const flatNoteNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Scale-based accidental logic for different keys
const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];

export type AccidentalDisplayMode = 'both' | 'sharps' | 'flats' | 'logical';

export function getDisplayNoteName(
  chromaticIndex: number, 
  mode: AccidentalDisplayMode, 
  keySignature?: string
): string {
  const sharpName = sharpNoteNames[chromaticIndex];
  const flatName = flatNoteNames[chromaticIndex];
  
  switch (mode) {
    case 'sharps':
      return sharpName;
    case 'flats':
      return flatName;
    case 'both':
      return sharpName === flatName ? sharpName : `${sharpName}/${flatName}`;
    case 'logical':
    default: {
      // Use key signature logic
      if (!keySignature || sharpName === flatName) {
        return sharpName; // Natural notes are the same
      }
      
      // Determine if key prefers sharps or flats
      const useFlats = flatKeys.includes(keySignature);
      return useFlats ? flatName : sharpName;
    }
  }
}

export function parseNoteComponents(noteName: string): { 
  letter: string; 
  accidental: string; 
  isSharp: boolean; 
  isFlat: boolean; 
} {
  const letter = noteName.charAt(0);
  const accidental = noteName.slice(1);
  
  return {
    letter,
    accidental,
    isSharp: accidental.includes('#') || accidental.includes('♯'),
    isFlat: accidental.includes('b') || accidental.includes('♭'),
  };
}

// Convert chromatic interval to scale degree notation
export function getChromaticScaleDegree(chromaticInterval: number): string {
  const degrees = [
    '1st',      // 0 - Root
    '♭2nd',     // 1 - Minor second
    '2nd',      // 2 - Major second
    '♭3rd',     // 3 - Minor third
    '3rd',      // 4 - Major third
    '4th',      // 5 - Perfect fourth
    '♯4th/♭5th',  // 6 - Tritone (can be either augmented fourth or diminished fifth)
    '5th',      // 7 - Perfect fifth
    '♭6th',     // 8 - Minor sixth
    '6th',      // 9 - Major sixth
    '♭7th',     // 10 - Minor seventh
    '7th',      // 11 - Major seventh
  ];
  
  return degrees[chromaticInterval % 12];
}

// Get scale degree for a specific scale context
export function getScaleDegreeInScale(
  chromaticInterval: number, 
  scale: Scale
): string {
  const scalePosition = scale.intervals.indexOf(chromaticInterval);
  
  if (scalePosition === -1) {
    // Note is not in the scale, show chromatic degree
    return getChromaticScaleDegree(chromaticInterval);
  }
  
  // Note is in the scale, use the scale's interval name if available
  if (scale.intervalNames && scale.intervalNames[scalePosition]) {
    return formatIntervalName(scale.intervalNames[scalePosition]);
  }
  
  // Fallback to chromatic degree
  return getChromaticScaleDegree(chromaticInterval);
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
