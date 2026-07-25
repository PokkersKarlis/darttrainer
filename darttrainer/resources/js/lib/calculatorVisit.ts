import { achievableDartCounts, pointsToDart } from '@/lib/dartPoints';

function validDartScores(): number[] {
    const scores = [0];
    for (let sector = 1; sector <= 20; sector++) {
        scores.push(sector, sector * 2, sector * 3);
    }
    scores.push(25, 50);

    return [...new Set(scores)].sort((a, b) => b - a);
}

function enumerateScoreCombinations(target: number, dartCount: number): number[][] {
    const results: number[][] = [];

    function collect(remaining: number, dartsLeft: number, current: number[]): void {
        if (dartsLeft === 0) {
            if (remaining === 0) {
                results.push(current);
            }

            return;
        }

        for (const score of validDartScores()) {
            if (score > remaining) {
                continue;
            }

            collect(remaining - score, dartsLeft - 1, [...current, score]);
        }
    }

    collect(target, dartCount, []);

    return results;
}

function permuteScores(scores: number[]): number[][] {
    if (scores.length <= 1) {
        return [scores];
    }

    const permutations: number[][] = [];

    for (let index = 0; index < scores.length; index++) {
        const rest = scores.filter((_, i) => i !== index);
        for (const perm of permuteScores(rest)) {
            permutations.push([scores[index], ...perm]);
        }
    }

    const unique = new Map<string, number[]>();
    for (const perm of permutations) {
        unique.set(perm.join(','), perm);
    }

    return [...unique.values()];
}

function scoresToDarts(scores: number[]): Array<{ sector: number; multiplier: number }> | null {
    const darts = [];

    for (const score of scores) {
        const dart = pointsToDart(score);
        if (dart === null) {
            return null;
        }
        darts.push(dart);
    }

    return darts;
}

function dartPoints(sector: number, multiplier: number): number {
    if (sector === 0) {
        return 0;
    }

    if (sector === 25) {
        return multiplier === 2 ? 50 : 25;
    }

    return sector * multiplier;
}

function isDoubleDart(sector: number, multiplier: number): boolean {
    return multiplier === 2;
}

export function countDoublesInDarts(darts: Array<{ sector: number; multiplier: number }>): number {
    return darts.filter((dart) => dart.multiplier === 2).length;
}

export function sequenceMatchesCheckout(
    darts: Array<{ sector: number; multiplier: number }>,
    remainingBefore: number,
    checkoutDart: number,
    requireDoubleOut: boolean,
): boolean {
    let running = remainingBefore;

    for (let index = 0; index < darts.length; index++) {
        const dart = darts[index];
        const points = dartPoints(dart.sector, dart.multiplier);

        if (points === 0) {
            continue;
        }

        const candidate = running - points;

        if (candidate < 0) {
            return false;
        }

        if (candidate === 1 && requireDoubleOut) {
            return false;
        }

        if (candidate === 0) {
            if (index + 1 !== checkoutDart) {
                return false;
            }

            if (requireDoubleOut && !isDoubleDart(dart.sector, dart.multiplier)) {
                return false;
            }

            return true;
        }

        running = candidate;
    }

    return false;
}

export interface VisitBuildConstraints {
    remainingBefore?: number;
    checkoutDart?: number;
    requireDoubleOut?: boolean;
}

/** Double attempts achievable for this visit total and dart-count options. */
export function achievableDoubleDartCounts(
    points: number,
    dartCounts?: number[],
    constraints?: VisitBuildConstraints,
): number[] {
    const counts = dartCounts ?? achievableDartCounts(points);
    const doubles = new Set<number>();

    for (const dartCount of counts) {
        if (
            constraints?.checkoutDart !== undefined
            && constraints.checkoutDart > dartCount
        ) {
            continue;
        }

        for (const combo of enumerateScoreCombinations(points, dartCount)) {
            for (const ordered of permuteScores(combo)) {
                const darts = scoresToDarts(ordered);
                if (darts === null) {
                    continue;
                }

                if (
                    constraints?.checkoutDart !== undefined
                    && constraints.remainingBefore !== undefined
                ) {
                    if (
                        !sequenceMatchesCheckout(
                            darts,
                            constraints.remainingBefore,
                            constraints.checkoutDart,
                            constraints.requireDoubleOut ?? true,
                        )
                    ) {
                        continue;
                    }
                }

                doubles.add(countDoublesInDarts(darts));
            }
        }
    }

    return [...doubles].sort((a, b) => a - b);
}

/** Which dart (1-based) can legally finish when scoring exactly the remaining. */
export function achievableCheckoutDarts(
    points: number,
    remainingBefore: number,
    dartCount: number | null,
    requireDoubleOut: boolean,
): number[] {
    const counts = dartCount !== null ? [dartCount] : achievableDartCounts(points);
    const checkoutDarts = new Set<number>();

    for (const count of counts) {
        for (let checkoutDart = 1; checkoutDart <= count; checkoutDart++) {
            for (const combo of enumerateScoreCombinations(points, count)) {
                for (const ordered of permuteScores(combo)) {
                    const darts = scoresToDarts(ordered);
                    if (darts === null) {
                        continue;
                    }

                    if (sequenceMatchesCheckout(darts, remainingBefore, checkoutDart, requireDoubleOut)) {
                        checkoutDarts.add(checkoutDart);
                        break;
                    }
                }

                if (checkoutDarts.has(checkoutDart)) {
                    break;
                }
            }
        }
    }

    return [...checkoutDarts].sort((a, b) => a - b);
}

/** Minimum darts required to score this visit total. */
export function minimumDartCountForVisit(points: number): number | null {
    const counts = achievableDartCounts(points);

    return counts.length > 0 ? Math.min(...counts) : null;
}
