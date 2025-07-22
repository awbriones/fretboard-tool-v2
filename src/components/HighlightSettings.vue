<template>
  <div class="highlighting-settings" :key="updateKey">
    <div class="controls-grid">
      <div class="control-row show-row">
        <span class="row-label">Show</span>
        <button
          v-for="(setting, index) in scaleDegreeSettings"
          :key="`show-${index}`"
          class="show-button"
          :class="{
            'show-button--visible': setting.show,
            'show-button--hidden': !setting.show,
            'show-button--colored': setting.color,
            'show-button--bright': setting.bright,
          }"
          :style="setting.show ? { backgroundColor: getNoteColor(index) } : {}"
          @click="toggleShow(index)"
          @mouseenter="handleShowButtonHover($event, setting.show ? 'Hide note' : 'Show note')"
          @mouseleave="handleMouseLeave"
        >
          <svg :viewBox="getButtonSvg(index)?.viewBox" width="40" height="40">
            <path
              v-for="(path, pathIndex) in getButtonSvg(index)?.paths"
              :key="`note-path-${pathIndex}`"
              :d="path.d"
              :fill="getTextColor(index)"
              :fill-rule="path.fillRule"
              :clip-rule="path.clipRule"
            />
          </svg>
        </button>
      </div>

      <div class="control-row color-row">
        <span class="row-label">Color</span>
        <button
          v-for="(setting, index) in scaleDegreeSettings"
          :key="`color-${index}`"
          class="color-button"
          :class="{
            'color-button--active': setting.color,
            'color-button--inactive': !setting.color,
            'color-button--hidden': !setting.show,
          }"
          :style="{
            fill: getColorButtonColor(index),
          }"
          @click="toggleColor(index)"
          @mouseenter="handleColorButtonHover($event, setting.color ? 'Set color off' : 'Set color on')"
          @mouseleave="handleMouseLeave"
        >
          <svg :viewBox="getSvgPath('colors')?.viewBox">
            <path
              v-for="(path, pathIndex) in getSvgPath('colors')?.paths"
              :key="`color-path-${pathIndex}`"
              :d="path.d"
              :fill-rule="path.fillRule"
            />
          </svg>
        </button>
      </div>

      <div class="control-row dim-row">
        <span class="row-label">Bright</span>
        <button
          v-for="(setting, index) in scaleDegreeSettings"
          :key="`dim-${index}`"
          class="dim-button"
          :class="{
            'dim-button--bright': setting.bright,
            'dim-button--dimmed': !setting.bright,
            'dim-button--hidden': !setting.show,
          }"
          :style="{ fill: getDimColor(index) }"
          @click="toggleBright(index)"
          @mouseenter="handleBrightButtonHover($event, setting.bright ? 'Set bright off' : 'Set bright on')"
          @mouseleave="handleMouseLeave"
        >
          <svg :viewBox="getSvgPath('brightness')?.viewBox">
            <path
              v-for="(path, pathIndex) in getSvgPath('brightness')?.paths"
              :key="`brightness-path-${pathIndex}`"
              :d="path.d"
              :fill-rule="path.fillRule"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Element Tooltip -->
    <ElementTooltip
      :visible="elementTooltip.state.value.visible"
      :content="elementTooltip.state.value.content"
      :target-element="elementTooltip.state.value.targetElement"
      :position="elementTooltip.state.value.position"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import { getSvgPath } from "@/utils/svgPaths";
import { noteNames } from "@/utils/noteUtils";
import ElementTooltip from "./ElementTooltip.vue";
import { useElementTooltip } from "@/composables/useElementTooltip";

// Initialize element tooltip system
const elementTooltip = useElementTooltip();

const store = useFretboardStore();
const { scaleDegreeSettings, rootNote, isScaleDegree } = storeToRefs(store);
const updateKey = ref(0);

// Use tooltip functions from props (access directly to maintain reactivity)

function getButtonSvg(index: number) {
  // Always show the note/degree label, never the hidden icon
  return getNoteSvg.value(index);
}

const getNoteSvg = computed(() => (index: number) => {
  // index now represents chromatic interval (0-11) directly
  if (isScaleDegree.value) {
    return getSvgPath(`degree_${index.toString().padStart(2, "0")}`);
  } else {
    const noteIndex = (index + noteNames.indexOf(rootNote.value)) % 12;
    return getSvgPath(`note_${noteIndex.toString().padStart(2, "0")}`);
  }
});

function getNoteColor(index: number) {
  const setting = scaleDegreeSettings.value[index];

  if (!setting.color) {
    // Show buttons: bright = shade-60 bg, dim = shade-30 bg
    return setting.bright ? "var(--shade-60)" : "var(--shade-30)";
  }

  // index now represents chromatic interval directly
  const colorIndex = index % 12;
  return setting.bright
    ? `var(--color-${colorIndex})`
    : `var(--color-${colorIndex}-dimmed)`;
}

function getTextColor(index: number) {
  const setting = scaleDegreeSettings.value[index];

  // Show buttons OFF: shade-40
  if (!setting.show) return "var(--shade-40)";

  if (!setting.color) {
    // Show buttons ON + brightness OFF: shade-60 text
    // Show buttons ON + brightness ON: shade-10 text
    return setting.bright ? "var(--shade-10)" : "var(--shade-60)";
  }

  // When color is enabled, use dark text on bright colors, light text on dim colors
  return setting.bright ? "var(--shade-20)" : "var(--light-48)";
}

function getColorButtonColor(index: number) {
  const setting = scaleDegreeSettings.value[index];
  if (!setting.color) {
    return "var(--shade-40)";
  }
  // Always use bright color for color button icons for better contrast
  const colorIndex = index % 12;
  return `var(--color-${colorIndex})`;
}

function getDimColor(index: number) {
  const setting = scaleDegreeSettings.value[index];
  if (!setting.color) {
    // When colors are OFF: bright buttons should be shade-60, dimmed buttons shade-40
    return setting.bright ? "var(--shade-60)" : "var(--shade-40)";
  }
  // When colors are ON: active dim buttons shade-60, inactive dim buttons shade-40
  return setting.bright ? "var(--shade-60)" : "var(--shade-40)";

  // Alternative colored approach (may want to return to this):
  // const colorIndex = index % 12;
  // return setting.bright
  //   ? `var(--color-${colorIndex})`
  //   : `var(--color-${colorIndex}-dimmed)`;
}

function toggleShow(index: number) {
  const currentSettings = [...scaleDegreeSettings.value];
  currentSettings[index] = {
    ...currentSettings[index],
    show: !currentSettings[index].show,
  };
  store.setScaleDegreeSettings(currentSettings);
  store.switchToCustomMode(); // Auto-switch dropdown to Custom (label only)
  updateKey.value++; // Force immediate re-render
  
  // Update tooltip if currently visible
  elementTooltip.updateTooltipContent(
    currentSettings[index].show ? 'Hide note' : 'Show note'
  );
}

function toggleColor(index: number) {
  const currentSettings = [...scaleDegreeSettings.value];
  currentSettings[index] = {
    ...currentSettings[index],
    color: !currentSettings[index].color,
  };
  store.setScaleDegreeSettings(currentSettings);
  
  // Update tooltip if currently visible
  elementTooltip.updateTooltipContent(
    currentSettings[index].color ? 'Set color off' : 'Set color on'
  );
}

function toggleBright(index: number) {
  const currentSettings = [...scaleDegreeSettings.value];
  currentSettings[index] = {
    ...currentSettings[index],
    bright: !currentSettings[index].bright,
  };
  store.setScaleDegreeSettings(currentSettings);
  
  // Update tooltip if currently visible
  elementTooltip.updateTooltipContent(
    currentSettings[index].bright ? 'Set bright off' : 'Set bright on'
  );
}

watch(
  () => store.isScaleDegree,
  (newValue) => {
    isScaleDegree.value = newValue;
  }
);

// Force a re-render when isScaleDegree changes
watch(isScaleDegree, () => {
  updateKey.value++;
});

// Tooltip handlers that position above elements
function handleShowButtonHover(event: MouseEvent, content: string) {
  const target = event.currentTarget as HTMLElement;
  elementTooltip.showAbove(content, target);
}

function handleColorButtonHover(event: MouseEvent, content: string) {
  const target = event.currentTarget as HTMLElement;
  elementTooltip.showAbove(content, target);
}

function handleBrightButtonHover(event: MouseEvent, content: string) {
  const target = event.currentTarget as HTMLElement;
  elementTooltip.showAbove(content, target);
}

function handleMouseLeave() {
  elementTooltip.hideTooltip();
}

onMounted(() => {
  isScaleDegree.value = store.isScaleDegree;
});
</script>

<style scoped lang="scss">
.highlighting-settings {
  background: var(--shade-20);
  border-radius: 8px;
}

.controls-grid {
  display: grid;
  gap: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-label {
  width: 40px;
  text-align: left;
  color: var(--shade-70);
  font-size: 14px;
  margin-right: 24px;
}

button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.show-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid var(--shade-10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--shade-10);

  svg {
    width: 48px;
    height: 100%;
  }

  // State-based classes for show buttons
  &.show-button--hidden {
    // Styles for hidden notes
    background-color: var(--shade-10);
  }
}

.color-button,
.dim-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--shade-10);
  border: 4px solid var(--shade-10);

  svg {
    width: 24px;
    height: 24px;
  }

  // New state-based classes for color buttons
  &.color-button--active {
    background-color: var(--shade-30) !important;
  }
  &.color-button--inactive {
    background-color: var(--shade-10) !important;
  }
  &.color-button--hidden {
    visibility: hidden;
  }

  // New state-based classes for dim buttons
  &.dim-button--bright {
    // Styles when note is bright
    background-color: var(--shade-30) !important;
  }
  &.dim-button--dimmed {
    // Styles when note is dimmed
    background-color: var(--shade-10) !important;
  }
  &.dim-button--hidden {
    visibility: hidden;
  }
}
</style>
