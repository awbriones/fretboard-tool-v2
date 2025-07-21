<template>
  <SmartToggleSwitch
    :model-value="isGuitar"
    left-label="Guitar"
    right-label="Bass"
    @update:model-value="changeInstrument"
  />
</template>

<script setup lang="ts">
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import SmartToggleSwitch from "./SmartToggleSwitch.vue";

const store = useFretboardStore();
const { isGuitar } = storeToRefs(store);

function changeInstrument(value: boolean) {
  store.setInstrument(value);
}
</script>
