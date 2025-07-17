<template>
  <select
    v-model="selectedInstrument"
    @change="changeInstrument"
    class="instrument-select custom-select"
  >
    <option value="guitar">Guitar</option>
    <option value="bass">Bass</option>
  </select>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";

const store = useFretboardStore();
const { isGuitar } = storeToRefs(store);

const selectedInstrument = ref(isGuitar.value ? "guitar" : "bass");

function changeInstrument() {
  store.setInstrument(selectedInstrument.value === "guitar");
}

watch(isGuitar, (newValue) => {
  selectedInstrument.value = newValue ? "guitar" : "bass";
});
</script>

<style scoped>
.instrument-select {
  width: 112px;
}
</style>
