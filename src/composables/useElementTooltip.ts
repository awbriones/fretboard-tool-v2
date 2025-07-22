import { ref, type Ref } from 'vue';
import type { TooltipPosition } from '@/types/tooltip';

interface ElementTooltipState {
  visible: boolean;
  content: string;
  targetElement: HTMLElement | null;
  position: TooltipPosition;
}

export function useElementTooltip() {
  const state: Ref<ElementTooltipState> = ref({
    visible: false,
    content: '',
    targetElement: null,
    position: 'above',
  });

  let hideTimeout: number | null = null;

  function clearHideTimeout() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function showTooltip(
    content: string, 
    element: HTMLElement, 
    position: TooltipPosition = 'above',
    delay = 150 // Reduced from 500ms to 150ms
  ) {
    clearHideTimeout();
    
    if (state.value.visible && state.value.targetElement !== element) {
      // Tooltip is already visible but for different element - update immediately
      state.value.content = content;
      state.value.targetElement = element;
      state.value.position = position;
    } else if (state.value.visible && state.value.targetElement === element) {
      // Same element - just update content immediately (handles state changes)
      state.value.content = content;
      state.value.position = position;
    } else {
      // First time showing - use delay
      setTimeout(() => {
        if (state.value.targetElement === element) { // Only show if still hovering the same element
          state.value.content = content;
          state.value.targetElement = element;
          state.value.position = position;
          state.value.visible = true;
        }
      }, delay);
    }

    // Update target immediately for hover tracking
    state.value.targetElement = element;
  }

  function hideTooltip(delay = 150) {
    state.value.targetElement = null;
    
    clearHideTimeout();
    hideTimeout = window.setTimeout(() => {
      state.value.visible = false;
      state.value.content = '';
    }, delay);
  }

  function hideTooltipImmediately() {
    clearHideTimeout();
    state.value.visible = false;
    state.value.content = '';
    state.value.targetElement = null;
  }

  // Update content for currently visible tooltip (useful after state changes)
  function updateTooltipContent(content: string) {
    if (state.value.visible && state.value.targetElement) {
      state.value.content = content;
    }
  }

  // Convenience methods for specific positions
  function showAbove(content: string, element: HTMLElement, delay?: number) {
    showTooltip(content, element, 'above', delay);
  }

  function showBelow(content: string, element: HTMLElement, delay?: number) {
    showTooltip(content, element, 'below', delay);
  }

  function showLeft(content: string, element: HTMLElement, delay?: number) {
    showTooltip(content, element, 'left', delay);
  }

  function showRight(content: string, element: HTMLElement, delay?: number) {
    showTooltip(content, element, 'right', delay);
  }

  return {
    state,
    showTooltip,
    hideTooltip,
    hideTooltipImmediately,
    updateTooltipContent,
    showAbove,
    showBelow,
    showLeft,
    showRight,
  };
}