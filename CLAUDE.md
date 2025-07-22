# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server:**
```bash
npm run serve
```

**Build for production:**
```bash
npm run build
```

**Lint and fix code:**
```bash
npm run lint
```

**Install dependencies:**
```bash
npm install
```

## Project Vision

This is a Vue 3 fretboard visualization tool for guitar and bass that displays scales, notes, and supports interactive music theory exploration. The project is undergoing refactoring to integrate Tonal.js for better music theory calculations and to implement multiple interaction modes for enhanced learning and exploration.

## Architecture Overview

This is a Vue 3 fretboard visualization tool built with TypeScript, Pinia for state management, and SCSS for styling. The application displays interactive fretboard diagrams for guitar and bass with scale visualization capabilities.

### Current Features
- Interactive fretboard display with configurable tuning and string count
- Scale visualization (major, minor, pentatonic, blues, modal scales)
- Smart toggle components (degrees/notes, guitar/bass) with programmatic sizing
- Piano-style key selector with full keyboard accessibility and dynamic accidental display
- Customizable highlighting for each scale degree (show/hide, color, brightness)
- Smooth note-anchored tooltips with proper musical notation (♭2nd, ♯4th, ♭7th)
- Element-positioned tooltips with viewport collision detection
- SVG-based rendering with hybrid text+symbol note labels
- Highlighted fret numbers for marker positions (3, 5, 7, 9, 12, 15)

### Recent Major Improvements (Latest Session)
- **Tooltip System Overhaul**: Replaced mouse-following tooltips with smooth note-anchored positioning
- **Piano Key Selector**: Custom piano-style interface replacing dropdown with accessibility features  
- **Smart Toggle Components**: Programmatically sized toggles that adapt to text content
- **Element Tooltips**: Fast, reactive tooltips for UI controls with state change updates
- **Musical Notation**: Proper scale degrees (♭2nd, ♯4th) and hybrid text+symbol rendering

### Known Issues & Limitations
- Manual music theory calculations (Tonal.js integration in progress)
- Limited extensibility for new scales/modes  
- Fixed fret count (15 frets)
- Notes only interactive when visible (no empty fret interaction)

### Key Architecture Components

**State Management:**
- Uses Pinia store (`src/stores/fretboard.ts`) as the single source of truth
- Store manages root note, selected scale, tuning, fret/string counts, and display settings
- Composables (`src/composables/`) provide reusable logic for fretboard and scale operations

**Core Data Flow:**
1. User selects root note and scale via header controls
2. Store computes fretboard notes using scale intervals and tuning
3. `FretboardDisplay` component renders SVG visualization
4. Settings components control note display and highlighting

**Type System:**
- `Scale` interface defines scale name and interval patterns
- `FretboardNote` extends base `Note` with string/fret positioning
- `ScaleDegree` interface for scale degree labeling

**Note Calculation:**
- Uses chromatic note array: `["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]`
- Interval calculation: `(noteIndex - rootIndex + 12) % 12`
- Scale degree matching via `scale.intervals.indexOf(interval)`

### Component Structure

**Main App (`src/App.vue`):**
- Sticky header with key/scale/instrument selectors
- Scrollable fretboard display container
- Bottom settings panel

**Key Components:**
- `FretboardDisplay.vue` - SVG-based fretboard visualization with note-anchored tooltips
- `KeySelector.vue` - Piano-style root note selection with accessibility
- `ScaleSelector.vue` - Scale pattern selection
- `InstrumentSelector.vue` - Smart toggle for guitar/bass switching
- `HighlightSettings.vue` - Scale degree display controls with element tooltips
- `SmartToggleSwitch.vue` - Programmatically-sized toggle component
- `ElementTooltip.vue` - Element-positioned tooltips with collision detection
- `NoteLabel.vue` - Hybrid text+symbol note rendering component
- `TooltipContainer.vue` - Smooth-transitioning tooltip container

**New Composables:**
- `useFretboardTooltip.ts` - Note-anchored tooltip system with SVG coordinate conversion
- `useElementTooltip.ts` - Element-positioned tooltips with smart timing and reactivity
- `useSimpleTooltip.ts` - Basic mouse-following tooltip system

### Development Patterns

**Path Aliases:**
- `@/` maps to `src/` directory via tsconfig.json

**Styling:**
- SCSS with CSS custom properties for theming
- Global styles in `src/assets/global.scss`
- Component-scoped styles using `<style lang="scss">`

**State Updates:**
- Use store methods like `setRootNote()`, `setSelectedScale()`, `setInstrument()`
- Store automatically recomputes fretboard notes when dependencies change
- Components use `storeToRefs()` for reactive store access

**SVG Assets:**
- Note and degree SVG icons in `src/assets/svgs/`
- Icons imported via `src/utils/svgPaths.ts`

## Refactoring Goals & Priorities

### 1. Tonal.js Integration
- Replace manual interval calculations with Tonal.js music theory library
- Use Tonal for scale/mode generation and chord detection
- Make it easier to add new scales, modes, and chord types
- Leverage Tonal for more accurate music theory calculations

### 2. Interaction Modes System
Implement different cursor/interaction modes:
- **Root Selection Mode**: Click any note to change root
- **Relative Mode Finder**: Click to find relative modes at that position
- **Note Toggle Mode**: Show/hide individual notes
- **Scale Builder Mode**: Build custom scales by clicking
- **Chord Detection Mode**: Show chord names when selecting multiple notes

### 3. Enhanced Customization
- Adjustable fret count (12, 15, 21, 24, or custom)
- Fret spacing slider (realistic logarithmic vs uniform spacing)
- String count flexibility (4, 5, 6, 7, 8 strings)
- Custom tuning presets

### 4. Improved Data Architecture
- Refactor core data structures for better extensibility
- Create a more robust fretboard state model
- Ensure all fret positions are interactable (even empty ones)
- Better separation of concerns between display and logic

### 5. UI Component Library
- Consider integrating shadcn/vue or similar for consistent UI components
- Maintain custom styling to match the existing dark theme aesthetic
- Components needed: sliders, dropdowns, modals, tooltips

## Design Principles

- **Dark theme** with specific color palette for each chromatic note
- **Smooth animations** and transitions
- **Minimal, professional** aesthetic
- **High contrast** for visibility
- **Consistent spacing** and visual hierarchy

## Future Considerations

- MIDI input/output support
- Sound playback
- Chord progression tools
- Scale practice modes
- Export/sharing functionality

## Framework Versions

- Vue 3.2.13 with Composition API
- TypeScript 4.5.5
- Pinia 2.1.7 for state management
- Vue CLI 5.0.0 build system
- D3.js 7.9.0 for potential data visualization enhancements