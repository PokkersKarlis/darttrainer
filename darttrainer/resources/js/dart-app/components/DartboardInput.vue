<script setup>
import { ref } from 'vue';

const emit = defineEmits(['add-dart']);

const ring = ref(1);
const center = 170;
const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

function sectorTextPos(index) {
  const angle = ((index * 18) - 90) * Math.PI / 180;
  return {
    x: center + Math.cos(angle) * 142,
    y: center + Math.sin(angle) * 142,
  };
}

function ringHint() {
  return ring.value === 1 ? 'Single — ārējā josla' : ring.value === 2 ? 'Double — ārējais gredzens' : 'Triple — vidējais gredzens';
}

function onBoardClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const scaleX = 340 / rect.width;
  const scaleY = 340 / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const dx = x - center;
  const dy = y - center;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 160) return;
  if (dist <= 14) {
    emit('add-dart', { segment: 25, multiplier: 2 });
    return;
  }
  if (dist <= 28) {
    emit('add-dart', { segment: 25, multiplier: 1 });
    return;
  }

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const normalized = (angle + 99 + 360) % 360;
  const index = Math.floor(normalized / 18);
  const segment = sectors[index];

  let multiplier = ring.value;
  if (dist > 134 && dist <= 160) {
    multiplier = 2;
  } else if (dist > 96 && dist <= 112) {
    multiplier = 3;
  }

  emit('add-dart', { segment, multiplier });
}
</script>

<template>
  <div class="select-none">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
      <div>
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-500">Šķīvja režīms</p>
        <p class="text-xs text-slate-400 mt-0.5 leading-snug">{{ ringHint() }}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button type="button" @click="ring=1"
                :class="ring===1 ? 'bg-slate-100 text-slate-900 ring-2 ring-amber-500/50 shadow' : 'bg-[#0f1c30] text-slate-400 border border-[#1e3050]'"
                class="min-w-[3.5rem] min-h-[48px] rounded-xl text-sm font-black transition active:scale-95 touch-manipulation">
          S
        </button>
        <button type="button" @click="ring=2"
                :class="ring===2 ? 'bg-sky-400 text-slate-900 ring-2 ring-sky-200/50 shadow' : 'bg-[#0f1c30] text-slate-400 border border-[#1e3050]'"
                class="min-w-[3.5rem] min-h-[48px] rounded-xl text-sm font-black transition active:scale-95 touch-manipulation">
          D
        </button>
        <button type="button" @click="ring=3"
                :class="ring===3 ? 'bg-amber-500 text-black ring-2 ring-amber-200/50 shadow' : 'bg-[#0f1c30] text-slate-400 border border-[#1e3050]'"
                class="min-w-[3.5rem] min-h-[48px] rounded-xl text-sm font-black transition active:scale-95 touch-manipulation">
          T
        </button>
      </div>
    </div>

    <svg viewBox="0 0 340 340"
         class="w-full max-w-[min(100%,320px)] mx-auto cursor-pointer touch-manipulation rounded-full shadow-[0_12px_40px_rgba(0,0,0,.45)] ring-1 ring-[#1e3050]"
         @click="onBoardClick">
      <defs>
        <radialGradient id="dartBg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#020617"/>
        </radialGradient>
      </defs>
      <circle cx="170" cy="170" r="160" fill="url(#dartBg)"/>
      <circle cx="170" cy="170" r="134" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <circle cx="170" cy="170" r="112" fill="#020617" stroke="#475569" stroke-width="0.5"/>
      <circle cx="170" cy="170" r="96" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <circle cx="170" cy="170" r="28" fill="#14532d" stroke="#22c55e" stroke-opacity="0.35" stroke-width="1.5"/>
      <circle cx="170" cy="170" r="14" fill="#b91c1c" stroke="#f87171" stroke-opacity="0.4" stroke-width="1.5"/>
      <text v-for="(num, i) in sectors" :key="i"
            :x="sectorTextPos(i).x" :y="sectorTextPos(i).y"
            text-anchor="middle" dominant-baseline="middle"
            class="pointer-events-none select-none fill-slate-200"
            style="font-size:11px;font-weight:800">{{ num }}</text>
      <text x="170" y="24" text-anchor="middle" class="fill-amber-400/90 pointer-events-none" style="font-size:11px;font-weight:800;letter-spacing:0.12em">20</text>
      <text x="170" y="332" text-anchor="middle" class="fill-slate-500 pointer-events-none" style="font-size:9px">Ārējais dubultais · vidējais trīskāršais</text>
    </svg>
  </div>
</template>
