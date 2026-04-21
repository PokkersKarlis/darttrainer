<script setup>
function onLogoError(e) {
  e.target.style.display = 'none';
  const fallback = e.target.nextElementSibling;
  if (fallback) fallback.style.display = 'flex';
}
</script>

<template>
  <a
    href="#/"
    class="dt-header-logo"
    style="
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
      min-width: 0;
    "
  >
    <img
      src="/images/logo.png"
      alt="DartTrainer"
      width="160"
      height="52"
      style="height: 48px; width: auto; max-width: 200px; object-fit: contain; display: block"
      @error="onLogoError"
    />
    <span
      style="
        display: none;
        align-items: center;
        gap: 8px;
        font-weight: 800;
        color: #f59e0b;
        font-size: 17px;
      "
    >
      <span style="font-size: 22px">🎯</span>
      <span class="hidden sm:inline" style="letter-spacing: -0.3px">DartTrainer</span>
    </span>
  </a>
</template>
