import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
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
  scaleDegreeSettings: ComputedRef<ScaleDegreeSetting[]>;
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

  const selectedScale = computed(() => {
    const scale = scales.value[selectedScaleName.value];
    if (!scale) {
      // Fallback to major scale if the selected scale doesn't exist
      return (
        scales.value.major || {
          name: "Major",
          intervals: [0, 2, 4, 5, 7, 9, 11],
          intervalNames: ["1P", "2M", "3M", "4P", "5P", "6M", "7M"],
        }
      );
    }
    return scale;
  });

  const scaleDegreeSettings = computed(() => {
    const scaleLength = selectedScale.value?.intervals?.length || 7;
    
    return Array.from({ length: scaleLength }, (_, index) => {
      const intervalSemitones = selectedScale.value?.intervals?.[index] || 0;
      
      // Map semitones to traditional music theory degrees
      // 1 (root): 0 semitones -> bright + colored
      if (intervalSemitones === 0) {
        return { show: true, color: true, bright: true };
      }
      // 3 or b3 (third): 3 or 4 semitones -> bright + colored
      if ([3, 4].includes(intervalSemitones)) {
        return { show: true, color: true, bright: true };
      }
      // 5 (fifth): 7 semitones -> bright + colored
      if (intervalSemitones === 7) {
        return { show: true, color: true, bright: true };
      }
      // 7 or b7 (seventh): 10 or 11 semitones -> colored + dim
      if ([10, 11].includes(intervalSemitones)) {
        return { show: true, color: true, bright: false };
      }
      // Everything else (2, 4, 6, etc.): dim only
      return { show: true, color: false, bright: false };
    });
  });

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
    // Note: Debug logging will be triggered by the rootNote watcher
  }

  function setSelectedScale(scaleName: string) {
    if (scales.value[scaleName]) {
      selectedScaleName.value = scaleName;
    } else {
      // eslint-disable-next-line no-console
      console.error(`Scale "${scaleName}" not found. Available scales:`, Object.keys(scales.value));
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

  const manualScaleDegreeSettings = ref<ScaleDegreeSetting[]>([]);

  function setScaleDegreeSettings(settings: ScaleDegreeSetting[]) {
    manualScaleDegreeSettings.value = settings;
    logDebugState(`Manual settings update via setScaleDegreeSettings`);
  }

  // Clear manual settings when scale changes
  watch(selectedScaleName, (newScale, oldScale) => {
    manualScaleDegreeSettings.value = [];
    logDebugState(`Scale changed from ${oldScale} to ${newScale}`);
  });

  // Use manual settings if they exist and match the scale length, otherwise use computed defaults
  const finalScaleDegreeSettings = computed(() => {
    const scaleLength = selectedScale.value?.intervals?.length || 7;
    if (manualScaleDegreeSettings.value.length === scaleLength) {
      return manualScaleDegreeSettings.value;
    }
    return scaleDegreeSettings.value;
  });

  // Debug logging for all 12 chromatic notes
  function logDebugState(trigger: string) {
    const chromaticNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const currentScale = selectedScale.value;
    const currentSettings = finalScaleDegreeSettings.value;
    
    console.group(`🎵 Fretboard State Change: ${trigger}`);
    console.log(`Root Note: ${rootNote.value}`);
    console.log(`Scale: ${currentScale.name} (${currentScale.intervals.join(', ')})`);
    console.log(`Settings Length: ${currentSettings.length}`);
    
    console.table(
      Array.from({ length: 12 }, (_, chromaticIndex) => {
        const noteName = chromaticNotes[(chromaticIndex + noteNames.indexOf(rootNote.value)) % 12];
        const isInScale = currentScale.intervals.includes(chromaticIndex);
        
        let setting;
        if (currentScale.name === "Chromatic") {
          // For chromatic, use direct chromatic indexing
          setting = currentSettings[chromaticIndex] || { show: false, bright: false, color: false };
        } else {
          // For other scales, check if this chromatic interval is in the scale
          const scalePosition = currentScale.intervals.indexOf(chromaticIndex);
          setting = scalePosition >= 0 
            ? (currentSettings[scalePosition] || { show: false, bright: false, color: false })
            : { show: false, bright: false, color: false };
        }
        
        return {
          chromatic: chromaticIndex,
          note: noteName,
          inScale: isInScale,
          show: setting.show,
          color: setting.color,
          bright: setting.bright,
          scalePos: currentScale.intervals.indexOf(chromaticIndex)
        };
      })
    );
    console.groupEnd();
  }

  // Watch for root note changes
  watch(rootNote, (newRoot, oldRoot) => {
    logDebugState(`Root note changed from ${oldRoot} to ${newRoot}`);
  });

  // Watch for settings changes
  watch(finalScaleDegreeSettings, () => {
    logDebugState(`Settings changed`);
  }, { deep: true });

  // Watch for manual settings changes
  watch(manualScaleDegreeSettings, () => {
    logDebugState(`Manual settings changed`);
  }, { deep: true });

  // Log initial state
  setTimeout(() => {
    logDebugState(`Initial store state`);
  }, 100);

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
    scaleDegreeSettings: finalScaleDegreeSettings,
    setScaleDegreeSettings,
    isGuitar,
    setInstrument,
  };
});

export type FretboardStore = ReturnType<typeof useFretboardStore>;
