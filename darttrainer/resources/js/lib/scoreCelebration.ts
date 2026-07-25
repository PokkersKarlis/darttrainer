export type ScoreCelebrationTier =
    | 'solid'
    | 'good'
    | 'great'
    | 'maximum'
    | 'special171'
    | 'bigFish';

export interface ScoreCelebration {
    tier: ScoreCelebrationTier;
    points: number;
}

type DartThrow = { sector: number; multiplier: number };

export function isTriple19Visit(throws: DartThrow[]): boolean {
    return throws.length === 3
        && throws.every((dart) => dart.sector === 19 && dart.multiplier === 3);
}

export function resolveScoreCelebration(
    points: number,
    throws: DartThrow[],
    isCheckout: boolean,
): ScoreCelebration | null {
    if (points < 95) {
        return null;
    }

    if (isCheckout && points === 170) {
        return { tier: 'bigFish', points };
    }

    if (points === 171 && isTriple19Visit(throws)) {
        return { tier: 'special171', points };
    }

    if (points === 180) {
        return { tier: 'maximum', points };
    }

    if (points >= 140 && points <= 179) {
        return { tier: 'great', points };
    }

    if (points >= 121 && points <= 139) {
        return { tier: 'good', points };
    }

    if (points >= 95 && points <= 120) {
        return { tier: 'solid', points };
    }

    return null;
}
