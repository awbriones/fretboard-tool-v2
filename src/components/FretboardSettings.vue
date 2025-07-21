<template>
  <div class="fretboard-settings">
    <!-- Left Column: Scale Controls -->
    <div class="left-settings-container">
      <!-- Root and Scale Selector Row -->
      <div class="root-and-scale-selector">
        <span class="scale-label">Scale</span>
        <div class="select-menus">
          <div 
            @mouseenter="showTooltip('Change root', $event)"
            @mouseleave="hideTooltip"
          >
            <KeySelector class="root-selector" />
          </div>
          <div 
            @mouseenter="showTooltip('Change scale', $event)"
            @mouseleave="hideTooltip"
          >
            <ScaleSelector class="scale-selector" />
          </div>
        </div>
      </div>

      <!-- Markers Toggle Row -->
      <div class="markers-toggle">
        <span class="markers-label">Markers</span>
        <div class="toggle">
          <ToggleSwitch
            v-model="isScaleDegree"
            left-label="Degrees"
            right-label="Notes"
            class="markers-toggle-switch"
          />
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="settings-divider"></div>

    <!-- Right Column: Highlight Settings -->
    <div class="right-settings-container">
      <HighlightSettings 
        :show-tooltip="showTooltip"
        :hide-tooltip="hideTooltip"
      />
    </div>

    <!-- Simple Settings Tooltip -->
    <TooltipContainer
      :visible="tooltipState.visible"
      :content="tooltipState.content"
      :x="tooltipState.x"
      :y="tooltipState.y"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFretboardStore } from "@/stores/fretboard";
import KeySelector from "./KeySelector.vue";
import ScaleSelector from "./ScaleSelector.vue";
import ToggleSwitch from "./ToggleSwitch.vue";
import HighlightSettings from "./HighlightSettings.vue";
import TooltipContainer from "./TooltipContainer.vue";
import { useSimpleTooltip } from "@/composables/useSimpleTooltip";

const store = useFretboardStore();

const isScaleDegree = computed({
  get: () => store.isScaleDegree,
  set: (value: boolean) => store.setIsScaleDegree(value),
});

// Initialize simple tooltip system
const { state: tooltipState, showTooltip, hideTooltip } = useSimpleTooltip();
</script>

<style scoped lang="scss">
.fretboard-settings {
  /* Settings Container */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 24px 32px;
  gap: 32px;

  position: relative;
  width: 100%;
  max-width: 1600px;
  // min-height: 208px;

  background: var(--shade-20);
  border-radius: 0px 0px 32px 32px;
  margin: 0 auto;
}

.left-settings-container {
  /* Left-settings-container */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;

  flex: none;
  order: 0;
  flex-grow: 0;
}

.root-and-scale-selector {
  /* Root and Scale Selector */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  // width: 140px;
  // height: 66px;

  flex: none;
  order: 0;
  flex-grow: 0;
}

.scale-label {
  /* Match existing row labels */
  width: 40px;
  text-align: left;
  color: var(--shade-70);
  font-size: 14px;
  margin-right: 24px;

  flex: none;
  order: 0;
  flex-grow: 0;
}

.select-menus {
  /* Select Menus */
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 0px;
  gap: 8px;

  width: 140px;
  height: 44px;

  flex: none;
  order: 1;
  flex-grow: 0;
}

.markers-toggle {
  /* Markers Toggle */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  width: 145px;
  height: 66px;

  flex: none;
  order: 1;
  flex-grow: 0;
}

.markers-label {
  /* Match existing row labels */
  width: 40px;
  text-align: left;
  color: var(--shade-70);
  font-size: 14px;
  margin-right: 24px;

  flex: none;
  order: 0;
  flex-grow: 0;
}

.settings-divider {
  width: 1px;
  height: 100%;
  background: var(--shade-10);
  flex-shrink: 0;
}

.right-settings-container {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

/* Responsive Design */
@media (max-width: 768px) {
  .fretboard-settings {
    flex-direction: column;
    gap: 24px;
    padding: 20px;
  }

  .left-settings-container {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }

  .root-and-scale-selector {
    flex-direction: row;
    align-items: center;
    width: auto;
    height: auto;
    gap: 12px;
  }

  .markers-toggle {
    flex-direction: row;
    align-items: center;
    width: auto;
    height: auto;
    gap: 12px;
  }

  .settings-divider {
    display: none;
  }

  .right-settings-container {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .fretboard-settings {
    overflow-x: auto;
    min-width: 600px;
  }
}
</style>
