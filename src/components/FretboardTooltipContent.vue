<template>
  <div class="fretboard-tooltip-content">
    <!-- Note name and position -->
    <div class="note-info">
      <span class="note-name">{{ data.noteName }}</span>
      <span class="position-info">Fret {{ data.fret }}, String {{ data.string + 1 }}</span>
    </div>
    
    <!-- Scale degree (if applicable) -->
    <div v-if="data.scaleDegree !== undefined" class="scale-degree">
      Scale degree: <span class="degree-value">{{ formatScaleDegree(data.scaleDegree) }}</span>
    </div>
    
    <!-- Instruction -->
    <div class="instruction">
      {{ data.instruction }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface TooltipData {
  noteName: string;
  scaleDegree?: string | number;
  instruction: string;
  fret: number;
  string: number;
}

interface Props {
  data: TooltipData;
}

defineProps<Props>();

function formatScaleDegree(degree: string | number): string {
  if (typeof degree === 'number') {
    // Convert 0-based to 1-based and add ordinal suffix
    const oneBasedDegree = degree + 1;
    const suffixes = ['st', 'nd', 'rd'];
    const suffix = suffixes[oneBasedDegree - 1] || 'th';
    return `${oneBasedDegree}${suffix}`;
  }
  return degree.toString();
}
</script>

<style scoped lang="scss">
.fretboard-tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}

.note-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.note-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--shade-70);
}

.position-info {
  font-size: 12px;
  color: var(--shade-50);
}

.scale-degree {
  font-size: 13px;
  color: var(--shade-60);
}

.degree-value {
  font-weight: 600;
  color: var(--shade-70);
}

.instruction {
  font-size: 12px;
  color: var(--shade-50);
  font-style: italic;
  border-top: 1px solid var(--shade-30);
  padding-top: 6px;
  margin-top: 2px;
}
</style>