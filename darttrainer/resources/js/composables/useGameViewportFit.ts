import type { GameFrame } from '@/composables/useGameResponsive';
import { nextTick, onMounted, onUnmounted, ref, type Ref, watch } from 'vue';

const MIN_SCALE = 0.34;

export function useGameViewportFit(
    viewportRef: Ref<HTMLElement | null>,
    stageRef: Ref<HTMLElement | null>,
    frame: Ref<GameFrame>,
    disableScale: Ref<boolean> = ref(false),
) {
    let frameId = 0;
    let observer: ResizeObserver | null = null;

    function resetStage(stage: HTMLElement) {
        stage.style.transform = 'none';
        stage.style.marginBottom = '0';
        stage.style.width = '100%';
    }

    function measure() {
        const viewport = viewportRef.value;
        const stage = stageRef.value;

        if (!viewport || !stage) {
            return;
        }

        resetStage(stage);

        const availableHeight = viewport.clientHeight;
        const availableWidth = viewport.clientWidth;
        const neededHeight = stage.scrollHeight;
        const neededWidth = stage.scrollWidth;

        if (availableHeight <= 0 || availableWidth <= 0) {
            return;
        }

        const scaleHeight = availableHeight / neededHeight;
        const scaleWidth = availableWidth / neededWidth;
        const rawScale = Math.min(scaleHeight, scaleWidth);
        const scale = Math.min(1, Math.max(MIN_SCALE, rawScale));

        if (disableScale.value || rawScale >= 1) {
            return;
        }

        stage.style.transform = `scale(${scale})`;
        stage.style.transformOrigin = 'top center';
        stage.style.width = `${100 / scale}%`;
        stage.style.marginBottom = `${neededHeight * (scale - 1)}px`;
    }

    function remeasure() {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
            void nextTick(measure);
        });
    }

    onMounted(() => {
        observer = new ResizeObserver(remeasure);
        window.addEventListener('resize', remeasure);
        remeasure();
    });

    const stopRefWatch = watch(
        [viewportRef, stageRef],
        ([viewport, stage]) => {
            observer?.disconnect();

            if (viewport) {
                observer?.observe(viewport);
            }

            if (stage) {
                observer?.observe(stage);
            }

            remeasure();
        },
        { flush: 'post' },
    );

    onUnmounted(() => {
        cancelAnimationFrame(frameId);
        stopRefWatch();
        observer?.disconnect();
        window.removeEventListener('resize', remeasure);
    });

    watch(frame, remeasure);
    watch(disableScale, remeasure);

    return { remeasure };
}

export const GameViewportRemeasureKey = Symbol('gameViewportRemeasure');
