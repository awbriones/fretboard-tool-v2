<template>
  <div class="highlighting-settings settings-container" :key="updateKey">
    <div class="controls-grid">
      <div class="control-row show-row">
        <span class="row-label">Show</span>
        <button
          v-for="(setting, index) in scaleDegreeSettings"
          :key="`show-${index}`"
          class="show-button"
          :class="{ hidden: !setting.show }"
          :style="{ backgroundColor: getNoteColor(index) }"
          @click="toggleShow(index)"
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
          :class="{ active: setting.color, hidden: !setting.show }"
          :style="{ fill: setting.color ? getNoteColor(index) : 'var(--light-48)' }"
          @click="toggleColor(index)"
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
        <span class="row-label">Dim</span>
        <button
          v-for="(setting, index) in scaleDegreeSettings"
          :key="`dim-${index}`"
          class="dim-button"
          :class="{ active: !setting.bright, hidden: !setting.show }"
          :style="{ fill: getDimColor(index) }"
          @click="toggleBright(index)"
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

      <div class="control-row labels-row">
        <span class="row-label">Labels</span>
        <div class="labels-buttons">
          <button
            v-for="option in ['Scale Degrees', 'Note Names']"
            :key="option"
            class="label-option"
            :class="{ active: isScaleDegree === (option === 'Scale Degrees') }"
            @click="setLabel(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import { storeToRefs } from "pinia";
import { getSvgPath } from "@/utils/svgPaths";
import { noteNames } from "@/utils/noteUtils";

const store = useFretboardStore();
const { scaleDegreeSettings, selectedScale, rootNote, isScaleDegree } = storeToRefs(store);
const updateKey = ref(0);

function getButtonSvg(index: number) {
  const setting = scaleDegreeSettings.value[index];
  if (!setting.show) {
    return getSvgPath("hidden");
  }
  return getNoteSvg.value(index);
}

const getNoteSvg = computed(() => (index: number) => {
  const scaleIntervals = selectedScale.value.intervals;
  if (isScaleDegree.value) {
    return getSvgPath(`degree_${scaleIntervals[index].toString().padStart(2, "0")}`);
  } else {
    const noteIndex = (scaleIntervals[index] + noteNames.indexOf(rootNote.value)) % 12;
    return getSvgPath(`note_${noteIndex.toString().padStart(2, "0")}`);
  }
});

function getNoteColor(index: number) {
  const setting = scaleDegreeSettings.value[index];
  if (!setting.show) return "var(--gray-01)";

  if (!setting.color) {
    return setting.bright ? "var(--gray-01)" : "var(--black-03)";
  }

  const colorIndex = selectedScale.value.intervals[index] % 12;
  return setting.bright ? `var(--color-${colorIndex})` : `var(--color-${colorIndex}-dimmed)`;
}

function getTextColor(index: number) {
  const setting = scaleDegreeSettings.value[index];
  if (!setting.show) return "var(--light-48)";

  if (!setting.color) {
    return setting.bright ? "var(--white-01)" : "var(--light-24)";
  }

  return setting.bright ? "var(--black-02)" : "var(--light-48)";
}

function getDimColor(index: number) {
  const setting = scaleDegreeSettings.value[index];
  if (!setting.color) {
    return setting.bright ? "var(--light-48)" : "var(--light-24)";
  }
  const colorIndex = selectedScale.value.intervals[index] % 12;
  return setting.bright ? `var(--color-${colorIndex})` : `var(--color-${colorIndex}-dimmed)`;
}

function toggleShow(index: number) {
  const currentSettings = [...scaleDegreeSettings.value];
  currentSettings[index] = { ...currentSettings[index], show: !currentSettings[index].show };
  store.setScaleDegreeSettings(currentSettings);
  updateKey.value++; // Force a re-render of the entire component
}

function toggleColor(index: number) {
  const currentSettings = [...scaleDegreeSettings.value];
  currentSettings[index] = { ...currentSettings[index], color: !currentSettings[index].color };
  store.setScaleDegreeSettings(currentSettings);
}

function toggleBright(index: number) {
  const currentSettings = [...scaleDegreeSettings.value];
  currentSettings[index] = { ...currentSettings[index], bright: !currentSettings[index].bright };
  store.setScaleDegreeSettings(currentSettings);
}

function setLabel(option: string) {
  store.setIsScaleDegree(option === "Scale Degrees");
}

watch(
  () => store.isScaleDegree,
  (newValue) => {
    isScaleDegree.value = newValue;
  }
);

watch(selectedScale, () => {
  // Scale change is handled by the store watcher that clears manual settings
});

// Force a re-render when isScaleDegree changes
const key = ref(0);
watch(isScaleDegree, () => {
  key.value++;
});

onMounted(() => {
  isScaleDegree.value = store.isScaleDegree;
});
</script>

<style scoped lang="scss">
.highlighting-settings {
  background: var(--black-02);
  border-radius: 8px;
  padding: 24px;
}

.controls-grid {
  display: grid;
  gap: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-label {
  width: 40px;
  text-align: left;
  color: var(--gray-03);
  font-size: 14px;
  margin-right: 24px;
}

button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.show-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 40px;
    height: 100%;
  }

  &.hidden {
    background-color: var(--gray-01) !important;

    svg {
      width: 24px;
      height: 24px;
    }
  }
}

.color-button,
.dim-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: transparent;

  svg {
    width: 20px;
    height: 20px;
  }

  &.hidden {
    visibility: hidden;
  }
  &:hover {
    background-color: var(--black-01);
  }
}

.labels-row {
  margin-top: 16px;
}

.labels-buttons {
  display: flex;
  gap: 8px;
  flex-grow: 1;
}

.label-option {
  background-color: var(--black-02);
  color: var(--gray-03);
  padding: 8px 16px;
  border-radius: 32px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.3s ease;
  width: inherit;

  &:hover {
    background-color: var(--black-03);
  }

  &.active {
    background-color: var(--black-03);
    color: var(--white-02);
  }
}
</style>
