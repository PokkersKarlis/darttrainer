<script setup>
defineOptions({ name: 'ShellRightAds' });
</script>

<template>
  <aside
    class="hidden xl:flex"
    style="
      width: 168px;
      flex-shrink: 0;
      background: #0a1120;
      border-left: 1px solid #162540;
      padding: 16px 12px;
      flex-direction: column;
      gap: 16px;
    "
  >
    <div class="ad-slot" style="height: 250px; width: 100%">
      <span>AD HERE</span>
      <span style="font-size: 9px; opacity: 0.7">160 × 250</span>
    </div>
    <div class="ad-slot" style="height: 250px; width: 100%">
      <span>AD HERE</span>
      <span style="font-size: 9px; opacity: 0.7">160 × 250</span>
    </div>
  </aside>
</template>
