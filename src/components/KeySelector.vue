<template>
  <div
    class="key-selector"
    :class="{ 'key-selector--open': isOpen }"
    ref="selectorRef"
  >
    <!-- Closed state trigger button -->
    <button
      v-if="!isOpen"
      class="root-selector-trigger"
      :aria-label="`Root note: ${currentRootNote}. Click to open key selector`"
      @click.stop="openSelector"
      @mousedown.stop
      @keydown="handleTriggerKeydown"
    >
      <NoteLabel
        :chromatic-index="currentRootIndex"
        :display-mode="accidentalDisplayMode"
        :key-signature="currentRootNote"
        size="medium"
      />
    </button>

    <!-- Open state piano layout -->
    <div
      v-if="isOpen"
      class="root-selector-open"
      role="listbox"
      :aria-label="'Select root note'"
      @keydown="handleKeyboardNavigation"
    >
      <!-- White keys (natural notes) -->
      <div class="white-keys">
        <button
          v-for="note in whiteKeys"
          :key="`white-${note.name}`"
          class="piano-key piano-key--white"
          :class="{
            'piano-key--selected': note.name === currentRootNote,
            'piano-key--focused': focusedKeyIndex === note.chromaticIndex,
          }"
          :style="{ left: `${note.position}px` }"
          :aria-label="`${note.name} key`"
          :aria-selected="note.name === currentRootNote"
          role="option"
          @click="selectKey(note.name)"
          @focus="focusedKeyIndex = note.chromaticIndex"
          @blur="handleBlur"
        >
          <NoteLabel
            :chromatic-index="note.chromaticIndex"
            :display-mode="accidentalDisplayMode"
            :key-signature="currentRootNote"
            size="medium"
          />
        </button>
      </div>

      <!-- Black keys (accidentals) -->
      <div class="black-keys">
        <button
          v-for="note in blackKeys"
          :key="`black-${note.name}`"
          class="piano-key piano-key--black"
          :class="{
            'piano-key--selected': note.name === currentRootNote,
            'piano-key--focused': focusedKeyIndex === note.chromaticIndex,
          }"
          :style="{ left: `${note.position}px` }"
          :aria-label="`${note.name} key`"
          :aria-selected="note.name === currentRootNote"
          role="option"
          @click="selectKey(note.name)"
          @focus="focusedKeyIndex = note.chromaticIndex"
          @blur="handleBlur"
        >
          <NoteLabel
            :chromatic-index="note.chromaticIndex"
            :display-mode="accidentalDisplayMode"
            :key-signature="currentRootNote"
            size="small"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import { sharpNoteNames } from "@/utils/noteUtils";
import NoteLabel from "./NoteLabel.vue";

const store = useFretboardStore();
const { rootNote, accidentalDisplayMode } = storeToRefs(store);

const isOpen = ref(false);
const focusedKeyIndex = ref(0);
const selectorRef = ref<HTMLElement>();

const currentRootNote = computed(() => rootNote.value);
const currentRootIndex = computed(() =>
  sharpNoteNames.indexOf(currentRootNote.value)
);

// Piano key layout data based on Figma design
const whiteKeys = computed(() => [
  { name: "C", chromaticIndex: 0, position: 8 },
  { name: "D", chromaticIndex: 2, position: 52 },
  { name: "E", chromaticIndex: 4, position: 96 },
  { name: "F", chromaticIndex: 5, position: 140 },
  { name: "G", chromaticIndex: 7, position: 184 },
  { name: "A", chromaticIndex: 9, position: 228 },
  { name: "B", chromaticIndex: 11, position: 272 },
]);

const blackKeys = computed(() => [
  { name: "C#", chromaticIndex: 1, position: 32 }, // Between C and D
  { name: "D#", chromaticIndex: 3, position: 76 }, // Between D and E
  { name: "F#", chromaticIndex: 6, position: 162 }, // Between F and G
  { name: "G#", chromaticIndex: 8, position: 206 }, // Between G and A
  { name: "A#", chromaticIndex: 10, position: 250 }, // Between A and B
]);

const allKeys = computed(() =>
  [...whiteKeys.value, ...blackKeys.value].sort(
    (a, b) => a.chromaticIndex - b.chromaticIndex
  )
);

function openSelector() {
  console.log("openSelector called"); // Debug log
  isOpen.value = true;
  focusedKeyIndex.value = currentRootIndex.value;

  // Focus the selected key after opening
  nextTick(() => {
    const selectedKey = selectorRef.value?.querySelector(
      ".piano-key--selected"
    ) as HTMLElement;
    if (selectedKey) {
      selectedKey.focus();
    }
  });
}

function closeSelector() {
  isOpen.value = false;
  focusedKeyIndex.value = 0;
}

function selectKey(noteName: string) {
  store.setRootNote(noteName);
  closeSelector();
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openSelector();
  }
}

function handleKeyboardNavigation(event: KeyboardEvent) {
  switch (event.key) {
    case "Escape":
      event.preventDefault();
      closeSelector();
      break;

    case "Enter":
    case " ": {
      event.preventDefault();
      const focusedKey = allKeys.value.find(
        (key) => key.chromaticIndex === focusedKeyIndex.value
      );
      if (focusedKey) {
        selectKey(focusedKey.name);
      }
      break;
    }

    case "ArrowLeft":
      event.preventDefault();
      moveFocus(-1);
      break;

    case "ArrowRight":
      event.preventDefault();
      moveFocus(1);
      break;

    case "Home":
      event.preventDefault();
      focusedKeyIndex.value = 0;
      focusKeyAtIndex(0);
      break;

    case "End":
      event.preventDefault();
      focusedKeyIndex.value = 11;
      focusKeyAtIndex(11);
      break;
  }
}

function moveFocus(direction: number) {
  const currentIndex = allKeys.value.findIndex(
    (key) => key.chromaticIndex === focusedKeyIndex.value
  );
  const newIndex = Math.max(
    0,
    Math.min(allKeys.value.length - 1, currentIndex + direction)
  );
  const newKey = allKeys.value[newIndex];

  if (newKey) {
    focusedKeyIndex.value = newKey.chromaticIndex;
    focusKeyAtIndex(newKey.chromaticIndex);
  }
}

function focusKeyAtIndex(chromaticIndex: number) {
  nextTick(() => {
    const keyButton = selectorRef.value?.querySelector(
      `[aria-label*="${sharpNoteNames[chromaticIndex]}"]`
    ) as HTMLElement;
    if (keyButton) {
      keyButton.focus();
    }
  });
}

function handleBlur() {
  // Only close if focus is moving outside the entire selector
  setTimeout(() => {
    if (
      selectorRef.value &&
      !selectorRef.value.contains(document.activeElement)
    ) {
      closeSelector();
    }
  }, 0);
}

function handleClickOutside(event: MouseEvent) {
  if (
    isOpen.value &&
    selectorRef.value &&
    !selectorRef.value.contains(event.target as Node)
  ) {
    closeSelector();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Watch for root note changes from external sources
watch(rootNote, () => {
  focusedKeyIndex.value = currentRootIndex.value;
});
</script>

<style scoped lang="scss">
.key-selector {
  position: relative;
  width: 44px; // Closed state width
  height: 44px; // Closed state height

  &--open {
    width: 320px;
    height: 83px;
    z-index: 1000; // Ensure it appears above other elements
  }
}

.root-selector-trigger {
  /* Closed state styling - matches current design */
  width: 44px;
  height: 44px;

  background: var(--shade-10);
  border: none;
  border-radius: 32px;

  font-weight: 600;
  font-size: 18px;
  text-align: center;

  color: var(--shade-70);

  cursor: pointer;
  transition: background-color 0.2s ease-out;

  display: flex;
  align-items: center;
  justify-content: center;

  // Ensure all child elements don't interfere with click events
  * {
    pointer-events: none;
  }

  &:hover,
  &:focus-visible {
    outline: 2px solid var(--light-24);
    outline: none;
  }
}

.root-selector-open {
  /* Open state container */
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border: 1px solid var(--shade-30);
  background: #141414ad;
  border-radius: 28px;
  backdrop-filter: blur(12px);

  &:focus-visible {
    outline: 2px solid var(--light-24);
    outline-offset: 2px;
  }
}

.white-keys,
.black-keys {
  position: relative;
  width: 100%;
  height: 100%;
}

.piano-key {
  position: absolute;
  border: none;
  border-radius: 117.544px; // From Figma design
  cursor: pointer;
  transition: all 0.2s ease-out;

  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid var(--light-48);
    outline-offset: 2px;
  }

  &--white {
    width: 40px;
    height: 67px;
    top: 8px;
    background: var(--shade-70); // Default white key color
    color: var(--shade-10);

    .note-label {
      position: absolute;
      top: 38px;
    }

    &:hover:not(.piano-key--selected) {
      background: var(--shade-60);
    }

    &.piano-key--selected {
      background: var(--color-0); // Root color (red)
      color: var(--shade-10);
    }
  }

  &--black {
    width: 40px;
    height: 40px;
    top: -78px;
    background: var(--shade-20); // Default black key color
    color: var(--shade-70);
    z-index: 10; // Black keys appear above white keys

    &:hover:not(.piano-key--selected) {
      background: var(--shade-30);
    }

    &.piano-key--selected {
      background: var(--color-0); // Root color (red)
      color: var(--shade-10);
    }
  }

  // Additional focused styling can be added here if needed
}
</style>
