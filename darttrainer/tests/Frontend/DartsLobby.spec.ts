import { friendActivityClass } from '@/lib/friendActivity';
import { resolveGameFrame } from '@/lib/gameFrame';
import { copyLobbyCode } from '@/stores/dartsLobbyActions';
import { describe, expect, it, vi } from 'vitest';

describe('useGameResponsive frame resolution', () => {
    it('test_ui_renders_3_responsive_layouts', () => {
        expect(resolveGameFrame(390, 844)).toBe('portrait');
        expect(resolveGameFrame(1366, 768)).toBe('landscape');
        expect(resolveGameFrame(700, 400)).toBe('landscape');
        expect(resolveGameFrame(844, 390)).toBe('landscape');
    });
});

describe('lobby code copy', () => {
    it('test_lobby_code_header_copy_feature', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal('navigator', {
            clipboard: { writeText },
        });

        await expect(copyLobbyCode('12-3456')).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith('12-3456');

        vi.unstubAllGlobals();
    });
});

describe('friend list status indicators', () => {
    it('test_friendlist_status_indicators', () => {
        expect(friendActivityClass('online')).toBe('xl-dot--green');
        expect(friendActivityClass('away')).toBe('xl-dot--amber');
        expect(friendActivityClass('in_game')).toBe('xl-dot--red');
        expect(friendActivityClass('in_lobby')).toBe('xl-dot--cyan');
    });
});
