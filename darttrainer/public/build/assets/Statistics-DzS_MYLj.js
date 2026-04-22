import{a as L,o as W,m as s,l as j,z as T,S as l,Q as B}from"./main-B2a35jW9.js";/* empty css            */import"./index-BuNY4Ty6.js";const F={setup(){const a=L(),r=t=>a.t(t),d=s(!0),o=s(null),n=s([]),i=s([]),c=s([]),x=s(!1),p=s([]),b=s(!1),m=T({cricket:!0,x01:!0,protocol:!1,lbCricket:!0,lbSolo:!0});function u(t){m[t]=!m[t]}const h=j(()=>{var f;const t=(f=o.value)==null?void 0:f.x01_solo;if(!t||!t.games_finished)return{avgW:0,coW:0,gamesW:0,maxAvg:60};const e=Math.min(100,t.average/60*100),v=Math.min(100,t.checkout_percent||0),M=Math.min(100,t.games_finished/20*100);return{avgW:e,coW:v,gamesW:M,maxAvg:60}});async function g(){try{const{data:t}=await l.me();o.value=t}catch{o.value=null}}function y(t){return t==="cricket"?r("stats.protocolTypeCricket"):t==="x01"?r("stats.protocolTypeX01"):t||"—"}function w(t){if(!t)return"—";const e=new Date(t);return Number.isNaN(e.getTime())?"—":e.toLocaleString(a.locale==="lv"?"lv-LV":"en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}async function k(){x.value=!0;try{const{data:t}=await l.recentMatches({limit:40});c.value=t.items??[]}catch{c.value=[]}finally{x.value=!1}}async function _(){b.value=!0;try{const{data:t}=await B.x01Finished({limit:40});p.value=t.items??[]}catch{p.value=[]}finally{b.value=!1}}function S(t){const e=t.in_mode==="double"?"D":"S",v=t.out_mode==="double"?"D":"S";return`${e}-in / ${v}-out`}async function P(){try{const[t,e]=await Promise.all([l.leaderboard("cricket"),l.leaderboard("x01_solo")]);n.value=t.data.items??[],i.value=e.data.items??[]}catch{n.value=[],i.value=[]}}async function C(){d.value=!0;try{await g();const t=[P()];o.value&&(t.push(k()),t.push(_())),await Promise.all(t)}finally{d.value=!1}}return W(C),{t:r,locale:a,loading:d,me:o,leaderboardCricket:n,leaderboardSolo:i,protocolMatches:c,protocolLoading:x,open:m,toggle:u,soloBars:h,protocolGameLabel:y,fmtProtocolEnd:w,soloProtocols:p,soloProtocolLoading:b,fmtSoloProtocolModes:S}},template:`
    <div class="flex-1 overflow-y-auto min-h-0">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-1">📊 {{ t('stats.title') }}</h1>
      <p class="text-slate-400 mb-6">{{ t('stats.subtitle') }}</p>

      <div v-if="loading" class="text-slate-400 py-12 text-center">{{ t('stats.loading') }}</div>

      <template v-else>

        <div v-if="!me"
             class="bg-slate-800 border border-amber-700/40 rounded-xl p-5 mb-8 text-center">
          <p class="text-slate-300 mb-2">{{ t('stats.loginHint') }}</p>
          <a href="/login" class="text-amber-400 hover:underline font-semibold">{{ t('stats.loginLink') }}</a>
        </div>

        <template v-else>

          <!-- Cricket block -->
          <section class="mb-4 rounded-2xl border border-slate-700 bg-slate-800/80 overflow-hidden">
            <button type="button" @click="toggle('cricket')"
                    class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left
                           hover:bg-slate-800/90 transition">
              <span class="text-lg font-bold text-white">{{ t('stats.cricketBlock') }}</span>
              <span class="text-slate-500 text-sm font-semibold shrink-0">{{ open.cricket ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.cricket" class="px-5 pb-5 pt-0 border-t border-slate-700/60">
              <div v-if="me.cricket && me.cricket.legs_played > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <p class="text-slate-400 text-xs mb-1">{{ t('stats.avg3') }}</p>
                  <p class="text-2xl font-bold text-amber-400">{{ me.cricket_average }}</p>
                </div>
                <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <p class="text-slate-400 text-xs mb-1">{{ t('stats.legsPlayed') }}</p>
                  <p class="text-2xl font-bold text-white">{{ me.cricket.legs_played }}</p>
                </div>
                <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <p class="text-slate-400 text-xs mb-1">{{ t('stats.legsWon') }}</p>
                  <p class="text-2xl font-bold text-emerald-400">{{ me.cricket.legs_won }}</p>
                </div>
                <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                  <p class="text-slate-400 text-xs mb-1">{{ t('stats.winRate') }}</p>
                  <p class="text-2xl font-bold text-amber-400">{{ me.cricket.win_rate }}%</p>
                </div>
                <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4 sm:col-span-2">
                  <p class="text-slate-400 text-xs mb-1">{{ t('stats.avgPtsLeg') }}</p>
                  <p class="text-2xl font-bold text-amber-400">{{ me.cricket.avg_points_per_leg }}</p>
                </div>
              </div>
              <div v-else class="mt-4 bg-slate-900/40 border border-slate-700 rounded-xl p-4 text-slate-400 text-sm">
                {{ t('stats.noCricket') }}
              </div>
            </div>
          </section>

          <!-- X01 solo block -->
          <section class="mb-4 rounded-2xl border border-slate-700 bg-slate-800/80 overflow-hidden">
            <button type="button" @click="toggle('x01')"
                    class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left
                           hover:bg-slate-800/90 transition">
              <span class="text-lg font-bold text-white">{{ t('stats.x01Block') }}</span>
              <span class="text-slate-500 text-sm font-semibold shrink-0">{{ open.x01 ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.x01" class="px-5 pb-5 pt-0 border-t border-slate-700/60">
              <div v-if="me.x01_solo && me.x01_solo.games_finished > 0" class="mt-4 space-y-5">
                <!-- Infographic -->
                <div class="rounded-2xl border border-indigo-900/50 bg-gradient-to-br from-indigo-950/50 to-slate-900/80 p-5">
                  <p class="text-indigo-200/90 text-xs font-semibold uppercase tracking-widest mb-4">X01 solo</p>
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{{ t('stats.avg3') }}</span>
                        <span class="text-amber-400 font-mono font-bold">{{ me.x01_solo.average }}</span>
                      </div>
                      <div class="h-3 rounded-full bg-slate-900 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-500"
                             :style="{ width: soloBars.avgW + '%' }"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{{ t('stats.checkout') }}</span>
                        <span class="text-emerald-400 font-mono font-bold">{{ me.x01_solo.checkout_percent }}%</span>
                      </div>
                      <div class="h-3 rounded-full bg-slate-900 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-500"
                             :style="{ width: soloBars.coW + '%' }"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{{ t('stats.gamesFinished') }}</span>
                        <span class="text-sky-400 font-mono font-bold">{{ me.x01_solo.games_finished }}</span>
                      </div>
                      <div class="h-3 rounded-full bg-slate-900 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-sky-800 to-sky-400 transition-all duration-500"
                             :style="{ width: soloBars.gamesW + '%' }"></div>
                      </div>
                    </div>
                  </div>
                  <p class="text-slate-500 text-[11px] mt-4 leading-relaxed">{{ t('stats.infographicHint') }}</p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                    <p class="text-slate-400 text-xs mb-1">{{ t('stats.highTurn') }}</p>
                    <p class="text-2xl font-bold text-white">{{ me.x01_solo.high_turn }}</p>
                  </div>
                  <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                    <p class="text-slate-400 text-xs mb-1">{{ t('stats.busts') }}</p>
                    <p class="text-2xl font-bold text-red-400">{{ me.x01_solo.busts }}</p>
                  </div>
                  <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                    <p class="text-slate-400 text-xs mb-1">{{ t('stats.soloDarts') }}</p>
                    <p class="text-2xl font-bold text-slate-200">{{ me.x01_solo.total_darts }}</p>
                  </div>
                  <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                    <p class="text-slate-400 text-xs mb-1">501 / 301</p>
                    <p v-if="me.x01_solo.by_variant && Object.keys(me.x01_solo.by_variant).length"
                       class="text-sm font-semibold text-slate-300">
                      <span v-for="(cnt, v) in me.x01_solo.by_variant" :key="String(v)" class="mr-2">{{ v }}: {{ cnt }}</span>
                    </p>
                    <p v-else class="text-sm text-slate-500">—</p>
                  </div>
                </div>
              </div>
              <div v-else class="mt-4 bg-slate-900/40 border border-slate-700 rounded-xl p-4 text-slate-400 text-sm">
                {{ t('stats.noSolo') }}
              </div>
            </div>
          </section>

          <!-- Pabeigto spēļu protokoli (zem spēļu apakšsadaļām) -->
          <section class="mb-4 rounded-2xl border border-slate-700 bg-slate-800/80 overflow-hidden">
            <button type="button" @click="toggle('protocol')"
                    class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left
                           hover:bg-slate-800/90 transition">
              <div>
                <span class="text-lg font-bold text-white block">{{ t('stats.protocolSectionTitle') }}</span>
                <span class="text-xs text-slate-500 font-normal">{{ t('stats.protocolSectionSubtitle') }}</span>
              </div>
              <span class="text-slate-500 text-sm font-semibold shrink-0">{{ open.protocol ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.protocol" class="px-5 pb-5 pt-0 border-t border-slate-700/60">
              <div v-if="protocolLoading" class="mt-4 text-slate-400 text-sm text-center py-6">{{ t('stats.loading') }}</div>
              <div v-else-if="!protocolMatches.length"
                   class="mt-4 bg-slate-900/40 border border-slate-700 rounded-xl p-4 text-slate-400 text-sm">
                {{ t('stats.protocolEmpty') }}
              </div>
              <div v-else class="mt-4 max-h-[min(28rem,55vh)] overflow-y-auto overscroll-y-contain rounded-xl border border-slate-700 bg-slate-900/40">
                <table class="w-full text-sm min-w-[20rem]">
                  <thead class="text-slate-400 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 border-b border-slate-700">
                    <tr>
                      <th class="text-left py-2.5 px-3 font-semibold">{{ t('stats.protocolRoomCol') }}</th>
                      <th class="text-left py-2.5 px-2 font-semibold">{{ t('stats.protocolFinished') }}</th>
                      <th class="text-left py-2.5 px-2 font-semibold hidden sm:table-cell">{{ t('stats.protocolWinner') }}</th>
                      <th class="text-right py-2.5 px-3 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in protocolMatches" :key="row.match_id"
                        class="border-t border-slate-700/80 hover:bg-slate-800/50">
                      <td class="py-2.5 px-3">
                        <span class="font-mono font-bold text-amber-400">{{ row.room_code }}</span>
                        <span class="block text-[11px] text-slate-500 mt-0.5">{{ protocolGameLabel(row.game_type) }}</span>
                      </td>
                      <td class="py-2.5 px-2 text-slate-300 tabular-nums text-xs sm:text-sm whitespace-nowrap">
                        {{ fmtProtocolEnd(row.finished_at) }}
                      </td>
                      <td class="py-2.5 px-2 text-slate-300 text-xs sm:text-sm hidden sm:table-cell">
                        {{ row.winner_name || '—' }}
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        <a :href="'/game/' + row.match_id"
                           class="inline-flex text-amber-400 hover:text-amber-300 font-semibold text-xs sm:text-sm whitespace-nowrap">
                          {{ t('stats.protocolOpen') }}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-700/60">
                <p class="text-sm font-bold text-white mb-0.5">{{ t('stats.soloProtocolTitle') }}</p>
                <p class="text-xs text-slate-500 mb-3">{{ t('stats.soloProtocolSub') }}</p>
                <div v-if="soloProtocolLoading" class="text-slate-400 text-sm text-center py-4">{{ t('stats.loading') }}</div>
                <div v-else-if="!soloProtocols.length"
                     class="bg-slate-900/40 border border-slate-700 rounded-xl p-4 text-slate-400 text-sm">
                  {{ t('stats.soloProtocolEmpty') }}
                </div>
                <div v-else class="max-h-[min(22rem,45vh)] overflow-y-auto overscroll-y-contain rounded-xl border border-slate-700 bg-slate-900/40">
                  <table class="w-full text-sm min-w-[18rem]">
                    <thead class="text-slate-400 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 border-b border-slate-700">
                      <tr>
                        <th class="text-left py-2.5 px-3 font-semibold">{{ t('stats.soloProtocolColVariant') }}</th>
                        <th class="text-left py-2.5 px-2 font-semibold hidden sm:table-cell">{{ t('stats.soloProtocolColModes') }}</th>
                        <th class="text-left py-2.5 px-2 font-semibold">{{ t('stats.soloProtocolColMeta') }}</th>
                        <th class="text-left py-2.5 px-2 font-semibold">{{ t('stats.protocolFinished') }}</th>
                        <th class="text-right py-2.5 px-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in soloProtocols" :key="'solo-' + row.id"
                          class="border-t border-slate-700/80 hover:bg-slate-800/50">
                        <td class="py-2.5 px-3">
                          <span class="font-mono font-bold text-amber-400">{{ row.variant }}</span>
                        </td>
                        <td class="py-2.5 px-2 text-slate-400 text-xs hidden sm:table-cell whitespace-nowrap">
                          {{ fmtSoloProtocolModes(row) }}
                        </td>
                        <td class="py-2.5 px-2 text-slate-300 text-xs tabular-nums">
                          {{ row.turns_count }} · {{ row.darts_count }}
                        </td>
                        <td class="py-2.5 px-2 text-slate-300 tabular-nums text-xs sm:text-sm whitespace-nowrap">
                          {{ fmtProtocolEnd(row.finished_at) }}
                        </td>
                        <td class="py-2.5 px-3 text-right">
                          <a :href="'/training/x01?protocol=' + row.id"
                             class="inline-flex text-amber-400 hover:text-amber-300 font-semibold text-xs sm:text-sm whitespace-nowrap">
                            {{ t('stats.soloProtocolOpen') }}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <!-- Cricket leaderboard -->
          <section class="mb-4 rounded-2xl border border-slate-700 bg-slate-800/80 overflow-hidden">
            <button type="button" @click="toggle('lbCricket')"
                    class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left
                           hover:bg-slate-800/90 transition">
              <span class="text-lg font-bold text-white">{{ t('stats.leaderboardCricket') }}</span>
              <span class="text-slate-500 text-sm font-semibold shrink-0">{{ open.lbCricket ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.lbCricket" class="px-5 pb-5 overflow-x-auto border-t border-slate-700/60">
              <table class="w-full text-sm mt-4">
                <thead class="text-slate-400">
                  <tr>
                    <th class="text-left py-2 pr-4">{{ t('stats.rank') }}</th>
                    <th class="text-left py-2">{{ t('stats.player') }}</th>
                    <th class="text-right py-2">{{ t('stats.winRateShort') }}</th>
                    <th class="text-right py-2">{{ t('stats.wonTotal') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in leaderboardCricket" :key="row.user_id"
                      class="border-t border-slate-700">
                    <td class="py-2 pr-4 text-slate-400 font-mono">{{ idx + 1 }}</td>
                    <td class="py-2 text-white font-medium">{{ row.name }}</td>
                    <td class="py-2 text-right font-semibold"
                        :class="row.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'">
                      {{ row.win_rate }}%
                    </td>
                    <td class="py-2 text-right text-slate-300">{{ row.legs_won }} / {{ row.legs_played }}</td>
                  </tr>
                  <tr v-if="leaderboardCricket.length === 0">
                    <td colspan="4" class="py-6 text-center text-slate-400">{{ t('stats.noData') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Solo X01 leaderboard -->
          <section class="mb-4 rounded-2xl border border-slate-700 bg-slate-800/80 overflow-hidden">
            <button type="button" @click="toggle('lbSolo')"
                    class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left
                           hover:bg-slate-800/90 transition">
              <span class="text-lg font-bold text-white">{{ t('stats.leaderboardSolo') }}</span>
              <span class="text-slate-500 text-sm font-semibold shrink-0">{{ open.lbSolo ? t('stats.close') : t('stats.open') }}</span>
            </button>
            <div v-show="open.lbSolo" class="px-5 pb-5 overflow-x-auto border-t border-slate-700/60">
              <table class="w-full text-sm mt-4">
                <thead class="text-slate-400">
                  <tr>
                    <th class="text-left py-2 pr-4">{{ t('stats.rank') }}</th>
                    <th class="text-left py-2">{{ t('stats.player') }}</th>
                    <th class="text-right py-2">{{ t('stats.avg3') }}</th>
                    <th class="text-right py-2">{{ t('stats.soloDarts') }}</th>
                    <th class="text-right py-2">{{ t('stats.soloGames') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in leaderboardSolo" :key="row.user_id"
                      class="border-t border-slate-700">
                    <td class="py-2 pr-4 text-slate-400 font-mono">{{ idx + 1 }}</td>
                    <td class="py-2 text-white font-medium">{{ row.name }}</td>
                    <td class="py-2 text-right text-amber-400 font-semibold">{{ row.average }}</td>
                    <td class="py-2 text-right text-slate-300">{{ row.total_darts }}</td>
                    <td class="py-2 text-right text-slate-300">{{ row.games }}</td>
                  </tr>
                  <tr v-if="leaderboardSolo.length === 0">
                    <td colspan="5" class="py-6 text-center text-slate-400">{{ t('stats.noData') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </template>
      </template>
    </div>
    </div>
  `};export{F as default};
