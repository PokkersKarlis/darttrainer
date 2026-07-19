<template>
    <div class="ix-atmosphere" aria-hidden="true">
        <div class="ix-glow ix-glow--a" />
        <div class="ix-glow ix-glow--b" />
        <div class="ix-gridlines" />
    </div>
</template>

<style scoped>
.ix-atmosphere {
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
}

.ix-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(calc(8px * var(--ix-glow-scale, 1)));
}

.ix-glow--a {
    top: -12%;
    left: -8%;
    width: calc(55vw * var(--ix-glow-scale, 1));
    height: calc(55vw * var(--ix-glow-scale, 1));
    max-width: calc(640px * var(--ix-glow-scale, 1));
    max-height: calc(640px * var(--ix-glow-scale, 1));
    background: radial-gradient(circle, rgba(57, 255, 20, 0.14), transparent 68%);
}

.ix-glow--b {
    top: 18%;
    right: -18%;
    width: calc(50vw * var(--ix-glow-scale, 1));
    height: calc(50vw * var(--ix-glow-scale, 1));
    max-width: calc(560px * var(--ix-glow-scale, 1));
    max-height: calc(560px * var(--ix-glow-scale, 1));
    background: radial-gradient(circle, rgba(34, 211, 238, 0.08), transparent 70%);
}

.ix-gridlines {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: var(--ix-grid-size, 48px) var(--ix-grid-size, 48px);
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 72%);
}
</style>
