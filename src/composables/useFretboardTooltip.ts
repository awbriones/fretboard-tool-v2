import { reactive, onMounted, onUnmounted } from 'vue';

interface TooltipData {
  noteName?: string;
  scaleDegree?: string | number;
  instruction?: string;
  fret?: number;
  string?: number;
}

interface TooltipState {
  visible: boolean;
  content: TooltipData | null;
  x: number;
  y: number;
  isInFretboardArea: boolean;
}

export function useFretboardTooltip() {
  const state = reactive<TooltipState>({
    visible: false,
    content: null,
    x: 0,
    y: 0,
    isInFretboardArea: false,
  });

  let hideTimeout: number | null = null;
  let fretboardElement: Element | null = null;
  let customBounds: { left: number; right: number; top: number; bottom: number } | null = null;

  // Track mouse position globally
  function updateMousePosition(event: MouseEvent) {
    state.x = event.clientX;
    state.y = event.clientY;
  }

  // Check if mouse is within fretboard area
  function checkFretboardArea(event: MouseEvent) {
    if (!fretboardElement) return false;
    
    const rect = fretboardElement.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    
    // Use the provided bounds if available, otherwise fall back to element bounds
    if (customBounds) {
      return (
        x >= customBounds.left &&
        x <= customBounds.right &&
        y >= customBounds.top &&
        y <= customBounds.bottom
      );
    }
    
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  }

  // Handle mouse enter fretboard area
  function handleMouseEnterArea() {
    state.isInFretboardArea = true;
    clearHideTimeout();
  }

  // Handle mouse leave fretboard area
  function handleMouseLeaveArea() {
    state.isInFretboardArea = false;
    scheduleHide();
  }

  // Show tooltip with content
  function showTooltip(content: TooltipData) {
    clearHideTimeout();
    state.content = content;
    state.visible = true;
  }

  // Hide tooltip immediately
  function hideTooltip() {
    clearHideTimeout();
    state.visible = false;
    state.content = null;
  }

  // Schedule hide with delay (for smooth transitions between notes)
  function scheduleHide(delay = 300) {
    clearHideTimeout();
    hideTimeout = window.setTimeout(() => {
      if (!state.isInFretboardArea) {
        hideTooltip();
      }
    }, delay);
  }

  // Clear hide timeout
  function clearHideTimeout() {
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  // Update tooltip content without hiding (for smooth transitions)
  function updateContent(content: TooltipData) {
    if (state.visible) {
      state.content = content;
    } else {
      showTooltip(content);
    }
  }

  // Set custom bounds for area detection
  function setCustomBounds(bounds: { left: number; right: number; top: number; bottom: number }) {
    customBounds = bounds;
  }

  // Initialize fretboard area tracking
  function initializeFretboard(element: Element) {
    fretboardElement = element;

    // Add area detection listeners
    element.addEventListener('mouseenter', handleMouseEnterArea);
    element.addEventListener('mouseleave', handleMouseLeaveArea);
  }

  // Global mouse move listener
  function handleGlobalMouseMove(event: MouseEvent) {
    updateMousePosition(event);
    
    // Update area detection
    const inArea = checkFretboardArea(event);
    if (inArea !== state.isInFretboardArea) {
      if (inArea) {
        handleMouseEnterArea();
      } else {
        handleMouseLeaveArea();
      }
    }
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('mousemove', handleGlobalMouseMove);
  });

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    clearHideTimeout();
    
    if (fretboardElement) {
      fretboardElement.removeEventListener('mouseenter', handleMouseEnterArea);
      fretboardElement.removeEventListener('mouseleave', handleMouseLeaveArea);
    }
  });

  return {
    state,
    showTooltip,
    hideTooltip,
    updateContent,
    scheduleHide,
    initializeFretboard,
    setCustomBounds,
  };
}

// Helper function to format tooltip content for notes
export function createNoteTooltipContent(data: {
  noteName: string;
  scaleDegree?: string | number;
  fret: number;
  string: number;
  instruction?: string;
}): TooltipData {
  return {
    noteName: data.noteName,
    scaleDegree: data.scaleDegree,
    fret: data.fret,
    string: data.string,
    instruction: data.instruction || 'Click to change root note',
  };
}