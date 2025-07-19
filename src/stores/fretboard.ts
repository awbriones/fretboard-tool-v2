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
  switchToCustomMode: () => void;
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
    const currentScale = selectedScale.value;
    const scaleIntervals = currentScale?.intervals || [];
    
    // Special handling for chromatic mode
    if (currentScale.name === "Chromatic") {
      return Array.from({ length: 12 }, (_, chromaticIndex) => {
        if (chromaticIndex === 0) {
          // Root note: bright + colored
          return { show: true, color: true, bright: true };
        } else {
          // All other notes: bright but not colored
          return { show: true, color: false, bright: true };
        }
      });
    }
    
    // Standard scale logic for all other scales
    return Array.from({ length: 12 }, (_, chromaticIndex) => {
      const isInScale = scaleIntervals.includes(chromaticIndex);
      
      if (!isInScale) {
        // Not in scale: hide the note
        return { show: false, color: false, bright: false };
      }
      
      // Note is in scale: apply styling based on harmonic function
      if (chromaticIndex === 0) {
        // Root note: always bright + colored
        return { show: true, color: true, bright: true };
      } else if (chromaticIndex === 3 || chromaticIndex === 4) {
        // Minor 3rd or Major 3rd: bright + colored
        return { show: true, color: true, bright: true };
      } else if (chromaticIndex === 7) {
        // Perfect 5th: bright + colored
        return { show: true, color: true, bright: true };
      } else if (chromaticIndex === 10 || chromaticIndex === 11) {
        // Minor 7th or Major 7th: bright but not colored
        return { show: true, color: false, bright: true };
      } else {
        // Other scale degrees: default in-scale styling
        return { show: true, color: false, bright: false };
      }
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
      // If switching TO Custom mode manually, preserve current settings
      if (scaleName === 'custom' && manualScaleDegreeSettings.value.length === 0) {
        // Save current computed settings as manual settings to preserve them
        manualScaleDegreeSettings.value = [...scaleDegreeSettings.value];
      }
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

  function switchToCustomMode() {
    // Just switch the dropdown to "Custom" without changing any settings
    if (selectedScaleName.value !== 'custom') {
      selectedScaleName.value = 'custom';
      logDebugState(`Auto-switched to Custom mode (label only)`);
    }
  }


  // Clear manual settings when scale changes (but NOT when switching to/from Custom)
  watch(selectedScaleName, (newScale, oldScale) => {
    // Don't clear manual settings when switching to Custom mode
    if (newScale !== 'custom') {
      manualScaleDegreeSettings.value = [];
    }
    logDebugState(`Scale changed from ${oldScale} to ${newScale}`);
  });

  // Use manual settings if they exist (always 12 for new system), otherwise use computed defaults
  const finalScaleDegreeSettings = computed(() => {
    // Always expect 12 chromatic settings
    if (manualScaleDegreeSettings.value.length === 12) {
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
    switchToCustomMode,
    isGuitar,
    setInstrument,
  };
});

export type FretboardStore = ReturnType<typeof useFretboardStore>;
