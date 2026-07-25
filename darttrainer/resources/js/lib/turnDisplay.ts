export type TurnInputSource = 'board' | 'calculator';

export interface TurnDart {
    sector: number;
    multiplier: number;
    points?: number;
    input_source?: TurnInputSource;
}

export function boardDartLabel(sector: number, multiplier: number): string {
    if (sector === 0 || multiplier === 0) {
        return 'MISS';
    }

    if (multiplier === 3) {
        return `T-${sector}`;
    }

    if (multiplier === 2) {
        return `D-${sector}`;
    }

    return `S-${sector}`;
}

/** Compact labels for turn history chips. */
export function shortBoardDartLabel(sector: number, multiplier: number): string {
    if (sector === 0 || multiplier === 0) {
        return 'M';
    }

    if (multiplier === 3) {
        return `T${sector}`;
    }

    if (multiplier === 2) {
        return `D${sector}`;
    }

    return `${sector}`;
}

export function isMissDart(sector: number, multiplier: number): boolean {
    return sector === 0 || multiplier === 0;
}
