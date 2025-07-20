<template>
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible"
        ref="tooltipEl"
        class="tooltip-container"
        :style="tooltipStyle"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- Simple text content -->
        <span v-if="typeof content === 'string'" class="tooltip-text">
          {{ content }}
        </span>
        
        <!-- Complex content slot -->
        <div v-else class="tooltip-content">
          <slot name="content" :data="content">
            <div v-if="typeof content === 'string'" v-html="content"></div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, withDefaults, defineProps, defineEmits } from 'vue';

interface Props {
  visible: boolean;
  content: string | object | null;
  x: number;
  y: number;
  offset?: { x: number; y: number };
  preventHover?: boolean; // For fretboard tooltips that shouldn't interfere with mouse events
}

const props = withDefaults(defineProps<Props>(), {
  offset: () => ({ x: 8, y: 8 }),
  preventHover: false,
});

const emit = defineEmits<{
  mouseenter: [event: MouseEvent];
  mouseleave: [event: MouseEvent];
}>();

const tooltipEl = ref<HTMLElement | null>(null);

const tooltipStyle = computed(() => {
  const style: Record<string, string> = {
    position: 'fixed',
    left: `${props.x + props.offset.x}px`,
    top: `${props.y + props.offset.y}px`,
    zIndex: '10000',
  };

  if (props.preventHover) {
    style.pointerEvents = 'none';
  }

  return style;
});

// Handle mouse events for non-fretboard tooltips
function handleMouseEnter(event: MouseEvent) {
  if (!props.preventHover) {
    emit('mouseenter', event);
  }
}

function handleMouseLeave(event: MouseEvent) {
  if (!props.preventHover) {
    emit('mouseleave', event);
  }
}

// Auto-adjust position to stay within viewport
watch([() => props.visible, () => props.x, () => props.y], async () => {
  if (props.visible) {
    await nextTick();
    
    if (tooltipEl.value) {
      const rect = tooltipEl.value.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if tooltip would go off-screen
      if (rect.right > viewportWidth) {
        tooltipEl.value.style.left = `${props.x - rect.width - props.offset.x}px`;
      }
      
      // Adjust vertical position if tooltip would go off-screen
      if (rect.bottom > viewportHeight) {
        tooltipEl.value.style.top = `${props.y - rect.height - props.offset.y}px`;
      }
    }
  }
});
</script>

<style scoped lang="scss">
.tooltip-container {
  background: var(--shade-10);
  border: 1px solid var(--shade-30);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  word-wrap: break-word;
}

.tooltip-text {
  color: var(--shade-70);
  line-height: 1.4;
}

.tooltip-content {
  color: var(--shade-70);
  line-height: 1.4;
}

/* Animations */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.15s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>