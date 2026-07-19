import type { Breakpoint, DesignType, DisplayFrame } from '@/types/display';
import { useWindowSize } from '@vueuse/core';
import { computed, inject, provide, type InjectionKey } from 'vue';

const COMPACT_MAX = 639;
const MEDIUM_MAX = 1023;
const SQUARE_RATIO_TOLERANCE = 0.1;

export const DisplayFrameKey: InjectionKey<ReturnType<typeof createDisplayFrame>> =
    Symbol('displayFrame');

export function resolveBreakpoint(width: number): Breakpoint {
    if (width <= COMPACT_MAX) {
        return 'compact';
    }

    if (width <= MEDIUM_MAX) {
        return 'medium';
    }

    return 'wide';
}

export function resolveDesignType(width: number, height: number): DesignType {
    if (width <= 0 || height <= 0) {
        return 'landscape';
    }

    const ratio = width / height;

    if (Math.abs(ratio - 1) <= SQUARE_RATIO_TOLERANCE) {
        return 'square';
    }

    return ratio > 1 ? 'landscape' : 'portrait';
}

export function buildDisplayFrame(width: number, height: number): DisplayFrame {
    return {
        width,
        height,
        breakpoint: resolveBreakpoint(width),
        designType: resolveDesignType(width, height),
    };
}

function createDisplayFrame() {
    const { width, height } = useWindowSize({ initialWidth: 0, initialHeight: 0 });

    const breakpoint = computed(() => resolveBreakpoint(width.value));
    const designType = computed(() => resolveDesignType(width.value, height.value));

    const frame = computed<DisplayFrame>(() => ({
        width: width.value,
        height: height.value,
        breakpoint: breakpoint.value,
        designType: designType.value,
    }));

    return {
        width,
        height,
        breakpoint,
        designType,
        frame,
    };
}

export function provideDisplayFrame() {
    const frame = createDisplayFrame();
    provide(DisplayFrameKey, frame);

    return frame;
}

export function useDisplayFrame() {
    return inject(DisplayFrameKey) ?? createDisplayFrame();
}
