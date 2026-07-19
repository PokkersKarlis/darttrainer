<template>
    <header class="hdr">
        <slot />
    </header>
</template>

<style scoped>
.hdr {
    --hdr-bg: #0b0f19;
    --hdr-line: #1f2937;
    --hdr-muted: #64748b;
    --hdr-soft: #94a3b8;
    --hdr-text: #f4f4f5;
    --hdr-green: #39ff14;
    --hdr-pink: #fb2c5f;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: nowrap;
    min-height: 64px;
    padding: 12px 20px;
    border-bottom: 1px solid color-mix(in srgb, var(--hdr-line) 80%, transparent);
    backdrop-filter: blur(8px);
    background: color-mix(in srgb, var(--hdr-bg) 78%, transparent);
    position: sticky;
    top: 0;
    z-index: 30;
    color: var(--hdr-text);
}

@media (max-width: 480px) {
    .hdr {
        padding: 10px 12px;
        gap: 8px;
    }
}
</style>
