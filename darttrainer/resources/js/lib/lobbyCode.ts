export const LOBBY_CODE_PATTERN = /^\d{2,4}-\d{2,4}$/;

export function normalizeLobbyCode(code: string): string {
    return code.replace(/\s+/g, '');
}

export function isValidLobbyCode(code: string): boolean {
    return LOBBY_CODE_PATTERN.test(normalizeLobbyCode(code));
}

export function sanitizeLobbyCodeInput(value: string): string {
    const cleaned = value.replace(/[^\d-]/g, '');
    const dashIndex = cleaned.indexOf('-');

    if (dashIndex === -1) {
        return cleaned.slice(0, 4);
    }

    const left = cleaned.slice(0, dashIndex).replace(/-/g, '').slice(0, 4);
    const right = cleaned.slice(dashIndex + 1).replace(/-/g, '').slice(0, 4);

    return `${left}-${right}`;
}
