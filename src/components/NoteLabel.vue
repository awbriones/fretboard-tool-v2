<template>
  <div
    class="note-label"
    :class="[
      `note-label--${size}`,
      {
        'note-label--accidental': hasAccidental,
        'note-label--both': isBothMode,
      },
    ]"
  >
    <template v-if="isBothMode">
      <!-- Special handling for "both" mode with two note names -->
      <span class="note-both">{{ displayName }}</span>
    </template>
    <template v-else>
      <!-- Normal single note display -->
      <span class="note-letter">{{ noteLetter }}</span>
      <span
        v-if="accidentalSymbol"
        class="note-accidental"
        :class="{
          'note-accidental--sharp': isSharp,
          'note-accidental--flat': isFlat,
        }"
      >
        {{ accidentalSymbol }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults, defineProps } from "vue";
import {
  getDisplayNoteName,
  parseNoteComponents,
  type AccidentalDisplayMode,
} from "@/utils/noteUtils";

interface Props {
  chromaticIndex: number;
  displayMode?: AccidentalDisplayMode;
  keySignature?: string;
  size?: "small" | "medium" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: "logical",
  size: "medium",
});

const displayName = computed(() => {
  return getDisplayNoteName(
    props.chromaticIndex,
    props.displayMode,
    props.keySignature
  );
});

const noteComponents = computed(() => {
  return parseNoteComponents(displayName.value);
});

const noteLetter = computed(() => {
  return noteComponents.value.letter;
});

const accidentalSymbol = computed(() => {
  const { accidental, isSharp, isFlat } = noteComponents.value;

  if (!accidental) return "";

  // Convert to proper musical symbols
  if (isSharp) {
    return "♯";
  } else if (isFlat) {
    return "♭";
  }

  return accidental;
});

const hasAccidental = computed(() => {
  return !!accidentalSymbol.value;
});

const isSharp = computed(() => {
  return noteComponents.value.isSharp;
});

const isFlat = computed(() => {
  return noteComponents.value.isFlat;
});

const isBothMode = computed(() => {
  return props.displayMode === "both" && displayName.value.includes("/");
});
</script>

<style scoped lang="scss">
.note-label {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  font-family: "Jost", sans-serif;
  font-weight: 600;
  text-align: center;

  // Size variants
  &--small {
    .note-letter {
      font-size: 14px;
      line-height: 1;
    }
    .note-accidental {
      font-size: 10px;
      margin-left: 1px;
    }
    .note-both {
      font-size: 12px;
      line-height: 1;
    }
  }

  &--medium {
    .note-letter {
      font-size: 18px;
      line-height: 1;
    }
    .note-accidental {
      font-size: 12px;
      margin-left: 2px;
    }
    .note-both {
      font-size: 14px;
      line-height: 1;
    }
  }

  &--large {
    .note-letter {
      font-size: 24px;
      line-height: 1;
    }
    .note-accidental {
      font-size: 16px;
      font-weight: bold;
      margin-left: 2px;
    }
    .note-both {
      font-size: 18px;
      line-height: 1;
    }
  }
}

.note-letter {
  font-family: "Jost", sans-serif;
  font-weight: 600;
}

.note-accidental {
  font-family: "Jost", sans-serif;
  font-weight: 400;
  position: relative;
  top: -0.1em; // Slight vertical adjustment for better alignment

  &--sharp {
    // Additional styling for sharp symbols if needed
  }

  &--flat {
    // Additional styling for flat symbols if needed
  }
}

.note-both {
  font-family: "Jost", sans-serif;
  font-weight: 600;
  white-space: nowrap;
}

// When displaying both sharp and flat (e.g., "C#/Db")
.note-label--both {
  // Additional styling for both mode if needed
}
</style>
