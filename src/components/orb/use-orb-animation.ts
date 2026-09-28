// Shared clock for DreamOrb (native + web). Adapted from thinking-orbs-native
// (MIT © Jakub Antalik, https://github.com/Jakubantalik/thinking-orbs).
//
// Geometry comes from `thinking-orbs/engine`: each frame is a finished,
// z-sorted list of dots (and lines for `connecting`) at the 64 px preset.
// Renderers only scale and draw it.

import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion, type SharedValue } from 'react-native-reanimated';
import { MODE_FRAMES, resolvePreset, type OrbFrame, type OrbState } from 'thinking-orbs/engine';

export type { OrbFrame, OrbState };

/** The tuned design size. Frames are drawn at this size and scaled up. */
export const PRESET_SIZE = 64;

/** How much faster the orb spins at full voice level. */
const LEVEL_SPEED_BOOST = 3;

/** The static frame reduced-motion users see (same instant as the web package). */
const REDUCED_MOTION_T = 0.6;

type Options = {
  speed?: number;
  /** Live audio level 0–1; speeds the animation up while you speak. */
  level?: SharedValue<number>;
  paused?: boolean;
};

const now = () => (globalThis.performance?.now?.() ?? Date.now()) / 1000;

/** False while the app is backgrounded, so the render loop stops. */
function useAppActive() {
  const [active, setActive] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s !== 'background'));
    return () => sub.remove();
  }, []);
  return active;
}

/** Runs the frame loop and calls `draw` with each new frame. */
export function useOrbAnimation(
  state: OrbState,
  { speed = 1, level, paused = false }: Options,
  draw: (frame: OrbFrame) => void,
) {
  const reduced = useReducedMotion();
  const appActive = useAppActive();
  const {
    mode,
    speed: baseSpeed,
    opts,
  } = useMemo(() => resolvePreset(state, PRESET_SIZE), [state]);

  // Keep time across state changes so switching states doesn't jump back to t=0.
  const time = useRef(1.3);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const build = MODE_FRAMES[mode];
    const render = (t: number) => drawRef.current(build(PRESET_SIZE, t, opts));

    if (reduced) {
      render(REDUCED_MOTION_T);
      return;
    }

    // Draw once even when paused, so the orb is never blank.
    render(time.current);
    if (paused || !appActive) return;

    let raf = 0;
    let running = true;
    let last = now();
    const loop = () => {
      const n = now();
      const dt = Math.min(0.1, n - last);
      last = n;
      const boost = 1 + (level ? level.get() : 0) * LEVEL_SPEED_BOOST;
      time.current += dt * baseSpeed * speed * boost;
      render(time.current);
      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [mode, opts, baseSpeed, speed, level, paused, reduced, appActive]);
}

/**
 * Grey level for a dot. The engine's ink is for paper, so on our dark background
 * it's mirrored; on a white surface (`onPaper`) it's used as-is.
 */
export function inkGrey(white: number, onPaper = false) {
  const w = Math.min(1, Math.max(0, white));
  return Math.round((onPaper ? w : 1 - w) * 255);
}
