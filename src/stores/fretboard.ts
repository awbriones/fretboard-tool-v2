import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref, ComputedRef } from "vue";
import { Scale, FretboardNote } from "@/types";
import { createFretboardNote, noteNames } from "@/utils/noteUtils";
import { useScales } from "@/composables/useScales";

interface FretboardState {
  rootNote: Ref<string>;
  selectedScaleName: Ref<string>;
  selectedScale: ComputedRef<Scale>;
  tuning: Ref<string[]>;
  numFrets: Ref<number>;
  numStrings: Ref<number>;
  fretboardNotes: ComputedRef<FretboardNote[]>;
  setRootNote: (note: string) => void;
  setSelectedScale: (scaleName: string) => void;
  setNumFrets: (num: number) => void;
  setNumStrings: (num: number) => void;
  setTuning: (newTuning: string[]) => void;
  isScaleDegree: Ref<boolean>;
  setIsScaleDegree: (value: boolean) => void;
  scaleDegreeSettings: Ref<ScaleDegreeSetting[]>;
  setScaleDegreeSettings: (settings: ScaleDegreeSetting[]) => void;
  isGuitar: Ref<boolean>; // Add the 'isGuitar' property
  setInstrument: (guitar: boolean) => void; // Add the 'setInstrument' property
}

interface ScaleDegreeSetting {
  show: boolean;
  color: boolean;
  bright: boolean;
}

export const useFretboardStore = defineStore("fretboard", (): FretboardState => {
  const { scales } = useScales();
  const rootNote = ref("C");
  const selectedScaleName = ref("major");
  const tuning = ref(["E", "A", "D", "G", "B", "E"]);
  const numFrets = ref(15);
  const numStrings = ref(6);
  const isScaleDegree = ref(true);

  const selectedScale = computed(() => scales.value[selectedScaleName.value]);

  const scaleDegreeSettings = ref<ScaleDegreeSetting[]>([
    { show: true, color: true, bright: true },
    { show: true, color: false, bright: false },
    { show: true, color: true, bright: true },
    { show: true, color: false, bright: false },
    { show: true, color: true, bright: true },
    { show: true, color: false, bright: false },
    { show: true, color: false, bright: false },
  ]);

  const fretboardNotes = computed(() => {
    return tuning.value.flatMap((stringNote, stringIndex) =>
      Array.from({ length: numFrets.value + 1 }, (_, fret) => {
        const noteIndex = (noteNames.indexOf(stringNote) + fret) % 12;
        const noteName = noteNames[noteIndex];
        return createFretboardNote(
          noteName,
          stringIndex,
          fret,
          rootNote.value,
          selectedScale.value
        );
      })
    );
  });

  function setNumFrets(num: number) {
    numFrets.value = num;
  }

  function setRootNote(note: string) {
    rootNote.value = note;
  }

  function setSelectedScale(scaleName: string) {
    if (scales.value[scaleName]) {
      selectedScaleName.value = scaleName;
    } else {
      console.error(`Scale "${scaleName}" not found`);
    }
  }

  function setNumStrings(num: number) {
    numStrings.value = num;
    // Optionally adjust tuning here based on number of strings
  }

  const isGuitar = ref(true);

  function setInstrument(guitar: boolean) {
    isGuitar.value = guitar;
    numStrings.value = guitar ? 6 : 4;
    tuning.value = guitar ? ["E", "A", "D", "G", "B", "E"] : ["E", "A", "D", "G"];
  }

  function setTuning(newTuning: string[]) {
    tuning.value = newTuning;
  }

  function setIsScaleDegree(value: boolean) {
    isScaleDegree.value = value;
  }

  function setScaleDegreeSettings(settings: ScaleDegreeSetting[]) {
    scaleDegreeSettings.value = settings;
  }

  return {
    rootNote,
    selectedScaleName,
    selectedScale,
    tuning,
    numFrets,
    numStrings,
    fretboardNotes,
    setRootNote,
    setNumFrets,
    setSelectedScale,
    setNumStrings,
    setTuning,
    isScaleDegree,
    setIsScaleDegree,
    scaleDegreeSettings,
    setScaleDegreeSettings,
    isGuitar,
    setInstrument,
  };
});

export type FretboardStore = ReturnType<typeof useFretboardStore>;
