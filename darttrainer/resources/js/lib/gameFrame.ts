export type GameFrame = 'landscape' | 'portrait' | 'square';

/** Reference height for desktop landscape (HP Omen baseline — Jul 2026). */
export const LANDSCAPE_MIN_HEIGHT = 500;

/** Width/height ratio at or above this → landscape play layout (scaled on smaller viewports). */
export const LANDSCAPE_MIN_RATIO = 0.95;

/**
 * Portrait when taller than wide; otherwise landscape (same layout everywhere wide, scaled via viewport fit).
 * `square` is kept for legacy CSS hooks but no longer returned here.
 */
export function resolveGameFrame(width: number, height: number): GameFrame {
    if (width <= 0 || height <= 0) {
        return 'portrait';
    }

    if (width / height >= LANDSCAPE_MIN_RATIO) {
        return 'landscape';
    }

    return 'portrait';
}
