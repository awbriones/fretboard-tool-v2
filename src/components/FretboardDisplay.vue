<template>
  <div class="fretboard" ref="fretboardContainer">
    <!-- String labels -->
    <TuningControls
      :tuning="store.tuning"
      :num-strings="store.numStrings"
      :note-names="noteNames"
      :is-guitar="isGuitar"
      @tuning-changed="handleTuningChanged"
    />

    <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" ref="fretboardSvg">
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
      <g v-for="(position, index) in fretPositions.slice(1)" :key="`marker-${index}`">
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
        <g v-for="note in visibleNotes" :key="note.id" class="note-marker" :class="{ 'hover-active': hoveredNoteId === note.id }">
          <circle :cx="getX(note.fret)" :cy="getY(note.string)" r="20" :fill="getNoteColor(note)" />
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

      <!-- Interactive areas for all fret positions (rendered on top) -->
      <g v-for="note in fretboardNotes" :key="`interactive-${note.id}`" class="interactive-marker">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import type { FretboardNote } from "@/types";
import TuningControls from "./TuningControls.vue";
import { noteNames } from "@/utils/noteUtils";
import { svgPaths } from "@/utils/svgPaths";

// Component gets isScaleDegree from store - no props needed

const visibleNotes = computed(() =>
  fretboardNotes.value.filter(
    (note) => {
      // Use chromatic interval (0-11) for indexing into the 12-note settings
      const chromaticIndex = note.interval % 12;
      return scaleDegreeSettings.value[chromaticIndex]?.show || false;
    }
  )
);
1;

const store = useFretboardStore();
const {
  scaleDegreeSettings,
  isScaleDegree,
  numFrets,
  fretboardNotes,
  isGuitar,
} = storeToRefs(store);

const fretboardContainer = ref<HTMLDivElement | null>(null);
const fretboardSvg = ref<SVGSVGElement | null>(null);
const hoveredNoteId = ref<string | null>(null);

const margin = { top: 64, right: 20, bottom: 30, left: 56 };
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
});

onUnmounted(() => {
  window.removeEventListener("resize", updateDimensions);
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
  return height.value - margin.bottom - cellHeight.value * string - cellHeight.value / 2;
}

function getStringY(index: number) {
  return height.value - margin.bottom - cellHeight.value * index - cellHeight.value / 2;
}

function getNoteColor(note: FretboardNote) {
  // Use chromatic interval (0-11) for indexing into the 12-note settings
  const chromaticIndex = note.interval % 12;
  const setting = scaleDegreeSettings.value[chromaticIndex];
  
  if (!setting || !setting.show) return "transparent";

  if (!setting.color) {
    return setting.bright ? "var(--gray-01)" : "var(--black-03)";
  }

  const colorIndex = note.interval % 12;
  return setting.bright ? `var(--color-${colorIndex})` : `var(--color-${colorIndex}-dimmed)`;
}

function getTextColor(note: FretboardNote) {
  // Use chromatic interval (0-11) for indexing into the 12-note settings
  const chromaticIndex = note.interval % 12;
  const setting = scaleDegreeSettings.value[chromaticIndex];
  
  if (!setting || !setting.show) return "transparent";

  if (!setting.color) {
    return setting.bright ? "var(--white-01)" : "var(--light-24)";
  }

  return setting.bright ? "var(--black-02)" : "var(--light-48)";
}

const getNoteSvg = computed(() => (note: FretboardNote) => {
  if (isScaleDegree.value) {
    return svgPaths[`degree_${note.interval.toString().padStart(2, "0")}`];
  } else {
    const noteIndex = (noteNames.indexOf(note.name) - noteNames.indexOf("C") + 12) % 12;
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
  } else {
    hoveredNoteId.value = null;
  }
}
</script>

<style scoped>
.fretboard {
  background: var(--black-02);
  border-radius: 24px;
  min-width: 900px;
  width: 100%;
  height: 375px;
  padding-bottom: 12px;
}

.nut {
  stroke: var(--white-01);
  stroke-width: 2;
}

.fret {
  stroke: var(--gray-02);
  stroke-width: 2;
}

.string {
  stroke: var(--white-01);
}

.fret-number-label {
  font-size: 16px;
  font-weight: 600;
  text-anchor: middle;
  fill: var(--gray-03);
}

.fret-marker {
  fill: var(--gray-03);
}

.note-circle {
  fill: var(--gray-01);
  transition: all 0.12s ease-out;
  cursor: pointer;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(1);
  opacity: 1;
}

.note-label {
  fill: var(--white-01);
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
  transition: transform 0.3s ease-out, opacity 0.3s ease-out, fill 0.3s ease-out;
}

.note-marker svg {
  transition: opacity 0.3s ease-out;
}

.note-marker path {
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
.note-marker.hover-active {
  transform: scale(1.1);
}

.note-marker {
  transition: transform 0.15s ease-out;
  transform-origin: center;
}
</style>
