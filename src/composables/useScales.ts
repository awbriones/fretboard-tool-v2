import { ref } from "vue";
import type { Scale } from "@/types";

export function useScales() {
  const scales = ref<Record<string, Scale>>({
    major: { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
    minor: { name: "Minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
    pentatonic: { name: "Pentatonic", intervals: [0, 3, 5, 7, 10] },
    blues: { name: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
    dorian: { name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
    mixolydian: { name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10] },
    phrygian: { name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
    locrian: { name: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10] },
    // Add other scales here
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
