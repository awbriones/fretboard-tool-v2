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
    // Modal scales
    major: generateScaleFromTonal("major"),
    minor: generateScaleFromTonal("minor"),
    dorian: generateScaleFromTonal("dorian"),
    phrygian: generateScaleFromTonal("phrygian"),
    lydian: generateScaleFromTonal("lydian"),
    mixolydian: generateScaleFromTonal("mixolydian"),
    locrian: generateScaleFromTonal("locrian"),

    // Pentatonic scales
    "major pentatonic": generateScaleFromTonal("major pentatonic"),
    "minor pentatonic": generateScaleFromTonal("minor pentatonic"),

    // Blues scales
    "minor blues": generateScaleFromTonal("minor blues"),

    // Add more scales here as needed:
    // "harmonic minor": generateScaleFromTonal("harmonic minor"),
    // "melodic minor": generateScaleFromTonal("melodic minor"),
    // "whole tone": generateScaleFromTonal("whole tone"),
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
