import { computed } from "vue";
import type { ComputedRef } from "vue";
import { useScales } from "./useScales";
import { getNoteFromInterval, noteNames } from "@/utils/noteUtils";
import type { FretboardNote, ScaleDegree } from "@/types";
import { storeToRefs } from "pinia";
import { useFretboardStore } from "@/stores/fretboard";

export function useFretboard() {
  const { scales } = useScales();
  const store = useFretboardStore();
  const { rootNote, numFrets, tuning, numStrings, selectedScale } = storeToRefs(store);

  const fretboardNotes: ComputedRef<FretboardNote[]> = computed(() => {
    return tuning.value
      .map((stringNote, stringIndex) =>
        Array.from({ length: numFrets.value + 1 }, (_, fret) => {
          const noteName = getNoteFromInterval(stringNote, fret);
          const interval =
            (noteNames.indexOf(noteName) - noteNames.indexOf(rootNote.value) + 12) % 12;
          const scaleDegree: ScaleDegree | null = selectedScale.value.intervals.includes(interval)
            ? {
                degree: selectedScale.value.intervals.indexOf(interval) + 1,
                interval,
                label: (selectedScale.value.intervals.indexOf(interval) + 1).toString(),
              }
            : null;

          return {
            name: noteName,
            value: noteNames.indexOf(noteName),
            interval,
            scaleDegree,
            isColored: !!scaleDegree,
            isDimmed: false,
            isDisplayed: !!scaleDegree,
            string: stringIndex,
            fret,
          } as FretboardNote;
        })
      )
      .flat();
  });

  // New computed property for reversed fretboard notes
  const reversedFretboardNotes: ComputedRef<FretboardNote[]> = computed(() => {
    const reversedNotes = [...fretboardNotes.value];
    const notesPerString = numFrets.value + 1;

    for (let i = 0; i < numStrings.value; i++) {
      const start = i * notesPerString;
      const end = start + notesPerString;
      const stringNotes = reversedNotes.slice(start, end);
      stringNotes.forEach((note) => (note.string = numStrings.value - 1 - i));
      reversedNotes.splice(start, notesPerString, ...stringNotes);
    }

    return reversedNotes;
  });

  return {
    rootNote,
    numFrets,
    numStrings,
    tuning,
    fretboardNotes: reversedFretboardNotes, // Return the reversed notes
  };
}
