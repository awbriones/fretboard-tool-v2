<template>
  <div
    class="smart-toggle-switch"
    :class="{ active: modelValue }"
    tabindex="0"
    @keydown.enter.prevent="toggleValue"
    @keydown.space.prevent="toggleValue"
    @click="toggleValue"
    ref="toggleContainer"
  >
    <!-- Animated background slider -->
    <div
      class="toggle-background-slider"
      :style="sliderStyle"
      ref="slider"
    ></div>

    <!-- Toggle options -->
    <div
      class="toggle-option left"
      :class="{ active: modelValue }"
      ref="leftOption"
    >
      {{ leftLabel }}
    </div>
    <div
      class="toggle-option right"
      :class="{ active: !modelValue }"
      ref="rightOption"
    >
      {{ rightLabel }}
    </div>

    <!-- Hidden input for form compatibility -->
    <input
      type="checkbox"
      :id="inputId"
      :checked="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  defineProps,
  defineEmits,
} from "vue";

interface Props {
  leftLabel: string;
  rightLabel: string;
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const inputId = ref(`toggle-${Math.random().toString(36).substring(2, 11)}`);
const toggleContainer = ref<HTMLElement>();
const leftOption = ref<HTMLElement>();
const rightOption = ref<HTMLElement>();
const slider = ref<HTMLElement>();

const leftWidth = ref(0);
const rightWidth = ref(0);
const containerWidth = ref(0);
const containerPadding = 8; // Container left/right padding from CSS
const borderOffset = -4; // Distance from container edge
const textPadding = 10; // Extra padding around text

function measureOptions() {
  if (!leftOption.value || !rightOption.value || !toggleContainer.value) return;

  // Measure the actual rendered width of each option
  leftWidth.value = leftOption.value.getBoundingClientRect().width;
  rightWidth.value = rightOption.value.getBoundingClientRect().width;
  containerWidth.value = toggleContainer.value.getBoundingClientRect().width;
}

const sliderStyle = computed(() => {
  if (
    leftWidth.value === 0 ||
    rightWidth.value === 0 ||
    containerWidth.value === 0
  ) {
    return {};
  }

  const activeWidth = props.modelValue ? leftWidth.value : rightWidth.value;
  const sliderWidth = activeWidth + textPadding * 2;

  // Calculate absolute positions from container edges
  // Available space inside container (excluding padding)
  const availableWidth = containerWidth.value - containerPadding * 2;

  let translateX = 0;

  if (props.modelValue) {
    // Position slider 4px from left edge of container
    // Calculate offset from center to desired position
    const leftEdgePosition =
      -availableWidth / 2 + borderOffset + sliderWidth / 2;
    translateX = leftEdgePosition;
  } else {
    // Position slider 4px from right edge of container
    // Calculate offset from center to desired position
    const rightEdgePosition =
      availableWidth / 2 - borderOffset - sliderWidth / 2;
    translateX = rightEdgePosition;
  }

  return {
    width: `${sliderWidth}px`,
    transform: `translateX(${translateX}px)`,
  };
});

function toggleValue() {
  emit("update:modelValue", !props.modelValue);
}

onMounted(async () => {
  await nextTick();
  measureOptions();

  // Re-measure on window resize
  window.addEventListener("resize", measureOptions);
});

onUnmounted(() => {
  window.removeEventListener("resize", measureOptions);
});

// Re-measure when labels change
watch([() => props.leftLabel, () => props.rightLabel], async () => {
  await nextTick();
  measureOptions();
});
</script>

<style scoped lang="scss">
.smart-toggle-switch {
  /* Toggle */
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 14px;
  gap: 16px;

  height: 48px;

  background: var(--shade-10);
  border-radius: 48px;
  cursor: pointer;
  user-select: none;

  flex: none;
  order: 1;
  flex-grow: 0;

  &:focus-visible {
    outline: 2px solid var(--light-24);
    outline-offset: 2px;
  }
}

.toggle-background-slider {
  /* Active background */
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 11px 8px;

  height: 40px;
  background: var(--shade-30);
  border-radius: 32px;
  transition: all 0.3s ease-out;
  z-index: 1;
}

.toggle-option {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  height: 40px;
  font-size: 14px;
  color: var(--shade-50);
  transition: color 0.3s ease-out;

  &.active {
    color: var(--shade-70);
    font-weight: 500;
  }

  &.left {
    order: 0;
  }

  &.right {
    order: 1;
  }
}
</style>
