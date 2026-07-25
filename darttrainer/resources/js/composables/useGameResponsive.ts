import { LANDSCAPE_MIN_HEIGHT, resolveGameFrame } from '@/lib/gameFrame';
import { computed, onMounted, onUnmounted, ref } from 'vue';

export type GameFrame = 'landscape' | 'portrait' | 'square';

export { LANDSCAPE_MIN_HEIGHT };

export function useGameResponsive() {
    const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1280);
    const height = ref(typeof window !== 'undefined' ? window.innerHeight : 720);

    const aspectRatio = computed(() => (height.value === 0 ? 1 : width.value / height.value));

    const frame = computed<GameFrame>(() => resolveGameFrame(width.value, height.value));

    function update() {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
    }

    onMounted(() => {
        update();
        window.addEventListener('resize', update);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', update);
    });

    return {
        width,
        height,
        aspectRatio,
        frame,
    };
}
