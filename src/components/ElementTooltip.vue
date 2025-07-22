<template>
  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible"
        ref="tooltipEl"
        class="element-tooltip"
        :class="[`element-tooltip--${actualPosition}`, { 'element-tooltip--adjusted': isAdjusted }]"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          {{ content }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, withDefaults, defineProps, onMounted, onUnmounted } from "vue";
import type { TooltipPosition } from "@/types/tooltip";

interface Props {
  visible: boolean;
  content: string;
  targetElement: HTMLElement | null;
  position?: TooltipPosition;
  offset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'above',
  offset: 8,
});

const tooltipEl = ref<HTMLElement | null>(null);
const actualPosition = ref<TooltipPosition>(props.position);
const isAdjusted = ref(false);

const tooltipStyle = computed(() => {
  if (!props.targetElement) {
    return { 
      position: 'fixed' as const,
      left: '-9999px',
      top: '-9999px',
      zIndex: '10000',
    };
  }

  const rect = props.targetElement.getBoundingClientRect();
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;

  let left = 0;
  let top = 0;

  // Calculate initial position based on desired placement
  switch (actualPosition.value) {
    case 'above':
      left = rect.left + scrollX + rect.width / 2;
      top = rect.top + scrollY - props.offset;
      break;
    case 'below':
      left = rect.left + scrollX + rect.width / 2;
      top = rect.bottom + scrollY + props.offset;
      break;
    case 'left':
      left = rect.left + scrollX - props.offset;
      top = rect.top + scrollY + rect.height / 2;
      break;
    case 'right':
      left = rect.right + scrollX + props.offset;
      top = rect.top + scrollY + rect.height / 2;
      break;
  }

  return {
    position: 'absolute' as const,
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '10000',
    transform: getTransform(),
  };
});

function getTransform(): string {
  switch (actualPosition.value) {
    case 'above':
      return 'translate(-50%, -100%)';
    case 'below':
      return 'translate(-50%, 0%)';
    case 'left':
      return 'translate(-100%, -50%)';
    case 'right':
      return 'translate(0%, -50%)';
    default:
      return 'translate(-50%, -100%)';
  }
}

async function checkViewportCollision() {
  if (!tooltipEl.value || !props.targetElement) return;

  await nextTick(); // Wait for DOM update
  
  const tooltipRect = tooltipEl.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let newPosition = props.position;
  let adjusted = false;

  // Check horizontal collisions
  if (props.position === 'left' && tooltipRect.left < 0) {
    newPosition = 'right';
    adjusted = true;
  } else if (props.position === 'right' && tooltipRect.right > viewportWidth) {
    newPosition = 'left';
    adjusted = true;
  }

  // Check vertical collisions
  if (props.position === 'above' && tooltipRect.top < 0) {
    newPosition = 'below';
    adjusted = true;
  } else if (props.position === 'below' && tooltipRect.bottom > viewportHeight) {
    newPosition = 'above';
    adjusted = true;
  }

  // For horizontal positions, also check if tooltip extends beyond viewport horizontally
  if ((props.position === 'above' || props.position === 'below')) {
    if (tooltipRect.left < 0 || tooltipRect.right > viewportWidth) {
      // Don't change position, but could adjust horizontal offset in the future
    }
  }

  // For vertical positions, also check if tooltip extends beyond viewport vertically
  if ((props.position === 'left' || props.position === 'right')) {
    if (tooltipRect.top < 0 || tooltipRect.bottom > viewportHeight) {
      // Don't change position, but could adjust vertical offset in the future
    }
  }

  if (adjusted) {
    actualPosition.value = newPosition;
    isAdjusted.value = true;
  } else {
    actualPosition.value = props.position;
    isAdjusted.value = false;
  }
}

// Watch for visibility changes to trigger collision detection
watch([() => props.visible, () => props.position], async () => {
  if (props.visible) {
    actualPosition.value = props.position;
    isAdjusted.value = false;
    await nextTick();
    await checkViewportCollision();
  }
});

// Watch for window resize to re-check positioning
function handleResize() {
  if (props.visible) {
    checkViewportCollision();
  }
}

// Add resize listener when mounted, remove when unmounted

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="scss">
.element-tooltip {
  background: #141414bd;
  backdrop-filter: blur(24px);
  border: 1px solid var(--shade-30);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--shade-70);
  max-width: 200px;
  word-wrap: break-word;
  white-space: nowrap;

  // Arrow styles for different positions
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
  }

  &--above::before {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: var(--shade-30);
  }

  &--below::before {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: var(--shade-30);
  }

  &--left::before {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: var(--shade-30);
  }

  &--right::before {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: var(--shade-30);
  }

  // Adjusted position styling (different color to indicate collision adjustment)
  &--adjusted {
    border-color: var(--shade-40);

    &::before {
      border-top-color: var(--shade-40);
      border-bottom-color: var(--shade-40);
      border-left-color: var(--shade-40);
      border-right-color: var(--shade-40);
    }
  }
}

.tooltip-content {
  font-size: inherit;
  line-height: 1.4;
}

// Transition animations
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease-out;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>