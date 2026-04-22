import{a as B,l as b,G as q,b as F,u as H,w as z,o as U,Q as u,m as i,A as j}from"./main-DngRMpl4.js";/* empty css            */import"./index-BuNY4Ty6.js";const K={props:{state:{type:Object,required:!0},defaultOpen:{type:Boolean,default:!1}},setup(d){const y=B(),n=e=>y.t(e);function c(e){const r=e.seg??e.segment,o=e.mul??e.multiplier;return r===0?n("x01Training.dartMiss"):r===25&&o===2?n("x01Training.dartBull"):r===25?n("x01Training.dartOuter"):(o===2?"D":o===3?"T":"")+r}function h(e){const r=e.mul??e.multiplier;return(e.seg??e.segment)===0?"text-slate-600":r===3?"text-emerald-400":r===2?"text-sky-400":"text-slate-300"}const l=b(()=>[{key:"1-1",label:n("x01Training.protocolSingleMatch"),turns:d.state.turns||[]}]);function x(e){return e.bust?n("x01Training.protocolBust"):e.checkout?n("x01Training.protocolCheckout"):d.state.in_mode==="double"&&!e.opened?n("x01Training.protocolWaitDoubleIn"):"—"}return{t:n,dartLabel:c,dartClass:h,legs:l,turnNotes:x}},template:`
    <div class="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden text-left">
      <details :open="defaultOpen" class="x01-solo-protocol-root">
        <summary
          class="px-3 py-2.5 cursor-pointer list-none flex items-center justify-between gap-2
                 border-b border-slate-700/40 hover:bg-slate-800/80
                 [&::-webkit-details-marker]:hidden">
          <span class="text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0">
            {{ t('x01Training.protocolTitle') }}
          </span>
          <span class="text-slate-600 text-[10px] font-semibold truncate text-right">
            {{ (state.turns || []).length }} {{ t('x01Training.protocolTurnsSuffix') }}
            <span class="text-slate-700">·</span>
            {{ state.variant }} · {{ state.in_mode === 'double' ? 'D-in' : 'S-in' }}
            · {{ state.out_mode === 'double' ? 'D-out' : 'S-out' }}
          </span>
        </summary>
        <div class="p-2 space-y-2">
          <details v-for="leg in legs" :key="leg.key" open
                   class="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/20">
            <summary
              class="px-3 py-2 text-xs font-bold text-amber-400/90 bg-slate-900/50 cursor-pointer
                     list-none flex items-center justify-between
                     [&::-webkit-details-marker]:hidden">
              <span>{{ leg.label }}</span>
              <span class="text-[10px] font-semibold text-slate-600">{{ leg.turns.length }} {{ t('x01Training.protocolTurnsSuffix') }}</span>
            </summary>
            <div class="max-h-[min(24rem,50vh)] overflow-y-auto overscroll-y-contain border-t border-slate-800/60">
              <table class="w-full text-xs min-w-[18rem]">
                <thead class="text-slate-500 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-[1] border-b border-slate-800">
                  <tr>
                    <th class="text-left py-2 px-2 font-semibold w-10">{{ t('x01Training.protocolColTurn') }}</th>
                    <th class="text-left py-2 px-2 font-semibold">{{ t('x01Training.protocolColDarts') }}</th>
                    <th class="text-right py-2 px-2 font-semibold w-12">{{ t('x01Training.protocolColScored') }}</th>
                    <th class="text-right py-2 px-2 font-semibold hidden sm:table-cell">{{ t('x01Training.protocolColScore') }}</th>
                    <th class="text-left py-2 px-2 font-semibold hidden md:table-cell">{{ t('x01Training.protocolColNotes') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(turn, idx) in leg.turns" :key="idx"
                      class="border-t border-slate-800/80"
                      :class="turn.bust ? 'opacity-55' : ''">
                    <td class="py-2 px-2 text-slate-600 font-mono tabular-nums align-top">{{ idx + 1 }}</td>
                    <td class="py-2 px-2 align-top">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="(d, di) in turn.darts" :key="di"
                              class="font-mono px-1.5 py-0.5 rounded bg-slate-900/70 text-[11px]"
                              :class="dartClass(d)">
                          {{ dartLabel(d) }}
                        </span>
                      </div>
                    </td>
                    <td class="py-2 px-2 text-right font-bold tabular-nums align-top"
                        :class="turn.bust ? 'text-red-400' : 'text-slate-300'">
                      {{ turn.bust ? '—' : '+' + turn.scored }}
                    </td>
                    <td class="py-2 px-2 text-right text-slate-500 font-mono tabular-nums align-top hidden sm:table-cell">
                      {{ turn.score_before }}→{{ turn.score_after }}
                    </td>
                    <td class="py-2 px-2 text-slate-500 align-top hidden md:table-cell whitespace-nowrap">
                      {{ turnNotes(turn) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </details>
    </div>
  `},Z={components:{X01SoloProtocol:K},setup(){const d=q(),y=F(),n=B(),c=H(),h=t=>n.t(t),l=i(null),x=i(!1),e=i(!1),r=i(!0),o=i(1),p=j({variant:501,in_mode:"straight",out_mode:"double"}),s=j({darts:[]}),m=i(null),v=i(null),f=i(!1),g=i(!1),k=b(()=>{const t=d.query.protocol;return t!=null&&String(t).trim()!==""});async function w(){if(!k.value){v.value=null,g.value=!1,f.value=!1;return}const t=Number(d.query.protocol);if(!Number.isFinite(t)||t<1){g.value=!0,f.value=!1;return}f.value=!0,g.value=!1,v.value=null;try{const{data:a}=await u.x01Protocol(t);v.value=a.state}catch{g.value=!0}finally{f.value=!1}}function E(){y.replace({path:"/training/x01"})}z(()=>d.query.protocol,w),U(async()=>{if(await w(),!v.value)try{const{data:t}=await u.x01State();t.state&&(l.value=t.state,r.value=!1)}catch{}});async function D(){var t;if(c.needsEmailVerification){(t=window._dartToast)==null||t.call(window,h("auth.verifyEmailToContinue"),"error");return}x.value=!0;try{const{data:a}=await u.x01Start({variant:p.variant,in_mode:p.in_mode,out_mode:p.out_mode});l.value=a.state,r.value=!1,s.darts=[],o.value=1}finally{x.value=!1}}async function C(){c.needsEmailVerification||(await u.x01Abandon(),l.value=null,r.value=!0,s.darts=[],m.value=null,o.value=1)}function V(t){if(s.darts.length>=3)return;let a=o.value;t===25&&a===3&&(a=1),s.darts.push({segment:t,multiplier:a})}function M(){s.darts.length>=3||s.darts.push({segment:0,multiplier:0})}function O(){s.darts.length>=3||s.darts.push({segment:25,multiplier:1})}function P(){s.darts.length>=3||s.darts.push({segment:25,multiplier:2})}function R(t){s.darts.splice(t,1)}function L(t){return t.segment===0?"Miss":t.segment===25&&t.multiplier===2?"Bull":t.segment===25?"Outer":(t.multiplier===2?"D":t.multiplier===3?"T":"")+t.segment}function T(t){return t.segment===0?0:t.segment*t.multiplier}function G(t){return t.segment===0?"text-slate-600":t.multiplier===3?"text-emerald-400":t.multiplier===2?"text-sky-400":"text-white"}async function Q(){if(c.needsEmailVerification||s.darts.length===0||e.value)return;e.value=!0;const t=s.darts.map(a=>({segment:a.segment,multiplier:a.multiplier}));try{const{data:a}=await u.x01Throw({darts:t});l.value=a.state,m.value=a.result,s.darts=[],o.value=1,setTimeout(()=>{m.value=null},2200)}finally{e.value=!1}}async function A(){if(c.needsEmailVerification)return;const{data:t}=await u.x01Undo();l.value=t.state,s.darts=[],m.value=null}const S=b(()=>s.darts.reduce((t,a)=>t+T(a),0)),_=b(()=>l.value?l.value.current_score-S.value:null),N=b(()=>{var a,I;if(((a=l.value)==null?void 0:a.in_mode)==="double"&&!((I=l.value)!=null&&I.opened))return!1;const t=_.value;return t===null?!1:t<0||t===1}),X=b(()=>o.value===2?"text-sky-300":o.value===3?"text-emerald-300":"text-white");return{route:d,auth:c,t:h,state:l,loading:x,submitting:e,showSetup:r,form:p,activeMultiplier:o,dartInput:s,feedback:m,turnTotal:S,projectedRemaining:_,projectedBust:N,mulTint:X,startGame:D,abandon:C,addSegment:V,addMiss:M,addOuter:O,addBull:P,removeDart:R,dartLabel:L,dartValue:T,dartColor:G,submitThrow:Q,undo:A,showProtocolQuery:k,protocolOnlyState:v,protocolLoading:f,protocolError:g,clearProtocolQuery:E}},template:`
    <div style="flex:1;overflow-y:auto;min-height:0">
    <div class="max-w-5xl mx-auto px-3 py-4">

      <template v-if="showProtocolQuery">
        <div v-if="protocolLoading" class="text-center py-16 text-slate-400">{{ t('stats.loading') }}</div>
        <div v-else-if="protocolError" class="max-w-md mx-auto text-center py-12 space-y-4">
          <p class="text-red-400">{{ t('x01Training.protocolLoadError') }}</p>
          <button type="button" @click="clearProtocolQuery"
                  class="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-2.5 rounded-xl transition">
            {{ t('x01Training.protocolBack') }}
          </button>
        </div>
        <div v-else-if="protocolOnlyState" class="max-w-3xl mx-auto space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <button type="button" @click="clearProtocolQuery"
                    class="text-sm font-black text-amber-400 hover:text-amber-300 transition">
              ← {{ t('x01Training.protocolBack') }}
            </button>
            <a href="/stats" class="text-xs font-semibold text-slate-500 hover:text-slate-300">{{ t('x01Training.protocolBackStats') }}</a>
          </div>
          <p class="text-xs text-slate-500">{{ t('x01Training.protocolReadOnlyHint') }}</p>
          <X01SoloProtocol :state="protocolOnlyState" :default-open="true" />
        </div>
      </template>

      <template v-else>

      <div v-if="auth.needsEmailVerification"
           class="mb-4 rounded-xl border border-amber-800/80 bg-amber-950/35 px-4 py-3 text-amber-100 text-sm leading-relaxed">
        {{ t('auth.verifyEmailToContinue') }}
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-black text-white">🎯 X01 Solo</h1>
        <button v-if="!showSetup && state" @click="abandon"
                class="text-slate-600 hover:text-red-400 text-xs font-semibold transition-colors">
          Beigt treniņu
        </button>
      </div>

      <!-- ══════════════════ SETUP ══════════════════ -->
      <div v-if="showSetup" class="max-w-sm mx-auto">
        <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 space-y-5">

          <!-- Variant -->
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-widest font-bold block mb-2">Variants</label>
            <div class="flex gap-2 bg-slate-900/60 rounded-xl p-1">
              <button v-for="v in [501, 301]" :key="v" @click="form.variant = v"
                      class="flex-1 py-3 rounded-lg font-black text-lg transition"
                      :class="form.variant === v ? 'bg-amber-500 text-black shadow' : 'text-slate-500 hover:text-white'">
                {{ v }}
              </button>
            </div>
          </div>

          <!-- In mode -->
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-widest font-bold block mb-2">In</label>
            <div class="flex gap-2 bg-slate-900/60 rounded-xl p-1">
              <button @click="form.in_mode = 'straight'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.in_mode === 'straight' ? 'bg-emerald-500 text-black shadow' : 'text-slate-500 hover:text-white'">
                Straight in
              </button>
              <button @click="form.in_mode = 'double'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.in_mode === 'double' ? 'bg-emerald-500 text-black shadow' : 'text-slate-500 hover:text-white'">
                Double in
              </button>
            </div>
          </div>

          <!-- Out mode -->
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-widest font-bold block mb-2">Out</label>
            <div class="flex gap-2 bg-slate-900/60 rounded-xl p-1">
              <button @click="form.out_mode = 'double'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.out_mode === 'double' ? 'bg-sky-400 text-slate-900 shadow' : 'text-slate-500 hover:text-white'">
                Double out
              </button>
              <button @click="form.out_mode = 'straight'"
                      class="flex-1 py-2.5 rounded-lg text-sm font-black transition"
                      :class="form.out_mode === 'straight' ? 'bg-sky-400 text-slate-900 shadow' : 'text-slate-500 hover:text-white'">
                Straight out
              </button>
            </div>
          </div>

          <button @click="startGame" :disabled="loading || auth.needsEmailVerification"
                  class="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl
                         transition disabled:opacity-50 text-lg shadow-xl shadow-amber-950/40 active:scale-[0.98]">
            {{ auth.needsEmailVerification ? t('auth.verifyEmailShort') : (loading ? 'Sāk...' : 'Sākt treniņu →') }}
          </button>
        </div>
      </div>

      <!-- ══════════════════ ACTIVE GAME ══════════════════ -->
      <template v-if="!showSetup && state">

        <!-- ── Finished screen ── -->
        <div v-if="state.finished" class="max-w-md mx-auto text-center py-12">
          <div class="text-6xl mb-4">🏆</div>
          <h2 class="text-3xl font-black text-amber-400 mb-1">Checkout!</h2>
          <p class="text-slate-400 mb-6 text-sm">
            {{ state.variant }} — {{ state.stats.turns }} kārtas · {{ state.stats.darts }} šautriņas
          </p>
          <div class="grid grid-cols-3 gap-3 mb-8">
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">3-dart avg</div>
              <div class="text-2xl font-black text-amber-400">{{ state.stats.average }}</div>
            </div>
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">High turn</div>
              <div class="text-2xl font-black text-emerald-400">{{ state.stats.high_turn }}</div>
            </div>
            <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
              <div class="text-xs text-slate-500 uppercase tracking-widest mb-1">Busts</div>
              <div class="text-2xl font-black text-red-400">{{ state.stats.busts }}</div>
            </div>
          </div>
          <div class="flex gap-3 justify-center">
            <button @click="startGame"
                    class="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-2xl
                           transition shadow-lg shadow-amber-950/40 active:scale-[0.97]">
              Vēlreiz →
            </button>
            <button @click="abandon"
                    class="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-2xl transition">
              Beigt
            </button>
          </div>
          <div v-if="state.turns && state.turns.length" class="max-w-xl mx-auto w-full mt-8 text-left">
            <X01SoloProtocol :state="state" :default-open="true" />
          </div>
        </div>

        <!-- ── Active layout ── -->
        <div v-else class="flex flex-col lg:flex-row gap-4 items-start">

          <!-- ─────── LEFT: score + stats + history ─────── -->
          <div class="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-3">

            <!-- Score card -->
            <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 text-center relative overflow-hidden">
              <!-- Feedback flash overlay -->
              <Transition name="fade">
                <div v-if="feedback"
                     class="absolute inset-0 flex items-center justify-center rounded-2xl z-10 backdrop-blur-sm"
                     :class="feedback.bust ? 'bg-red-950/90' : 'bg-emerald-950/90'">
                  <div>
                    <div class="text-4xl font-black"
                         :class="feedback.bust ? 'text-red-400' : 'text-emerald-400'">
                      {{ feedback.bust ? '💥 Bust' : '+' + feedback.scored }}
                    </div>
                    <div v-if="!feedback.bust" class="text-slate-400 text-sm mt-1">
                      → {{ feedback.score_after }}
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Double-in badge -->
              <div v-if="state.in_mode === 'double' && !state.opened"
                   class="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                ⬡ Double in
              </div>

              <!-- Turn number -->
              <div class="text-xs text-slate-600 uppercase tracking-widest font-bold mb-1">
                Kārta {{ state.turn_number }}
              </div>

              <!-- Remaining -->
              <Transition name="fade" mode="out-in">
                <div :key="state.current_score"
                     class="font-black tabular-nums leading-none"
                     :class="[state.current_score <= 170 && (state.in_mode === 'straight' || state.opened) ? 'text-amber-400' : 'text-white',
                              state.current_score >= 100 ? 'text-7xl' : 'text-8xl']">
                  {{ state.current_score }}
                </div>
              </Transition>

              <!-- Projected while staging -->
              <div v-if="dartInput.darts.length > 0 && projectedRemaining !== null"
                   class="text-base font-bold tabular-nums mt-1.5"
                   :class="projectedBust ? 'text-red-400' : 'text-slate-400'">
                {{ projectedBust ? '💥 Bust' : '→ ' + projectedRemaining }}
              </div>

              <!-- Checkout suggestion -->
              <div v-if="state.checkout?.length && dartInput.darts.length === 0"
                   class="flex items-center justify-center flex-wrap gap-1.5 mt-2">
                <span class="text-slate-600 text-xs">out:</span>
                <span v-for="c in state.checkout" :key="c"
                      class="text-xs font-mono font-bold bg-emerald-950 text-emerald-400
                             border border-emerald-900/60 px-2 py-0.5 rounded-lg">
                  {{ c }}
                </span>
              </div>

              <!-- Game mode badges -->
              <div class="flex justify-center gap-2 mt-3 flex-wrap">
                <span class="text-xs text-slate-700 font-semibold">{{ state.variant }}</span>
                <span class="text-slate-800">·</span>
                <span class="text-xs text-slate-700 font-semibold">
                  {{ state.in_mode === 'double' ? 'D-in' : 'S-in' }}
                </span>
                <span class="text-slate-800">·</span>
                <span class="text-xs text-slate-700 font-semibold">
                  {{ state.out_mode === 'double' ? 'D-out' : 'S-out' }}
                </span>
              </div>
            </div>

            <!-- Stats bar -->
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">3-dart avg</div>
                <div class="text-xl font-black tabular-nums mt-0.5"
                     :class="state.stats.average >= 60 ? 'text-amber-400' : state.stats.average > 0 ? 'text-white' : 'text-slate-700'">
                  {{ state.stats.average || '—' }}
                </div>
              </div>
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">First 9</div>
                <div class="text-xl font-black tabular-nums mt-0.5 text-white">
                  {{ state.stats.first9_avg || '—' }}
                </div>
              </div>
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">High</div>
                <div class="text-xl font-black tabular-nums mt-0.5 text-emerald-400">
                  {{ state.stats.high_turn || '—' }}
                </div>
              </div>
              <div class="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2.5 text-center">
                <div class="text-xs text-slate-600 uppercase tracking-widest">Busts</div>
                <div class="text-xl font-black tabular-nums mt-0.5"
                     :class="state.stats.busts > 0 ? 'text-red-400' : 'text-slate-700'">
                  {{ state.stats.busts }}
                </div>
              </div>
            </div>

            <X01SoloProtocol v-if="state.turns.length > 0" :state="state" :default-open="false" />

          </div>

          <!-- ─────── RIGHT: input keypad ─────── -->
          <div class="flex-1 min-w-0">
            <div class="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3">

              <!-- ── Dart slots ── -->
              <div class="flex gap-2">
                <div v-for="i in 3" :key="i"
                     class="flex-1 relative rounded-xl border-2 flex flex-col items-center justify-center py-2.5 transition-all"
                     :class="dartInput.darts[i-1]
                       ? (dartInput.darts[i-1].segment === 0
                           ? 'border-slate-700 bg-slate-900/40'
                           : dartInput.darts[i-1].multiplier === 3
                             ? 'border-emerald-800 bg-emerald-950/30'
                             : dartInput.darts[i-1].multiplier === 2
                               ? 'border-sky-800 bg-sky-950/30'
                               : 'border-slate-600 bg-slate-900/60')
                       : 'border-dashed border-slate-800 bg-slate-900/20'">
                  <template v-if="dartInput.darts[i-1]">
                    <button @click="removeDart(i-1)"
                            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-400
                                   rounded-full text-white text-xs font-black flex items-center justify-center
                                   leading-none z-10 shadow transition-colors">
                      ×
                    </button>
                    <span class="font-black text-base leading-none"
                          :class="dartColor(dartInput.darts[i-1])">
                      {{ dartLabel(dartInput.darts[i-1]) }}
                    </span>
                    <span class="text-xs tabular-nums mt-0.5"
                          :class="dartValue(dartInput.darts[i-1]) > 0 ? 'text-slate-500' : 'text-slate-700'">
                      {{ dartValue(dartInput.darts[i-1]) > 0 ? dartValue(dartInput.darts[i-1]) : '—' }}
                    </span>
                  </template>
                  <span v-else class="text-slate-800 font-black text-lg">{{ i }}</span>
                </div>
              </div>

              <!-- Turn total / projected -->
              <div class="flex items-center justify-between px-1 min-h-[24px]">
                <span class="text-xs text-slate-700 font-bold uppercase tracking-wider">
                  Kārtas summa
                </span>
                <span v-if="dartInput.darts.length > 0"
                      class="font-black tabular-nums text-base transition-colors"
                      :class="projectedBust ? 'text-red-400' : 'text-white'">
                  {{ turnTotal }}
                  <span class="text-slate-500 font-normal text-sm ml-1">
                    {{ projectedBust ? '— Bust!' : projectedRemaining !== null ? '→ ' + projectedRemaining : '' }}
                  </span>
                </span>
                <span v-else class="text-slate-800 font-bold">—</span>
              </div>

              <!-- ── Multiplier buttons ── -->
              <div class="flex gap-2">
                <button v-for="[val, lbl, cls] in [[1,'S','bg-slate-700 text-white'],[2,'D','bg-sky-500 text-white'],[3,'T','bg-emerald-500 text-black']]"
                        :key="val"
                        @click="activeMultiplier = val"
                        class="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
                        :class="activeMultiplier === val
                          ? cls + ' shadow-lg scale-[1.04]'
                          : 'bg-slate-900/60 text-slate-500 hover:text-white border border-slate-800'">
                  {{ lbl }}
                </button>
              </div>

              <!-- ── Number grid 1–20 ── -->
              <div class="grid grid-cols-5 gap-1.5">
                <button v-for="n in 20" :key="n"
                        @click="addSegment(n)"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl font-black text-sm transition-all active:scale-90 select-none"
                        :class="dartInput.darts.length >= 3
                          ? 'opacity-25 cursor-not-allowed bg-slate-900/30 text-slate-700'
                          : activeMultiplier === 3
                            ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-900/40'
                            : activeMultiplier === 2
                              ? 'bg-sky-950/60 text-sky-300 hover:bg-sky-900/60 border border-sky-900/40'
                              : 'bg-slate-700/60 text-white hover:bg-slate-600/80'">
                  {{ n }}
                </button>
              </div>

              <!-- ── Special buttons ── -->
              <div class="grid grid-cols-3 gap-1.5">
                <button @click="addOuter"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl text-xs font-black transition-all active:scale-90 select-none
                               bg-amber-950/40 text-amber-500 hover:bg-amber-900/40 border border-amber-900/30
                               disabled:opacity-25 disabled:cursor-not-allowed">
                  Outer<br><span class="font-normal opacity-70">25</span>
                </button>
                <button @click="addBull"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl text-xs font-black transition-all active:scale-90 select-none
                               bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/30
                               disabled:opacity-25 disabled:cursor-not-allowed">
                  Bull<br><span class="font-normal opacity-70">50</span>
                </button>
                <button @click="addMiss"
                        :disabled="dartInput.darts.length >= 3"
                        class="py-3 rounded-xl text-xs font-black transition-all active:scale-90 select-none
                               bg-slate-900/40 text-slate-600 hover:text-slate-400 hover:bg-slate-800/40
                               border border-slate-800/60
                               disabled:opacity-25 disabled:cursor-not-allowed">
                  Miss<br><span class="font-normal opacity-70">0</span>
                </button>
              </div>

              <!-- ── Submit / Undo ── -->
              <div class="flex gap-2 pt-1">
                <button @click="submitThrow"
                        :disabled="dartInput.darts.length === 0 || submitting"
                        class="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl
                               transition-all disabled:opacity-40 shadow-lg shadow-amber-950/40
                               active:scale-[0.97] text-base">
                  {{ submitting ? '...' : '✓ Iesniegt' }}
                </button>
                <button @click="undo"
                        class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-4 rounded-2xl
                               transition-all font-bold active:scale-[0.97]">
                  ↩
                </button>
              </div>

            </div>
          </div>
        </div>

      </template>

      </template>

    </div>
    </div>
  `};export{Z as default};
