import { resolveGameFrame } from '@/lib/gameFrame';
import { computed, onMounted, onUnmounted, ref } from 'vue';

export type GameFrame = 'landscape' | 'portrait' | 'square';

export function useGameResponsive() {
    const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1280);
    const height = ref(typeof window !== 'undefined' ? window.innerHeight : 720);

    const aspectRatio = computed(() => (height.value === 0 ? 1 : width.value / height.value));

    const frame = computed<GameFrame>(() => resolveGameFrame(width.value, height.value));

    // Mobilajās pārlūkprogrammās (īpaši iOS Safari) window.innerWidth/innerHeight
    // maiņa, kad pārlūka adrešu josla sabrūk/parādās pēc lapas ielādes, ne vienmēr
    // uzticami izraisa `resize` notikumu — tāpēc `frame` varēja "iesprūst" nepareizā
    // stāvoklī uzreiz pēc pārlādes (kamēr adrešu josla vēl bija redzama), un neko
    // vairs nekoriģēja, jo neviens notikums neatnāca. `window.visualViewport` ziņo
    // par patiesi redzamo laukumu un savu 'resize' notikumu izraisa uzticami arī
    // šajos gadījumos, tāpēc dodam tam priekšroku, ja tas ir pieejams.
    function readViewportSize() {
        const vv = window.visualViewport;
        if (vv) {
            return { w: vv.width, h: vv.height };
        }

        return { w: window.innerWidth, h: window.innerHeight };
    }

    function update() {
        const { w, h } = readViewportSize();
        width.value = w;
        height.value = h;
    }

    let settleTimeoutId: ReturnType<typeof setTimeout> | undefined;

    onMounted(() => {
        update();

        window.visualViewport?.addEventListener('resize', update);
        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);

        // Drošības tīkls: dažās pārlūkprogrammās adrešu joslas sabrukšana īsi pēc
        // pārlādes noris bez jebkāda notikuma vispār — pārbaudām vēlreiz pēc brīža.
        settleTimeoutId = setTimeout(update, 400);
    });

    onUnmounted(() => {
        window.visualViewport?.removeEventListener('resize', update);
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update);
        clearTimeout(settleTimeoutId);
    });

    return {
        width,
        height,
        aspectRatio,
        frame,
    };
}
