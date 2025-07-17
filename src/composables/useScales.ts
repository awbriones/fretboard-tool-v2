import { ref } from "vue";
import type { Scale } from "@/types";
import { Scale as TonalScale, distance } from "@tonaljs/tonal";

export function useScales() {
  // Generate scales using Tonal.js
  const generateScaleFromTonal = (scaleName: string): Scale => {
    const tonalScale = TonalScale.get(`C ${scaleName}`);
    const intervals = tonalScale.notes.map((note) => {
      const semitones = distance("C", note);
      return typeof semitones === "number" ? semitones : 0;
    });
    return {
      name: tonalScale.name || scaleName,
      intervals,
    };
  };

  const scales = ref<Record<string, Scale>>({
    major: generateScaleFromTonal("major"),
    minor: generateScaleFromTonal("minor"),
    dorian: generateScaleFromTonal("dorian"),
    phrygian: generateScaleFromTonal("phrygian"),
    lydian: generateScaleFromTonal("lydian"),
    mixolydian: generateScaleFromTonal("mixolydian"),
    locrian: generateScaleFromTonal("locrian"),
    // Custom scales that might not be in Tonal.js
    pentatonic: { name: "Pentatonic", intervals: [0, 2, 4, 7, 9] },
    blues: { name: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
  });

  // const selectedScale = ref("major");

  // const currentScale = computed(() => scales.value[selectedScale.value]);

  // function setSelectedScale(scaleName: string) {
  //   if (scaleName in scales.value) {
  //     selectedScale.value = scaleName;
  //   } else {
  //     console.error(`Scale "${scaleName}" not found`);
  //   }
  // }

  return {
    scales,
    // selectedScale,
    // currentScale,
    // setSelectedScale,
  };
}
