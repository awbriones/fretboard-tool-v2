<template>
  <div
    class="toggle-switch"
    :class="{ active: modelValue }"
    tabindex="0"
    @keydown.enter.prevent="toggleValue"
    @keydown.space.prevent="toggleValue"
    @click="toggleValue"
  >
    <!-- Animated background slider -->
    <div
      class="toggle-background-slider"
      :class="{ 'slide-right': !modelValue }"
    ></div>

    <!-- Toggle options -->
    <div class="toggle-option left" :class="{ active: modelValue }">
      {{ leftLabel }}
    </div>
    <div class="toggle-option right" :class="{ active: !modelValue }">
      {{ rightLabel }}
    </div>

    <!-- Hidden input for form compatibility -->
    <input
      type="checkbox"
      :id="inputId"
      :checked="modelValue"
      @input="$emit('update:modelValue', $event.target.checked)"
      style="display: none"
    />
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    leftLabel: String,
    rightLabel: String,
    modelValue: Boolean,
  },
  setup() {
    const inputId = ref(
      `toggle-${Math.random().toString(36).substring(2, 11)}`
    );
    return { inputId };
  },
  methods: {
    toggleValue() {
      this.$emit("update:modelValue", !this.modelValue);
    },
  },
};
</script>

<style scoped lang="scss">
.toggle-switch {
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

  width: 54px;
  height: 36px;

  background: var(--shade-30);
  border-radius: 32px;

  transition: all 0.3s ease-out;
  z-index: 1;

  /* Default position for left (degrees) */
  transform: translateX(-27px);
  width: 71px;

  &.slide-right {
    /* Position for right (notes) */
    transform: translateX(34px);
    width: 54px;
  }
}

.toggle-option {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;

  height: 36px;

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
