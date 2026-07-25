export function pointsToDart(points: number): { sector: number; multiplier: number } | null {
    if (points === 0) {
        return { sector: 0, multiplier: 0 };
    }

    if (points === 50) {
        return { sector: 25, multiplier: 2 };
    }

    if (points === 25) {
        return { sector: 25, multiplier: 1 };
    }

    if (points >= 1 && points <= 20) {
        return { sector: points, multiplier: 1 };
    }

    if (points % 2 === 0 && points >= 2 && points <= 40) {
        return { sector: points / 2, multiplier: 2 };
    }

    if (points % 3 === 0 && points >= 3 && points <= 60) {
        const sector = points / 3;
        if (sector >= 1 && sector <= 20) {
            return { sector, multiplier: 3 };
        }
    }

    return null;
}

function validDartScores(): number[] {
    const scores = [0];
    for (let sector = 1; sector <= 20; sector++) {
        scores.push(sector, sector * 2, sector * 3);
    }
    scores.push(25, 50);

    return [...new Set(scores)].sort((a, b) => b - a);
}

function findDartScoreCombination(target: number, dartsLeft: number): number[] | null {
    if (target === 0) {
        return [];
    }

    if (dartsLeft === 0) {
        return null;
    }

    for (const score of validDartScores()) {
        if (score > target) {
            continue;
        }

        const rest = findDartScoreCombination(target - score, dartsLeft - 1);
        if (rest !== null) {
            return [score, ...rest];
        }
    }

    return null;
}

/** Can this visit total be scored with 1–3 darts? */
export function isAchievableVisitTotal(points: number): boolean {
    if (!Number.isFinite(points) || points < 0 || points > 180) {
        return false;
    }

    for (let dartCount = 1; dartCount <= 3; dartCount++) {
        if (findDartScoreCombination(points, dartCount) !== null) {
            return true;
        }
    }

    return false;
}

export function isValidVisitPoints(points: number): boolean {
    return isAchievableVisitTotal(points);
}

/** Which visit lengths (1–3 darts) can produce this total? */
export function achievableDartCounts(points: number): number[] {
    if (!Number.isFinite(points) || points < 0 || points > 180) {
        return [];
    }

    const counts: number[] = [];

    for (let dartCount = 1; dartCount <= 3; dartCount++) {
        if (findDartScoreCombination(points, dartCount) !== null) {
            counts.push(dartCount);
        }
    }

    return counts;
}

/** Decompose a visit total into 1–3 valid dart scores (prefers fewer darts). */
export function visitPointsToDarts(points: number, dartCount?: number): Array<{ sector: number; multiplier: number }> | null {
    if (points < 0 || points > 180) {
        return null;
    }

    const counts = dartCount !== undefined ? [dartCount] : [1, 2, 3];

    for (const count of counts) {
        const scores = findDartScoreCombination(points, count);
        if (scores === null) {
            continue;
        }

        const ordered = [...scores].reverse();
        const darts = [];

        for (const score of ordered) {
            const dart = pointsToDart(score);
            if (dart === null) {
                return null;
            }
            darts.push(dart);
        }

        return darts;
    }

    return null;
}
