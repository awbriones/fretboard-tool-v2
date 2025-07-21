<template>
  <div class="fretboard" ref="fretboardContainer">
    <!-- String labels -->
    <TuningControls
      :tuning="store.tuning"
      :num-strings="store.numStrings"
      :note-names="noteNames"
      :is-guitar="isGuitar"
      :show-tooltip="showTooltip"
      :hide-tooltip="hideTooltip"
      @tuning-changed="handleTuningChanged"
    />

    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      ref="fretboardSvg"
    >
      <!-- Frets -->
      <line
        v-for="(position, index) in fretPositions"
        :key="`fret-${index}`"
        :x1="position"
        :x2="position"
        :y1="margin.top"
        :y2="height - margin.bottom"
        :class="{ nut: index === 0, fret: index > 0 }"
      />

      <!-- Strings -->
      <!-- Strings -->
      <line
        v-for="(_, index) in store.tuning"
        :key="`string-${index}`"
        :x1="margin.left"
        :x2="width - stringPadding"
        :y1="getStringY(store.tuning.length - 1 - index)"
        :y2="getStringY(store.tuning.length - 1 - index)"
        :stroke-width="1 + index / 1.5"
        class="string"
      />

      <!-- Fret markers -->
      <g
        v-for="(position, index) in fretPositions.slice(1)"
        :key="`marker-${index}`"
      >
        <text
          :x="(position + fretPositions[index]) / 2"
          :y="margin.top / 2"
          alignment-baseline="middle"
          class="fret-number-label"
        >
          {{ index + 1 }}
        </text>
        <circle
          v-if="[3, 5, 7, 9, 15, 17, 19, 21].includes(index + 1)"
          :cx="(position + fretPositions[index]) / 2"
          :cy="height - margin.bottom / 2"
          r="5"
          class="fret-marker"
        />
        <g v-if="index + 1 === 12">
          <circle
            :cx="(position + fretPositions[index]) / 2 - 8"
            :cy="height - margin.bottom / 2"
            r="5"
            class="fret-marker"
          />
          <circle
            :cx="(position + fretPositions[index]) / 2 + 8"
            :cy="height - margin.bottom / 2"
            r="5"
            class="fret-marker"
          />
        </g>
      </g>

      <!-- Notes -->
      <transition-group name="note-marker">
        <g
          v-for="note in visibleNotes"
          :key="`position-${note.fret}-${note.string}-${selectedScaleName}`"
          class="note-marker"
          :class="{ 'hover-active': hoveredNoteId === note.id }"
          :style="{ opacity: hoveredNoteId === note.id ? 0 : 1 }"
        >
          <!-- Background circle with stroke -->
          <circle
            :cx="getX(note.fret)"
            :cy="getY(note.string)"
            r="24"
            :fill="getBackgroundColor(note)"
            stroke="none"
          />
          <!-- Foreground circle with fill -->
          <circle
            :cx="getX(note.fret)"
            :cy="getY(note.string)"
            r="20"
            :fill="getNoteColor(note)"
            stroke="none"
          />
          <svg
            :x="getX(note.fret) - 20"
            :y="getY(note.string) - 20"
            width="40"
            height="40"
            :viewBox="getNoteSvg(note).viewBox"
          >
            <path
              v-for="(path, index) in getNoteSvg(note).paths"
              :key="index"
              :d="path.d"
              :fill="getTextColor(note)"
              :fill-rule="path.fillRule"
              :clip-rule="path.clipRule"
            />
          </svg>
        </g>
      </transition-group>

      <!-- Hovered note layer (renders on top) -->
      <g
        v-if="hoveredNoteId"
        :key="`hovered-${hoveredNoteId}`"
        class="note-marker hover-active"
      >
        <template v-for="note in visibleNotes" :key="note.id">
          <template v-if="note.id === hoveredNoteId">
            <!-- Background circle with stroke -->
            <circle
              :cx="getX(note.fret)"
              :cy="getY(note.string)"
              r="24"
              :fill="getBackgroundColor(note)"
              stroke="none"
            />
            <!-- Foreground circle with fill -->
            <circle
              :cx="getX(note.fret)"
              :cy="getY(note.string)"
              r="20"
              :fill="getNoteColor(note)"
              stroke="none"
            />
            <svg
              :x="getX(note.fret) - 20"
              :y="getY(note.string) - 20"
              width="40"
              height="40"
              :viewBox="getNoteSvg(note).viewBox"
            >
              <path
                v-for="(path, index) in getNoteSvg(note).paths"
                :key="index"
                :d="path.d"
                :fill="getTextColor(note)"
                :fill-rule="path.fillRule"
                :clip-rule="path.clipRule"
              />
            </svg>
          </template>
        </template>
      </g>

      <!-- Interactive areas for all fret positions (rendered on top) -->
      <g
        v-for="note in fretboardNotes"
        :key="`interactive-${note.id}`"
        class="interactive-marker"
      >
        <rect
          :x="getInteractiveX(note.fret)"
          :y="getInteractiveY(note.string)"
          :width="getInteractiveWidth(note.fret)"
          :height="cellHeight"
          fill="transparent"
          class="interactive-area"
          @click="handleNoteClick(note)"
          @mouseover="handleNoteHover(note, true)"
          @mouseout="handleNoteHover(note, false)"
        />
      </g>
    </svg>

    <!-- Fretboard Tooltip -->
    <TooltipContainer
      :visible="fretboardTooltipState.visible"
      :content="fretboardTooltipState.content"
      :x="fretboardTooltipState.x"
      :y="fretboardTooltipState.y"
      :prevent-hover="true"
    >
      <template #content="{ data }">
        <FretboardTooltipContent
          v-if="data && typeof data === 'object' && 'noteName' in data"
          :data="data as any"
        />
      </template>
    </TooltipContainer>

    <!-- Simple Tooltip for Tuning Controls -->
    <TooltipContainer
      :visible="simpleTooltipState.visible"
      :content="simpleTooltipState.content"
      :x="simpleTooltipState.x"
      :y="simpleTooltipState.y"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import type { FretboardNote } from "@/types";
import TuningControls from "./TuningControls.vue";
import TooltipContainer from "./TooltipContainer.vue";
import FretboardTooltipContent from "./FretboardTooltipContent.vue";
import { noteNames } from "@/utils/noteUtils";
import { svgPaths } from "@/utils/svgPaths";
import {
  useFretboardTooltip,
  createNoteTooltipContent,
} from "@/composables/useFretboardTooltip";
import { useSimpleTooltip } from "@/composables/useSimpleTooltip";

// Component gets isScaleDegree from store - no props needed

const store = useFretboardStore();
const {
  scaleDegreeSettings,
  isScaleDegree,
  numFrets,
  fretboardNotes,
  isGuitar,
  selectedScaleName,
} = storeToRefs(store);

// Track notes for delayed removal during exit animations
const notesToShow = ref(new Set<string>());
const exitTimeouts = ref(new Map<string, number>());

function getZIndex(note: FretboardNote) {
  // Base z-index: lower frets (closer to nut) have higher z-index
  // Fret 0 (open) = 100, fret 1 = 99, fret 2 = 98, etc.
  const baseZIndex = 100 - note.fret;

  return baseZIndex;
}

// Compute which notes should be visible based on current settings
const shouldBeVisible = computed(() => {
  const noteIds = new Set<string>();
  fretboardNotes.value.forEach((note) => {
    const chromaticIndex = note.interval % 12;
    if (scaleDegreeSettings.value[chromaticIndex]?.show) {
      noteIds.add(note.id);
    }
  });
  return noteIds;
});

// Watch for visibility changes and handle exit timing
watch(
  shouldBeVisible,
  (newVisibleIds, oldVisibleIds) => {
    if (!oldVisibleIds) {
      // Initial load - add all visible notes immediately
      newVisibleIds.forEach((id) => notesToShow.value.add(id));
      return;
    }

    // Find notes that should start entering
    const entering = new Set(
      [...newVisibleIds].filter((id) => !oldVisibleIds.has(id))
    );

    // Find notes that should start exiting
    const exiting = new Set(
      [...oldVisibleIds].filter((id) => !newVisibleIds.has(id))
    );

    // Add entering notes immediately
    entering.forEach((id) => {
      notesToShow.value.add(id);
      // Cancel any pending exit
      const existingTimeout = exitTimeouts.value.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        exitTimeouts.value.delete(id);
      }
    });

    // Handle exiting notes with delay
    exiting.forEach((id) => {
      const timeoutId = setTimeout(() => {
        notesToShow.value.delete(id);
        exitTimeouts.value.delete(id);
      }, 300); // Match CSS transition duration
      exitTimeouts.value.set(id, timeoutId);
    });
  },
  { immediate: true }
);

// Final visible notes list including those currently exiting, sorted by z-index priority
const visibleNotes = computed(() => {
  const filtered = fretboardNotes.value.filter((note) =>
    notesToShow.value.has(note.id)
  );

  // Sort by z-index priority (higher z-index last, so they render on top)
  return filtered.sort((a, b) => {
    const aZIndex = getZIndex(a);
    const bZIndex = getZIndex(b);
    return bZIndex - aZIndex; // Reversed: higher values come last
  });
});

const fretboardContainer = ref<HTMLDivElement | null>(null);
const fretboardSvg = ref<SVGSVGElement | null>(null);
const hoveredNoteId = ref<string | null>(null);

// Initialize fretboard tooltip system
const {
  state: fretboardTooltipState,
  updateContent,
  initializeFretboard,
} = useFretboardTooltip();

// Initialize simple tooltip system for tuning controls
const {
  state: simpleTooltipState,
  showTooltip,
  hideTooltip,
} = useSimpleTooltip();

const margin = { top: 48, right: 20, bottom: 40, left: 56 };
const width = ref(1000);
const height = ref(375);

// Configurable padding controls
const stringPadding = ref(24); // Distance from right edge to string ends
const fretPadding = ref(28); // Distance from right edge to 15th fret (allows space for notes)

const updateDimensions = () => {
  if (fretboardContainer.value) {
    width.value = fretboardContainer.value.clientWidth;
    height.value = fretboardContainer.value.clientHeight;
  }
};

onMounted(() => {
  updateDimensions();
  window.addEventListener("resize", updateDimensions);

  // Initialize tooltip system
  if (fretboardContainer.value) {
    initializeFretboard(fretboardContainer.value);
  }
});

// Reinitialize tooltip system when instrument changes
watch(
  () => store.numStrings,
  () => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      if (fretboardContainer.value) {
        initializeFretboard(fretboardContainer.value);
      }
    }, 50);
  }
);

onUnmounted(() => {
  window.removeEventListener("resize", updateDimensions);
  // Clean up any pending timeouts
  exitTimeouts.value.forEach((timeoutId) => clearTimeout(timeoutId));
  exitTimeouts.value.clear();
});

const cellHeight = computed(
  () => (height.value - margin.top - margin.bottom) / store.tuning.length
);

const fretPositions = computed(() => {
  const scaleLength = width.value - margin.left - fretPadding.value;
  //const rule = 17.817; // This is closer to the standard rule for fret positioning
  const rule = 17.817; // This is closer to the standard rule for fret positioning

  let totalLength = 0;
  let fretLength = scaleLength;
  for (let i = 0; i < numFrets.value; i++) {
    const fretSpacing = fretLength / rule;
    totalLength += fretSpacing;
    fretLength -= fretSpacing;
  }

  const scalingFactor = scaleLength / totalLength;
  const positions: number[] = [];
  let adjustedFretLength = scaleLength * scalingFactor;

  for (let i = 0; i <= numFrets.value; i++) {
    const adjustedFretSpacing = adjustedFretLength / rule;
    adjustedFretLength -= adjustedFretSpacing;

    if (i === 0) {
      positions.push(margin.left + 48); // 48 = nut offset, added to left margin
    } else {
      positions.push(positions[i - 1] + adjustedFretSpacing);
    }
  }

  return positions;
});

function getX(fret: number) {
  if (fret === 0) {
    // For open strings, position to the left of the nut
    return fretPositions.value[0] - 28; // was originally - cellHeight.value / 2
  } else {
    // For fretted notes, position in the center of the fret
    return (fretPositions.value[fret - 1] + fretPositions.value[fret]) / 2;
  }
}

function getY(string: number) {
  return (
    height.value -
    margin.bottom -
    cellHeight.value * string -
    cellHeight.value / 2
  );
}

function getStringY(index: number) {
  return (
    height.value -
    margin.bottom -
    cellHeight.value * index -
    cellHeight.value / 2
  );
}

function getNoteColor(note: FretboardNote) {
  // Use chromatic interval (0-11) for indexing into the 12-note settings
  const chromaticIndex = note.interval % 12;
  const setting = scaleDegreeSettings.value[chromaticIndex];

  if (!setting || !setting.show) return "transparent";

  if (!setting.color) {
    // Notes shown, not colored: bright = shade-60 bg, dim = shade-30 bg
    return setting.bright ? "var(--shade-60)" : "var(--shade-30)";
  }

  const colorIndex = note.interval % 12;
  return setting.bright
    ? `var(--color-${colorIndex})`
    : `var(--color-${colorIndex}-dimmed)`;
}

function getBackgroundColor(note: FretboardNote) {
  // Use chromatic interval (0-11) for indexing into the 12-note settings
  const chromaticIndex = note.interval % 12;
  const setting = scaleDegreeSettings.value[chromaticIndex];

  if (!setting || !setting.show) return "transparent";

  return "var(--shade-20)";
}

function getTextColor(note: FretboardNote) {
  // Use chromatic interval (0-11) for indexing into the 12-note settings
  const chromaticIndex = note.interval % 12;
  const setting = scaleDegreeSettings.value[chromaticIndex];

  if (!setting || !setting.show) return "transparent";

  if (!setting.color) {
    // Notes shown, not colored: bright = shade-10 text, dim = shade-60 text
    return setting.bright ? "var(--shade-10)" : "var(--shade-60)";
  }

  return setting.bright ? "var(--shade-20)" : "var(--light-48)";
}

const getNoteSvg = computed(() => (note: FretboardNote) => {
  if (isScaleDegree.value) {
    return svgPaths[`degree_${note.interval.toString().padStart(2, "0")}`];
  } else {
    const noteIndex =
      (noteNames.indexOf(note.name) - noteNames.indexOf("C") + 12) % 12;
    return svgPaths[`note_${noteIndex.toString().padStart(2, "0")}`];
  }
});

//not 100 sure about this
// const isGuitar = computed(() => store.numStrings === 6);

function handleTuningChanged(newTuning: string[]) {
  store.setTuning(newTuning);
}

function handleNoteClick(note: FretboardNote) {
  // Set the clicked note as the new root note
  store.setRootNote(note.name);
}

function getInteractiveX(fret: number) {
  if (fret === 0) {
    // Open string: start from left margin
    return margin.left;
  } else {
    // Fretted note: start from previous fret position
    return fretPositions.value[fret - 1];
  }
}

function getInteractiveY(string: number) {
  // Center the interactive area on the string
  return getY(string) - cellHeight.value / 2;
}

function getInteractiveWidth(fret: number) {
  if (fret === 0) {
    // Open string: width from left margin to first fret
    return fretPositions.value[0] - margin.left;
  } else {
    // Fretted note: width between current and previous fret
    return fretPositions.value[fret] - fretPositions.value[fret - 1];
  }
}

function handleNoteHover(note: FretboardNote, isHovered: boolean) {
  if (isHovered) {
    hoveredNoteId.value = note.id;

    // Show tooltip content
    const chromaticIndex = note.interval % 12;
    const setting = scaleDegreeSettings.value[chromaticIndex];

    if (setting?.show) {
      // Note is visible - show full tooltip
      const tooltipContent = createNoteTooltipContent({
        noteName: note.name,
        scaleDegree: isScaleDegree.value ? note.interval : undefined,
        fret: note.fret,
        string: note.string,
        instruction: "Click to change root note",
      });
      updateContent(tooltipContent);
    } else {
      // Note is not visible - show simple instruction
      const tooltipContent = createNoteTooltipContent({
        noteName: note.name,
        fret: note.fret,
        string: note.string,
        instruction: "Click to change root note",
      });
      updateContent(tooltipContent);
    }
  } else {
    hoveredNoteId.value = null;
    // Don't hide tooltip immediately - let the area-based logic handle it
  }
}
</script>

<style scoped>
.fretboard {
  /* Only component-specific styles here - inherits global styles */
  min-width: 900px;
  width: 100%;
  height: 360px;
  padding-bottom: 12px;
  padding-top: 4px;
}

.nut {
  stroke: var(--shade-70);
  stroke-width: 2;
}

.fret {
  stroke: var(--shade-50);
  stroke-width: 2;
}

.string {
  stroke: var(--shade-70);
}

.fret-number-label {
  font-size: 16px;
  font-weight: 600;
  text-anchor: middle;
  fill: var(--shade-60);
}

.fret-marker {
  fill: var(--shade-60);
}

.note-circle {
  fill: var(--shade-40);
  transition: all 0.12s ease-out;
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(1);
  opacity: 1;
}

.note-label {
  fill: var(--shade-70);
  font-size: 18px;
  font-weight: 600;
  text-anchor: middle;
  user-select: none;
  pointer-events: none;
}

.note-label * {
  fill: inherit;
}

.dimmed .note-label {
  fill: var(--light-48);
}

g.note-circle:hover {
  transform: scale(1.12);
  filter: brightness(1.12);
}

g.note-circle:active {
  transform: scale(1);
}

/* animation stuff */

.note-marker {
  transform-box: border-box;
  transform-origin: center;
  /* transition: transform 2.2s ease-out, opacity 2.2s ease-out; */
}

.note-marker-enter-active,
.note-marker-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.note-marker-enter-from,
.note-marker-leave-to {
  transform: scale(0.1);
  opacity: 0;
}

.note-marker-enter-to,
.note-marker-leave-from {
  transform: scale(1);
  opacity: 1;
}

.note-marker circle {
  transform-box: border-box;
  transform-origin: center;
  transition: fill 0.3s ease-out;
}

.note-marker svg {
  transition: opacity 0.3s ease-out;
}

.note-marker svg path {
  transition: fill 0.3s ease-out;
}

/* Interactive markers for all fret positions */
.interactive-marker {
  cursor: pointer;
}

.interactive-area {
  /* Debug: uncomment to see interactive areas */
  /* fill: rgba(255, 0, 0, 0.1) !important; */
}

/* Hover effects on visible notes only */
.note-marker.hover-active circle:first-child {
  /* transform: scale(0.958); */
  stroke: var(--shade-60);
  stroke-width: 2px;
  transition: all 0.9s ease;
}

.note-marker {
  transition: transform 0.15s ease-out;
  transform-origin: center;
}
</style>
