<script setup>
/** Sānjoslas / navigācijas saite ar ikonu */
defineProps({
  href: { type: String, required: true },
  icon: { type: String, default: '' },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  title: { type: String, default: '' },
});
</script>

<template>
  <router-link
    v-if="!disabled"
    :to="href"
    class="nav-link"
    active-class="nav-link--active"
    :title="title || undefined"
  >
    <span class="icon">{{ icon }}</span>{{ label }}
  </router-link>
  <span
    v-else
    class="nav-link nav-link--disabled"
    :title="title || undefined"
    aria-disabled="true"
  >
    <span class="icon">{{ icon }}</span>{{ label }}
  </span>
</template>
