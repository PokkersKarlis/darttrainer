export type GameFrame = 'landscape' | 'portrait' | 'square';

/**
 * Width/height ratio at or below this → portrait (clearly taller than wide).
 * Reciprocal of {@link SQUARE_MAX_RATIO} so the "square" band is symmetric
 * around a true 1:1 ratio.
 */
export const SQUARE_MIN_RATIO = 0.8;

/** Width/height ratio at or above this → landscape (clearly wider than tall). */
export const SQUARE_MAX_RATIO = 1.25;

/**
 * Single source of truth for the 3-breakpoint game frame system:
 * `portrait` (tall), `square` (near 1:1), `landscape` (wide). Every darts
 * lobby/play screen scales proportionally within one of these 3 frames via
 * useGameViewportFit — there is no separate raw-pixel "mobile" breakpoint.
 */
export function resolveGameFrame(width: number, height: number): GameFrame {
    if (width <= 0 || height <= 0) {
        return 'portrait';
    }

    const ratio = width / height;

    if (ratio >= SQUARE_MAX_RATIO) {
        return 'landscape';
    }

    if (ratio <= SQUARE_MIN_RATIO) {
        return 'portrait';
    }

    return 'square';
}
