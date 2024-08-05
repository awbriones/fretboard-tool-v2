<template>
  <div class="tuning-controls" :class="{ bass: numStrings === 4 }">
    <select
      v-for="(string, index) in reversedLocalTuning"
      :key="index"
      class="tuning-select"
      :value="string"
      @change="(event) => changeTuning(numStrings - 1 - index, (event.target as HTMLSelectElement).value)"
    >
      <option v-for="note in noteNames" :key="note" :value="note">
        {{ note }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  tuning: string[];
  numStrings: number;
  noteNames: string[];
  isGuitar: boolean;
}>();

const emit = defineEmits<{
  (e: "tuning-changed", newTuning: string[]): void;
}>();

const localTuning = ref([...props.tuning]);

const reversedLocalTuning = computed(() => [...localTuning.value].reverse());

watch(
  () => props.tuning,
  (newTuning) => {
    localTuning.value = [...newTuning];
  },
  { immediate: true }
);

function changeTuning(index: number, newValue: string) {
  const newTuning = [...localTuning.value];
  newTuning[index] = newValue;
  emit("tuning-changed", newTuning);
}
</script>

<style scoped>
.tuning-controls {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 56px;
  left: 8px;
  gap: 12px;
}

.tuning-controls.bass {
  top: 69px;
  gap: 34px;
}

.tuning-select {
  padding: 4px;
  font-size: 14px;
  background-color: var(--black-01);
  color: var(--white-01);
  border: 1px solid var(--gray-02);
  width: 40px;
}

select.tuning-select {
  appearance: none;
  /* Remove default styling */
  -webkit-appearance: none;
  /* Remove default styling for WebKit browsers */
  -moz-appearance: none;
  /* Remove default styling for Mozilla browsers */
  height: 32px;
  width: 32px;
  border-radius: 20px;
  background-color: var(--black-02);
  border: 2px solid var(--black-02);
  font-size: 16px;
  font-weight: 600;
  /* Make the text bold */
  color: var(--gray-03);
  text-align: center;
  /* Center the text */
  transition: background-color 0.12s ease-out;
  /* Fix the transition property syntax */
}

select.tuning-select:hover,
select.tuning-select:focus-visible {
  background-color: var(--black-03);
  cursor: pointer;
  border: 2px solid var(--light-12);
  outline: none;
  /* Change cursor to pointer on hover */
}
</style>
