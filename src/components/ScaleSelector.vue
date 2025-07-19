<template>
  <div class="scale-selector">
    <select v-model="localSelectedScale" @change="updateScale" class="custom-select">
      <template v-for="item in organizedScales" :key="item.key">
        <option v-if="item.isSeparator" disabled="">─────</option>
        <option v-else :value="item.value">{{ item.name }}</option>
      </template>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useFretboardStore } from "@/stores/fretboard";
import { useScales } from "@/composables/useScales";

const store = useFretboardStore();
const { selectedScaleName } = storeToRefs(store);
const { scales } = useScales();

const localSelectedScale = ref(selectedScaleName.value);

// Organize scales with line separators
const organizedScales = computed(() => {
  return [
    // Chromatic
    { key: 'chromatic', value: 'chromatic', name: scales.value.chromatic.name, isSeparator: false },
    
    // Separator
    { key: 'sep1', isSeparator: true },
    
    // Basic Scales
    { key: 'major', value: 'major', name: scales.value.major.name, isSeparator: false },
    { key: 'minor', value: 'minor', name: scales.value.minor.name, isSeparator: false },
    
    // Separator
    { key: 'sep2', isSeparator: true },
    
    // Modal Scales
    { key: 'ionian', value: 'ionian', name: scales.value.ionian.name, isSeparator: false },
    { key: 'dorian', value: 'dorian', name: scales.value.dorian.name, isSeparator: false },
    { key: 'phrygian', value: 'phrygian', name: scales.value.phrygian.name, isSeparator: false },
    { key: 'lydian', value: 'lydian', name: scales.value.lydian.name, isSeparator: false },
    { key: 'mixolydian', value: 'mixolydian', name: scales.value.mixolydian.name, isSeparator: false },
    { key: 'aeolian', value: 'aeolian', name: scales.value.aeolian.name, isSeparator: false },
    { key: 'locrian', value: 'locrian', name: scales.value.locrian.name, isSeparator: false },
    
    // Separator
    { key: 'sep3', isSeparator: true },
    
    // Pentatonic & Blues
    { key: 'major-pentatonic', value: 'major pentatonic', name: scales.value['major pentatonic'].name, isSeparator: false },
    { key: 'minor-pentatonic', value: 'minor pentatonic', name: scales.value['minor pentatonic'].name, isSeparator: false },
    { key: 'blues', value: 'blues', name: scales.value.blues.name, isSeparator: false },
    
    // Separator  
    { key: 'sep4', isSeparator: true },
    
    // Custom
    { key: 'custom', value: 'custom', name: scales.value.custom.name, isSeparator: false }
  ];
});

watch(selectedScaleName, (newValue) => {
  localSelectedScale.value = newValue;
});

function updateScale() {
  store.setSelectedScale(localSelectedScale.value);
}
</script>

<style scoped>
.scale-selector {
}
</style>
