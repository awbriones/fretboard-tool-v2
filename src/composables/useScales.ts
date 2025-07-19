import { ref } from "vue";
import type { Scale } from "@/types";
import { Scale as TonalScale, Interval } from "@tonaljs/tonal";

export function useScales() {
  // Generate scales using Tonal.js
  const generateScaleFromTonal = (scaleName: string): Scale => {
    const tonalScale = TonalScale.get(`C ${scaleName}`);
    if (tonalScale.empty) {
      // eslint-disable-next-line no-console
      console.error(`Failed to generate scale: "${scaleName}" - Tonal.js returned empty result`);
      return { name: scaleName, intervals: [], intervalNames: [] };
    }
    const intervals = tonalScale.intervals.map((interval) => {
      return Interval.semitones(interval) || 0;
    });
    // Remove "C " from the name and capitalize first letter
    const cleanName = tonalScale.name ? tonalScale.name.replace(/^C\s+/, "") : scaleName;
    const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    return {
      name: capitalizedName,
      intervals,
      intervalNames: tonalScale.intervals,
    };
  };

  // To add new scales:
  // 1. Check if the scale exists in Tonal.js by testing: Scale.get("C <scale_name>")
  // 2. Add it here using generateScaleFromTonal("<scale_name>")
  // 3. The key you use here will appear in the scale selector dropdown
  const scales = ref<Record<string, Scale>>({
    // Chromatic - all notes
    chromatic: {
      name: "Chromatic",
      intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      intervalNames: ["1P", "2m", "2M", "3m", "3M", "4P", "4A", "5P", "6m", "6M", "7m", "7M"]
    },

    // --- SEPARATOR ---

    // Basic scales
    major: generateScaleFromTonal("major"),
    minor: generateScaleFromTonal("minor"),

    // --- SEPARATOR ---

    // All 7 modes
    ionian: { ...generateScaleFromTonal("major"), name: "Ionian" },
    dorian: generateScaleFromTonal("dorian"),
    phrygian: generateScaleFromTonal("phrygian"),
    lydian: generateScaleFromTonal("lydian"),
    mixolydian: generateScaleFromTonal("mixolydian"),
    aeolian: { ...generateScaleFromTonal("minor"), name: "Aeolian" },
    locrian: generateScaleFromTonal("locrian"),

    // --- SEPARATOR ---

    // Pentatonic and Blues
    "major pentatonic": { ...generateScaleFromTonal("major pentatonic"), name: "Major Pentatonic" },
    "minor pentatonic": { ...generateScaleFromTonal("minor pentatonic"), name: "Minor Pentatonic" },
    "blues": { ...generateScaleFromTonal("minor blues"), name: "Blues" },

    // --- SEPARATOR ---

    // Custom scale - user-defined note selection
    custom: {
      name: "Custom",
      intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      intervalNames: ["1P", "2m", "2M", "3m", "3M", "4P", "4A", "5P", "6m", "6M", "7m", "7M"]
    },
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
