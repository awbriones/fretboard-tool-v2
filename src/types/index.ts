export interface ScaleDegree {
  degree: number;
  interval: number;
  label: string;
}

export interface Scale {
  name: string;
  intervals: number[];
  intervalNames: string[];
}

export interface Note {
  name: string;
  value: number; // 0-11 offset from C
  interval: number; // 0-11 offset from root note
  scaleDegree: number | null;
  isColored: boolean;
  isDimmed: boolean;
  isDisplayed: boolean;
}

export interface FretboardNote extends Note {
  string: number;
  fret: number;
  id: string;
}

export interface InstrumentConfig {
  name: string;
  strings: number;
  tuning: string[];
  frets: number;
}

export type NoteValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
