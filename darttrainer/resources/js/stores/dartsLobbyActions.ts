export async function copyLobbyCode(code: string | null): Promise<boolean> {
    if (!code) {
        return false;
    }

    try {
        await navigator.clipboard.writeText(code);
        return true;
    } catch {
        return false;
    }
}

export function applyStartingPoints(
    config: { starting_points: 301 | 501; in_rule: 'straight' | 'double'; out_rule: 'straight' | 'double' },
    points: 301 | 501,
): void {
    config.starting_points = points;

    if (points === 301) {
        config.in_rule = 'double';
        config.out_rule = 'double';
        return;
    }

    config.in_rule = 'straight';
    config.out_rule = 'double';
}
