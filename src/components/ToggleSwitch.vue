<template>
  <div
    class="toggle-switch"
    :class="{ left: modelValue, right: !modelValue }"
    tabindex="0"
    @keydown.enter.prevent="toggleValue"
    @keydown.space.prevent="toggleValue"
  >
    <label :for="inputId" class="toggle-switch-label">
      <span class="toggle-switch-text left">{{ leftLabel }}</span>
      <input
        type="checkbox"
        :id="inputId"
        :checked="modelValue"
        @input="$emit('update:modelValue', $event.target.checked)"
      />
      <span class="toggle-switch-slider"></span>
      <span class="toggle-switch-text right">{{ rightLabel }}</span>
    </label>
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
    const inputId = ref(`toggle-${Math.random().toString(36).substr(2, 9)}`);
    return { inputId };
  },
  methods: {
    toggleValue() {
      this.$emit("update:modelValue", !this.modelValue);
    },
  },
};
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: flex;
  height: 40px;
  align-items: center;
  gap: 12px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  display: none;
}

.toggle-switch .toggle-switch-label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
  gap: 12px;
  color: var(--gray-02);
  transition: color 0.24s ease-out;
  background: transparent;
  padding: 0 12px;
  transition: background-color, ease-out, 0.12s;
  border-radius: 20px;
  user-select: none;
}

.toggle-switch .toggle-switch-label:hover {
  background: var(--black-02);
  cursor: pointer;
}

.toggle-switch:focus-visible {
  border-radius: 20px;
  background: var(--black-02);
  outline: 2px solid var(--light-24);
}

.toggle-switch.right .toggle-switch-text.right,
.toggle-switch.left .toggle-switch-text.left {
  color: var(--white-01);
}

.toggle-switch .toggle-switch-slider {
  position: relative;
  width: 28px;
  height: 16px;
  background-color: var(--slider-background-color);
  border-radius: 20px;
  transition: background-color 0.24s ease-out;
}

.toggle-switch .toggle-switch-slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background-color: var(--white-01);
  border-radius: 50%;
  transition: transform 0.24s ease-out;
  transform: translateX(100%);
}

.toggle-switch input:checked ~ .toggle-switch-slider:before {
  transform: translateX(0%);
}

.toggle-switch input:checked ~ .toggle-switch-slider {
  background-color: var(--slider-checked-background-color);
}
</style>
