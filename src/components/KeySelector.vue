<template>
  <div class="key-selector">
    <select v-model="selectedKey" @change="selectNote" class="root-select">
      <option v-for="note in fullNoteNames" :key="note" :value="note">
        {{ note }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import {
  fullNoteNames,
  getSimpleNoteName,
  getFullNoteName,
} from "@/utils/noteUtils";

const store = useFretboardStore();
const { rootNote } = storeToRefs(store);

const selectedKey = ref(getFullNoteName(rootNote.value));

function selectNote() {
  store.setRootNote(getSimpleNoteName(selectedKey.value));
}

watch(rootNote, (newRootNote) => {
  selectedKey.value = getFullNoteName(newRootNote);
});
</script>

<style scoped lang="scss">
.key-selector {
  display: flex;
  justify-content: center;
}

.root-select {
  /* Root Selector */
  width: 44px;
  height: 44px;

  background: var(--shade-10);
  border: none;
  border-radius: 32px;

  font-weight: 600;
  font-size: 18px;
  text-align: center;

  color: var(--shade-70);

  flex: none;
  order: 0;
  flex-grow: 0;

  cursor: pointer;
  transition: background-color 0.2s ease-out;

  &:hover,
  &:focus-visible {
    background-color: var(--shade-20);
    outline: none;
  }
}
</style>
