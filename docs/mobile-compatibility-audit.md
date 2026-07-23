# Mobile Compatibility Audit

## Status

**Audit date:** 23 July 2026  
**Scope:** landing page, simulation screen, suspended-mass interaction, controls, readouts, measurement dialog, portrait/landscape behavior, and accessibility-related touch constraints.  
**Production-code changes in this step:** none.

This document records the baseline before the responsive implementation begins. It is intended to guide the next development stages and to prevent regressions in the desktop interface.

> Implementation update: the structural responsive stage is complete. See [`responsive-foundation.md`](./responsive-foundation.md). The measurements in this audit remain the pre-implementation baseline.

## Executive Summary

The landing page already behaves well on narrow screens: it has no page-level horizontal overflow, switches to a single-column card layout below `760 px`, and remains usable at `320 px` wide.

The simulation itself is not yet smartphone-responsive. Below `760 px`, the application deliberately keeps a `900 px`-wide SVG host inside a horizontally scrollable card. On a `320 px` viewport, the visible simulation area is only `302 px` wide, so most of the apparatus, the mass rack, part of the controls, and the suspended mass are outside the initial viewport. This is a functional desktop fallback rather than a mobile layout.

The principal blockers are:

1. the `900 px` minimum width applied to the SVG host on small screens;
2. the fixed `430 px` control panel placed absolutely over the SVG;
3. controls measuring `40 × 40 px` or `42 × 42 px`, below the intended `44 × 44 px` mobile target;
4. drag-only touch selection of suspended masses, with no simple-tap alternative;
5. lack of safe-area and dynamic-viewport handling;
6. no orientation-specific layout.

The measurement dialog is closer to mobile-ready. It stays inside the screen margins and provides internal scrolling, but it still requires horizontal table scrolling on portrait phones and its icon buttons are `42 × 42 px`.

## Audit Method

The standalone `index.html` was rendered with Chromium at the following viewport sizes:

| Profile | Viewport |
|---|---:|
| Small phone, portrait | `320 × 568 px` |
| Phone, portrait | `375 × 667 px` |
| Phone, portrait | `390 × 844 px` |
| Large phone, portrait | `430 × 932 px` |
| Phone, landscape | `667 × 375 px` |
| Large phone, landscape | `932 × 430 px` |
| Tablet, portrait | `768 × 1024 px` |
| Desktop reference | `1440 × 900 px` |

For each profile, the audit recorded:

- document and component dimensions;
- page-level and component-level horizontal overflow;
- rendered SVG scale;
- control and mass hit-area dimensions;
- modal and table scrolling behavior;
- representative screenshots of the landing page, simulation, and measurement dialog.

The raw measurements are stored in [`mobile-audit-results.json`](./mobile-audit-results.json). Screenshots are stored in [`mobile-audit-screenshots/`](./mobile-audit-screenshots/).

## Current Strengths

### Document and SVG foundations

- The document already includes a correct viewport declaration:
  `width=device-width, initial-scale=1`.
- The page shell is fluid and constrained with `min()` rather than a fixed page width.
- The apparatus SVG uses a `viewBox`, `width: 100%`, `height: auto`, and `preserveAspectRatio="xMidYMid meet"`.
- No page-level horizontal overflow was observed from `320 px` to `1440 px`.
- The application remains a single autonomous HTML file with no runtime dependency.

### Landing page

- The two mode cards switch to one column below `760 px`.
- At `320 px`, both mode cards remain fully visible and readable after vertical scrolling.
- French labels fit without horizontal clipping in the tested landing-page layouts.
- Language and project-information controls remain reachable at the top corners.

### Pointer and keyboard interaction

- Suspended-mass dragging already uses Pointer Events rather than mouse-only events.
- Pointer capture is used during a drag.
- `touch-action: none` is limited to draggable mass choices.
- Keyboard mass selection with `Enter` and `Space` is already supported.
- Icon controls have accessible names and visible focus styles.

### Measurement dialog

- The dialog uses a modal overlay and a dedicated internal scrolling region.
- The table header is sticky.
- At narrow widths, the table scrolls internally instead of forcing page-level overflow.
- The dialog remains closable by button, backdrop, and `Escape`.

## Findings by Component

### 1. Page shell

| Finding | Status | Evidence | Required response |
|---|---|---|---|
| Fluid page width | Good | No page-level horizontal overflow in any tested viewport | Preserve |
| Minimum body width | Watch | `body { min-width: 320px; }` | Accept for the current `320 px` minimum target, reconsider for split-screen contexts |
| Safe areas | Missing | No `env(safe-area-inset-*)` use | Add safe-area-aware padding for fixed corner controls and full-screen dialogs |
| Dynamic viewport units | Missing | Landing page uses `100vh`; dialog uses `vh` | Introduce `dvh` with a suitable fallback |

### 2. Landing page

| Finding | Status | Evidence | Required response |
|---|---|---|---|
| Narrow portrait layout | Good | One card column at `320–667 px` | Preserve |
| Page-level overflow | Good | None observed | Preserve |
| Vertical length | Acceptable | Landing page height is approximately `1099 px` at `320 × 568 px` | Normal vertical scrolling is acceptable |
| Fixed top controls | Watch | Language and information controls use fixed positioning at `8 px` on mobile | Include safe-area offsets and verify overlap with enlarged text |
| Landscape breakpoint | Needs review | `667 × 375 px` still uses the long one-column layout | Add orientation-aware or height-aware rules in a later stage |

### 3. Simulation canvas and apparatus

| Finding | Status | Evidence | Required response |
|---|---|---|---|
| Smartphone width | Blocking | Below `760 px`, `.apparatus-host` has `min-width: 900px` | Replace the scrolling desktop canvas with a dedicated mobile layout |
| Internal horizontal scrolling | Blocking | At `320 px`, the card is `302 px` wide and its scroll content is `900 px` wide | Eliminate as the normal mobile interaction |
| Initial apparatus visibility | Blocking | The mobile, first sensors, and part of the controls are visible; pulley, suspended mass, mass rack, and right-hand results are off-screen | Recompose the SVG or separate apparatus and controls into responsive regions |
| Fixed geometry | Expected constraint | SVG coordinates use a fixed `1200 × 620` viewBox | Preserve the physical coordinate model while changing presentation/layout |
| Tablet scaling | Mostly acceptable | At `768 px`, the SVG renders at about `734 × 379 px` with no card scroll | Verify text legibility and preserve physical alignment |
| Landscape height | Needs review | At `932 × 430 px`, the desktop-like canvas is about `464 px` tall before page padding | Add a compact landscape arrangement |

### 4. Controls and readouts

| Finding | Status | Evidence | Required response |
|---|---|---|---|
| Control panel width | Blocking | `.animation-controls` is fixed at `430 px` | Use a fluid grid/flex layout and reflow onto one or two rows |
| Absolute placement | Blocking on phones | Panel is positioned over the SVG with percentage offsets | Move controls outside the scaled apparatus region in portrait mode |
| Main control hit areas | Needs improvement | Buttons are `40 × 40 px` | Increase to at least `44 × 44 px` |
| Home button | Needs improvement | `42 × 42 px` | Increase to at least `44 × 44 px` and account for safe areas |
| Readout minimum widths | Blocking on narrow screens | Readouts use minimum widths while the panel stays fixed | Stack or grid the readouts responsively |
| Playback control | Needs redesign | Range and number fields use fixed widths (`76 px`, `54 px`) | Give the range control flexible width on mobile |
| Hover states | Neutral | Hover is not required for operation | Preserve focus and active states; add clear pressed feedback |

At `320 px`, the control panel extends from approximately `20 px` to `450 px`, beyond both the viewport and the visible card area. All five simulation action buttons measured less than `44 px` in at least one dimension.

### 5. Suspended-mass selection

| Finding | Status | Evidence | Required response |
|---|---|---|---|
| Pointer Events | Good | `pointerdown`, `pointermove`, `pointerup`, and `pointercancel` are implemented | Preserve |
| Pointer capture | Good | `setPointerCapture()` and `releasePointerCapture()` are used | Preserve |
| Touch-scroll isolation | Good | `.mass-choice { touch-action: none; }` | Preserve on the draggable target only |
| Tap alternative | Missing | Touch selection requires a successful drag to the suspended-mass target | Add simple tap/click selection |
| Mass rack visibility | Blocking | Rack is outside the initial narrow-screen view | Place the rack in a dedicated mobile control region |
| Hit-area size | Good in current fallback | Rendered mass choices are about `63 × 63 px` at the forced `900 px` canvas width | Recheck after removing the forced minimum width |

The currently selected mass is not present as an available draggable choice, so three draggable masses were measured. Their apparent size is sufficient only because the mobile canvas is forced to remain `900 px` wide.

### 6. Measurement table

| Finding | Status | Evidence | Required response |
|---|---|---|---|
| Modal width | Good foundation | At `320 px`, the dialog is approximately `300 px` wide | Preserve near-full-screen sizing |
| Table width | Partial | Portrait phones require internal horizontal scrolling | Consider shorter mobile headers, responsive column labels, or a card/table hybrid |
| Vertical capacity | Partial | At `320 × 568 px`, both horizontal and vertical table scrolling are required | Use `100dvh`, compact spacing, and a stable header |
| Dialog controls | Needs improvement | Download and close buttons are `42 × 42 px` | Increase to at least `44 × 44 px` |
| Dynamic browser chrome | Missing | Maximum height is based on `vh` | Prefer `dvh` with fallback |

Horizontal scrolling inside the table is acceptable as a fallback because four scientific columns must remain unambiguous, but it should not be the only presentation considered for the narrowest screens.

### 7. Orientation and resizing

- Breakpoints depend only on width.
- No dedicated portrait or landscape rule exists.
- No special handling exists for short landscape viewports.
- The SVG and CSS naturally recompute after resizing, so a JavaScript orientation listener is not currently required.
- Rotating during a drag has not been addressed and should be included in interaction testing after the responsive layout is implemented.

### 8. Accessibility considerations for mobile

Existing accessible names, focus indicators, keyboard controls, and modal semantics should be preserved.

The next implementation stages must additionally verify:

- `44 × 44 px` minimum interactive targets;
- no function dependent exclusively on drag-and-drop;
- correct focus visibility after responsive reordering;
- logical DOM/tab order if visual regions move;
- usability at browser text zoom and enlarged system fonts;
- safe-area spacing;
- meaningful support for `prefers-reduced-motion` beyond disabling smooth scrolling.

## Viewport Results

| Viewport | Landing page | Simulation | Measurement dialog |
|---|---|---|---|
| `320 × 568` | Pass: one column, no horizontal overflow | Fail: `302 px` visible area for `900 px` content; controls clipped | Partial: horizontal and vertical internal scrolling |
| `375 × 667` | Pass: one column, no horizontal overflow | Fail: `357 px` visible area for `900 px` content | Partial: horizontal internal scrolling |
| `390 × 844` | Pass: one column, no horizontal overflow | Fail: `372 px` visible area for `900 px` content | Partial: horizontal internal scrolling |
| `430 × 932` | Pass: one column, no horizontal overflow | Fail: `412 px` visible area for `900 px` content | Partial: horizontal internal scrolling |
| `667 × 375` | Pass, but vertically long | Fail: `649 px` visible area for `900 px` content | Partial: vertical scrolling; compact-height review required |
| `932 × 430` | Pass: two columns | Partial: no horizontal card scroll, but landscape height is tight | Partial: vertical scrolling |
| `768 × 1024` | Pass: two columns | Pass for overflow; touch targets still undersized | Pass for overflow; controls still undersized |
| `1440 × 900` | Desktop reference passes | Desktop reference passes | Desktop reference passes |

## Source Inventory for the Responsive Work

### Primary files

- `src/apparatus.css`
  - page and SVG sizing;
  - mobile breakpoint behavior;
  - control panel and readout layout;
  - mode-selection cards;
  - modal and table layout;
  - touch target dimensions.
- `scripts/build-standalone.mjs`
  - page structure;
  - viewport metadata;
  - DOM order of simulation controls and dialog.
- `src/apparatus-view.js`
  - SVG structure and accessible SVG content.
- `src/apparatus-geometry.js`
  - fixed SVG viewBox and apparatus coordinates.
- `src/mass-selector.js`
  - pointer/touch drag behavior and future tap selection.

### Supporting files

- `src/animated-app.js`
  - component initialization and rebuilding after mass selection.
- `src/simulation-controls.js`
  - control events and keyboard shortcuts.
- `src/measurement-export.js`
  - measurement dialog behavior and CSV action.
- `src/i18n.js`
  - French and English strings that must be tested at narrow widths.
- `test/interface-markup.test.js`
  - current CSS/markup expectations that will need updates as fixed dimensions are removed.
- `test/mass-selector.test.js`
  - pointer behavior and future tap-selection coverage.
- `test/apparatus-view.test.js`
  - SVG structure and viewBox expectations.

## Implementation Priorities for the Next Stage

### Priority 1 — Remove structural blockers

- Remove the `900 px` mobile minimum width.
- Replace the fixed `430 px` absolute control panel with a responsive layout.
- Keep the apparatus physically accurate while presenting controls and mass choices outside the constrained drawing when necessary.

### Priority 2 — Make every action touch-complete

- Increase all primary hit areas to at least `44 × 44 px`.
- Add tap-to-select for the suspended masses.
- Preserve pointer drag and keyboard selection.

### Priority 3 — Harden mobile viewport behavior

- Add dynamic viewport units.
- Add safe-area-aware spacing.
- Add portrait and short-landscape rules.
- Retest both French and English text.

### Priority 4 — Refine the measurement dialog

- Increase dialog button targets.
- Reduce the cost of horizontal table scrolling on narrow screens.
- Verify all eleven records with dynamic browser chrome visible.

## Acceptance Baseline for the Responsive Implementation

The mobile implementation should not be considered complete until all of the following are true:

- no page-level or apparatus-level horizontal scrolling is required at `320 px` width;
- the entire apparatus workflow is reachable without panning a desktop-sized canvas;
- all commands and mass choices are operable by touch without relying on drag alone;
- all interactive targets are at least `44 × 44 px`;
- French and English labels remain legible without zoom;
- portrait and landscape orientations are both usable;
- the measurement dialog remains usable with eleven rows;
- desktop behavior and physical-coordinate accuracy remain unchanged;
- the standalone `index.html`, automated tests, and smoke test continue to pass.
