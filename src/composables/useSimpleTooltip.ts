import { reactive } from 'vue';

interface SimpleTooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

export function useSimpleTooltip() {
  const state = reactive<SimpleTooltipState>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });

  let hideTimeout: number | null = null;

  function showTooltip(content: string, event: MouseEvent) {
    clearTimeout();
    state.content = content;
    state.x = event.clientX;
    state.y = event.clientY;
    state.visible = true;
  }

  function hideTooltip() {
    clearTimeout();
    hideTimeout = window.setTimeout(() => {
      state.visible = false;
      state.content = '';
    }, 100); // Small delay to prevent flicker
  }

  function clearTimeout() {
    if (hideTimeout !== null) {
      window.clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  return {
    state,
    showTooltip,
    hideTooltip,
  };
}