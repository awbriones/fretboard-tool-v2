<template>
  <div class="scale-selector">
    <select v-model="localSelectedScale" @change="updateScale" class="custom-select">
      <option v-for="(scale, name) in scales" :key="name" :value="name">
        {{ rootNote }} {{ scale.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useFretboardStore } from "@/stores/fretboard";
import { useScales } from "@/composables/useScales";

const store = useFretboardStore();
const { rootNote, selectedScaleName } = storeToRefs(store);
const { scales } = useScales();

const localSelectedScale = ref(selectedScaleName.value);

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
