/** Scores that cannot be finished in three darts (double-out). */
export const IMPOSSIBLE_CHECKOUTS = new Set([
    159, 162, 163, 165, 166, 168, 169, 172, 173, 175, 176, 178, 179,
]);

export function isFinishableCheckout(remaining: number): boolean {
    return remaining >= 2 && remaining <= 170 && !IMPOSSIBLE_CHECKOUTS.has(remaining);
}

export function requiresCheckoutDartCount(
    remainingBefore: number,
    trackCheckoutRate: boolean,
): boolean {
    return trackCheckoutRate && isFinishableCheckout(remainingBefore);
}

/** Checkout finish — pick which dart closed the leg. */
export function requiresCheckoutDart(points: number, remainingBefore: number, wouldBust: boolean): boolean {
    return !wouldBust && points === remainingBefore && remainingBefore > 0;
}

/** Double-sector attempts during a checkout-zone visit. */
export function requiresDoubleDartCount(
    points: number,
    remainingBefore: number,
    wouldBust: boolean,
): boolean {
    if (!isFinishableCheckout(remainingBefore)) {
        return false;
    }

    if (wouldBust) {
        return true;
    }

    return points < remainingBefore - 1 || points === remainingBefore;
}

export function calculatorVisitNeedsModal(
    points: number,
    remainingBefore: number,
    wouldBust: boolean,
    trackCheckoutRate: boolean,
): boolean {
    return (
        requiresCheckoutDart(points, remainingBefore, wouldBust)
        || requiresCheckoutDartCount(remainingBefore, trackCheckoutRate)
        || requiresDoubleDartCount(points, remainingBefore, wouldBust)
    );
}
