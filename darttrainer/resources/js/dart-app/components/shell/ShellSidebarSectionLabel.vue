<script setup>
/** Sānjoslas sadaļas virsraksts (uppercase) */
defineProps({
  text: { type: String, required: true },
});
</script>

<template>
  <div style="margin:8px 0 4px 12px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#334155">
    {{ text }}
  </div>
</template>
