import{o as Ct,f as Kt,r as q,a3 as Fe,A as f,g as r,h as i,i as e,t as m,F as P,y as D,n as A,z as j,m as $,k as Y,j as tt,q as K,a as Xt,u as Ee,c as Ge,w as Ue,L as We,J as Ve}from"./main-DVdNKccV.js";import{u as qe}from"./useBodyShellClass-DNXhPCb0.js";import{useGameStore as Oe}from"./game-Clejp_tC.js";/* empty css            */import"./index-BuNY4Ty6.js";const Ke=.92,Vt=1.08;function Xe(){if(typeof window>"u")return{w:1,h:1};const t=window.visualViewport,g=t?Math.max(1,Math.round(t.width)):Math.max(1,window.innerWidth),w=t?Math.max(1,Math.round(t.height)):Math.max(1,window.innerHeight);return{w:g,h:w}}function Je(t,g){const w=t/g;return w>=Ke&&w<=Vt?t>=800?{kind:"landscape",label:"Landscape"}:{kind:"square",label:"Square"}:w>Vt?{kind:"landscape",label:"Landscape"}:{kind:"portrait",label:"Portrait"}}function _e(){const t=q("portrait"),g=q("Portrait"),w=q(0),y=q(0),c=q("1.000");function k(){const{w:n,h:x}=Xe(),{kind:h,label:N}=Je(n,x);w.value=n,y.value=x,c.value=(n/x).toFixed(3),t.value=h,g.value=N}function b(){requestAnimationFrame(()=>k())}return Ct(()=>{k(),window.addEventListener("resize",k,{passive:!0}),window.addEventListener("orientationchange",b);const n=window.visualViewport;n&&n.addEventListener("resize",k,{passive:!0})}),Kt(()=>{window.removeEventListener("resize",k),window.removeEventListener("orientationchange",b);const n=typeof window<"u"?window.visualViewport:null;n&&n.removeEventListener("resize",k)}),{layoutKind:t,layoutLabel:g,layoutWidth:w,layoutHeight:y,layoutAspect:c,syncGameScreenLayout:k}}const Qe={props:{matchId:{type:[String,Number],required:!0}},emits:["home"],setup(t,{emit:g}){const w=q(!0),y=q(null),c=q(null),k=f(()=>{var S,W;return((W=(S=c.value)==null?void 0:S.match)==null?void 0:W.game_type)==="cricket"}),b=f(()=>{var S,W;return((W=(S=c.value)==null?void 0:S.match)==null?void 0:W.game_type)==="x01"}),n=f(()=>{var S;return((S=c.value)==null?void 0:S.report)??null}),x=f(()=>{var S;return((S=n.value)==null?void 0:S.meta)??{}}),h=f(()=>{var S;return((S=n.value)==null?void 0:S.player_rows)??[]}),N=f(()=>{var S;return((S=n.value)==null?void 0:S.agp)??null}),o=f(()=>{var S;return((S=n.value)==null?void 0:S.leg_rows)??[]});function v(S){if(!S)return"—";try{return new Date(S).toLocaleString("lv-LV",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return S}}function U(){window.print()}return Ct(async()=>{w.value=!0,y.value=null;try{const{data:S}=await Fe.protocol(t.matchId);c.value=S}catch{y.value="Neizdevās ielādēt protokolu."}finally{w.value=!1}}),{loading:w,error:y,payload:c,isCricket:k,isX01:b,report:n,meta:x,rows:h,agp:N,legRows:o,fmtDateTime:v,printReport:U,goHome:()=>g("home")}},template:`
    <div class="match-report flex h-full min-h-0 flex-1 flex-col overflow-hidden w-full bg-[#060d18] text-slate-200 print:bg-white print:text-black">
      <div class="flex-shrink-0 border-b border-[#162540] print:border-slate-300 px-4 py-4 max-w-4xl mx-auto w-full">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 print:text-slate-600 mb-1">Spēles protokols</p>
            <h1 class="text-2xl font-black text-amber-400 print:text-amber-700 font-mono tracking-tight">
              {{ meta.room_code || '—' }}
            </h1>
          </div>
          <div class="flex gap-2 print:hidden">
            <button type="button" @click="printReport"
                    class="px-4 py-2 rounded-xl text-sm font-bold border border-[#1e3050] bg-[#0a1120] text-slate-200 hover:bg-[#162540] transition">
              Drukāt
            </button>
            <button type="button" @click="goHome"
                    class="px-4 py-2 rounded-xl text-sm font-black bg-amber-500 text-black hover:bg-amber-400 transition">
              Uz sākumu
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 py-6 max-w-4xl mx-auto w-full space-y-8 print:overflow-visible">

        <div v-if="loading" class="flex justify-center py-16">
          <div class="flex gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
          </div>
        </div>

        <div v-else-if="error" class="text-center text-rose-400 py-12 font-bold">{{ error }}</div>

        <template v-else-if="report">

          <!-- Uzvarētājs -->
          <div v-if="payload.match?.winner" class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-4 print:border-emerald-700">
            <div class="text-[10px] font-black uppercase tracking-widest text-emerald-400/90 mb-1">Uzvara</div>
            <div class="text-2xl font-black text-emerald-100">{{ payload.match.winner.name }}</div>
          </div>

          <!-- Meta -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
              <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Sākums</div>
              <div class="font-bold tabular-nums">{{ fmtDateTime(meta.started_at) }}</div>
            </div>
            <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
              <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Beigas</div>
              <div class="font-bold tabular-nums">{{ fmtDateTime(meta.finished_at) }}</div>
            </div>
            <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
              <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Ilgums</div>
              <div class="font-black text-amber-400 print:text-amber-800 tabular-nums">{{ meta.duration_label }}</div>
            </div>
            <div class="rounded-xl border border-[#162540] bg-[#0a1120]/80 p-3 print:bg-slate-50">
              <div class="text-[9px] uppercase tracking-wider text-slate-500 print:text-slate-600 mb-0.5">Tips / legi</div>
              <div class="font-bold">{{ meta.game_type_label }} · {{ meta.legs_played }} leg.</div>
              <div v-if="meta.x01_in_out" class="text-[11px] text-slate-400 print:text-slate-600 mt-1 font-mono">{{ meta.x01_in_out }}</div>
            </div>
          </div>
          <p class="text-xs text-slate-500 print:text-slate-600 font-mono">Match ID: {{ meta.match_id }}</p>
          <p v-if="isX01 && agp" class="text-sm text-slate-300 print:text-slate-800 mt-2">
            <span class="font-bold text-amber-400 print:text-amber-800">Spēles 3DA (AGP):</span>
            <span class="font-mono font-black tabular-nums ml-2">{{ agp.three_da }}</span>
            <span v-if="agp.busts != null" class="text-slate-500 ml-3">· BUST kopā: {{ agp.busts }}</span>
          </p>

          <!-- Cricket: kopsavilkums -->
          <section v-if="isCricket">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-500 print:text-slate-600 mb-3">Spēlētāji · Cricket</h2>
            <div class="overflow-x-auto rounded-xl border border-[#162540] print:border-slate-300">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-[#0a1120] print:bg-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th class="p-3 font-bold">Spēlētājs</th>
                    <th class="p-3 font-bold text-center">Seti</th>
                    <th class="p-3 font-bold text-center">Legi</th>
                    <th class="p-3 font-bold text-center">Punkti</th>
                    <th class="p-3 font-bold text-center">Zīmes</th>
                    <th class="p-3 font-bold text-center">Metieni</th>
                    <th class="p-3 font-bold text-center">MPR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in rows" :key="r.id" class="border-t border-[#162540]/80 print:border-slate-200">
                    <td class="p-3 font-bold">
                      {{ r.name }}
                      <span v-if="r.won_match" class="ml-2 text-[10px] font-black uppercase text-emerald-400">WIN</span>
                    </td>
                    <td class="p-3 text-center tabular-nums">{{ r.sets_won }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.legs_won }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.points }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.marks }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.darts }}</td>
                    <td class="p-3 text-center font-mono font-black text-amber-400/95 print:text-amber-800 tabular-nums">{{ r.mpr }}</td>
                  </tr>
                  <tr v-if="agp" class="border-t-2 border-amber-500/30 bg-[#0a1120]/50 print:bg-slate-100 font-bold">
                    <td class="p-3 text-slate-400">Kopā (mačs)</td>
                    <td class="p-3 text-center">—</td>
                    <td class="p-3 text-center tabular-nums">{{ meta.legs_played }}</td>
                    <td class="p-3 text-center tabular-nums">{{ agp.points }}</td>
                    <td class="p-3 text-center tabular-nums">{{ agp.marks }}</td>
                    <td class="p-3 text-center tabular-nums">{{ agp.darts }}</td>
                    <td class="p-3 text-center font-mono text-amber-400 print:text-amber-900 tabular-nums">{{ agp.mpr }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-[10px] text-slate-500 mt-2">MPR = vidējie slēgšanas metieni uz 3 šautnēm (marks ÷ metieni × 3).</p>
          </section>

          <!-- X01 -->
          <section v-if="isX01">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-500 print:text-slate-600 mb-3">Spēlētāji · {{ meta.game_type_label }}</h2>
            <div class="overflow-x-auto rounded-xl border border-[#162540] print:border-slate-300">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-[#0a1120] print:bg-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th class="p-3 font-bold">Spēlētājs</th>
                    <th class="p-3 font-bold text-center">Seti</th>
                    <th class="p-3 font-bold text-center">Legi</th>
                    <th class="p-3 font-bold text-center">Punkti</th>
                    <th class="p-3 font-bold text-center">Metieni</th>
                    <th class="p-3 font-bold text-center">3DA</th>
                    <th class="p-3 font-bold text-center">BUST</th>
                    <th class="p-3 font-bold text-center">CO</th>
                    <th class="p-3 font-bold text-center">Max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in rows" :key="r.id" class="border-t border-[#162540]/80 print:border-slate-200">
                    <td class="p-3 font-bold">
                      {{ r.name }}
                      <span v-if="r.won_match" class="ml-2 text-[10px] font-black uppercase text-emerald-400">WIN</span>
                    </td>
                    <td class="p-3 text-center tabular-nums">{{ r.sets_won }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.legs_won }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.points }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.darts }}</td>
                    <td class="p-3 text-center font-mono font-black text-amber-400/95 print:text-amber-800 tabular-nums">{{ r.three_da }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.busts ?? 0 }}</td>
                    <td class="p-3 text-center tabular-nums">{{ r.checkouts ?? 0 }}</td>
                    <td class="p-3 text-center tabular-nums font-mono">{{ r.high_turn ?? 0 }}</td>
                  </tr>
                  <tr v-if="agp" class="border-t-2 border-amber-500/30 bg-[#0a1120]/50 print:bg-slate-100 font-bold">
                    <td class="p-3 text-slate-400">Kopā (mačs)</td>
                    <td class="p-3 text-center">—</td>
                    <td class="p-3 text-center tabular-nums">{{ meta.legs_played }}</td>
                    <td class="p-3 text-center tabular-nums">{{ agp.points }}</td>
                    <td class="p-3 text-center tabular-nums">{{ agp.darts }}</td>
                    <td class="p-3 text-center font-mono text-amber-400 print:text-amber-900 tabular-nums">{{ agp.three_da }}</td>
                    <td class="p-3 text-center tabular-nums">{{ agp.busts ?? '—' }}</td>
                    <td class="p-3 text-center">—</td>
                    <td class="p-3 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Legu detaļas -->
          <section v-if="legRows.length">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-500 print:text-slate-600 mb-3">Legi</h2>
            <div class="overflow-x-auto rounded-xl border border-[#162540] print:border-slate-300">
              <table class="w-full text-xs sm:text-sm border-collapse min-w-[32rem]">
                <thead>
                  <tr class="bg-[#0a1120] print:bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                    <th class="p-2 text-left font-bold">Leg</th>
                    <th v-if="isCricket" class="p-2 text-center font-bold" v-for="p in legRows[0].players" :key="'h'+p.id">MPR / zīmes<br><span class="normal-case font-semibold text-slate-400">{{ p.name }}</span></th>
                    <th v-if="isX01" class="p-2 text-center font-bold" v-for="p in legRows[0].players" :key="'xh'+p.id">3DA / leg<br><span class="normal-case font-semibold text-slate-400">{{ p.name }}</span></th>
                    <th class="p-2 text-center font-bold">{{ legRows[0].game_label }}</th>
                    <th v-if="isCricket" class="p-2 text-center font-bold" v-for="p in legRows[0].players" :key="'h2'+p.id">Punkti</th>
                    <th v-if="isX01" class="p-2 text-center font-bold" v-for="p in legRows[0].players" :key="'xh2'+p.id">Punkti</th>
                    <th class="p-2 text-center font-bold">Metieni</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="leg in legRows" :key="leg.label" class="border-t border-[#162540]/80 print:border-slate-200">
                    <td class="p-2 font-mono font-black text-amber-400/90">{{ leg.label }}</td>
                    <template v-if="isCricket">
                      <td v-for="p in leg.players" :key="leg.label+'m'+p.id" class="p-2 text-center font-mono tabular-nums leading-tight">
                        <div>{{ p.mpr }}</div>
                        <div class="text-[10px] font-sans text-slate-500 print:text-slate-600">{{ p.marks }} zīmes</div>
                      </td>
                      <td class="p-2 text-center text-slate-500 font-bold">{{ leg.game_label }}</td>
                      <td v-for="p in leg.players" :key="leg.label+'pt'+p.id" class="p-2 text-center tabular-nums">{{ p.points }}</td>
                    </template>
                    <template v-else>
                      <td v-for="p in leg.players" :key="leg.label+'x'+p.id" class="p-2 text-center font-mono tabular-nums leading-tight">
                        <div>{{ p.three_da }}</div>
                        <div class="text-[10px] font-sans text-slate-500 print:text-slate-600">
                          {{ p.darts }} š. · busti {{ p.busts ?? 0 }}<span v-if="(p.high_turn ?? 0) > 0"> · max {{ p.high_turn }}</span>
                        </div>
                      </td>
                      <td class="p-2 text-center text-slate-500 font-bold">{{ leg.game_label }}</td>
                      <td v-for="p in leg.players" :key="leg.label+'xpt'+p.id" class="p-2 text-center tabular-nums">{{ p.points }}</td>
                    </template>
                    <td class="p-2 text-center font-mono tabular-nums">{{ leg.total_darts }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <p class="text-[10px] text-slate-600 print:text-slate-500 pb-8">
            Statistika aprēķināta no saglabātajiem metieniem. Metodes var atšķirties no citām platformām.
          </p>
        </template>
      </div>
    </div>
  `},St={props:{boosted:{type:Boolean,default:!0},prominent:{type:Boolean,default:!1}},template:`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         aria-hidden="true"
         class="inline-block align-middle flex-shrink-0"
         :class="prominent
           ? 'w-[clamp(1.85rem,6vmin,3.15rem)] h-[clamp(1.85rem,6vmin,3.15rem)] min-w-[1.85rem] min-h-[1.85rem] ' +
             'drop-shadow-[0_4px_18px_rgba(16,185,129,.42)]'
           : boosted
             ? 'w-[1.24em] h-[1.24em] min-w-[1.24em] min-h-[1.24em] sm:w-[1.32em] sm:h-[1.32em] sm:min-w-[1.32em] sm:min-h-[1.32em] ' +
               'drop-shadow-[0_2px_10px_rgba(16,185,129,.28)]'
             : 'w-[1em] h-[1em] min-w-[1em] min-h-[1em] drop-shadow-[0_1px_6px_rgba(16,185,129,.2)]'">
      <circle cx="12" cy="12" :r="prominent ? 9.85 : 9.65"
              fill="#10b981" :fill-opacity="prominent ? 0.22 : 0.14"
              :stroke="prominent ? '#6ee7b7' : '#34d399'"
              :stroke-opacity="prominent ? 0.95 : 0.6"
              :stroke-width="prominent ? 1.55 : 1.35"/>
      <path d="M7.05 12.45 10.4 15.6 17.1 7.65"
            stroke="#ecfdf5"
            :stroke-width="prominent ? 2.75 : 2.35"
            stroke-linecap="round" stroke-linejoin="round"
            stroke-opacity="0.97"/>
    </svg>
  `},gt={components:{CricketClosedCheck:St},props:{hits:{type:Number,default:0},closed:{type:Boolean,default:!1},size:{type:String,default:"md"}},setup(t){function g(x){const h=x??0;return h===2?"2":h===1?"1":"0"}function w(x){const h=x??0;return h>=3?"Slēgts (3 trāpījumi)":h===2?"Divi trāpījumi":h===1?"Viens trāpījums":"Nav trāpījumu"}function y(x){return x>=3?"text-emerald-300":x===2?"text-amber-200":x===1?"text-sky-200":"text-slate-500"}function c(x){const h=x??0;return h>=3?"bg-emerald-500/20 ring-1 ring-emerald-400/35 shadow-[0_0_20px_rgba(52,211,153,.12)]":h===2?"bg-amber-500/18 ring-1 ring-amber-400/30":h===1?"bg-sky-500/18 ring-1 ring-sky-400/28":"bg-[#0c1528]/90 ring-1 ring-[#1e3050]/80"}const k=f(()=>{const x={sm:"text-xl",md:"text-2xl",lg:"text-3xl",board:"text-[clamp(1.35rem,4.2vmin,2.75rem)] sm:text-[clamp(1.5rem,3.8vmin,2.5rem)]","board-sm":"text-[clamp(0.7rem,2.6vmin,1.05rem)]"};return x[t.size]??x.md}),b=f(()=>t.size==="board"||t.size==="board-sm"),n=f(()=>t.size==="board-sm");return{symbol:g,hitTitle:w,colorClass:y,pillClass:c,sizeClass:k,isBoard:b,isBoardCompact:n}},template:`
    <div class="flex items-center justify-center w-full h-full min-h-0 min-w-0 select-none p-0.5"
         :title="hitTitle(hits)">
      <Transition name="mark" mode="out-in">
        <span
          :key="hits"
          class="font-black leading-none transition-colors duration-200
                 drop-shadow-[0_2px_8px_rgba(0,0,0,.45)]"
        >
          <span
            v-if="hits < 3"
            :class="[
              isBoard ? pillClass(hits) : '',
              isBoard ? (isBoardCompact
                ? 'rounded-lg px-1 py-0.5 flex items-center justify-center min-w-[1.35rem] min-h-[1.35rem]'
                : 'rounded-xl px-2 py-1 flex items-center justify-center min-w-[2.25rem] min-h-[2.25rem] sm:min-w-[2.5rem] sm:min-h-[2.5rem]') : '',
              sizeClass,
              colorClass(hits),
              'font-mono tabular-nums',
            ]"
          >{{ symbol(hits) }}</span>
          <span
            v-else
            :class="[
              isBoard ? pillClass(hits) : '',
              isBoard ? (isBoardCompact
                ? 'rounded-lg px-0.5 py-0.5 flex items-center justify-center min-w-[1.45rem] min-h-[1.45rem]'
                : 'rounded-xl px-1.5 py-0.5 flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem] sm:min-w-[2.85rem] sm:min-h-[2.85rem]') : 'inline-flex items-center justify-center',
              'inline-flex items-center justify-center font-sans',
              'mark-close-anim',
            ]"
          >
            <CricketClosedCheck :prominent="true" />
          </span>
        </span>
      </Transition>
    </div>
  `},bt={props:{hits:{type:Number,default:0},size:{type:Number,default:32},dimmed:{type:Boolean,default:!1}},setup(t){return{color:f(()=>t.dimmed?"#3a4a63":t.hits>=3?"#3ecf8e":"#f5a623")}},template:`
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style="display:block;flex-shrink:0;overflow:visible"
    >
      <!-- pirmais skripts: apakškreisi → augšlabi -->
      <line
        v-if="hits >= 1"
        x1="18" y1="82" x2="82" y2="18"
        :stroke="color"
        stroke-width="12"
        stroke-linecap="round"
      />
      <!-- otrais skripts: augškreisi → apakšlabi -->
      <line
        v-if="hits >= 2"
        x1="18" y1="18" x2="82" y2="82"
        :stroke="color"
        stroke-width="12"
        stroke-linecap="round"
      />
      <!-- aplis = aizvērts -->
      <circle
        v-if="hits >= 3"
        cx="50" cy="50" r="39"
        fill="none"
        :stroke="dimmed ? '#3a4a63' : '#3ecf8e'"
        stroke-width="10"
      />
    </svg>
  `},Ye={key:0,class:"flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center"},Ze={class:"text-xl font-black text-slate-100"},ts={class:"flex shrink-0 items-center justify-between"},es={class:"flex items-center gap-2"},ss={class:"text-[10px] font-semibold text-slate-400"},as={class:"flex gap-[3px]"},ns={key:0,class:"flex shrink-0 items-center justify-end gap-1"},ls={key:0,class:"text-[9px] font-black text-emerald-400"},rs={key:1,class:"text-[9px] text-amber-500"},is={class:"flex shrink-0 gap-1.5"},os={class:"min-w-0 flex-1"},ds={class:"truncate font-mono text-sm font-black leading-tight text-amber-400"},cs={class:"text-[10px] tabular-nums text-slate-600"},us=["onClick"],ms={class:"min-h-0 flex-1 grid grid-cols-3 gap-[3px]",style:{"grid-template-rows":"1fr 1fr"}},bs={class:"flex shrink-0 items-center justify-between px-1.5 pt-1"},fs={class:"flex min-h-0 flex-1 items-stretch gap-[2px] p-1 pt-0.5"},xs=["disabled","onClick"],ps={class:"flex shrink-0 gap-1.5"},gs={class:"flex items-center justify-between px-1.5 pt-1"},hs={class:"flex gap-[2px] p-1 pt-0.5"},vs=["disabled"],ys=["disabled"],ks=["disabled"],ws={class:"flex shrink-0 gap-2"},Ts=["disabled"],Cs={class:"flex shrink-0 items-center justify-between",style:{"margin-bottom":"10px"}},Ss={class:"flex items-center gap-1.5"},As={class:"text-[11px] font-semibold text-[#7b8ba8]"},Bs={class:"rounded-full border border-[#252d3d] bg-[#131720] px-[7px] py-[2px] text-[10px] font-bold text-[#7b8ba8]"},Ns={class:"flex shrink-0 gap-[5px]",style:{"margin-bottom":"12px"}},Ms=["onClick"],js={class:"text-[9px] font-bold text-[#2e3a50]"},Rs={class:"grid min-h-0 flex-1 grid-cols-2 gap-[7px]",style:{"grid-auto-rows":"minmax(0,1fr)"}},Is={class:"flex items-center justify-between",style:{"margin-bottom":"1px"}},Ls={class:"flex items-center gap-1"},zs={class:"text-[14px] font-extrabold tabular-nums tracking-[-0.5px] text-[#f5a623]"},Ps={class:"flex gap-1"},$s=["disabled","onClick"],Hs={key:0,class:"shrink-0 rounded-[9px] border border-[#252d3d] bg-[#131720] p-[8px]",style:{"margin-top":"8px"}},Ds={class:"flex items-center justify-between",style:{"margin-bottom":"5px"}},Fs={class:"flex items-center gap-1"},Es={class:"flex gap-1"},Gs=["disabled"],Us=["disabled"],Ws=["disabled"],Vs={class:"flex shrink-0 gap-[7px]",style:{"margin-top":"8px"}},qs=["disabled"],qt={__name:"CricketInputPanel",props:{state:{type:Object,required:!0},dartInput:{type:Object,required:!0},submitting:{type:Boolean,default:!1},waitingForTurnUi:{type:Boolean,default:!1},cricketPadSplit:{type:Object,default:()=>({left:[],right:[]})},cricketSdtHasBull:{type:Boolean,default:!1},segClosedByAll:{type:Function,required:!0},myHitsFor:{type:Function,required:!0},addCricketDart:{type:Function,required:!0},removeDart:{type:Function,required:!0},submitThrow:{type:Function,required:!0},undo:{type:Function,required:!0},dartLabel:{type:Function,required:!0},dartValue:{type:Function,required:!0},density:{type:String,default:"default"}},setup(t){const g=t,w=f(()=>[...g.cricketPadSplit.left,...g.cricketPadSplit.right]),y=f(()=>{const b=new Set([...g.cricketPadSplit.left,...g.cricketPadSplit.right,...g.cricketSdtHasBull?[25]:[]]);return g.dartInput.darts.reduce((n,x)=>{const h=Number(x.segment??0),N=Number(x.multiplier??0);return n+(h>0&&N>0&&b.has(h)?N:0)},0)}),c=f(()=>y.value>=9?"#3ecf8e":y.value>=6?"#f5a623":y.value>=4?"#7b8ba8":"#3a4a63");function k(b){return b===25?"25":String(b)}return(b,n)=>{var x,h,N;return r(),i("div",{class:A(["flex min-h-0 flex-1 flex-col overflow-hidden",t.density==="compact"?"gap-1.5 p-2":"gap-3 p-3"])},[t.waitingForTurnUi?(r(),i("div",Ye,[n[10]||(n[10]=e("div",{class:"text-xs font-semibold uppercase tracking-widest text-slate-500"},"Gaida",-1)),e("div",Ze,m((x=t.state.current_player)==null?void 0:x.name),1),n[11]||(n[11]=e("div",{class:"flex gap-1.5"},[e("span",{class:"h-2 w-2 animate-bounce rounded-full bg-amber-500",style:{"animation-delay":"0ms"}}),e("span",{class:"h-2 w-2 animate-bounce rounded-full bg-amber-500",style:{"animation-delay":"150ms"}}),e("span",{class:"h-2 w-2 animate-bounce rounded-full bg-amber-500",style:{"animation-delay":"300ms"}})],-1))])):t.density==="compact"?(r(),i(P,{key:1},[e("div",ts,[n[13]||(n[13]=e("span",{class:"text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600"},"Šīs kārtas",-1)),e("div",es,[e("span",ss,m((h=t.state.current_player)==null?void 0:h.name),1),e("div",as,[(r(),i(P,null,D(3,o=>e("span",{key:o,class:A(["h-1.5 w-1.5 rounded-full transition-all",o<=t.dartInput.darts.length?"bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,.5)]":"bg-[#1e3050]"])},null,2)),64))])]),y.value>0?(r(),i("div",ns,[n[12]||(n[12]=e("span",{class:"text-[9px] text-slate-600"},"kārtā:",-1)),e("span",{class:"text-[11px] font-black tabular-nums transition-colors",style:j({color:c.value})},m(y.value)+" m",5),y.value>=9?(r(),i("span",ls,"🔥")):y.value>=6?(r(),i("span",rs,"⬡")):$("",!0)])):$("",!0)]),e("div",is,[(r(!0),i(P,null,D(t.dartInput.darts,(o,v)=>(r(),i("div",{key:v,class:"relative flex h-[2.4rem] flex-1 items-center overflow-hidden rounded-xl border border-[#1e3050] bg-[#0f1c30] px-2"},[e("div",os,[e("div",ds,m(t.dartLabel(o)),1),e("div",cs,m(t.dartValue(o)>0?t.dartValue(o):"—"),1)]),e("button",{type:"button",class:"ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-700/70 text-[9px] font-black text-white transition hover:bg-red-600 active:scale-90 touch-manipulation",onClick:U=>t.removeDart(v)},"✕",8,us)]))),128)),(r(!0),i(P,null,D(3-t.dartInput.darts.length,o=>(r(),i("div",{key:"e"+o,class:"flex h-[2.4rem] flex-1 items-center justify-center rounded-xl border border-dashed border-[#1e3050] bg-[#060d18]/60 font-mono text-xs text-[#1e3050]"},"—"))),128))]),e("div",ms,[(r(!0),i(P,null,D(w.value,o=>(r(),i("div",{key:"cs"+o,class:A(["flex flex-col overflow-hidden rounded-xl transition-opacity",t.segClosedByAll(o)?"border border-[#131720] bg-[#090d12] opacity-30":"border border-slate-500/20 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] shadow-md shadow-black/30 ring-1 ring-white/[0.05]"])},[e("div",bs,[Y(tt(bt),{hits:t.myHitsFor(o),dimmed:t.segClosedByAll(o),size:13},null,8,["hits","dimmed"]),e("span",{class:A(["text-sm font-extrabold tabular-nums leading-none",t.segClosedByAll(o)?"text-[#3a4a63] line-through":"text-[#f5a623]"])},m(k(o)),3)]),e("div",fs,[(r(),i(P,null,D(3,v=>e("button",{key:v,type:"button",class:A(["flex flex-1 items-center justify-center rounded-lg text-[11px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20",t.myHitsFor(o)>=3?"bg-emerald-950/70 text-emerald-500/80":v===3?"bg-[#2a1e0a] text-[#f5a623] hover:bg-[#3a2a0e]":v===2?"bg-[#0a1828] text-sky-300/90 hover:bg-[#0e2035]":"bg-[#1a2030] text-[#c0c8d8] hover:bg-[#222a3c]"]),disabled:t.segClosedByAll(o)||t.dartInput.darts.length>=3,onClick:U=>t.addCricketDart(o,v)},m(v)+"×",11,xs)),64))])],2))),128))]),e("div",ps,[t.cricketSdtHasBull?(r(),i("div",{key:0,class:A(["flex-[2] overflow-hidden rounded-xl transition-opacity",t.segClosedByAll(25)?"border border-[#131720] bg-[#090d12] opacity-30":"border border-[#1e3050] bg-gradient-to-b from-[#101c32] to-[#060d14] shadow-md ring-1 ring-white/[0.05]"])},[e("div",gs,[Y(tt(bt),{hits:t.myHitsFor(25),dimmed:t.segClosedByAll(25),size:13},null,8,["hits","dimmed"]),e("span",{class:A(["text-sm font-extrabold leading-none",t.segClosedByAll(25)?"text-[#3a4a63] line-through":"text-[#ff5252]"])},"25",2)]),e("div",hs,[e("button",{type:"button",class:A(["flex flex-1 items-center justify-center rounded-lg py-0.5 text-[11px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20",t.myHitsFor(25)>=3?"bg-emerald-950/70 text-emerald-500/80":"bg-[#1a2030] text-[#c0c8d8] hover:bg-[#222a3c]"]),disabled:t.segClosedByAll(25)||t.dartInput.darts.length>=3,onClick:n[0]||(n[0]=o=>t.addCricketDart(25,1))},"1×",10,vs),e("button",{type:"button",class:A(["flex flex-[2] items-center justify-center rounded-lg py-0.5 text-[12px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20",t.myHitsFor(25)>=3?"bg-emerald-950/70 text-emerald-500/80":"bg-[#200a0f] text-[#ff5252] hover:bg-[#2c0e14]"]),disabled:t.segClosedByAll(25)||t.dartInput.darts.length>=3,onClick:n[1]||(n[1]=o=>t.addCricketDart(25,2))},"2× Bull",10,ys)])],2)):$("",!0),e("button",{type:"button",class:"flex-1 rounded-xl border border-rose-900/35 bg-[#1a0a0f] py-1 text-[11px] font-black uppercase tracking-wide text-rose-300/80 transition hover:bg-[#241018] active:scale-[0.97] touch-manipulation disabled:opacity-20",disabled:t.dartInput.darts.length>=3,onClick:n[2]||(n[2]=o=>t.addCricketDart(0,0))},"Miss",8,ks)]),e("div",ws,[e("button",{type:"button",class:"flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#1e3050] bg-[#0f1c30] py-2.5 text-sm font-bold text-slate-300 transition hover:bg-[#162540] active:scale-[0.97] touch-manipulation",onClick:n[3]||(n[3]=(...o)=>t.undo&&t.undo(...o))},[...n[14]||(n[14]=[e("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round",class:"w-4 h-4 shrink-0"},[e("path",{d:"M7.5 5H13a4 4 0 0 1 0 8H7"}),e("polyline",{points:"4 5 7.5 2 7.5 8"})],-1),K(" Atsaukt ",-1)])]),e("button",{type:"button",class:"flex-1 rounded-2xl bg-amber-500 py-2.5 text-sm font-black text-black shadow-lg shadow-amber-950/30 transition hover:bg-amber-400 active:scale-[0.97] touch-manipulation disabled:opacity-40",disabled:t.dartInput.darts.length===0||t.submitting,onClick:n[4]||(n[4]=(...o)=>t.submitThrow&&t.submitThrow(...o))},m(t.submitting?"...":"Iesniegt →"),9,Ts)])],64)):(r(),i(P,{key:2},[e("div",Cs,[n[15]||(n[15]=e("div",{class:"text-[10px] font-bold uppercase tracking-[0.14em] text-[#3a4a63]"},"ŠĪS KĀRTAS",-1)),e("div",Ss,[e("div",As,m((N=t.state.current_player)==null?void 0:N.name),1),e("div",Bs,m(t.dartInput.darts.length)+"/3 ",1)])]),e("div",Ns,[(r(!0),i(P,null,D(t.dartInput.darts,(o,v)=>(r(),i("div",{key:"sd-"+v,class:"relative flex flex-1 items-center justify-center overflow-hidden rounded-[7px] border px-2 text-center",style:j({height:"34px",background:o.segment===0||o.multiplier===0?"#252d3d":"#f5a62318",borderColor:o.segment===0||o.multiplier===0?"#3a4a63":"#f5a62345"})},[e("span",{class:"truncate text-[11px] font-bold",style:j({color:o.segment===0||o.multiplier===0?"#7b8ba8":"#f5a623"})},m(t.dartLabel(o).toUpperCase()),5),e("button",{type:"button",class:"absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-700 text-[10px] font-black text-white shadow-md transition hover:bg-red-600 active:scale-90 touch-manipulation",onClick:U=>t.removeDart(v)},"✕",8,Ms)],4))),128)),(r(!0),i(P,null,D(3-t.dartInput.darts.length,o=>(r(),i("div",{key:"se-"+o,class:"flex flex-1 items-center justify-center rounded-[7px] border border-dashed border-[#1e2738] text-center",style:{height:"34px"}},[e("span",js,"BULTA "+m(t.dartInput.darts.length+o),1)]))),128))]),e("div",Rs,[(r(!0),i(P,null,D(w.value,o=>(r(),i("div",{key:"df-"+o,class:"flex min-h-0 flex-col gap-[5px] rounded-[9px] border p-[8px]",style:j({background:t.segClosedByAll(o)?"#09100f":"#131720",borderColor:t.segClosedByAll(o)?"#131720":"#252d3d",opacity:t.segClosedByAll(o)?.35:1})},[e("div",Is,[n[16]||(n[16]=e("span",{class:"text-[10px] font-bold uppercase tracking-[0.05em] text-[#7b8ba8]"},"Lauks",-1)),e("div",Ls,[Y(tt(bt),{hits:t.myHitsFor(o),dimmed:t.segClosedByAll(o),size:14},null,8,["hits","dimmed"]),e("span",zs,m(k(o)),1)])]),e("div",Ps,[(r(),i(P,null,D(3,v=>e("button",{key:"dfm-"+o+"-"+v,type:"button",class:"flex flex-1 select-none items-center justify-center rounded-[6px] py-[7px] text-[12px] font-bold transition active:scale-[0.97] touch-manipulation disabled:opacity-40",style:j({background:t.dartInput.darts.length>=3||t.segClosedByAll(o)?"#0b0e14":v===3?"#2a1e0a":"#1a2030",color:t.dartInput.darts.length>=3||t.segClosedByAll(o)?"#2e3a50":v===3?"#f5a623":"#c0c8d8"}),disabled:t.dartInput.darts.length>=3||t.segClosedByAll(o),onClick:U=>t.addCricketDart(o,v)},m(v)+"×",13,$s)),64))])],4))),128))]),t.cricketSdtHasBull?(r(),i("div",Hs,[e("div",Ds,[n[18]||(n[18]=e("span",{class:"text-[10px] font-bold uppercase tracking-[0.08em] text-[#7b8ba8]"},"Bull",-1)),e("div",Fs,[Y(tt(bt),{hits:t.myHitsFor(25),dimmed:t.segClosedByAll(25),size:14},null,8,["hits","dimmed"]),n[17]||(n[17]=e("span",{class:"text-[14px] font-extrabold text-[#ff5252]"},"25",-1))])]),e("div",Es,[e("button",{type:"button",class:"flex flex-1 select-none items-center justify-center rounded-[6px] py-2 text-[12px] font-bold transition active:scale-[0.97] touch-manipulation disabled:opacity-40",style:j({background:t.dartInput.darts.length>=3||t.segClosedByAll(25)?"#0b0e14":"#1a2030",color:t.dartInput.darts.length>=3||t.segClosedByAll(25)?"#2e3a50":"#c0c8d8"}),disabled:t.dartInput.darts.length>=3||t.segClosedByAll(25),onClick:n[5]||(n[5]=o=>t.addCricketDart(25,1))},"1×",12,Gs),e("button",{type:"button",class:"flex flex-1 select-none items-center justify-center rounded-[6px] py-2 text-[12px] font-bold transition active:scale-[0.97] touch-manipulation disabled:opacity-40",style:j({background:t.dartInput.darts.length>=3||t.segClosedByAll(25)?"#0b0e14":"#200808",color:t.dartInput.darts.length>=3||t.segClosedByAll(25)?"#2e3a50":"#ff5252"}),disabled:t.dartInput.darts.length>=3||t.segClosedByAll(25),onClick:n[6]||(n[6]=o=>t.addCricketDart(25,2))},"2×",12,Us)])])):$("",!0),e("button",{type:"button",class:"shrink-0 w-full rounded-[8px] border border-[#252d3d] bg-[#0b0e14] py-[10px] text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8ba8] transition active:scale-[0.98] touch-manipulation disabled:opacity-40",style:{"margin-top":"7px"},disabled:t.dartInput.darts.length>=3,onClick:n[7]||(n[7]=o=>t.addCricketDart(0,0))},"MISS",8,Ws),e("div",Vs,[e("button",{type:"button",class:"flex flex-1 items-center justify-center rounded-[8px] border bg-[#131720] py-[11px] text-[12px] font-semibold transition active:scale-[0.98] touch-manipulation",style:j({borderColor:t.dartInput.darts.length===0?"#131720":"#252d3d",color:t.dartInput.darts.length===0?"#252d3d":"#7b8ba8"}),onClick:n[8]||(n[8]=(...o)=>t.undo&&t.undo(...o))},"← Atsaukt",4),e("button",{type:"button",class:"flex flex-[2] items-center justify-center rounded-[8px] border-none py-[11px] text-[13px] font-bold transition active:scale-[0.98] touch-manipulation disabled:opacity-60",style:j({background:t.dartInput.darts.length>0&&!t.submitting?"linear-gradient(135deg,#f5a623,#f5c842)":"#252d3d",color:t.dartInput.darts.length>0&&!t.submitting?"#0b0e14":"#3a4a63"}),disabled:t.dartInput.darts.length===0||t.submitting,onClick:n[9]||(n[9]=(...o)=>t.submitThrow&&t.submitThrow(...o))},m(t.submitting?"...":"Ierakstīt →"),13,qs)])],64))],2)}}},Os=["data-cricket-canvas"],Ks={class:"flex shrink-0 items-center gap-2"},Xs=["width","height"],Js={key:0,class:"text-[12px] font-bold"},_s={key:0,class:"h-4 w-px shrink-0 bg-[#1e2738]"},Qs={class:"flex shrink-0 gap-1.5"},Ys={class:"font-bold text-[#e8eaf0]"},Zs={class:"font-bold text-[#e8eaf0]"},ta={class:"ml-auto flex shrink-0 items-center gap-2"},ea=["title"],sa={key:1,class:"hidden items-center gap-3 lg:flex"},aa={class:"flex items-center gap-1.5"},na={class:"flex items-center gap-1.5"},la={class:"flex items-center gap-1.5"},ra={class:"flex shrink-0 gap-1.5 px-2.5 pt-2"},ia={key:0,class:"absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},oa={class:"mb-1.5 flex items-center gap-2"},da={key:0,class:"h-2 w-2 shrink-0 rounded-full bg-[#f5a623]"},ca={key:1,class:"mb-1.5 flex items-center gap-2"},ua={class:"h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]"},ma={class:"w-[3.5rem] shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400"},ba={class:"text-[36px] font-black leading-none tracking-tight text-[#e8eaf0]"},fa=["title"],xa={class:"font-bold uppercase tracking-wide text-amber-600/90"},pa={class:"font-mono font-black text-amber-100/90"},ga={class:"mt-1 text-[11px] text-[#7b8ba8]"},ha={class:"ml-0.5 font-bold text-[#e8eaf0]"},va={class:"ml-0.5 font-bold text-[#e8eaf0]"},ya={class:"flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 pt-1.5"},ka={class:"flex min-h-0 flex-1 flex-col overflow-hidden"},wa={class:"flex shrink-0 border-b border-[#1a2030] px-1"},Ta={class:"flex-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]"},Ca={class:"flex-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]"},Sa={class:"flex flex-1 items-center justify-center"},Aa={class:"flex w-[4.5rem] shrink-0 items-center justify-center"},Ba={key:0,class:"mt-0.5 text-[6px] font-bold uppercase tracking-wider text-[#ff525270]"},Na={class:"flex flex-1 items-center justify-center"},Ma={class:"flex min-h-0 flex-1 flex-col overflow-y-auto"},ja={key:1,class:"flex min-h-0 flex-1 overflow-hidden"},Ra={class:"flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"},Ia={class:"flex shrink-0 gap-0 px-[10px] pt-[10px]"},La={class:"min-w-0 flex-1 pr-1"},za={key:0,class:"absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},Pa={class:"min-w-0 flex-1"},$a={class:"mb-[6px] flex items-center gap-2"},Ha={key:0,class:"h-[7px] w-[7px] shrink-0 rounded-full bg-[#f5a623]"},Da={key:0,class:"mb-[6px] flex items-center gap-2"},Fa={class:"h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]"},Ea={class:"w-[3.5rem] shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400"},Ga={class:"flex items-baseline gap-[10px]"},Ua={class:"text-[38px] font-extrabold leading-none tracking-[-2px] text-[#e8eaf0]"},Wa=["title"],Va={class:"font-bold uppercase tracking-wide text-amber-600/90"},qa={class:"font-mono font-black text-amber-100/90"},Oa={class:"flex flex-col items-end gap-[5px]"},Ka={class:"text-[11px] text-[#7b8ba8]"},Xa={class:"font-bold text-[#e8eaf0]"},Ja={class:"font-bold text-[#e8eaf0]"},_a={class:"min-w-0 flex-1 pl-1"},Qa={key:0,class:"absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},Ya={class:"min-w-0 flex-1"},Za={class:"mb-[6px] flex items-center gap-2"},tn={key:0,class:"h-[7px] w-[7px] shrink-0 rounded-full bg-[#f5a623]"},en={key:0,class:"mb-[6px] flex items-center gap-2"},sn={class:"h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]"},an={class:"w-[3.5rem] shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400"},nn={class:"flex items-baseline gap-[10px]"},ln={class:"text-[38px] font-extrabold leading-none tracking-[-2px] text-[#e8eaf0]"},rn=["title"],on={class:"font-bold uppercase tracking-wide text-amber-600/90"},dn={class:"font-mono font-black text-amber-100/90"},cn={class:"flex flex-col items-end gap-[5px]"},un={class:"text-[11px] text-[#7b8ba8]"},mn={class:"font-bold text-[#e8eaf0]"},bn={class:"font-bold text-[#e8eaf0]"},fn={class:"flex shrink-0 px-[10px] pt-[6px]"},xn={class:"flex min-h-0 flex-1 overflow-hidden px-[10px] pb-[10px] pt-[4px]"},pn={class:"flex min-w-0 flex-1 flex-col overflow-hidden"},gn={class:"flex min-w-0 flex-1 flex-col overflow-hidden"},hn={class:"min-w-0 flex-1 pr-1"},vn={key:0,class:"absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},yn={class:"mb-1 flex items-center gap-2"},kn={key:0,class:"h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]"},wn={class:"text-[38px] font-extrabold leading-none tracking-tight text-[#e8eaf0]"},Tn={class:"mt-1 flex items-end justify-between gap-2"},Cn=["title"],Sn={class:"text-[9px] font-bold uppercase tracking-wide text-amber-500/90"},An={class:"text-base font-black tabular-nums text-amber-100"},Bn={class:"flex flex-col items-end gap-1"},Nn={class:"flex gap-0.5"},Mn={class:"text-right text-[11px] text-[#7b8ba8]"},jn={class:"font-bold text-[#e8eaf0]"},Rn={class:"mx-1 font-bold text-[#e8eaf0]"},In={class:"min-w-0 flex-1 pl-1"},Ln={key:0,class:"absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},zn={class:"mb-1 flex items-center gap-2"},Pn={key:0,class:"h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]"},$n={class:"text-[38px] font-extrabold leading-none tracking-tight text-[#e8eaf0]"},Hn={class:"mt-1 flex items-end justify-between gap-2"},Dn=["title"],Fn={class:"text-[9px] font-bold uppercase tracking-wide text-amber-500/90"},En={class:"text-base font-black tabular-nums text-amber-100"},Gn={class:"flex flex-col items-end gap-1"},Un={class:"flex gap-0.5"},Wn={class:"text-right text-[11px] text-[#7b8ba8]"},Vn={class:"font-bold text-[#e8eaf0]"},qn={class:"mx-1 font-bold text-[#e8eaf0]"},On={class:"flex shrink-0 px-2 pb-1 pt-0.5"},Kn={class:"flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2"},Xn={class:"flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#162540] bg-[#0f1c30]/90 shadow-inner"},Jn={class:"flex min-h-0 flex-1 flex-col overflow-hidden"},_n={class:"flex flex-col items-center justify-center gap-0.5 py-0.5 leading-none"},Qn={key:0,class:"text-[8px] font-bold uppercase tracking-widest text-rose-400/80"},Yn={class:"flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-t border-[#162540] bg-[#0a1120]/40 px-3 py-1.5 text-[11px] text-slate-500"},Zn={class:"inline-flex items-center gap-1.5"},tl={class:"inline-flex h-4 w-4 flex-shrink-0 items-center justify-center text-emerald-400/95"},el=76,sl=28,al=20,Ot=310,nl={__name:"CricketGameAdaptiveLayout",props:{layoutKind:{type:String,required:!0},layoutWidth:{type:Number,default:0},layoutHeight:{type:Number,default:0},state:{type:Object,required:!0},players:{type:Array,default:()=>[]},leftPlayers:{type:Array,default:()=>[]},rightPlayers:{type:Array,default:()=>[]},cricketSdtSegments:{type:Array,default:()=>[]},cricketSdtNonBull:{type:Array,default:()=>[]},cricketSdtHasBull:{type:Boolean,default:!1},cricketPadSplit:{type:Object,default:()=>({left:[],right:[]})},legsConfigTotal:{type:Number,default:1},setsConfigTotal:{type:Number,default:1},legsToWin:{type:Number,default:1},isMatchActive:{type:Boolean,default:!1},isSuspended:{type:Boolean,default:!1},auth:{type:Object,default:null},dartInput:{type:Object,required:!0},submitting:{type:Boolean,default:!1},waitingForTurnUi:{type:Boolean,default:!1},showTurnTimeoutWaitingBanner:{type:Boolean,default:!1},turnTimerRowVisible:{type:Boolean,default:!1},turnTimerProgress:{type:Number,default:0},turnTimerRemainingSec:{type:Number,default:0},scorecardGridStyle:{type:Object,required:!0},scorecardRowGridStyle:{type:Object,required:!0},hitsFor:{type:Function,required:!0},segClosedByAll:{type:Function,required:!0},myHitsFor:{type:Function,required:!0},dartLabel:{type:Function,required:!0},dartValue:{type:Function,required:!0},formatTurnClock:{type:Function,required:!0},addCricketDart:{type:Function,required:!0},removeDart:{type:Function,required:!0},submitThrow:{type:Function,required:!0},undo:{type:Function,required:!0},exitGameSaving:{type:Function,required:!0},onShowAbandon:{type:Function,required:!0}},setup(t){const g=t,w=Xt(),y=L=>w.t(L),c=f(()=>g.layoutKind==="portrait"),k=f(()=>g.layoutKind==="square"),b=f(()=>g.layoutKind==="landscape"),n=f(()=>c.value||b.value),x=f(()=>c.value?430:k.value?800:1280),h=f(()=>c.value?932:k.value?800:720),N=f(()=>{const L=Math.max(1,g.layoutWidth||1),d=Math.max(1,g.layoutHeight||1);return Math.min(L/x.value,d/h.value)}),o=f(()=>{const L=N.value;return b.value?{width:"100%",height:"100%",flex:"1 1 0%",minWidth:0,minHeight:0}:{width:`${x.value*L}px`,height:`${h.value*L}px`,flexShrink:"0"}}),v=f(()=>{if(!b.value)return{x:0,y:0};const L=Math.max(1,g.layoutWidth||1),d=Math.max(1,g.layoutHeight||1),V=N.value;return{x:Math.max(0,Math.round((L-x.value*V)/2)),y:Math.max(0,Math.round((d-h.value*V)/2))}}),U=f(()=>({width:`${x.value}px`,height:`${h.value}px`,transform:`translate(${v.value.x}px, ${v.value.y}px) scale(${N.value})`,transformOrigin:"top left"})),S=f(()=>c.value?48:k.value?46:48),W=f(()=>c.value?"100%":k.value?"268px":"320px"),I=f(()=>c.value?"80px":k.value?"120px":"180px"),R=f(()=>{var V;if(!b.value)return 0;const L=Math.max(1,((V=g.cricketSdtSegments)==null?void 0:V.length)||1);return(h.value-S.value-el-sl-al)/L}),F=f(()=>b.value?Math.max(20,Math.min(56,Math.round(R.value*.54))):44);function p(L){var d,V;return Number(L)===Number((V=(d=g.state)==null?void 0:d.current_player)==null?void 0:V.id)}function O(L){return L===25?"25":String(L)}return(L,d)=>{var V,st,pt,lt,ft,E;return r(),i("div",{class:"flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#040609]","data-cricket-canvas":t.layoutKind},[e("div",{class:A(["flex min-h-0 min-w-0 flex-1 overflow-hidden",b.value?"items-stretch justify-stretch":"items-center justify-center"])},[e("div",{class:A(["relative overflow-hidden rounded-sm shadow-2xl shadow-black/40",b.value?"flex-1 min-h-0 min-w-0":"shrink-0"]),style:j(o.value)},[e("div",{class:"absolute left-0 top-0 flex flex-col overflow-hidden bg-[#0b0e14] font-sans text-[#e8eaf0]",style:j(U.value)},[e("div",{class:"flex shrink-0 items-center gap-2 border-b border-[#1e2738] bg-[#0c1018]",style:j({height:S.value+"px",padding:c.value?"0 14px":"0 16px",gap:c.value?"10px":"12px"})},[e("div",Ks,[e("div",{class:"flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f5a623] to-[#f5c842]",style:j({width:c.value?"24px":"26px",height:c.value?"24px":"26px"})},[(r(),i("svg",{class:"text-[#0b0e14]",width:c.value?13:14,height:c.value?13:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round"},[...d[2]||(d[2]=[e("circle",{cx:"12",cy:"12",r:"10"},null,-1),e("circle",{cx:"12",cy:"12",r:"6"},null,-1),e("circle",{cx:"12",cy:"12",r:"2"},null,-1)])],8,Xs))],4),n.value?$("",!0):(r(),i("span",Js,"traindart"))]),n.value?$("",!0):(r(),i("div",_s)),d[7]||(d[7]=e("span",{class:"min-w-0 flex-1 truncate text-[13px] font-bold"},"Cricket",-1)),e("div",Qs,[e("div",{class:A(["rounded-md border border-[#1e2738] bg-[#131720] text-[10px] font-semibold text-[#7b8ba8]",c.value?"px-2 py-0.5":"px-2.5 py-0.5"])},[K(m(c.value?"L":"Leg"),1),e("span",Ys,m(t.state.current_leg),1),K("/"+m(t.legsConfigTotal),1)],2),t.setsConfigTotal>1?(r(),i("div",{key:0,class:A(["rounded-md border border-[#1e2738] bg-[#131720] text-[10px] font-semibold text-[#7b8ba8]",c.value?"px-2 py-0.5":"px-2.5 py-0.5"])},[K(m(c.value?"S":"Set"),1),e("span",Zs,m(t.state.current_set),1),K("/"+m(t.setsConfigTotal),1)],2)):$("",!0)]),e("div",ta,[n.value?$("",!0):(r(),i("span",{key:0,class:"hidden max-w-[8rem] truncate font-mono text-[9px] text-[#3a4a63] sm:inline",title:t.layoutKind+" · "+t.layoutWidth+"×"+t.layoutHeight},m(t.state.room_code),9,ea)),n.value?$("",!0):(r(),i("div",sa,[e("div",aa,[Y(tt(gt),{hits:1,closed:!1,size:"board-sm"}),d[3]||(d[3]=e("span",{class:"text-[9px] text-[#7b8ba8]"},"1×",-1))]),e("div",na,[Y(tt(gt),{hits:2,closed:!1,size:"board-sm"}),d[4]||(d[4]=e("span",{class:"text-[9px] text-[#7b8ba8]"},"2×",-1))]),e("div",la,[Y(tt(gt),{hits:3,closed:!1,size:"board-sm"}),d[5]||(d[5]=e("span",{class:"text-[9px] text-[#7b8ba8]"},"slēgts",-1))])])),d[6]||(d[6]=e("div",{class:"h-4 w-px shrink-0 bg-[#1e2738]"},null,-1)),(t.isMatchActive||t.isSuspended)&&((V=t.auth)!=null&&V.user)?(r(),i("button",{key:2,type:"button",class:A(["shrink-0 rounded-md border border-[#252d3d] bg-transparent text-[11px] font-semibold text-[#7b8ba8] hover:bg-[#131720]",c.value?"px-2.5 py-1":"px-3 py-1"]),onClick:d[0]||(d[0]=(...a)=>t.exitGameSaving&&t.exitGameSaving(...a))},m(y("game.exitSave")),3)):$("",!0),t.isMatchActive&&((st=t.auth)!=null&&st.user)?(r(),i("button",{key:3,type:"button",class:A(["shrink-0 rounded-md border border-[#3a1515] bg-[#2a1010] text-[11px] font-semibold text-[#ff5252]",c.value?"px-2.5 py-1":"px-3 py-1"]),onClick:d[1]||(d[1]=(...a)=>t.onShowAbandon&&t.onShowAbandon(...a))}," Pārtraukt ",2)):$("",!0)])],4),c.value?(r(),i(P,{key:0},[e("div",ra,[(r(!0),i(P,null,D(t.players,a=>{var z;return r(),i("div",{key:"pc-"+a.id,class:A(["relative min-w-0 flex-1 overflow-hidden rounded-[12px] border px-3.5 py-3",p(a.id)?"border-[#f5a62345] bg-[#1b2232]":"border-[#1e2738] bg-[#131720]"])},[p(a.id)?(r(),i("div",ia)):$("",!0),e("div",oa,[p(a.id)?(r(),i("span",da)):$("",!0),e("span",{class:A(["truncate text-[14px] font-bold",p(a.id)?"text-[#f5a623]":"text-[#8ea0bf]"])},m(a.name),3)]),t.isMatchActive&&p(a.id)&&t.turnTimerRowVisible?(r(),i("div",ca,[e("div",ua,[e("div",{class:"h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear",style:j({width:t.turnTimerProgress+"%"})},null,4)]),e("span",ma,m(t.formatTurnClock(t.turnTimerRemainingSec)),1)])):$("",!0),e("div",ba,m(((z=a.cricket)==null?void 0:z.points)??0),1),e("div",{class:"mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]",title:y("game.cricketAvgHint")},[e("span",xa,m(y("game.cricketAvgShort")),1),e("span",pa,m(a.avg_pts??"—"),1)],8,fa),e("div",ga,[d[8]||(d[8]=K(" S:",-1)),e("span",ha,m(a.sets_won??0),1),d[9]||(d[9]=K(" L:",-1)),e("span",va,m(a.legs_won??0),1)])],2)}),128))]),e("div",ya,[e("div",ka,[e("div",wa,[e("div",Ta,m(((lt=(pt=t.leftPlayers[0])==null?void 0:pt.name)==null?void 0:lt.slice(0,8))||"—"),1),d[10]||(d[10]=e("div",{class:"w-20 shrink-0 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]"},"LAUKS",-1)),e("div",Ca,m(((E=(ft=t.rightPlayers[0])==null?void 0:ft.name)==null?void 0:E.slice(0,8))||"—"),1)]),(r(!0),i(P,null,D(t.cricketSdtSegments,(a,z)=>{var _,ht;return r(),i("div",{key:"pr-"+a,class:A(["flex min-h-0 flex-1 basis-0 items-center border-b border-[#0d1016] transition-colors",[t.segClosedByAll(a)?"bg-[#060810]/60":z%2!==0?"bg-[#060910]/35":""]])},[e("div",Sa,[Y(tt(bt),{hits:t.hitsFor((_=t.leftPlayers[0])==null?void 0:_.id,a),dimmed:t.segClosedByAll(a),size:36},null,8,["hits","dimmed"])]),e("div",Aa,[e("div",{class:A(["flex flex-col items-center justify-center rounded-lg border transition-all",t.segClosedByAll(a)?"border-[#151b26] bg-[#0c1016] opacity-35":a===25?"border-[#ff525328] bg-[#1c0808]":"border-[#252d3d] bg-[#1a2030]"]),style:{width:"50px",height:"68%","max-height":"54px","min-height":"28px"}},[e("span",{class:A(["font-extrabold leading-none tracking-tight",[t.segClosedByAll(a)?"text-[#3a4a63] line-through decoration-[#1e2738]":a===25?"text-[#ff5252]":"text-[#f5a623]",a>=20?"text-[15px]":"text-[14px]"]])},m(O(a)),3),a===25&&!t.segClosedByAll(a)?(r(),i("span",Ba,"BULL")):$("",!0)],2)]),e("div",Na,[Y(tt(bt),{hits:t.hitsFor((ht=t.rightPlayers[0])==null?void 0:ht.id,a),dimmed:t.segClosedByAll(a),size:36},null,8,["hits","dimmed"])])],2)}),128))])]),e("div",{class:"flex shrink-0 flex-col overflow-hidden border-t border-[#1e2738] bg-[#0c1018] px-2 pb-3 pt-2",style:j({height:Ot+"px",minHeight:Ot+"px"})},[e("div",Ma,[Y(qt,{density:"compact",state:t.state,"dart-input":t.dartInput,submitting:t.submitting,"waiting-for-turn-ui":t.waitingForTurnUi,"cricket-pad-split":t.cricketPadSplit,"cricket-sdt-has-bull":t.cricketSdtHasBull,"seg-closed-by-all":t.segClosedByAll,"my-hits-for":t.myHitsFor,"add-cricket-dart":t.addCricketDart,"remove-dart":t.removeDart,"submit-throw":t.submitThrow,undo:t.undo,"dart-label":t.dartLabel,"dart-value":t.dartValue},null,8,["state","dart-input","submitting","waiting-for-turn-ui","cricket-pad-split","cricket-sdt-has-bull","seg-closed-by-all","my-hits-for","add-cricket-dart","remove-dart","submit-throw","undo","dart-label","dart-value"])])],4)],64)):(r(),i("div",ja,[e("div",Ra,[b.value?(r(),i(P,{key:0},[e("div",Ia,[e("div",La,[(r(!0),i(P,null,D(t.leftPlayers,a=>{var z;return r(),i("div",{key:"lc2-"+a.id,class:A(["relative flex items-center gap-[14px] overflow-hidden rounded-[10px] border px-[18px] py-[11px] last:mb-0",p(a.id)?"bg-[#1b2232]":"bg-[#131720]"]),style:j({borderWidth:"1.5px",borderColor:p(a.id)?"#f5a62348":"#1e2738"})},[p(a.id)?(r(),i("div",za)):$("",!0),e("div",Pa,[e("div",$a,[p(a.id)?(r(),i("div",Ha)):$("",!0),e("div",{class:A(["truncate text-[14px] font-semibold",p(a.id)?"text-[#f5a623]":"text-[#7b8ba8]"])},m(a.name),3)]),t.isMatchActive&&p(a.id)&&t.turnTimerRowVisible?(r(),i("div",Da,[e("div",Fa,[e("div",{class:"h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear",style:j({width:t.turnTimerProgress+"%"})},null,4)]),e("span",Ea,m(t.formatTurnClock(t.turnTimerRemainingSec)),1)])):$("",!0),e("div",Ga,[e("span",Ua,m(((z=a.cricket)==null?void 0:z.points)??0),1)]),e("div",{class:"mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]",title:y("game.cricketAvgHint")},[e("span",Va,m(y("game.cricketAvgShort")),1),e("span",qa,m(a.avg_pts??"—"),1)],8,Wa)]),e("div",Oa,[e("div",Ka,[e("span",Xa,m(a.sets_won??0),1),d[11]||(d[11]=K(" sets  ",-1)),e("span",Ja,m(a.legs_won??0),1),d[12]||(d[12]=K(" legs ",-1))]),e("div",{class:A(["rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.06em]",p(a.id)?"border border-[#f5a62335] bg-[#f5a62318] text-[#f5a623]":"border border-[#1e2738] bg-[#0b0e14] text-[#3a4a63]"])},m(p(a.id)?"● AKTĪVS":"○ GAIDA"),3)])],6)}),128))]),e("div",{class:"flex shrink-0 items-center justify-center",style:j({width:I.value})},[...d[13]||(d[13]=[e("span",{class:"text-[9px] font-bold uppercase tracking-[0.14em] text-[#2e3a50]"},"LAUKS",-1)])],4),e("div",_a,[(r(!0),i(P,null,D(t.rightPlayers,a=>{var z;return r(),i("div",{key:"rc2-"+a.id,class:A(["relative flex items-center gap-[14px] overflow-hidden rounded-[10px] border px-[18px] py-[11px] last:mb-0",p(a.id)?"bg-[#1b2232]":"bg-[#131720]"]),style:j({borderWidth:"1.5px",borderColor:p(a.id)?"#f5a62348":"#1e2738"})},[p(a.id)?(r(),i("div",Qa)):$("",!0),e("div",Ya,[e("div",Za,[p(a.id)?(r(),i("div",tn)):$("",!0),e("div",{class:A(["truncate text-[14px] font-semibold",p(a.id)?"text-[#f5a623]":"text-[#7b8ba8]"])},m(a.name),3)]),t.isMatchActive&&p(a.id)&&t.turnTimerRowVisible?(r(),i("div",en,[e("div",sn,[e("div",{class:"h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear",style:j({width:t.turnTimerProgress+"%"})},null,4)]),e("span",an,m(t.formatTurnClock(t.turnTimerRemainingSec)),1)])):$("",!0),e("div",nn,[e("span",ln,m(((z=a.cricket)==null?void 0:z.points)??0),1)]),e("div",{class:"mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]",title:y("game.cricketAvgHint")},[e("span",on,m(y("game.cricketAvgShort")),1),e("span",dn,m(a.avg_pts??"—"),1)],8,rn)]),e("div",cn,[e("div",un,[e("span",mn,m(a.sets_won??0),1),d[14]||(d[14]=K(" sets  ",-1)),e("span",bn,m(a.legs_won??0),1),d[15]||(d[15]=K(" legs ",-1))]),e("div",{class:A(["rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.06em]",p(a.id)?"border border-[#f5a62335] bg-[#f5a62318] text-[#f5a623]":"border border-[#1e2738] bg-[#0b0e14] text-[#3a4a63]"])},m(p(a.id)?"● AKTĪVS":"○ GAIDA"),3)])],6)}),128))])]),e("div",fn,[d[16]||(d[16]=e("div",{class:"flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#252d3d]"},"trāpījumi",-1)),e("div",{class:"shrink-0",style:j({width:I.value})},null,4),d[17]||(d[17]=e("div",{class:"flex-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#252d3d]"},"trāpījumi",-1))]),e("div",xn,[e("div",pn,[(r(!0),i(P,null,D(t.cricketSdtSegments,a=>{var z;return r(),i("div",{key:"lrow-"+a,class:"flex items-center justify-center border-b border-[#131720] last:border-b-0",style:j({height:R.value+"px"})},[Y(tt(bt),{hits:t.hitsFor((z=t.leftPlayers[0])==null?void 0:z.id,a),dimmed:t.segClosedByAll(a),size:F.value},null,8,["hits","dimmed","size"])],4)}),128))]),e("div",{class:"flex shrink-0 flex-col overflow-hidden",style:j({width:I.value})},[(r(!0),i(P,null,D(t.cricketSdtSegments,a=>(r(),i("div",{key:"crow-"+a,class:"flex items-center justify-center border-b border-[#0f1218] last:border-b-0",style:j({height:R.value+"px"})},[e("div",{class:A(["flex flex-col items-center justify-center rounded-lg border",t.segClosedByAll(a)?"opacity-45":""]),style:j({width:"78px",height:Math.round(R.value*.7)+"px",background:t.segClosedByAll(a)?"#0e1118":a===25?"#200a0a":"#1a2030",borderColor:t.segClosedByAll(a)?"#151b26":a===25?"#ff525235":"#252d3d"})},[e("div",{class:"font-extrabold leading-none",style:j({fontSize:"22px",letterSpacing:"-0.5px",color:t.segClosedByAll(a)?"#3a4a63":a===25?"#ff5252":"#f5a623"})},m(O(a)),5),a===25?(r(),i("div",{key:0,class:"mt-[1px] text-[8px] font-bold uppercase tracking-[0.08em]",style:j({color:t.segClosedByAll(a)?"#3a4a63":"#ff525288"})}," BULL ",4)):$("",!0)],6)],4))),128))],4),e("div",gn,[(r(!0),i(P,null,D(t.cricketSdtSegments,a=>{var z;return r(),i("div",{key:"rrow-"+a,class:"flex items-center justify-center border-b border-[#131720] last:border-b-0",style:j({height:R.value+"px"})},[Y(tt(bt),{hits:t.hitsFor((z=t.rightPlayers[0])==null?void 0:z.id,a),dimmed:t.segClosedByAll(a),size:F.value},null,8,["hits","dimmed","size"])],4)}),128))])])],64)):(r(),i(P,{key:1},[e("div",{class:A(["flex shrink-0 gap-0 px-2 pt-2",k.value?"px-2":"px-2.5"])},[e("div",hn,[(r(!0),i(P,null,D(t.leftPlayers,a=>{var z;return r(),i("div",{key:"lc-"+a.id,class:A(["relative mb-1 overflow-hidden rounded-[10px] border px-4 py-3 last:mb-0",p(a.id)?"border-[#f5a62348] bg-[#1b2232]":"border-[#1e2738] bg-[#131720]"])},[p(a.id)?(r(),i("div",vn)):$("",!0),e("div",yn,[p(a.id)?(r(),i("span",kn)):$("",!0),e("span",{class:A(["truncate text-sm font-semibold",p(a.id)?"text-[#f5a623]":"text-[#7b8ba8]"])},m(a.name),3)]),e("div",wn,m(((z=a.cricket)==null?void 0:z.points)??0),1),e("div",Tn,[e("div",{class:"flex flex-col gap-0.5",title:y("game.cricketAvgHint")},[e("span",Sn,m(y("game.cricketAvgShort")),1),e("span",An,m(a.avg_pts??"—"),1)],8,Cn),e("div",Bn,[e("div",Nn,[(r(!0),i(P,null,D(t.legsToWin,_=>(r(),i("div",{key:_,class:A(["h-1.5 w-1.5 rounded-full border transition-all",_<=(a.legs_won||0)?"border-amber-400 bg-amber-400":"border-[#1e3050]"])},null,2))),128))]),e("div",Mn,[e("span",jn,m(a.sets_won??0),1),d[18]||(d[18]=K(" S ",-1)),e("span",Rn,m(a.legs_won??0),1),d[19]||(d[19]=K(" L ",-1))])])])],2)}),128))]),e("div",{class:"flex shrink-0 items-center justify-center text-[9px] font-bold uppercase tracking-widest text-[#2e3a50]",style:j({width:I.value})}," LAUKS ",4),e("div",In,[(r(!0),i(P,null,D(t.rightPlayers,a=>{var z;return r(),i("div",{key:"rc-"+a.id,class:A(["relative mb-1 overflow-hidden rounded-[10px] border px-4 py-3 last:mb-0",p(a.id)?"border-[#f5a62348] bg-[#1b2232]":"border-[#1e2738] bg-[#131720]"])},[p(a.id)?(r(),i("div",Ln)):$("",!0),e("div",zn,[p(a.id)?(r(),i("span",Pn)):$("",!0),e("span",{class:A(["truncate text-sm font-semibold",p(a.id)?"text-[#f5a623]":"text-[#7b8ba8]"])},m(a.name),3)]),e("div",$n,m(((z=a.cricket)==null?void 0:z.points)??0),1),e("div",Hn,[e("div",{class:"flex flex-col gap-0.5",title:y("game.cricketAvgHint")},[e("span",Fn,m(y("game.cricketAvgShort")),1),e("span",En,m(a.avg_pts??"—"),1)],8,Dn),e("div",Gn,[e("div",Un,[(r(!0),i(P,null,D(t.legsToWin,_=>(r(),i("div",{key:_,class:A(["h-1.5 w-1.5 rounded-full border transition-all",_<=(a.legs_won||0)?"border-amber-400 bg-amber-400":"border-[#1e3050]"])},null,2))),128))]),e("div",Wn,[e("span",Vn,m(a.sets_won??0),1),d[20]||(d[20]=K(" S ",-1)),e("span",qn,m(a.legs_won??0),1),d[21]||(d[21]=K(" L ",-1))])])])],2)}),128))])],2),e("div",On,[d[22]||(d[22]=e("div",{class:"flex-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#1e2738]"},"trāpījumi",-1)),e("div",{class:"shrink-0",style:j({width:I.value})},null,4),d[23]||(d[23]=e("div",{class:"flex-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#1e2738]"},"trāpījumi",-1))]),e("div",Kn,[e("div",Xn,[e("div",{class:"shrink-0 border-b border-[#162540] bg-[#0a1120]/60 py-2",style:j(t.scorecardGridStyle)},[(r(!0),i(P,null,D(t.leftPlayers,a=>(r(),i("div",{key:"lh-"+a.id,class:A(["truncate px-1 text-center text-xs font-bold",p(a.id)?"text-amber-400":"text-slate-500"])},m(a.name),3))),128)),d[24]||(d[24]=e("div",{class:"text-center text-[10px] font-black uppercase tracking-widest text-slate-500"},"Lauks",-1)),(r(!0),i(P,null,D(t.rightPlayers,a=>(r(),i("div",{key:"rh-"+a.id,class:A(["truncate px-1 text-center text-xs font-bold",p(a.id)?"text-amber-400":"text-slate-500"])},m(a.name),3))),128))],4),e("div",Jn,[(r(!0),i(P,null,D(t.cricketSdtSegments,(a,z)=>(r(),i("div",{key:"sr-"+a,class:A(["min-h-0 min-w-0 flex-1 basis-0 border-b border-[#162540]/40 transition-all last:border-b-0",[z%2===0?"bg-[#0a1120]/25":"",t.segClosedByAll(a)?"opacity-25":""]]),style:j(t.scorecardRowGridStyle)},[(r(!0),i(P,null,D(t.leftPlayers,_=>(r(),i("div",{key:"lm-"+_.id+"-"+a,class:"flex min-h-0 min-w-0 items-center justify-center border-r border-[#162540]/30 p-1"},[Y(tt(gt),{hits:t.hitsFor(_.id,a),closed:t.segClosedByAll(a),size:"board"},null,8,["hits","closed"])]))),128)),e("div",{class:A(["mx-0.5 my-0.5 flex min-h-0 min-w-0 items-center justify-center rounded-lg px-1 shadow-inner",t.segClosedByAll(a)?"border border-[#1e3050] bg-[#0a1120]/95":"border border-rose-900/40 bg-[#1a0a0f]"])},[e("div",_n,[e("span",{class:A(["select-none font-black tabular-nums",[k.value?"text-[20px]":"text-[22px]",t.segClosedByAll(a)?"text-slate-500 line-through":"text-rose-300/90"]])},m(O(a)),3),a===25&&!t.segClosedByAll(a)?(r(),i("span",Qn,"bull")):$("",!0)])],2),(r(!0),i(P,null,D(t.rightPlayers,_=>(r(),i("div",{key:"rm-"+_.id+"-"+a,class:"flex min-h-0 min-w-0 items-center justify-center border-l border-[#162540]/30 p-1"},[Y(tt(gt),{hits:t.hitsFor(_.id,a),closed:t.segClosedByAll(a),size:"board"},null,8,["hits","closed"])]))),128))],6))),128))]),e("div",Yn,[d[26]||(d[26]=e("span",null,[e("span",{class:"font-mono font-black text-slate-400"},"0"),K(" nav")],-1)),d[27]||(d[27]=e("span",null,[e("span",{class:"font-mono font-black text-sky-400/90"},"1"),K(" viens")],-1)),d[28]||(d[28]=e("span",null,[e("span",{class:"font-mono font-black text-amber-400/90"},"2"),K(" divi")],-1)),e("span",Zn,[e("span",tl,[Y(tt(St),{boosted:!1})]),d[25]||(d[25]=K(" slēgts ",-1))])])])])],64))]),e("div",{class:"flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-[#1e2738] bg-[#0c1018]",style:j({width:W.value,padding:k.value?"12px 10px":"14px 12px"})},[Y(qt,{density:"default",state:t.state,"dart-input":t.dartInput,submitting:t.submitting,"waiting-for-turn-ui":t.waitingForTurnUi,"cricket-pad-split":t.cricketPadSplit,"cricket-sdt-has-bull":t.cricketSdtHasBull,"seg-closed-by-all":t.segClosedByAll,"my-hits-for":t.myHitsFor,"add-cricket-dart":t.addCricketDart,"remove-dart":t.removeDart,"submit-throw":t.submitThrow,undo:t.undo,"dart-label":t.dartLabel,"dart-value":t.dartValue},null,8,["state","dart-input","submitting","waiting-for-turn-ui","cricket-pad-split","cricket-sdt-has-bull","seg-closed-by-all","my-hits-for","add-cricket-dart","remove-dart","submit-throw","undo","dart-label","dart-value"])],4)]))],4)],6)],2)],8,Os)}}},et=3;function ll(t){const g=Number(t);return g===25?"seg_bull":`seg_${g}`}function rl(t,g){const w=t==null?void 0:t.cricket;if(!w)return 0;const y=ll(g);return Math.max(0,Math.min(et,Number(w[y]??0)))}function Jt(t,g){const w=(g||[]).map(Number),y=(t||[]).map(k=>Number(k.id)),c={};for(const k of y){c[k]={};const b=(t||[]).find(n=>Number(n.id)===k);for(const n of w)c[k][n]=b?rl(b,n):0}return{hits:c,playerIds:y}}function _t(t,g,w){var k;const y=(w||[]).map(Number),c={};for(const b of g){c[b]={};for(const n of y)c[b][n]=((k=t==null?void 0:t[b])==null?void 0:k[n])??0}return c}function At(t,g,w){const y=Number(w);return(g||[]).length>0&&g.every(c=>{var k;return(((k=t==null?void 0:t[c])==null?void 0:k[y])??0)>=et})}function Qt(t,g,w,y){var b;const c=Number(y),k=Number(w);for(const n of g||[])if(Number(n)!==k&&(((b=t==null?void 0:t[n])==null?void 0:b[c])??0)<et)return!0;return!1}function Yt(t,g,w,y,c,k){var o;const b=(w||[]).map(Number),n=Number(c),x=Number(k),h=Number(y);if(x<=0||n<=0||!b.includes(n)||At(t,g,n))return 0;const N=((o=t==null?void 0:t[h])==null?void 0:o[n])??0;return N>=et?0:Math.min(x,et-N)}function Zt(t,g,w,y,c){var v;const k=(c||[]).map(Number),b=Number(w),n=Number(y),x=Number(g);if(n<=0||b<=0||!k.includes(b))return;const h=((v=t==null?void 0:t[x])==null?void 0:v[b])??0;if(h>=et)return;const N=et-h,o=Math.min(n,N);t[x][b]=h+o}function il(t,g,w,y){const c=(g||[]).map(Number),{hits:k,playerIds:b}=Jt(t||[],c),n=_t(k,b,c),x=Number(w);for(const h of y||[])Zt(n,x,h.segment,h.multiplier,c);return{H:n,playerIds:b,segs:c,tid:x}}function ol({hits:t,playerIds:g,segs:w,throwerId:y,segment:c,multiplier:k}){var p;const b=Number(c??0),n=Number(k??0),x=Number(y),h=b>0?((p=t==null?void 0:t[x])==null?void 0:p[b])??0:0,N=Math.max(0,et-h),o=b>0?At(t,g,b):!1,v=Yt(t,g,w,x,b,n),U=b>0?Qt(t,g,x,b):!1,S=h>=et&&U,W=Math.max(0,n-v),R=h<et&&h+v>=et&&W>0&&U;let F=0;return o||b<=0||n<=0||!(w||[]).map(Number).includes(b)?F=0:S?F=n:F=v+(R?W:0),{myHitsBefore:h,needToClose:N,allClosedBefore:o,effMarks:v,scoredEligible:S,overflowScoredEligible:R,validAmount:F}}function dl(t,g,w,y){var S;const c=(g||[]).map(Number),{hits:k,playerIds:b}=Jt(w||[],c),n=_t(k,b,c),x=Number(y),h=[],N=[],o=[];let v=0,U=0;for(const W of t||[]){const I=Number(W.segment??0),R=Number(W.multiplier??0);let F=0,p=!1,O=0;if(I>0&&R>0&&c.includes(I)){const L=((S=n==null?void 0:n[x])==null?void 0:S[I])??0,d=At(n,b,I),V=Qt(n,b,x,I);if(!d)if(F=Yt(n,b,c,x,I,R),L>=et&&V)p=!0,O=R;else{const st=Math.max(0,R-F),lt=L<et&&L+F>=et&&st>0&&V;O=F+(lt?st:0)}Zt(n,x,I,R,c)}h.push(F),o.push(p),N.push(O),v+=F,U+=O}return{totalMarks:v,totalValid:U,perDartMarks:h,perDartValid:N,perDartScored:o}}function cl(t,g,w,y){const c=(g||[]).map(Number),{perDartValid:k}=dl(t,c,w,y);let b=0,n=!1;const x={},h=[];let N=0;for(let R=0;R<(t||[]).length;R++){const F=t[R],p=Number(F.segment??0),O=Number(F.multiplier??0),L=Number(k[R]??0),d=L>0;!p||!O||!c.includes(p)||(p===25&&(b+=L,d&&(n=!0)),p!==25&&d&&(N+=L),O===3&&p!==25&&d&&h.push(p),d&&(x[p]||(x[p]=new Set),x[p].add(O)))}const o=h.length===3&&new Set(h).size===1,v=o?h[0]:null,U=h.length===3&&new Set(h).size===3,S=h.length===3&&new Set(h).size===2,W=Object.keys(x).some(R=>{const F=Number(R);if(F===25)return!1;const p=x[F];return!!(p&&p.has(1)&&p.has(2)&&p.has(3))}),I=(R,F,p,O,L,d,V={})=>({tier:R,emoji:F,title:p,sub:O,color:L,glow:d,shake:!1,fullScreen:!1,duration:2200,...V});return o?I("holyGrail","✨","Holy Grail",`3× triple vienā laukā · T${v}`,"#fde68a","#f59e0b",{shake:!0,fullScreen:!0,duration:4200}):U?I("whitehorse","🐴","White Horse!","3 triples · 3 dažādi lauki","#e2e8f0","#94a3b8",{fullScreen:!0,duration:3500}):S?I("tripleTriples","💥","9 trāpījumi","2× triple vienā laukā + 1× triple citā","#fcd34d","#f59e0b",{shake:!0,duration:2800}):W?I("shanghai","⛩️","Shanghai!","Single · Double · Triple (vienā laukā)","#fca5a5","#ef4444",{duration:2800}):N>=8?I("insaneMark","🔥","Insane Mark!","8 trāpījumi","#fbbf24","#d97706",{shake:!0,duration:3200}):N>=7?I("ultraMark","💥","Ultra Mark!","7 trāpījumi","#f9a8d4","#ec4899",{shake:!0,duration:2900}):b>=6&&n?I("rodeo","🤠","Rodeo!","3× Double Bull","#fcd34d","#d97706",{duration:3e3}):N>=6?I("megaMark","⚡","Mega Mark!","6 trāpījumi","#fde047","#eab308",{shake:!0,duration:2700}):N>=5?I("superMark","🎇","Super Mark!","5 trāpījumi","#fb923c","#ea580c",{duration:2300}):b>=3&&n?I("bulls3","🎯",`${b} Bull!`,`Bull trāpījumi: ${b}`,"#f87171","#dc2626",{duration:2200}):N>=4?I("bigMark","⬡","Big Mark!","4 trāpījumi","#93c5fd","#3b82f6",{duration:1800}):null}const hl={props:["matchId"],components:{MatchReport:Qe,CricketMarkCell:gt,CricketClosedCheck:St,CricketGameAdaptiveLayout:nl},setup(t){qe("body--game-shell");const{layoutKind:g,layoutLabel:w,layoutWidth:y,layoutHeight:c,layoutAspect:k,syncGameScreenLayout:b}=_e(),n=Oe(),x=Ee(),h=Xt(),N=s=>h.t(s),o=Ge(),v=Ve({darts:[]}),U=q(!1),S=q(null),W=q(null),I=q(null);let R=null;const F=q(1),p=q(!1),O=q(!1),L=q(!0),d=q(null),V=q(null);let st=null;const pt=q(Date.now()),lt=q(!1);let ft=null;const E=f(()=>n.state),a=f(()=>n.isMyTurn),z=f(()=>n.isMatchActive),_=f(()=>n.isSuspended),ht=f(()=>z.value&&!a.value),te=f(()=>{var s,l;return Math.max(1,Number((l=(s=E.value)==null?void 0:s.legs_config)==null?void 0:l.legs)||1)}),ee=f(()=>{var s,l;return Math.max(1,Number((l=(s=E.value)==null?void 0:s.legs_config)==null?void 0:l.sets)||1)}),Bt=f(()=>n.undoAvailable),se=f(()=>n.gameType==="x01"),Nt=f(()=>n.gameType==="cricket"),rt=f(()=>n.players),ae=f(()=>n.isFinished),ne=f(()=>{var s,l;return Math.ceil((((l=(s=E.value)==null?void 0:s.legs_config)==null?void 0:l.legs)??1)/2)}),xt=f(()=>{var s;return((s=E.value)==null?void 0:s.turn_timer)??null}),le=f(()=>{var s;return!!((s=E.value)!=null&&s.use_turn_timer)}),vt=f(()=>{const s=xt.value;return!!(s!=null&&s.deadline_at||s!=null&&s.pending)}),Mt=f(()=>{const s=xt.value;if(!(s!=null&&s.deadline_at))return 0;const l=new Date(s.deadline_at).getTime();return Math.max(0,Math.ceil((l-pt.value)/1e3))}),re=f(()=>{const s=xt.value;if(!(s!=null&&s.deadline_at)||s.pending)return 0;const l=Math.max(1,s.window_seconds||300),u=Mt.value;return Math.min(100,Math.max(0,u/l*100))}),ie=f(()=>{if(!vt.value||!z.value)return!1;const s=xt.value;return!!(s!=null&&s.deadline_at&&!s.pending)}),oe=f(()=>{var u,T,C,M;if(!vt.value||!z.value||!((u=xt.value)!=null&&u.pending))return!1;const s=(T=x.user)==null?void 0:T.id,l=(M=(C=E.value)==null?void 0:C.current_player)==null?void 0:M.user_id;return s==null||l==null?!1:Number(l)===Number(s)}),jt=f(()=>{var u,T,C,M;if(!vt.value||!z.value||!((u=xt.value)!=null&&u.pending))return!1;const s=(T=x.user)==null?void 0:T.id,l=(M=(C=E.value)==null?void 0:C.current_player)==null?void 0:M.user_id;return s==null||l==null?!1:Number(l)!==Number(s)});function de(s){const l=Math.max(0,Number(s)||0),u=Math.floor(l/60),T=l%60;return u+":"+String(T).padStart(2,"0")}async function ce(){var s,l,u,T,C;if(!lt.value){lt.value=!0;try{await n.turnTimeoutGrantExtra()}catch(M){const B=((l=(s=M.response)==null?void 0:s.data)==null?void 0:l.error)||((T=(u=M.response)==null?void 0:u.data)==null?void 0:T.message)||"Kļūda.";(C=window._dartToast)==null||C.call(window,B,"error")}finally{lt.value=!1}}}async function ue(){var s,l,u,T,C;if(!lt.value){lt.value=!0;try{await n.turnTimeoutEndNoStats()}catch(M){const B=((l=(s=M.response)==null?void 0:s.data)==null?void 0:l.error)||((T=(u=M.response)==null?void 0:u.data)==null?void 0:T.message)||"Kļūda.";(C=window._dartToast)==null||C.call(window,B,"error")}finally{lt.value=!1}}}const Rt=f(()=>{var u;const s=(u=E.value)==null?void 0:u.cricket_segments;return(Array.isArray(s)&&s.length?s:[20,19,18,17,16,15,25]).map(T=>Number(T))});function yt(s,l){if(s==null)return 0;const u=Number(s),T=rt.value.find(B=>Number(B.id)===u),C=T==null?void 0:T.cricket;if(!C)return 0;const M=Number(l);return M===25?C.seg_bull??0:C["seg_"+M]??0}function me(s){var l,u;return yt((u=(l=E.value)==null?void 0:l.current_player)==null?void 0:u.id,s)}function be(s){const l=Number(s);return rt.value.length>0&&rt.value.every(u=>yt(u.id,l)>=3)}const It=f(()=>{const s=rt.value.length,l=Math.ceil(s/2),u=Math.floor(s/2);return[...Array(l).fill("1fr"),"minmax(3.25rem, 5vw)",...Array(u).fill("1fr")].join(" ")}),fe=f(()=>({display:"grid",gridTemplateColumns:It.value,alignItems:"center"})),xe=f(()=>({display:"grid",gridTemplateColumns:It.value,alignItems:"stretch",minHeight:0})),pe=f(()=>rt.value.slice(0,Math.ceil(rt.value.length/2))),ge=f(()=>rt.value.slice(Math.ceil(rt.value.length/2)));function he(s){const l=(s||[]).map(Number),u=new Set(l),T=[...u].filter(B=>B>=1&&B<=20).sort((B,H)=>B-H),C=[...u].filter(B=>(B<1||B>20)&&B!==25).sort((B,H)=>B-H),M=[...T,...C];return u.has(25)&&M.push(25),M}const kt=f(()=>he(Rt.value)),Lt=f(()=>kt.value.filter(s=>s!==25)),ve=f(()=>kt.value.includes(25)),ye=f(()=>{const s=Lt.value,l=Math.ceil(s.length/2);return{left:s.slice(0,l),right:s.slice(l)}});function ke(s,l){v.darts.length>=3||v.darts.push({segment:s,multiplier:l})}function we(){v.darts.length>=3||v.darts.push({segment:0,multiplier:0})}function Te(s,l){var it,ot,G;if(v.darts.length>=3)return;const u=(ot=(it=E.value)==null?void 0:it.current_player)==null?void 0:ot.id,T=(((G=E.value)==null?void 0:G.cricket_segments)??[20,19,18,17,16,15,25]).map(Number),C=[...rt.value],{H:M,playerIds:B,segs:H,tid:nt}=il(C,T,u,v.darts),ct=ol({hits:M,playerIds:B,segs:H,throwerId:nt,segment:s,multiplier:l});v.darts.push({segment:s,multiplier:l,cricketMeta:ct})}function zt(s){v.darts.splice(s,1)}function Pt(s){return s.segment===0?"Miss":s.segment===25&&s.multiplier===2?"Bull":s.segment===25?"Outer":(s.multiplier===2?"D":s.multiplier===3?"T":"S")+s.segment}function $t(s){return s.segment===0?0:s.segment*s.multiplier}function at(s){return s[Math.floor(Math.random()*s.length)]}function Ht(s,l,u){return s!=null&&l!=null&&(Number(u.current_leg)!==Number(s)||Number(u.current_set)!==Number(l))}function Dt(s){return s>=180?"t180":s>=140?"t140":s>=100?"t100":s>=95?"t95":null}function Ce(s){switch(s){case"t95":return"Pīķa zona";case"t100":return"Labi sit!";case"t140":return"Premium gājiens";case"t180":return"TON 80 · EXCELLENT";default:return""}}function Se(s){const l=Number(s);return!l||l<=0?{coTier:null,title:"",tag:""}:l<=20?{coTier:"co1",title:at(["Aizvērts!","Ieejamā!","Čau, score!","Klusi, bet precīzi"]),tag:at(["Kā ar karoti medu.","Miers ir miers.","Mini finišs, liela sirds."])}:l<=40?{coTier:"co2",title:at(["Slēdzam!","Aizķēries!","Uz mājām!"]),tag:at(["Jau redzams gals.","Vēl tuvāk kāpām.","Pretinieks nervozē."])}:l<=80?{coTier:"co3",title:at(["Labs finišs!","Turpinām kāpt!","Score krīt!"]),tag:at(["Šis sāp pretiniekam.","Kārtīgs gājiens.","Tā turēt!"])}:l<=120?{coTier:"co4",title:at(["Iespaidīgs checkout!","Augstākā līga!","Meistarība!"]),tag:at(["Tu dari to pareizi.","Šķīvis klausa.","Tā ir māksla."])}:l<=169?{coTier:"co5",title:at(["Augstas raudzes finišs!","Reta putna līmenis!","Ko tu dari ar šķīvi?!"]),tag:at(["Šito rāda atkārtojumā.","Kā no grāmatas.","Elite."])}:{coTier:"coTop",title:at(["LEĠENDĀRS!","170 klubs!","Meistarklase!"]),tag:at(["Aplausi. Tu to nopelnīji.","Šādu redz reti.","Respekts."])}}function Ae(s){const l=s==null?void 0:s.kind,u=s==null?void 0:s.checkoutTitle,T=u?"ring-2 ring-emerald-500/30 border-emerald-600/45":"";if(l==="bust")return"border-rose-500/75 bg-gradient-to-br from-rose-950/98 via-[#1a0a0f]/95 to-slate-900/98 shadow-xl shadow-rose-900/40 ring-1 ring-rose-500/30";if(l==="miss")return"border-slate-500/70 bg-slate-900/98 shadow-lg shadow-black/40 ring-1 ring-slate-600/30";if(l==="high"){const C=s.highTier;if(C==="t95")return`border-amber-700/50 bg-gradient-to-br from-slate-900/98 to-[#0f172a]/98 shadow-md ${T}`.trim();if(C==="t100")return`border-amber-400/65 bg-gradient-to-br from-amber-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-lg shadow-amber-900/25 ${T}`.trim();if(C==="t140")return`border-fuchsia-400/55 bg-gradient-to-br from-fuchsia-950/85 via-amber-950/50 to-[#0a1120]/98 shadow-xl shadow-fuchsia-900/30 ${T}`.trim();if(C==="t180")return`border-yellow-300/70 bg-gradient-to-br from-yellow-950/90 via-amber-900/60 to-slate-950/98 shadow-2xl shadow-amber-500/35 ${T}`.trim()}return u?"border-emerald-500/55 bg-gradient-to-br from-emerald-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-xl shadow-emerald-900/25":"border-slate-600 bg-slate-800/95"}function Be(s){const l=[],u=s==null?void 0:s.kind;return u==="bust"?l.push("dt-x01-toast-bust"):u==="miss"?l.push("dt-x01-toast-miss"):u==="high"&&(s.highTier==="t95"?l.push("dt-x01-tier-95"):s.highTier==="t100"?l.push("dt-x01-tier-100"):s.highTier==="t140"?l.push("dt-x01-tier-140"):s.highTier==="t180"&&l.push("dt-x01-tier-180")),s.checkoutTitle&&l.push("dt-x01-co-pop"),l.join(" ")}function Ne(s){return s.kind==="bust"?"text-rose-300":s.kind==="miss"?"text-slate-400":s.highTier==="t95"?"text-amber-200/90 text-[11px] sm:text-xs font-black tracking-[0.18em]":s.highTier==="t100"?"text-amber-200 text-xs sm:text-sm font-black tracking-wide":s.highTier==="t140"?"text-fuchsia-200 text-sm sm:text-base font-black tracking-tight":s.highTier==="t180"?"text-yellow-200 text-base sm:text-lg font-black drop-shadow-[0_0_14px_rgba(250,204,21,0.4)]":s.checkoutTitle&&s.kind==="normal"?"text-emerald-300 text-xs sm:text-sm font-black":"text-slate-200 text-xs font-bold"}const Me=["Legs iekārtots!","Šajā legā — tu!","Kāpes augšā!","Punkts pievienots!","Uzvaras aplis!"];function Ft({winnerName:s,wonSet:l,wonLeg:u},T){setTimeout(()=>{W.value={winnerName:s,wonSet:l,wonLeg:u,line:at(Me)},setTimeout(()=>{W.value=null},5e3)},T)}function je(s,{throwerId:l,prevLeg:u,prevSet:T,prevRemaining:C,data:M}){const B=s.reduce((mt,Tt)=>mt+$t(Tt),0),H=s.map(Pt),nt=Ht(u,T,M),ct=M.players||[],it=l!=null?ct.find(mt=>Number(mt.id)===Number(l)):null,ot=it==null?void 0:it.remaining;let G="normal";B===0?G="miss":!nt&&C!=null&&ot!=null&&Number(C)===Number(ot)?G="bust":Dt(B)&&(G="high");const X=nt&&B>0&&C!=null&&Number(C)===Number(B),Z=X?Se(C):{title:"",tag:""},Q=G==="high"?Dt(B):null,J=Q?Ce(Q):"";let dt="";G==="bust"?dt="BUST":G==="miss"?dt="":J?dt=J:Z.title&&(dt=Z.title);const wt=X&&J&&Z.title?{title:Z.title,tag:Z.tag}:null,De=X&&!J&&Z.tag?Z.tag:null;let ut=2800;(G==="miss"||G==="bust")&&(ut=3500),G==="high"&&(Q==="t95"?ut=3100:Q==="t100"?ut=3900:Q==="t140"?ut=4400:Q==="t180"&&(ut=5400)),Z.title&&(ut=Math.max(ut,4e3)),S.value={labels:H,pts:B,kind:G,highTier:Q,checkoutTitle:X&&Z.title?Z.title:null,topBanner:dt,bannerIsCompact:G==="bust"||G==="miss",checkoutDetail:wt,checkoutFooter:De},setTimeout(()=>{S.value=null},ut);const Wt=M.status==="finished";if((nt||Wt)&&B>0&&G!=="bust"&&G!=="miss"&&l&&!Wt){const mt=ct.find(Tt=>Number(Tt.id)===Number(l));Ft({winnerName:(mt==null?void 0:mt.name)||"—",wonSet:T,wonLeg:u},ut+220)}}Ue(()=>{var s,l;return[(s=E.value)==null?void 0:s.current_set,(l=E.value)==null?void 0:l.current_leg]},()=>{v.darts=[]});async function Et(){var B,H,nt,ct,it,ot,G;if(v.darts.length===0)return;U.value=!0;const s=[...v.darts],l=[...rt.value],u=(H=(B=E.value)==null?void 0:B.current_player)==null?void 0:H.id,T=(nt=E.value)==null?void 0:nt.current_leg,C=(ct=E.value)==null?void 0:ct.current_set,M=u!=null?(it=rt.value.find(X=>Number(X.id)===Number(u)))==null?void 0:it.remaining:null;try{const X=await n.submitThrow(s),Z=Ht(T,C,X);if(!Nt.value)je(s,{throwerId:u,prevLeg:T,prevSet:C,prevRemaining:M,data:X});else{const Q=(((ot=E.value)==null?void 0:ot.cricket_segments)??[20,19,18,17,16,15,25]).map(Number),J=u!=null?cl(s,Q,l,u):null;if(J&&(d.value=J,(J.fullScreen||J.shake)&&(st&&clearTimeout(st),V.value={color:J.glow},st=setTimeout(()=>{V.value=null,st=null},550)),J.shake&&typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(J.tier==="holyGrail"?[120,60,120,60,200]:J.tier==="insaneMark"?[80,40,80,40,120]:[60,40,80]),setTimeout(()=>{d.value=null},J.duration)),Z&&X.status!=="finished"&&u){const dt=(X.players||[]).find(wt=>Number(wt.id)===Number(u));Ft({winnerName:(dt==null?void 0:dt.name)||"—",wonSet:C,wonLeg:T},J?2950:450)}}if(X.status==="finished"){const Q=X.winner,J=(Q==null?void 0:Q.name)||((G=(X.players||[]).find(dt=>Number(dt.id)===Number(Q==null?void 0:Q.id)))==null?void 0:G.name)||"—";R&&(clearTimeout(R),R=null),I.value={winnerName:J},R=setTimeout(()=>{I.value=null,R=null},5e3)}v.darts=[]}finally{U.value=!1}}async function Gt(){v.darts.length>0?v.darts.pop():p.value=!0}async function Re(){var l;if(p.value=!1,!Bt.value)return;const s=await n.undo();v.darts=[],s||(l=window._dartToast)==null||l.call(window,"Neizdevās atsaukt gājienu.","error")}function Ie(){p.value=!1,O.value=!0}async function Le(){var s,l,u,T,C,M,B;O.value=!1;try{const H=await n.abandonMatch();H!=null&&H.message&&((s=window._dartToast)==null||s.call(window,H.message,"info")),o.push("/")}catch(H){if(((l=H==null?void 0:H.response)==null?void 0:l.status)===404){o.push("/");return}const nt=((T=(u=H.response)==null?void 0:u.data)==null?void 0:T.message)||((M=(C=H.response)==null?void 0:C.data)==null?void 0:M.error)||"Neizdevās pārtraukt spēli.";(B=window._dartToast)==null||B.call(window,nt,"error")}}async function ze(){var l,u,T,C,M;const s=n.state;if(!(!s||s.status!=="suspended"||s.play_mode!=="local")&&!(!x.user||Number(s.host_user_id)!==Number(x.user.id)))try{await n.resumeMatch()}catch(B){const H=((u=(l=B.response)==null?void 0:l.data)==null?void 0:u.error)||((C=(T=B.response)==null?void 0:T.data)==null?void 0:C.message)||N("common.error");(M=window._dartToast)==null||M.call(window,H,"error"),o.push("/")}}async function Pe(){var C,M,B,H,nt,ct,it,ot,G;const s=(C=E.value)==null?void 0:C.play_mode,l=(M=E.value)==null?void 0:M.host_user_id,u=(B=x.user)==null?void 0:B.id,T=s==="local"&&u!=null&&Number(l)===Number(u);try{T&&n.isMatchActive&&(await n.suspendLocalMatch(),(H=window._dartToast)==null||H.call(window,N("game.suspendedExitToast"),"success"))}catch(X){const Z=((ct=(nt=X.response)==null?void 0:nt.data)==null?void 0:ct.message)||((ot=(it=X.response)==null?void 0:it.data)==null?void 0:ot.error)||N("common.error");(G=window._dartToast)==null||G.call(window,Z,"error");return}n.reset(),o.push("/")}function $e(){n.reset(),o.push("/")}function He(){O.value=!0}function Ut(s){if(jt.value||!a.value||U.value)return;const l=s.target;l&&(l.tagName==="INPUT"||l.tagName==="TEXTAREA"||l.closest&&l.closest('[contenteditable="true"]'))||(s.key==="Enter"&&v.darts.length>0?(s.preventDefault(),Et()):s.key==="Escape"?(s.preventDefault(),Gt()):s.key==="Backspace"&&v.darts.length>0&&(s.preventDefault(),zt(v.darts.length-1)))}return Ct(async()=>{L.value=!0;try{await n.loadState(t.matchId),await ze()}finally{L.value=!1}We(()=>b()),n.startPolling(1100),document.addEventListener("keydown",Ut),ft=setInterval(()=>{pt.value=Date.now()},500)}),Kt(()=>{n.stopPolling(),document.removeEventListener("keydown",Ut),ft&&(clearInterval(ft),ft=null),R&&(clearTimeout(R),R=null),st&&(clearTimeout(st),st=null)}),{matchId:f(()=>t.matchId),state:E,isMyTurn:a,isX01:se,isCricket:Nt,players:rt,finished:ae,legsToWin:ne,dartInput:v,submitting:U,turnResult:S,legWonCelebration:W,matchEndCelebration:I,activeMultiplier:F,showUndoConfirm:p,showAbandonConfirm:O,isMatchActive:z,isSuspended:_,waitingForTurnUi:ht,legsConfigTotal:te,setsConfigTotal:ee,gameBootPending:L,undoAvailable:Bt,cricketActiveSegs:Rt,cricketSdtSegments:kt,cricketSdtNonBull:Lt,cricketSdtHasBull:ve,cricketPadSplit:ye,hitsFor:yt,myHitsFor:me,segClosedByAll:be,scorecardGridStyle:fe,scorecardRowGridStyle:xe,leftPlayers:pe,rightPlayers:ge,addX01Dart:ke,addX01Miss:we,addCricketDart:Te,removeDart:zt,dartLabel:Pt,dartValue:$t,turnResultShellClass:Ae,turnResultMotionClass:Be,turnResultTopBannerClass:Ne,submitThrow:Et,undo:Gt,confirmUndo:Re,goAbandonFromUndoDialog:Ie,confirmAbandon:Le,exitGameSaving:Pe,goHome:$e,auth:x,gameStore:n,cricketAchievement:d,cricketFlash:V,t:N,useTurnTimer:le,turnTimer:xt,turnTimerRemainingSec:Mt,turnTimerProgress:re,turnTimerRowVisible:ie,showTurnTimeoutWaitingBanner:oe,showTurnTimeoutOpponentModal:jt,formatTurnClock:de,turnTimeoutBusy:lt,onTurnTimeoutGrantExtra:ce,onTurnTimeoutEndNoStats:ue,layoutKind:g,layoutLabel:w,layoutWidth:y,layoutHeight:c,layoutAspect:k,revealAbandonConfirm:He}},template:`
    <div class="flex h-full min-h-0 flex-1 flex-col w-full min-w-0 overflow-hidden bg-[#060d18] text-slate-200"
         :data-game-layout="state && !gameBootPending && !finished ? layoutKind : null">

      <!-- Turn result toast (X01: punkti / checkout / BUST / Miss) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="turnResult"
               class="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none backdrop-blur-sm max-w-[min(100%,24rem)] w-[calc(100%-2rem)]
                      bottom-[30%] sm:bottom-[22%] md:bottom-24">
            <div class="rounded-2xl border px-4 py-2.5 sm:px-5 sm:py-3 shadow-2xl flex flex-col gap-1.5"
                 :class="turnResultShellClass(turnResult)">
              <div v-if="turnResult.topBanner"
                   class="font-black leading-tight"
                   :class="[
                     turnResult.bannerIsCompact ? 'uppercase tracking-[0.2em] text-[10px]' : '',
                     turnResultTopBannerClass(turnResult),
                   ]">
                {{ turnResult.topBanner }}
              </div>
              <div v-if="turnResult.checkoutDetail" class="rounded-lg bg-emerald-950/50 border border-emerald-600/35 px-2.5 py-1.5">
                <div class="text-xs font-black text-emerald-200 leading-snug">{{ turnResult.checkoutDetail.title }}</div>
                <div v-if="turnResult.checkoutDetail.tag" class="text-[11px] text-emerald-400/90 leading-snug mt-0.5">
                  {{ turnResult.checkoutDetail.tag }}
                </div>
              </div>
              <div v-else-if="turnResult.checkoutFooter" class="text-[11px] text-emerald-400/90 leading-snug">
                {{ turnResult.checkoutFooter }}
              </div>
              <div class="flex items-center gap-2 sm:gap-4" :class="turnResultMotionClass(turnResult)">
                <div class="flex flex-wrap gap-1.5 min-w-0">
                  <span v-for="(lbl, i) in turnResult.labels" :key="i"
                        class="font-mono font-black tabular-nums leading-none"
                        :class="turnResult.kind === 'bust' ? 'text-rose-200 text-base sm:text-lg'
                          : turnResult.kind === 'miss' ? 'text-slate-400 text-sm sm:text-base'
                          : turnResult.kind === 'high' && turnResult.highTier === 't180' ? 'text-yellow-200 text-lg sm:text-2xl'
                          : turnResult.kind === 'high' ? 'text-amber-300 text-base sm:text-xl'
                          : 'text-amber-400 text-base sm:text-lg'">
                    {{ lbl }}
                  </span>
                </div>
                <div class="border-l border-white/15 pl-2 sm:pl-4 font-black tabular-nums text-base sm:text-xl shrink-0"
                     :class="turnResult.kind === 'bust' ? 'text-rose-400'
                       : turnResult.kind === 'miss' ? 'text-slate-400 text-sm sm:text-base uppercase tracking-widest'
                       : turnResult.kind === 'high' && turnResult.highTier === 't180' ? 'text-yellow-200 text-lg sm:text-2xl'
                       : turnResult.kind === 'high' ? 'text-amber-200'
                       : turnResult.pts > 0 ? 'text-emerald-400' : 'text-slate-500'">
                  <template v-if="turnResult.kind === 'miss'">Miss</template>
                  <template v-else-if="turnResult.kind === 'bust'">0</template>
                  <template v-else>{{ turnResult.pts > 0 ? '+' + turnResult.pts : '0' }}</template>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Leg uzvara -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="legWonCelebration"
               class="fixed left-1/2 z-[55] pointer-events-none w-[min(22rem,92vw)]"
               style="top: 16%; transform: translateX(-50%)">
            <div class="dt-leg-won-enter rounded-2xl border border-amber-500/45 bg-gradient-to-b from-[#2a1f0a]/98 via-[#0f172a]/98 to-[#060d18]/98 px-4 py-4 sm:px-5 sm:py-5 text-center shadow-2xl shadow-amber-900/45 ring-1 ring-amber-400/20">
              <div class="text-[10px] font-black uppercase tracking-[0.28em] text-amber-500/95 mb-1">Leg uzvara</div>
              <div class="text-xl sm:text-2xl font-black text-amber-50 leading-tight">{{ legWonCelebration.winnerName }}</div>
              <div class="text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums">
                Set {{ legWonCelebration.wonSet }} · Leg {{ legWonCelebration.wonLeg }}
              </div>
              <div class="text-sm text-amber-400/95 mt-2 font-semibold leading-snug">{{ legWonCelebration.line }}</div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Mača uzvara — pirms protokola (~5 s) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="finished && matchEndCelebration"
               class="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 pointer-events-none">
            <div class="pointer-events-none max-w-md w-full text-center rounded-2xl border border-amber-500/40 bg-gradient-to-b from-[#1a1408]/98 to-[#0c1528]/98 px-8 py-10 shadow-2xl shadow-amber-900/30">
              <div class="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500/90 mb-3">{{ t('game.matchVictoryTitle') }}</div>
              <div class="text-3xl sm:text-4xl font-black text-amber-50 leading-tight mb-2">{{ matchEndCelebration.winnerName }}</div>
              <div class="text-sm text-slate-400">{{ t('game.matchVictorySubtitle') }}</div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Cricket achievement: screen flash -->
      <Teleport to="body">
        <Transition name="cricket-flash">
          <div v-if="cricketFlash"
               class="fixed inset-0 pointer-events-none dt-ach-flash"
               style="z-index:44"
               :style="{ background: cricketFlash.color + '28' }"></div>
        </Transition>
      </Teleport>

      <!-- Cricket achievement popup -->
      <Teleport to="body">
        <Transition name="achieve">
          <div v-if="cricketAchievement"
               class="fixed z-[45] pointer-events-none"
               :style="{
                 top: '24%',
                 left: '50%',
                 transform: 'translateX(-50%)',
                 width: cricketAchievement.fullScreen ? 'min(28rem,92vw)' : 'min(22rem,90vw)',
               }">

            <!-- Ambient backdrop for epic tiers -->
            <div v-if="cricketAchievement.fullScreen"
                 class="fixed inset-0 pointer-events-none"
                 style="z-index:-1"
                 :style="{ background: 'radial-gradient(ellipse at 50% 28%, ' + cricketAchievement.glow + '1e 0%, transparent 62%)' }"></div>

            <!-- Holy Grail: rotating rays behind card -->
            <div v-if="cricketAchievement.tier === 'holyGrail'"
                 class="absolute pointer-events-none"
                 style="inset:-300%; overflow:hidden; z-index:-1">
              <div class="dt-ach-rays"></div>
            </div>

            <!-- White Horse: silhouette running across full screen -->
            <div v-if="cricketAchievement.tier === 'whitehorse'"
                 class="fixed pointer-events-none dt-ach-horse-run"
                 style="top:32%; left:0; z-index:46; font-size:7rem; line-height:1;
                        filter:drop-shadow(0 0 18px rgba(255,255,255,.75)) drop-shadow(0 0 36px rgba(148,163,184,.5))">
              🐴
            </div>

            <!-- Main card -->
            <div class="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/80 dt-ach-card"
                 :class="['dt-ach-' + cricketAchievement.tier, cricketAchievement.shake ? 'dt-ach-shake' : '']">

              <!-- Top accent bar -->
              <div class="h-1.5 w-full" :style="{ background: cricketAchievement.glow }"></div>

              <!-- Bull pulsing rings (bulls3 / rodeo) -->
              <div v-if="cricketAchievement.tier === 'bulls3' || cricketAchievement.tier === 'rodeo'"
                   class="absolute inset-0 pointer-events-none overflow-hidden">
                <div class="dt-ach-ring"></div>
                <div class="dt-ach-ring"></div>
                <div class="dt-ach-ring"></div>
              </div>

              <!-- Gold sparkles (insaneMark / holyGrail) -->
              <template v-if="cricketAchievement.tier === 'insaneMark' || cricketAchievement.tier === 'holyGrail'">
                <span class="dt-ach-spark" style="left:10%"></span>
                <span class="dt-ach-spark" style="left:28%;animation-delay:.18s"></span>
                <span class="dt-ach-spark" style="left:50%;animation-delay:.08s"></span>
                <span class="dt-ach-spark" style="left:70%;animation-delay:.28s"></span>
                <span class="dt-ach-spark" style="left:88%;animation-delay:.14s"></span>
              </template>

              <!-- Content -->
              <div class="relative px-6 py-5 flex flex-col items-center text-center gap-1.5">
                <div class="leading-none mb-1 drop-shadow-[0_4px_20px_rgba(0,0,0,0.75)]"
                     :class="cricketAchievement.fullScreen ? 'text-7xl' : 'text-6xl'">
                  {{ cricketAchievement.emoji }}
                </div>
                <div class="font-black text-white tracking-tight leading-snug"
                     :class="cricketAchievement.fullScreen ? 'text-2xl' : 'text-xl'">
                  {{ cricketAchievement.title }}
                </div>
                <div v-if="cricketAchievement.sub"
                     class="text-sm font-semibold leading-snug"
                     :style="{ color: cricketAchievement.color }">
                  {{ cricketAchievement.sub }}
                </div>
              </div>

              <!-- Glow edge overlay -->
              <div class="absolute inset-0 pointer-events-none rounded-2xl"
                   :style="{ boxShadow: '0 0 80px 0 ' + cricketAchievement.glow + '44' }"></div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Undo / nav pēdējā gājiena — Cricket: piedāvāt pārtraukt spēli -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showUndoConfirm"
               class="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                      bg-black/60 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-4"
               @click.self="showUndoConfirm = false">
            <div class="w-full max-w-sm bg-[#0d1a2e] border border-[#1e3050] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
              <template v-if="undoAvailable">
                <div class="px-6 pt-6 pb-5">
                  <div class="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-700/40
                              flex items-center justify-center mb-4">
                    <span class="text-rose-400 text-lg">↩</span>
                  </div>
                  <h3 class="text-base font-black text-slate-100 mb-1">Atsaukt pēdējo gājienu?</h3>
                  <p class="text-slate-400 text-sm leading-relaxed">
                    Iepriekšējais iesniegtais gājiens tiks atcelts un rezultāts atjaunots visiem spēlētājiem.
                  </p>
                </div>
                <div class="flex border-t border-[#1e3050]">
                  <button type="button" @click="showUndoConfirm = false"
                          class="flex-1 py-4 text-slate-300 font-bold text-sm border-r border-[#1e3050]
                                 hover:bg-[#162540] active:bg-[#1e3050] transition touch-manipulation">
                    Aizvērt
                  </button>
                  <button type="button" @click="confirmUndo"
                          class="flex-1 py-4 text-rose-400 font-black text-sm
                                 hover:bg-rose-950/40 active:bg-rose-950/60 transition touch-manipulation">
                    Jā, atsaukt
                  </button>
                </div>
              </template>
              <template v-else>
                <div class="px-6 pt-6 pb-5">
                  <div class="w-10 h-10 rounded-full bg-slate-700/80 border border-slate-600/50
                              flex items-center justify-center mb-4">
                    <span class="text-slate-300 text-lg">↩</span>
                  </div>
                  <h3 class="text-base font-black text-slate-100 mb-1">Nav ko atsaukt</h3>
                  <p class="text-slate-400 text-sm leading-relaxed">
                    Šajā legā vēl nav iesniegts neviens gājiens, ko varētu atsaukt. Vari pārtraukt visu spēli
                    (abi spēlētāji redzēs pārtraukumu reāllaikā) vai doties prom no skata.
                  </p>
                </div>
                <div class="flex flex-col border-t border-[#1e3050]">
                  <button type="button" @click="goAbandonFromUndoDialog"
                          class="w-full py-3.5 text-rose-400 font-black text-sm border-b border-[#1e3050]
                                 hover:bg-rose-950/30 active:bg-rose-950/50 transition touch-manipulation">
                    Pārtraukt spēli…
                  </button>
                  <button type="button" @click="showUndoConfirm = false"
                          class="w-full py-3.5 text-slate-300 font-bold text-sm hover:bg-[#162540] transition touch-manipulation">
                    Aizvērt
                  </button>
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Pārtraukt spēli (apstiprinājums) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showAbandonConfirm"
               class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center
                      bg-black/70 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-4"
               @click.self="showAbandonConfirm = false">
            <div class="w-full max-w-sm bg-[#0d1a2e] border border-rose-900/40 rounded-2xl shadow-2xl overflow-hidden">
              <div class="px-6 pt-6 pb-5">
                <h3 class="text-base font-black text-slate-100 mb-1">
                  {{ state?.play_mode === 'local' ? t('game.abandonLocalTitle') : t('game.abandonOnlineTitle') }}
                </h3>
                <p class="text-slate-400 text-sm leading-relaxed">
                  {{ state?.play_mode === 'local' ? t('game.abandonLocalBody') : t('game.abandonOnlineBody') }}
                </p>
              </div>
              <div class="flex border-t border-[#1e3050]">
                <button type="button" @click="showAbandonConfirm = false"
                        class="flex-1 py-4 text-slate-300 font-bold text-sm border-r border-[#1e3050]
                               hover:bg-[#162540] transition touch-manipulation">
                  Atcelt
                </button>
                <button type="button" @click="confirmAbandon"
                        class="flex-1 py-4 text-rose-400 font-black text-sm
                               hover:bg-rose-950/40 transition touch-manipulation">
                  Jā, pārtraukt
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Pretinieka izvēle pēc gājiena taimera -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showTurnTimeoutOpponentModal"
               class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center
                      bg-black/75 backdrop-blur-sm px-4 pb-[env(safe-area-inset-bottom)] sm:pb-4"
               role="dialog" aria-modal="true">
            <div class="w-full max-w-md overflow-hidden rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#1a1408] to-[#0d1a2e] shadow-2xl shadow-black/60">
              <div class="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
              <div class="px-6 pt-5 pb-4">
                <h3 class="text-lg font-black text-amber-100 tracking-tight mb-2">{{ t('game.turnTimer.opponentTitle') }}</h3>
                <p class="text-sm text-slate-400 leading-relaxed">{{ t('game.turnTimer.opponentBody') }}</p>
              </div>
              <div class="flex flex-col gap-2 border-t border-[#1e3050] px-4 py-4 sm:flex-row sm:items-stretch">
                <button type="button" :disabled="turnTimeoutBusy" @click="onTurnTimeoutEndNoStats"
                        class="flex-1 py-3 rounded-xl border border-rose-900/50 bg-rose-950/40 text-rose-200 font-bold text-sm
                               hover:bg-rose-950/70 transition disabled:opacity-40 touch-manipulation">
                  {{ turnTimeoutBusy ? t('game.turnTimer.busy') : t('game.turnTimer.endNoStats') }}
                </button>
                <button type="button" :disabled="turnTimeoutBusy" @click="onTurnTimeoutGrantExtra"
                        class="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm
                               transition disabled:opacity-40 shadow-md shadow-amber-950/30 touch-manipulation">
                  {{ turnTimeoutBusy ? t('game.turnTimer.busy') : t('game.turnTimer.grantExtra') }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Loading (arī kamēr lokālais resume no pauzes) -->
      <div v-if="!state || gameBootPending" class="flex flex-1 min-h-[50vh] items-center justify-center bg-[#060d18]">
        <div class="flex gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
        </div>
      </div>

      <template v-else>

        <!-- ══ FINISHED: protokols (ritināms, pilns augstums no shell) ══ -->
        <div v-if="finished" class="relative flex min-h-0 flex-1 flex-col overflow-hidden w-full">
          <MatchReport v-show="!matchEndCelebration" :match-id="matchId" class="min-h-0 flex-1" @home="goHome" />
        </div>

        <!-- ════════════════ CRICKET ════════════════ -->
        <div v-else-if="isCricket" class="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CricketGameAdaptiveLayout
            :layout-kind="layoutKind"
            :layout-width="layoutWidth"
            :layout-height="layoutHeight"
            :state="state"
            :players="players"
            :left-players="leftPlayers"
            :right-players="rightPlayers"
            :cricket-sdt-segments="cricketSdtSegments"
            :cricket-sdt-non-bull="cricketSdtNonBull"
            :cricket-sdt-has-bull="cricketSdtHasBull"
            :cricket-pad-split="cricketPadSplit"
            :legs-config-total="legsConfigTotal"
            :sets-config-total="setsConfigTotal"
            :legs-to-win="legsToWin"
            :is-match-active="isMatchActive"
            :is-suspended="isSuspended"
            :auth="auth"
            :dart-input="dartInput"
            :submitting="submitting"
            :waiting-for-turn-ui="waitingForTurnUi"
            :show-turn-timeout-waiting-banner="showTurnTimeoutWaitingBanner"
            :turn-timer-row-visible="turnTimerRowVisible"
            :turn-timer-progress="turnTimerProgress"
            :turn-timer-remaining-sec="turnTimerRemainingSec"
            :scorecard-grid-style="scorecardGridStyle"
            :scorecard-row-grid-style="scorecardRowGridStyle"
            :hits-for="hitsFor"
            :seg-closed-by-all="segClosedByAll"
            :my-hits-for="myHitsFor"
            :dart-label="dartLabel"
            :dart-value="dartValue"
            :format-turn-clock="formatTurnClock"
            :add-cricket-dart="addCricketDart"
            :remove-dart="removeDart"
            :submit-throw="submitThrow"
            :undo="undo"
            :exit-game-saving="exitGameSaving"
            :on-show-abandon="revealAbandonConfirm"
          />
        </div>

        <!-- ════════════════ X01 ════════════════ -->
        <div v-else class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain bg-[#060d18] flex flex-col pb-[env(safe-area-inset-bottom)]">
          <div class="flex-1 min-h-0 max-w-5xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-6 pb-4 sm:pb-10 flex flex-col min-h-0">
          <div class="shrink-0 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-[#162540]">
            <div class="text-[11px] sm:text-sm text-slate-500 min-w-0 leading-snug">
              <span class="text-amber-400 font-mono font-black">{{ state.room_code }}</span>
              <span class="mx-1 sm:mx-2 text-slate-700">·</span>
              Leg {{ state.current_leg }}/{{ legsConfigTotal }}<template v-if="setsConfigTotal > 1"> · Set {{ state.current_set }}/{{ setsConfigTotal }}</template>
            </div>
            <div v-if="(isMatchActive || isSuspended) && auth.user" class="flex gap-1 sm:gap-2 flex-shrink-0">
              <button type="button" @click="exitGameSaving"
                      class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-slate-600/60 text-slate-400 hover:bg-[#162540] transition touch-manipulation">
                {{ t('game.exitSave') }}
              </button>
              <button v-if="isMatchActive" type="button" @click="showAbandonConfirm = true"
                      class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black border border-rose-800/50 text-rose-400 hover:bg-rose-950/30 transition touch-manipulation">
                Pārtraukt
              </button>
            </div>
          </div>

          <div v-if="isMatchActive && showTurnTimeoutWaitingBanner"
               class="shrink-0 -mx-0 px-2 sm:px-3 py-2 sm:py-2.5 mb-2 sm:mb-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center text-[11px] sm:text-xs font-semibold text-amber-100 leading-snug">
            {{ t('game.turnTimer.waitingOpponentChoice') }}
          </div>
          <div v-else-if="turnTimerRowVisible"
               class="shrink-0 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-0.5 sm:px-1">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 hidden sm:inline">{{ t('game.turnTimer.label') }}</span>
            <div class="flex-1 min-w-0 h-1.5 sm:h-2 rounded-full bg-[#1e3050] overflow-hidden ring-1 ring-black/20">
              <div class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                   :style="{ width: turnTimerProgress + '%' }"></div>
            </div>
            <span class="text-xs sm:text-sm font-mono font-black tabular-nums text-amber-400 w-[4rem] sm:w-[4.75rem] text-right shrink-0">{{ formatTurnClock(turnTimerRemainingSec) }}</span>
          </div>

          <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 min-h-0">

            <div class="lg:col-span-2 min-h-0 overflow-y-auto flex flex-col gap-2 sm:gap-4 order-2 lg:order-1">

              <div v-for="player in players" :key="player.id"
                   class="border-2 rounded-lg sm:rounded-xl p-2.5 sm:p-4 transition-all duration-300 shrink-0"
                   :class="Number(player.id) === Number(state.current_player?.id)
                     ? 'border-amber-500/40 bg-[#0f1c30] shadow-md shadow-black/10'
                     : 'border-[#162540] bg-[#0a1120]/80'">
                <div class="flex justify-between items-start gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="font-black text-base leading-none"
                            :class="Number(player.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-100'">
                        {{ player.name }}
                      </span>
                      <span v-if="Number(player.id) === Number(state.current_player?.id)"
                            class="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-black">
                        Kārta
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div v-for="i in legsToWin" :key="i"
                           class="w-3 h-3 rounded-full border-2 transition-colors"
                           :class="i <= player.legs_won ? 'bg-amber-400 border-amber-400' : 'border-slate-700'"></div>
                      <span v-if="state.legs_config?.sets > 1"
                            class="text-xs text-slate-600 ml-1">S{{ player.sets_won }}</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-2xl sm:text-4xl font-black text-white tabular-nums leading-none">{{ player.remaining }}</div>
                    <div v-if="player.checkout?.length" class="text-[10px] sm:text-xs text-emerald-400 mt-0.5 font-mono leading-tight">
                      {{ player.checkout.join(' → ') }}
                    </div>
                    <div class="mt-1 sm:mt-1.5 pt-1 border-t border-slate-700/80">
                      <div class="text-[9px] font-black uppercase tracking-wide text-sky-400/90 leading-none mb-0.5">{{ t('stats.avg3') }}</div>
                      <div class="text-base sm:text-lg font-black tabular-nums text-sky-100 leading-none">{{ player.avg ?? '—' }}</div>
                    </div>
                  </div>
                </div>
                <div v-if="player.visits_this_leg?.length" class="mt-2 sm:mt-3 pt-2 border-t border-[#162540]/80">
                  <div class="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Šīs leg gājieni</div>
                  <div class="flex flex-wrap gap-0.5 sm:gap-1">
                    <span v-for="(v, vi) in player.visits_this_leg" :key="vi"
                          class="text-[10px] sm:text-[11px] font-mono font-bold tabular-nums px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border"
                          :class="v.bust ? 'border-rose-500/50 bg-rose-950/40 text-rose-200' : 'border-slate-600/60 bg-[#060d18] text-slate-300'">
                      {{ v.bust ? 'BUST' : v.pts }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input panel -->
            <div class="min-h-0 overflow-y-auto flex flex-col lg:sticky lg:top-2 lg:self-start bg-[#0f1c30] border border-[#162540] rounded-lg sm:rounded-xl p-2 sm:p-4 order-1 lg:order-2
                        shadow-[inset_0_1px_0_rgba(255,255,255,.05)] max-lg:max-h-[min(52vh,28rem)]">

              <div v-if="waitingForTurnUi" class="text-center py-6 sm:py-8 shrink-0">
                <div class="text-slate-600 text-xs mb-2 uppercase tracking-widest">Gaida</div>
                <div class="text-white font-black text-lg">{{ state.current_player?.name }}</div>
                <div class="flex justify-center gap-1.5 mt-4">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>

              <template v-else>
                <!-- Dart slots -->
                <div class="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3 shrink-0">
                  <div v-for="(d, i) in dartInput.darts" :key="i"
                       class="flex-1 bg-[#0a1120] border border-[#162540] rounded-lg sm:rounded-xl py-1.5 sm:py-2 text-center relative group min-w-0 touch-manipulation">
                    <div class="text-amber-400 font-mono font-black text-sm sm:text-base truncate px-1">{{ dartLabel(d) }}</div>
                    <div class="text-slate-500 text-[10px] sm:text-xs tabular-nums">{{ dartValue(d) > 0 ? dartValue(d) : '—' }}</div>
                    <button type="button" @click="removeDart(i)"
                            class="absolute -top-1 -right-1 w-6 h-6 bg-red-700 hover:bg-red-600 text-white rounded-full text-[10px]
                                   flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">✕</button>
                  </div>
                  <div v-for="i in (3 - dartInput.darts.length)" :key="'xe'+i"
                       class="flex-1 min-h-[2.65rem] sm:min-h-[3rem] bg-[#060d18]/80 border border-dashed border-[#1e3050]
                              rounded-lg sm:rounded-xl flex items-center justify-center text-[#1e3050] text-[10px] sm:text-xs font-mono">—</div>
                </div>

                <!-- Multiplier toggle -->
                <div class="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3 shrink-0">
                  <button v-for="m in [1, 2, 3]" :key="m" type="button"
                          @click="activeMultiplier = m"
                          class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm transition active:scale-[0.97] touch-manipulation border"
                          :class="activeMultiplier === m
                            ? m === 1 ? 'bg-slate-600 border-slate-400/50 text-white shadow-inner'
                            : m === 2 ? 'bg-sky-700 border-sky-400/50 text-sky-50 shadow-inner'
                            : 'bg-amber-600 border-amber-400/50 text-amber-50 shadow-inner'
                            : 'bg-[#0a1120] border-[#1e3050] text-slate-500 hover:text-slate-300'">
                    {{ m }}×
                  </button>
                </div>

                <!-- Number grid 1–20 (Miss pogas stils) -->
                <div class="grid grid-cols-5 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2 shrink-0">
                  <button v-for="n in 20" :key="n" type="button"
                          @click="addX01Dart(n, activeMultiplier)"
                          :disabled="dartInput.darts.length >= 3"
                          class="py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm tabular-nums transition active:scale-[0.96] touch-manipulation
                                 border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90 hover:bg-[#2a1218]
                                 disabled:opacity-30">
                    {{ n }}
                  </button>
                </div>

                <!-- Bull / Outer / Miss -->
                <div class="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3 shrink-0">
                  <button type="button" @click="addX01Dart(25, 1)"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border border-emerald-700/45 bg-emerald-950/75
                                 text-emerald-200 hover:bg-emerald-900/55 transition active:scale-[0.97] touch-manipulation disabled:opacity-30">
                    Outer
                  </button>
                  <button type="button" @click="addX01Dart(25, 2)"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border border-red-800/50 bg-red-950/85
                                 text-red-100 hover:bg-red-900/55 transition active:scale-[0.97] touch-manipulation disabled:opacity-30">
                    Bull
                  </button>
                  <button type="button" @click="addX01Miss"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border border-rose-900/40 bg-[#1a0a0f]
                                 text-rose-300/90 hover:bg-[#2a1218] transition active:scale-[0.97] touch-manipulation disabled:opacity-30">
                    Miss
                  </button>
                </div>

                <!-- Submit / Undo -->
                <div class="flex gap-1.5 sm:gap-2 shrink-0">
                  <button type="button" @click="undo"
                          class="flex-1 py-2.5 sm:py-3 bg-[#162540] hover:bg-[#1e3050] text-slate-200 rounded-lg sm:rounded-xl
                                 font-bold transition text-xs sm:text-sm active:scale-[0.97] border border-[#1e3050] touch-manipulation">
                    ↩ Atsaukt
                  </button>
                  <button type="button" @click="submitThrow"
                          :disabled="submitting || dartInput.darts.length === 0"
                          class="flex-1 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-lg sm:rounded-xl
                                 font-black transition disabled:opacity-40 text-xs sm:text-sm
                                 active:scale-[0.97] shadow-md shadow-amber-950/30 touch-manipulation">
                    {{ submitting ? '...' : 'Iesniegt →' }}
                  </button>
                </div>
              </template>
            </div>

          </div>
          </div>
        </div>

      </template>
    </div>
  `};export{hl as default};
