export interface ScaleDegree {
  degree: number;
  interval: number;
  label: string;
}

export interface Scale {
  name: string;
  intervals: number[];
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
