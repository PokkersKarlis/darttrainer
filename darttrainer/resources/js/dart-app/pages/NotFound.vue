<script setup>
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../store/locale.js';

const router = useRouter();
const locale = useLocaleStore();
const t = (k) => locale.t(k);
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-10">
    <div class="w-full max-w-md rounded-2xl border border-[#252d3d] bg-[#131720] p-6 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1e2738] bg-[#0b0e14] text-lg font-black text-amber-400">
        404
      </div>
      <h1 class="mt-4 text-lg font-black text-[#e8eaf0]">{{ t('notFound.title') }}</h1>
      <p class="mt-2 text-sm text-[#7b8ba8]">{{ t('notFound.body') }}</p>
      <div class="mt-5 flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-xl border border-[#252d3d] bg-[#0b0e14] px-4 py-2.5 text-sm font-bold text-[#e8eaf0] hover:border-[#3a4a63]"
          @click="router.push('/')"
        >
          ← {{ t('nav.home') }}
        </button>
        <button
          type="button"
          class="flex-1 rounded-xl px-4 py-2.5 text-sm font-black"
          style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
          @click="router.push('/lobby/cricket')"
        >
          {{ t('nav.lobby') }}
        </button>
      </div>
    </div>
  </div>
</template>

