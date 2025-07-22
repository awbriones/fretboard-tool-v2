import { reactive } from 'vue';

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
  isTransitioning: boolean;
}

export function useFretboardTooltip() {
  const state = reactive<TooltipState>({
    visible: false,
    content: null,
    x: 0,
    y: 0,
    isTransitioning: false,
  });

  let hideTimeout: number | null = null;
  let currentNoteId: string | null = null;

  function clearHideTimeout() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  // Calculate anchor position below a note using SVG coordinates
  function calculateNoteAnchorPosition(
    noteCenterX: number, 
    noteCenterY: number, 
    svgElement: SVGSVGElement
  ): { x: number; y: number } {
    const svgRect = svgElement.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    // Convert SVG coordinates to screen coordinates
    const screenX = svgRect.left + scrollX + noteCenterX;
    const screenY = svgRect.top + scrollY + noteCenterY;
    
    return {
      x: screenX, // Note center X - tooltip will center itself via CSS transform
      y: screenY + 20 // Position below note (24px radius + 8px offset)
    };
  }

  // Show tooltip for a note (either first time or transition)
  function showNoteTooltip(
    noteId: string, 
    content: TooltipData, 
    noteCenterX: number,
    noteCenterY: number,
    svgElement: SVGSVGElement
  ) {
    clearHideTimeout();
    
    const anchorPosition = calculateNoteAnchorPosition(noteCenterX, noteCenterY, svgElement);
    
    if (!state.visible) {
      // First time showing tooltip
      state.content = content;
      state.x = anchorPosition.x;
      state.y = anchorPosition.y;
      state.visible = true;
      currentNoteId = noteId;
    } else if (currentNoteId !== noteId) {
      // Transitioning to new note
      state.isTransitioning = true;
      
      // Update content immediately for responsive feel
      state.content = content;
      
      // Animate to new position
      state.x = anchorPosition.x;
      state.y = anchorPosition.y;
      
      // Reset transition flag after animation completes
      setTimeout(() => {
        state.isTransitioning = false;
      }, 250); // Match CSS transition duration
      
      currentNoteId = noteId;
    }
    // If same note, do nothing (tooltip stays in same position)
  }

  // Hide tooltip with delay
  function hideTooltip(delay = 200) {
    clearHideTimeout();
    currentNoteId = null;
    
    hideTimeout = window.setTimeout(() => {
      state.visible = false;
      state.content = null;
      state.isTransitioning = false;
    }, delay);
  }

  // Hide tooltip immediately (for cleanup)
  function hideTooltipImmediately() {
    clearHideTimeout();
    state.visible = false;
    state.content = null;
    state.isTransitioning = false;
    currentNoteId = null;
  }

  // Legacy method for updating content (kept for compatibility)
  function updateContent(content: TooltipData) {
    if (state.visible) {
      state.content = content;
    }
  }

  // Initialize fretboard (kept for compatibility but simplified)
  function initializeFretboard() {
    // Store reference but don't set up mouse listeners since we handle them per-note
    // This is kept for potential future use
  }

  return {
    state,
    showNoteTooltip,
    hideTooltip,
    hideTooltipImmediately,
    updateContent, // Legacy compatibility
    initializeFretboard, // Legacy compatibility
  };
}

// Helper function to create tooltip content (kept for compatibility)
export function createNoteTooltipContent(data: {
  noteName: string;
  scaleDegree?: string;
  fret: number;
  string: number;
  instruction?: string;
}): TooltipData {
  return {
    noteName: data.noteName,
    scaleDegree: data.scaleDegree,
    fret: data.fret,
    string: data.string,
    instruction: data.instruction,
  };
}