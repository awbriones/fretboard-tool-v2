<template>
  <div id="app">
    <header class="sticky-header">
      <div class="header-content">
        <h1 class="main-title">Fretboard Tool <span class="version">V2</span></h1>
        <div class="rightside-content">
          <KeySelector />
          <ScaleSelector />
          <InstrumentSelector />
        </div>
      </div>
    </header>

    <div class="main-container">
      <div class="fb-scroll-container">
        <div class="fretboard-container">
          <FretboardDisplay />
        </div>
      </div>
      <div class="bottom-settings">
        <!-- <ToggleSwitch
          :model-value="isScaleDegree"
          @update:model-value="toggleNoteDisplay"
          left-label="Note"
          right-label="Scale Degree"
        /> -->
        <HighlightSettings />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KeySelector from "@/components/KeySelector.vue";
import ScaleSelector from "@/components/ScaleSelector.vue";
import FretboardDisplay from "@/components/FretboardDisplay.vue";
import HighlightSettings from "@/components/HighlightSettings.vue";
import InstrumentSelector from "@/components/InstrumentSelector.vue";
import { onMounted } from "vue";
import { useFretboardStore } from "@/stores/fretboard";

const store = useFretboardStore();

onMounted(() => {
  // Ensure the store has an initial scale set
  if (!store.selectedScaleName) {
    store.setSelectedScale("major");
  }
});

</script>

<style lang="scss">
#app {
  font-family: "Jost", Avenir Next, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  box-sizing: border-box;
}
* {
  font-family: "Jost", Avenir Next, Helvetica, Arial, sans-serif;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: var(--black-02);
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1556px;
  margin: 0 auto;
  padding: 16px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rightside-content {
  display: flex;
  gap: 20px;
}

.main-title {
  margin: 0;
  font-size: 24px;
  color: var(--white-01);
}

.version {
  font-size: 14px;
  color: var(--gray-02);
}

.main-container {
  max-width: 1556px;
  margin: 20px auto;
  padding: 0 20px;
}
</style>
