/**
 * Evaluate a simple visit-total expression (+, -, *).
 * Result must be a valid visit total (0–180).
 */
export const VISIT_POINTS_MIN = 1;
export const VISIT_POINTS_MAX = 180;

export function evaluateVisitExpression(raw: string): number | null {
    const expr = raw.trim().replace(/\s/g, '');

    if (expr === '') {
        return null;
    }

    if (!/^[\d+\-*]+$/.test(expr)) {
        return null;
    }

    const tokens = expr.match(/(\d+|[+\-*])/g);

    if (!tokens || tokens.length === 0) {
        return null;
    }

    const first = Number.parseInt(tokens[0], 10);

    if (!Number.isFinite(first)) {
        return null;
    }

    let result = first;

    for (let index = 1; index < tokens.length; index += 2) {
        const operator = tokens[index];
        const operand = Number.parseInt(tokens[index + 1] ?? '', 10);

        if (!Number.isFinite(operand)) {
            return null;
        }

        if (operator === '+') {
            result += operand;
        } else if (operator === '-') {
            result -= operand;
        } else if (operator === '*') {
            result *= operand;
        } else {
            return null;
        }
    }

    if (result < 0 || result > VISIT_POINTS_MAX) {
        return null;
    }

    return result;
}

/** Whether appending a digit keeps the visit entry within 1–180 rules. */
export function canAppendVisitDigit(current: string, digit: string): boolean {
    if (!/^\d$/.test(digit)) {
        return false;
    }

    const candidate = `${current}${digit}`.replace(/\s/g, '');

    if (candidate.length > 14) {
        return false;
    }

    if (/^\d+$/.test(candidate)) {
        if (candidate.startsWith('0')) {
            return false;
        }

        return Number.parseInt(candidate, 10) <= VISIT_POINTS_MAX;
    }

    const tokens = candidate.match(/\d+/g) ?? [];

    for (const token of tokens) {
        if (token.startsWith('0')) {
            return false;
        }

        if (Number.parseInt(token, 10) > VISIT_POINTS_MAX) {
            return false;
        }
    }

    const value = evaluateVisitExpression(candidate);

    return value === null || value <= VISIT_POINTS_MAX;
}

/** @deprecated Use evaluateVisitExpression — kept for turn-edit single-dart arithmetic. */
export function evaluateDartExpression(raw: string): number | null {
    const expr = raw.trim().replace(/\s/g, '');

    if (expr === '') {
        return null;
    }

    if (!/^[\d+\-*]+$/.test(expr)) {
        return null;
    }

    const tokens = expr.match(/(\d+|[+\-*])/g);

    if (!tokens || tokens.length === 0) {
        return null;
    }

    const first = Number.parseInt(tokens[0], 10);

    if (!Number.isFinite(first)) {
        return null;
    }

    let result = first;

    for (let index = 1; index < tokens.length; index += 2) {
        const operator = tokens[index];
        const operand = Number.parseInt(tokens[index + 1] ?? '', 10);

        if (!Number.isFinite(operand)) {
            return null;
        }

        if (operator === '+') {
            result += operand;
        } else if (operator === '-') {
            result -= operand;
        } else if (operator === '*') {
            result *= operand;
        } else {
            return null;
        }
    }

    if (result < 0 || result > 60) {
        return null;
    }

    return result;
}

export function isValidDartExpression(raw: string): boolean {
    return evaluateDartExpression(raw) !== null;
}

export function isValidVisitExpression(raw: string): boolean {
    return evaluateVisitExpression(raw) !== null;
}
