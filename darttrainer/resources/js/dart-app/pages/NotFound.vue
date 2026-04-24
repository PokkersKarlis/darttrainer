<script setup>
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../store/locale.js';

const router = useRouter();
const locale = useLocaleStore();
const t = (k) => locale.t(k);
</script>

<template>
  <div class="relative flex min-h-[70vh] items-center justify-center px-4 py-10 overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 opacity-70"
      style="
        background:
          radial-gradient(800px 360px at 50% 18%, rgba(245, 166, 35, 0.18), transparent 60%),
          radial-gradient(900px 480px at 20% 80%, rgba(62, 207, 142, 0.10), transparent 55%),
          radial-gradient(900px 520px at 85% 82%, rgba(99, 102, 241, 0.10), transparent 60%);
      "
      aria-hidden="true"
    />

    <div class="relative w-full max-w-xl">
      <div
        class="rounded-3xl border border-[#252d3d] bg-[#131720] shadow-2xl overflow-hidden"
        style="box-shadow: 0 24px 60px rgba(0,0,0,.55)"
      >
        <div
          class="px-6 pt-6 pb-5 border-b border-[#1e2738]"
          style="background: linear-gradient(180deg, rgba(11,14,20,.65), rgba(19,23,32,0));"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="text-[10px] font-black uppercase tracking-[0.25em]" style="color:#3a4a63">
                {{ t('notFound.title') }}
              </div>
              <h1 class="mt-1 text-xl sm:text-2xl font-black tracking-tight" style="color:#e8eaf0">
                404
              </h1>
            </div>
            <div
              class="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black"
              style="background: linear-gradient(135deg, #f5a623, #f5c842); color:#0b0e14"
              aria-hidden="true"
            >
              ×
            </div>
          </div>
          <p class="mt-2 text-sm leading-snug" style="color:#7b8ba8">
            {{ t('notFound.body') }}
          </p>
        </div>

        <div class="px-6 pb-6 pt-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-2xl border border-[#252d3d] bg-[#0b0e14] px-4 py-3 text-sm font-black text-[#e8eaf0] transition hover:border-[#3a4a63]"
              @click="router.push('/')"
            >
              ← {{ t('nav.home') }}
            </button>
            <button
              type="button"
              class="rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.99]"
              style="background: linear-gradient(135deg, #f5a623, #f5c842); color: #0b0e14; border: none"
              @click="router.push('/lobby/cricket')"
            >
              {{ t('nav.lobby') }}
            </button>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs" style="color:#3a4a63">
            <button type="button" class="underline" @click="router.back()">{{ t('notFound.back') }}</button>
            <span aria-hidden="true">•</span>
            <button type="button" class="underline" @click="router.push('/login')">{{ t('shell.login') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

