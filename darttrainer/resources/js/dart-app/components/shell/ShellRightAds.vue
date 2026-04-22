<script setup>
defineOptions({ name: 'ShellRightAds' });
</script>

<template>
  <aside
    class="hidden xl:flex"
    style="
      width: 80px;
      flex-shrink: 0;
      background: #0f1520;
      border-left: 1px solid #1e2738;
      padding: 16px 0;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    "
  >
    <div
      class="ad-slot"
      style="
        width: 60px;
        height: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
      "
    >
      <span>AD</span>
      <span style="font-size: 8px; opacity: 0.7">60×160</span>
    </div>
    <div
      class="ad-slot"
      style="
        width: 60px;
        height: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
      "
    >
      <span>AD</span>
      <span style="font-size: 8px; opacity: 0.7">60×160</span>
    </div>
  </aside>
</template>
