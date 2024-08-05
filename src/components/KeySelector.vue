<template>
  <div class="key-selector">
    <select v-model="selectedKey" @change="selectNote" class="custom-select">
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
import { fullNoteNames, getSimpleNoteName, getFullNoteName } from "@/utils/noteUtils";

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

.custom-select {
  //width: 80px; // Adjust this value as needed
}
</style>
