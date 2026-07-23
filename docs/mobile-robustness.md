# Mobile Robustness

This document records the current mobile behavior of the standalone horizontal-track simulation. Historical audit reports, raw browser measurements, and intermediate screenshots were removed during repository cleanup because they no longer represented the current interface.

## Supported Layouts

The interface supports:

- portrait phones from `320 px` wide;
- short landscape phones down to `568 × 320 px`;
- tablets in portrait and landscape orientations;
- desktop layouts up to the restored `1440 px` maximum interface width.

The page avoids global horizontal scrolling. The SVG apparatus is recropped without changing the physical coordinate system, and controls are repositioned according to the available width and height.

## Touch Interaction

Suspended masses can be selected by:

- tapping the dedicated large mobile buttons;
- clicking the SVG masses;
- dragging and dropping on supported pointer devices;
- using `Enter` or `Space` from the keyboard.

Primary interactive targets are at least `44 × 44 px`. Interrupted pointer gestures are cancelled cleanly, and viewport changes trigger a fresh responsive layout calculation.

## Phone-Specific Navigation

The overlaid home button is hidden in phone layouts in both portrait and landscape orientations because it can overlap content or conflict with browser gestures. On larger screens, the button remains available. On a phone, reloading the page returns to the language and mode selection screen.

## Measurement Dialog

On narrow screens, measurement rows are presented as cards rather than a horizontally compressed table. The dialog:

- traps keyboard focus;
- closes with its close button, the backdrop, or `Escape`;
- prevents interaction with the apparatus while open;
- locks page scrolling;
- restores focus to the table button when closed;
- keeps the localized CSV download available.

## Accessibility and User Preferences

The simulation includes visible focus states, translated accessible names, a live simulation-status announcement, reduced decorative motion when requested, and forced-color support. The physical animation remains active under reduced-motion preferences because it conveys the scientific behavior being studied.

## Validation

The automated test suite covers the physical model, exact events, localization, measurement formatting, touch and keyboard selection, modal behavior, responsive viewport selection, and standalone generation.

Run the current checks with:

```bash
npm test
npm run build
npm run smoke
```

Automated browser checks are useful, but final validation on representative physical smartphones remains recommended before public deployment.
