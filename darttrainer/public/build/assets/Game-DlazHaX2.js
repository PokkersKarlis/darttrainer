import{o as we,e as qe,r as E,a2 as Pt,z as f,f as o,g as d,h as t,t as y,F,x as H,n as B,y as se,l as z,j as ae,i as oe,p as X,a as Oe,u as Dt,c as Et,w as Gt,K as Ut,I as Vt}from"./main-DcfQ8g_a.js";import{u as Wt}from"./useBodyShellClass-Bg8uJNbJ.js";import{useGameStore as qt}from"./game-DSDbrWRA.js";/* empty css            */import"./index-BuNY4Ty6.js";const Ot=.92,Ue=1.08;function Kt(){if(typeof window>"u")return{w:1,h:1};const e=window.visualViewport,x=e?Math.max(1,Math.round(e.width)):Math.max(1,window.innerWidth),T=e?Math.max(1,Math.round(e.height)):Math.max(1,window.innerHeight);return{w:x,h:T}}function Xt(e,x){const T=e/x;return T>=Ot&&T<=Ue?{kind:"square",label:"Square"}:T>Ue?{kind:"landscape",label:"Landscape"}:{kind:"portrait",label:"Portrait"}}function _t(){const e=E("portrait"),x=E("Portrait"),T=E(0),g=E(0),c=E("1.000");function v(){const{w:a,h:b}=Kt(),{kind:h,label:r}=Xt(a,b);T.value=a,g.value=b,c.value=(a/b).toFixed(3),e.value=h,x.value=r}function m(){requestAnimationFrame(()=>v())}return we(()=>{v(),window.addEventListener("resize",v,{passive:!0}),window.addEventListener("orientationchange",m);const a=window.visualViewport;a&&a.addEventListener("resize",v,{passive:!0})}),qe(()=>{window.removeEventListener("resize",v),window.removeEventListener("orientationchange",m);const a=typeof window<"u"?window.visualViewport:null;a&&a.removeEventListener("resize",v)}),{layoutKind:e,layoutLabel:x,layoutWidth:T,layoutHeight:g,layoutAspect:c,syncGameScreenLayout:v}}const Jt={props:{matchId:{type:[String,Number],required:!0}},emits:["home"],setup(e,{emit:x}){const T=E(!0),g=E(null),c=E(null),v=f(()=>{var p,P;return((P=(p=c.value)==null?void 0:p.match)==null?void 0:P.game_type)==="cricket"}),m=f(()=>{var p,P;return((P=(p=c.value)==null?void 0:p.match)==null?void 0:P.game_type)==="x01"}),a=f(()=>{var p;return((p=c.value)==null?void 0:p.report)??null}),b=f(()=>{var p;return((p=a.value)==null?void 0:p.meta)??{}}),h=f(()=>{var p;return((p=a.value)==null?void 0:p.player_rows)??[]}),r=f(()=>{var p;return((p=a.value)==null?void 0:p.agp)??null}),k=f(()=>{var p;return((p=a.value)==null?void 0:p.leg_rows)??[]});function S(p){if(!p)return"—";try{return new Date(p).toLocaleString("lv-LV",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return p}}function U(){window.print()}return we(async()=>{T.value=!0,g.value=null;try{const{data:p}=await Pt.protocol(e.matchId);c.value=p}catch{g.value="Neizdevās ielādēt protokolu."}finally{T.value=!1}}),{loading:T,error:g,payload:c,isCricket:v,isX01:m,report:a,meta:b,rows:h,agp:r,legRows:k,fmtDateTime:S,printReport:U,goHome:()=>x("home")}},template:`
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
  `},Te={props:{boosted:{type:Boolean,default:!0},prominent:{type:Boolean,default:!1}},template:`
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
  `},be={components:{CricketClosedCheck:Te},props:{hits:{type:Number,default:0},closed:{type:Boolean,default:!1},size:{type:String,default:"md"}},setup(e){function x(b){const h=b??0;return h===2?"2":h===1?"1":"0"}function T(b){const h=b??0;return h>=3?"Slēgts (3 trāpījumi)":h===2?"Divi trāpījumi":h===1?"Viens trāpījums":"Nav trāpījumu"}function g(b){return b>=3?"text-emerald-300":b===2?"text-amber-200":b===1?"text-sky-200":"text-slate-500"}function c(b){const h=b??0;return h>=3?"bg-emerald-500/20 ring-1 ring-emerald-400/35 shadow-[0_0_20px_rgba(52,211,153,.12)]":h===2?"bg-amber-500/18 ring-1 ring-amber-400/30":h===1?"bg-sky-500/18 ring-1 ring-sky-400/28":"bg-[#0c1528]/90 ring-1 ring-[#1e3050]/80"}const v=f(()=>{const b={sm:"text-xl",md:"text-2xl",lg:"text-3xl",board:"text-[clamp(1.35rem,4.2vmin,2.75rem)] sm:text-[clamp(1.5rem,3.8vmin,2.5rem)]","board-sm":"text-[clamp(0.7rem,2.6vmin,1.05rem)]"};return b[e.size]??b.md}),m=f(()=>e.size==="board"||e.size==="board-sm"),a=f(()=>e.size==="board-sm");return{symbol:x,hitTitle:T,colorClass:g,pillClass:c,sizeClass:v,isBoard:m,isBoardCompact:a}},template:`
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
  `},pe={props:{hits:{type:Number,default:0},size:{type:Number,default:32},dimmed:{type:Boolean,default:!1}},setup(e){return{color:f(()=>e.dimmed?"#3a4a63":e.hits>=3?"#3ecf8e":"#f5a623")}},template:`
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
  `},Qt={key:0,class:"flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center"},Zt={class:"text-xl font-black text-slate-100"},Yt={class:"flex shrink-0 items-center justify-between"},es={class:"flex items-center gap-2"},ts={class:"text-[10px] font-semibold text-slate-400"},ss={class:"flex gap-[3px]"},as={key:0,class:"flex shrink-0 items-center justify-end gap-1"},ns={key:0,class:"text-[9px] font-black text-emerald-400"},rs={key:1,class:"text-[9px] text-amber-500"},ls={class:"flex shrink-0 gap-1.5"},is={class:"min-w-0 flex-1"},os={class:"truncate font-mono text-sm font-black leading-tight text-amber-400"},ds={class:"text-[10px] tabular-nums text-slate-600"},cs=["onClick"],us={class:"min-h-0 flex-1 grid grid-cols-3 gap-[3px]",style:{"grid-template-rows":"1fr 1fr"}},ms={class:"flex shrink-0 items-center justify-between px-1.5 pt-1"},bs={class:"flex min-h-0 flex-1 items-stretch gap-[2px] p-1 pt-0.5"},fs=["disabled","onClick"],xs={class:"flex shrink-0 gap-1.5"},ps={class:"flex items-center justify-between px-1.5 pt-1"},gs={class:"flex gap-[2px] p-1 pt-0.5"},hs=["disabled"],vs=["disabled"],ys=["disabled"],ks={class:"flex shrink-0 gap-2"},ws=["disabled"],Ts={class:"flex shrink-0 items-center justify-between gap-2"},Cs={class:"flex gap-1","aria-hidden":"true"},Ss={class:"flex shrink-0 gap-2"},As={class:"truncate font-mono text-sm font-black text-amber-400 sm:text-base"},Ns={class:"text-[11px] tabular-nums text-slate-500"},Bs=["onClick"],Ms={class:"flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5"},js={class:"grid grid-cols-2 gap-x-2 gap-y-2"},$s={class:"flex flex-col gap-2"},Rs={class:"mb-1.5 flex items-center justify-between gap-2"},Fs={class:"min-w-[2.25rem] rounded-xl border border-rose-900/40 bg-[#1a0a0f] px-2.5 py-1 text-center text-xl font-black tabular-nums text-rose-300/90"},Ls={class:"grid grid-cols-3 gap-1.5"},Is=["disabled","onClick"],zs={class:"text-xl font-black leading-none tabular-nums"},Hs={key:0,class:"absolute right-0.5 top-0.5 text-[8px] text-emerald-400"},Ps={class:"flex flex-col gap-2"},Ds={class:"mb-1.5 flex items-center justify-between gap-2"},Es={class:"min-w-[2.25rem] rounded-xl border border-rose-900/40 bg-[#1a0a0f] px-2.5 py-1 text-center text-xl font-black tabular-nums text-rose-300/90"},Gs={class:"grid grid-cols-3 gap-1.5"},Us=["disabled","onClick"],Vs={class:"text-xl font-black leading-none tabular-nums"},Ws={key:0,class:"absolute right-0.5 top-0.5 text-[8px] text-emerald-400"},qs={key:0,class:"shrink-0 rounded-2xl border border-[#1e3050] bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg ring-1 ring-white/[0.06]"},Os={class:"grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-1.5"},Ks=["disabled"],Xs={key:0,class:"absolute right-1 top-1 text-[8px] text-emerald-400"},_s=["disabled"],Js={key:0,class:"absolute right-1 top-1 text-[8px] text-emerald-400"},Qs=["disabled"],Zs={class:"flex shrink-0 gap-2 pt-1"},Ys=["disabled"],Ve={__name:"CricketInputPanel",props:{state:{type:Object,required:!0},dartInput:{type:Object,required:!0},submitting:{type:Boolean,default:!1},waitingForTurnUi:{type:Boolean,default:!1},cricketPadSplit:{type:Object,default:()=>({left:[],right:[]})},cricketSdtHasBull:{type:Boolean,default:!1},segClosedByAll:{type:Function,required:!0},myHitsFor:{type:Function,required:!0},addCricketDart:{type:Function,required:!0},removeDart:{type:Function,required:!0},submitThrow:{type:Function,required:!0},undo:{type:Function,required:!0},dartLabel:{type:Function,required:!0},dartValue:{type:Function,required:!0},density:{type:String,default:"default"}},setup(e){const x=e,T=f(()=>[...x.cricketPadSplit.left,...x.cricketPadSplit.right]),g=f(()=>{const m=new Set([...x.cricketPadSplit.left,...x.cricketPadSplit.right,...x.cricketSdtHasBull?[25]:[]]);return x.dartInput.darts.reduce((a,b)=>{const h=Number(b.segment??0),r=Number(b.multiplier??0);return a+(h>0&&r>0&&m.has(h)?r:0)},0)}),c=f(()=>g.value>=9?"#3ecf8e":g.value>=6?"#f5a623":g.value>=4?"#7b8ba8":"#3a4a63");function v(m){return m===25?"25":String(m)}return(m,a)=>{var b,h;return o(),d("div",{class:B(["flex min-h-0 flex-1 flex-col overflow-hidden",e.density==="compact"?"gap-1.5 p-2":"gap-3 p-3"])},[e.waitingForTurnUi?(o(),d("div",Qt,[a[10]||(a[10]=t("div",{class:"text-xs font-semibold uppercase tracking-widest text-slate-500"},"Gaida",-1)),t("div",Zt,y((b=e.state.current_player)==null?void 0:b.name),1),a[11]||(a[11]=t("div",{class:"flex gap-1.5"},[t("span",{class:"h-2 w-2 animate-bounce rounded-full bg-amber-500",style:{"animation-delay":"0ms"}}),t("span",{class:"h-2 w-2 animate-bounce rounded-full bg-amber-500",style:{"animation-delay":"150ms"}}),t("span",{class:"h-2 w-2 animate-bounce rounded-full bg-amber-500",style:{"animation-delay":"300ms"}})],-1))])):e.density==="compact"?(o(),d(F,{key:1},[t("div",Yt,[a[13]||(a[13]=t("span",{class:"text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600"},"Šīs kārtas",-1)),t("div",es,[t("span",ts,y((h=e.state.current_player)==null?void 0:h.name),1),t("div",ss,[(o(),d(F,null,H(3,r=>t("span",{key:r,class:B(["h-1.5 w-1.5 rounded-full transition-all",r<=e.dartInput.darts.length?"bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,.5)]":"bg-[#1e3050]"])},null,2)),64))])]),g.value>0?(o(),d("div",as,[a[12]||(a[12]=t("span",{class:"text-[9px] text-slate-600"},"kārtā:",-1)),t("span",{class:"text-[11px] font-black tabular-nums transition-colors",style:se({color:c.value})},y(g.value)+" m",5),g.value>=9?(o(),d("span",ns,"🔥")):g.value>=6?(o(),d("span",rs,"⬡")):z("",!0)])):z("",!0)]),t("div",ls,[(o(!0),d(F,null,H(e.dartInput.darts,(r,k)=>(o(),d("div",{key:k,class:"relative flex h-[2.4rem] flex-1 items-center overflow-hidden rounded-xl border border-[#1e3050] bg-[#0f1c30] px-2"},[t("div",is,[t("div",os,y(e.dartLabel(r)),1),t("div",ds,y(e.dartValue(r)>0?e.dartValue(r):"—"),1)]),t("button",{type:"button",class:"ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-700/70 text-[9px] font-black text-white transition hover:bg-red-600 active:scale-90 touch-manipulation",onClick:S=>e.removeDart(k)},"✕",8,cs)]))),128)),(o(!0),d(F,null,H(3-e.dartInput.darts.length,r=>(o(),d("div",{key:"e"+r,class:"flex h-[2.4rem] flex-1 items-center justify-center rounded-xl border border-dashed border-[#1e3050] bg-[#060d18]/60 font-mono text-xs text-[#1e3050]"},"—"))),128))]),t("div",us,[(o(!0),d(F,null,H(T.value,r=>(o(),d("div",{key:"cs"+r,class:B(["flex flex-col overflow-hidden rounded-xl transition-opacity",e.segClosedByAll(r)?"border border-[#131720] bg-[#090d12] opacity-30":"border border-slate-500/20 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] shadow-md shadow-black/30 ring-1 ring-white/[0.05]"])},[t("div",ms,[ae(oe(pe),{hits:e.myHitsFor(r),dimmed:e.segClosedByAll(r),size:13},null,8,["hits","dimmed"]),t("span",{class:B(["text-sm font-extrabold tabular-nums leading-none",e.segClosedByAll(r)?"text-[#3a4a63] line-through":"text-[#f5a623]"])},y(v(r)),3)]),t("div",bs,[(o(),d(F,null,H(3,k=>t("button",{key:k,type:"button",class:B(["flex flex-1 items-center justify-center rounded-lg text-[11px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20",e.myHitsFor(r)>=3?"bg-emerald-950/70 text-emerald-500/80":k===3?"bg-[#2a1e0a] text-[#f5a623] hover:bg-[#3a2a0e]":k===2?"bg-[#0a1828] text-sky-300/90 hover:bg-[#0e2035]":"bg-[#1a2030] text-[#c0c8d8] hover:bg-[#222a3c]"]),disabled:e.segClosedByAll(r)||e.dartInput.darts.length>=3,onClick:S=>e.addCricketDart(r,k)},y(k)+"×",11,fs)),64))])],2))),128))]),t("div",xs,[e.cricketSdtHasBull?(o(),d("div",{key:0,class:B(["flex-[2] overflow-hidden rounded-xl transition-opacity",e.segClosedByAll(25)?"border border-[#131720] bg-[#090d12] opacity-30":"border border-[#1e3050] bg-gradient-to-b from-[#101c32] to-[#060d14] shadow-md ring-1 ring-white/[0.05]"])},[t("div",ps,[ae(oe(pe),{hits:e.myHitsFor(25),dimmed:e.segClosedByAll(25),size:13},null,8,["hits","dimmed"]),t("span",{class:B(["text-sm font-extrabold leading-none",e.segClosedByAll(25)?"text-[#3a4a63] line-through":"text-[#ff5252]"])},"25",2)]),t("div",gs,[t("button",{type:"button",class:B(["flex flex-1 items-center justify-center rounded-lg py-0.5 text-[11px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20",e.myHitsFor(25)>=3?"bg-emerald-950/70 text-emerald-500/80":"bg-[#1a2030] text-[#c0c8d8] hover:bg-[#222a3c]"]),disabled:e.segClosedByAll(25)||e.dartInput.darts.length>=3,onClick:a[0]||(a[0]=r=>e.addCricketDart(25,1))},"1×",10,hs),t("button",{type:"button",class:B(["flex flex-[2] items-center justify-center rounded-lg py-0.5 text-[12px] font-bold transition active:scale-90 touch-manipulation disabled:opacity-20",e.myHitsFor(25)>=3?"bg-emerald-950/70 text-emerald-500/80":"bg-[#200a0f] text-[#ff5252] hover:bg-[#2c0e14]"]),disabled:e.segClosedByAll(25)||e.dartInput.darts.length>=3,onClick:a[1]||(a[1]=r=>e.addCricketDart(25,2))},"2× Bull",10,vs)])],2)):z("",!0),t("button",{type:"button",class:"flex-1 rounded-xl border border-rose-900/35 bg-[#1a0a0f] py-1 text-[11px] font-black uppercase tracking-wide text-rose-300/80 transition hover:bg-[#241018] active:scale-[0.97] touch-manipulation disabled:opacity-20",disabled:e.dartInput.darts.length>=3,onClick:a[2]||(a[2]=r=>e.addCricketDart(0,0))},"Miss",8,ys)]),t("div",ks,[t("button",{type:"button",class:"flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#1e3050] bg-[#0f1c30] py-2.5 text-sm font-bold text-slate-300 transition hover:bg-[#162540] active:scale-[0.97] touch-manipulation",onClick:a[3]||(a[3]=(...r)=>e.undo&&e.undo(...r))},[...a[14]||(a[14]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round",class:"w-4 h-4 shrink-0"},[t("path",{d:"M7.5 5H13a4 4 0 0 1 0 8H7"}),t("polyline",{points:"4 5 7.5 2 7.5 8"})],-1),X(" Atsaukt ",-1)])]),t("button",{type:"button",class:"flex-1 rounded-2xl bg-amber-500 py-2.5 text-sm font-black text-black shadow-lg shadow-amber-950/30 transition hover:bg-amber-400 active:scale-[0.97] touch-manipulation disabled:opacity-40",disabled:e.dartInput.darts.length===0||e.submitting,onClick:a[4]||(a[4]=(...r)=>e.submitThrow&&e.submitThrow(...r))},y(e.submitting?"...":"Iesniegt →"),9,ws)])],64)):(o(),d(F,{key:2},[t("div",Ts,[a[15]||(a[15]=t("span",{class:"text-[10px] font-black uppercase tracking-widest text-slate-500"},"Šīs kārtas",-1)),t("div",Cs,[(o(),d(F,null,H(3,r=>t("span",{key:r,class:B(["h-1.5 w-1.5 rounded-full transition-all",r<=e.dartInput.darts.length?"bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,.5)]":"bg-[#1e3050]"])},null,2)),64))])]),t("div",Ss,[(o(!0),d(F,null,H(e.dartInput.darts,(r,k)=>(o(),d("div",{key:k,class:"group relative flex min-h-[3.5rem] min-w-0 flex-1 flex-col justify-center rounded-xl border border-[#162540] bg-[#0f1c30] px-1.5 py-2 text-center touch-manipulation"},[t("div",As,y(e.dartLabel(r)),1),t("div",Ns,y(e.dartValue(r)>0?e.dartValue(r):"—"),1),t("button",{type:"button",class:"absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-xs text-white shadow-md transition hover:bg-red-600 sm:h-6 sm:w-6",onClick:S=>e.removeDart(k)},"✕",8,Bs)]))),128)),(o(!0),d(F,null,H(3-e.dartInput.darts.length,r=>(o(),d("div",{key:"e"+r,class:"flex min-h-[3.5rem] flex-1 items-center justify-center rounded-xl border border-dashed border-[#1e3050] bg-[#060d18]/80 font-mono text-xs text-[#1e3050]"},"—"))),128))]),t("div",Ms,[t("div",js,[t("div",$s,[(o(!0),d(F,null,H(e.cricketPadSplit.left,r=>(o(),d("div",{key:"il"+r,class:"rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]"},[t("div",Rs,[a[16]||(a[16]=t("span",{class:"text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"},"Lauks",-1)),t("span",Fs,y(r),1)]),t("div",Ls,[(o(),d(F,null,H(3,k=>t("button",{key:k,type:"button",class:B(["relative flex select-none items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm ring-1 ring-inset transition active:scale-[0.96] touch-manipulation disabled:opacity-20",[e.myHitsFor(r)>=3?"!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15":k===3?"border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-amber-300/15 hover:from-amber-500/50":k===2?"border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-sky-300/15 hover:from-sky-500/55":"border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-white/10 hover:from-slate-500/55"]]),disabled:e.segClosedByAll(r)||e.dartInput.darts.length>=3,onClick:S=>e.addCricketDart(r,k)},[t("span",zs,y(k)+"×",1),e.myHitsFor(r)>=3?(o(),d("span",Hs,"✓")):z("",!0)],10,Is)),64))])]))),128))]),t("div",Ps,[(o(!0),d(F,null,H(e.cricketPadSplit.right,r=>(o(),d("div",{key:"ir"+r,class:"rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]"},[t("div",Ds,[a[17]||(a[17]=t("span",{class:"text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"},"Lauks",-1)),t("span",Es,y(r),1)]),t("div",Gs,[(o(),d(F,null,H(3,k=>t("button",{key:k,type:"button",class:B(["relative flex select-none items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm ring-1 ring-inset transition active:scale-[0.96] touch-manipulation disabled:opacity-20",[e.myHitsFor(r)>=3?"!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15":k===3?"border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-amber-300/15 hover:from-amber-500/50":k===2?"border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-sky-300/15 hover:from-sky-500/55":"border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-white/10 hover:from-slate-500/55"]]),disabled:e.segClosedByAll(r)||e.dartInput.darts.length>=3,onClick:S=>e.addCricketDart(r,k)},[t("span",Vs,y(k)+"×",1),e.myHitsFor(r)>=3?(o(),d("span",Ws,"✓")):z("",!0)],10,Us)),64))])]))),128))])])]),e.cricketSdtHasBull?(o(),d("div",qs,[a[20]||(a[20]=t("div",{class:"mb-1.5 flex items-center justify-between gap-2 px-0.5"},[t("span",{class:"text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"},"Bull"),t("span",{class:"rounded-xl border border-rose-900/40 bg-[#1a0a0f] px-2.5 py-1 text-xl font-black tabular-nums text-rose-300/90"},"25")],-1)),t("div",Os,[t("button",{type:"button",class:B(["relative flex select-none items-center justify-center overflow-hidden rounded-xl border border-emerald-700/45 bg-gradient-to-b from-emerald-800/50 to-emerald-950/95 px-1 py-2.5 text-emerald-100 shadow-sm ring-1 ring-inset ring-emerald-500/15 transition hover:from-emerald-700/55 active:scale-[0.96] touch-manipulation disabled:opacity-20",e.myHitsFor(25)>=3?"!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950":""]),disabled:e.segClosedByAll(25)||e.dartInput.darts.length>=3,onClick:a[5]||(a[5]=r=>e.addCricketDart(25,1))},[a[18]||(a[18]=t("span",{class:"text-xl font-black tabular-nums leading-none"},"1×",-1)),e.myHitsFor(25)>=3?(o(),d("span",Xs,"✓")):z("",!0)],10,Ks),t("button",{type:"button",class:B(["relative flex select-none items-center justify-center overflow-hidden rounded-xl border border-red-800/50 bg-gradient-to-b from-red-800/55 to-red-950/95 px-1 py-2.5 text-red-50 shadow-md ring-1 ring-inset ring-red-500/20 transition hover:from-red-700/60 active:scale-[0.96] touch-manipulation disabled:opacity-20",e.myHitsFor(25)>=3?"!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/30":""]),disabled:e.segClosedByAll(25)||e.dartInput.darts.length>=3,onClick:a[6]||(a[6]=r=>e.addCricketDart(25,2))},[a[19]||(a[19]=t("span",{class:"text-2xl font-black tabular-nums leading-none"},"2×",-1)),e.myHitsFor(25)>=3?(o(),d("span",Js,"✓")):z("",!0)],10,_s)])])):z("",!0),t("button",{type:"button",class:"shrink-0 w-full select-none rounded-2xl border border-rose-900/40 bg-[#1a0a0f] py-3 text-xs font-black uppercase tracking-wide text-rose-300/90 transition hover:bg-[#2a1218] active:scale-95 touch-manipulation disabled:opacity-20",disabled:e.dartInput.darts.length>=3,onClick:a[7]||(a[7]=r=>e.addCricketDart(0,0))},"Miss",8,Qs),t("div",Zs,[t("button",{type:"button",class:"flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#1e3050] bg-[#162540] py-3.5 text-sm font-bold text-slate-200 transition hover:bg-[#1e3050] active:scale-[0.97] touch-manipulation",onClick:a[8]||(a[8]=(...r)=>e.undo&&e.undo(...r))},[...a[21]||(a[21]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round",class:"w-4 h-4 shrink-0"},[t("path",{d:"M7.5 5H13a4 4 0 0 1 0 8H7"}),t("polyline",{points:"4 5 7.5 2 7.5 8"})],-1),X(" Atsaukt ",-1)])]),t("button",{type:"button",class:"flex-1 rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-black shadow-lg shadow-amber-950/30 transition hover:bg-amber-400 active:scale-[0.97] touch-manipulation disabled:opacity-40",disabled:e.dartInput.darts.length===0||e.submitting,onClick:a[9]||(a[9]=(...r)=>e.submitThrow&&e.submitThrow(...r))},y(e.submitting?"...":"Iesniegt →"),9,Ys)])],64))],2)}}},ea=["data-cricket-canvas"],ta={class:"flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden"},sa={class:"flex shrink-0 items-center gap-2"},aa=["width","height"],na={key:0,class:"text-[12px] font-bold"},ra={key:0,class:"h-4 w-px shrink-0 bg-[#1e2738]"},la={class:"flex shrink-0 gap-1.5"},ia={class:"font-bold text-[#e8eaf0]"},oa={class:"font-bold text-[#e8eaf0]"},da={class:"ml-auto flex shrink-0 items-center gap-2"},ca=["title"],ua={key:0,class:"hidden items-center gap-3 lg:flex"},ma={class:"flex items-center gap-1.5"},ba={class:"flex items-center gap-1.5"},fa={class:"flex items-center gap-1.5"},xa={key:0,class:"shrink-0 border-b border-amber-700/40 bg-amber-950/50 px-2 py-2 text-center text-[10px] font-semibold leading-snug text-amber-100"},pa={key:1,class:"flex shrink-0 items-center gap-2 border-b border-[#162540] bg-[#0d1526]/95 px-2 py-1.5"},ga={class:"hidden text-[10px] font-black uppercase tracking-widest text-slate-500 md:inline"},ha={class:"h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#1e3050]"},va={class:"w-12 shrink-0 text-right font-mono text-[11px] font-black tabular-nums text-amber-400"},ya={class:"flex shrink-0 gap-1.5 px-2.5 pt-2"},ka={key:0,class:"absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},wa={class:"mb-1.5 flex items-center gap-2"},Ta={key:0,class:"h-2 w-2 shrink-0 rounded-full bg-[#f5a623]"},Ca={class:"text-[36px] font-black leading-none tracking-tight text-[#e8eaf0]"},Sa=["title"],Aa={class:"font-bold uppercase tracking-wide text-amber-600/90"},Na={class:"font-mono font-black text-amber-100/90"},Ba={class:"mt-1 text-[11px] text-[#7b8ba8]"},Ma={class:"ml-0.5 font-bold text-[#e8eaf0]"},ja={class:"ml-0.5 font-bold text-[#e8eaf0]"},$a={class:"flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 pt-1.5"},Ra={class:"flex min-h-0 flex-1 flex-col overflow-hidden"},Fa={class:"flex shrink-0 border-b border-[#1a2030] px-1"},La={class:"flex-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]"},Ia={class:"flex-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]"},za={class:"flex flex-1 items-center justify-center"},Ha={class:"flex w-[4.5rem] shrink-0 items-center justify-center"},Pa={key:0,class:"mt-0.5 text-[6px] font-bold uppercase tracking-wider text-[#ff525270]"},Da={class:"flex flex-1 items-center justify-center"},Ea={class:"flex min-h-0 flex-1 flex-col overflow-y-auto"},Ga={key:3,class:"flex min-h-0 flex-1 overflow-hidden"},Ua={class:"flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"},Va={class:"min-w-0 flex-1 pr-1"},Wa={key:0,class:"absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},qa={class:"mb-1 flex items-center gap-2"},Oa={key:0,class:"h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]"},Ka={class:"text-[38px] font-extrabold leading-none tracking-tight text-[#e8eaf0]"},Xa={class:"mt-1 flex items-end justify-between gap-2"},_a=["title"],Ja={class:"text-[9px] font-bold uppercase tracking-wide text-amber-500/90"},Qa={class:"text-base font-black tabular-nums text-amber-100"},Za={class:"flex flex-col items-end gap-1"},Ya={class:"flex gap-0.5"},en={class:"text-right text-[11px] text-[#7b8ba8]"},tn={class:"font-bold text-[#e8eaf0]"},sn={class:"mx-1 font-bold text-[#e8eaf0]"},an={class:"min-w-0 flex-1 pl-1"},nn={key:0,class:"absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-[#f5a623] to-[#f5c842]"},rn={class:"mb-1 flex items-center gap-2"},ln={key:0,class:"h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5a623]"},on={class:"text-[38px] font-extrabold leading-none tracking-tight text-[#e8eaf0]"},dn={class:"mt-1 flex items-end justify-between gap-2"},cn=["title"],un={class:"text-[9px] font-bold uppercase tracking-wide text-amber-500/90"},mn={class:"text-base font-black tabular-nums text-amber-100"},bn={class:"flex flex-col items-end gap-1"},fn={class:"flex gap-0.5"},xn={class:"text-right text-[11px] text-[#7b8ba8]"},pn={class:"font-bold text-[#e8eaf0]"},gn={class:"mx-1 font-bold text-[#e8eaf0]"},hn={class:"flex shrink-0 px-2 pb-1 pt-0.5"},vn={class:"flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2"},yn={class:"flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#162540] bg-[#0f1c30]/90 shadow-inner"},kn={class:"flex min-h-0 flex-1 flex-col overflow-hidden"},wn={class:"flex flex-col items-center justify-center gap-0.5 py-0.5 leading-none"},Tn={key:0,class:"text-[8px] font-bold uppercase tracking-widest text-rose-400/80"},Cn={class:"flex shrink-0 flex-wrap gap-x-4 gap-y-1 border-t border-[#162540] bg-[#0a1120]/40 px-3 py-1.5 text-[11px] text-slate-500"},Sn={class:"inline-flex items-center gap-1.5"},An={class:"inline-flex h-4 w-4 flex-shrink-0 items-center justify-center text-emerald-400/95"},We=310,Nn={__name:"CricketGameAdaptiveLayout",props:{layoutKind:{type:String,required:!0},layoutWidth:{type:Number,default:0},layoutHeight:{type:Number,default:0},state:{type:Object,required:!0},players:{type:Array,default:()=>[]},leftPlayers:{type:Array,default:()=>[]},rightPlayers:{type:Array,default:()=>[]},cricketSdtSegments:{type:Array,default:()=>[]},cricketSdtNonBull:{type:Array,default:()=>[]},cricketSdtHasBull:{type:Boolean,default:!1},cricketPadSplit:{type:Object,default:()=>({left:[],right:[]})},legsConfigTotal:{type:Number,default:1},setsConfigTotal:{type:Number,default:1},legsToWin:{type:Number,default:1},isMatchActive:{type:Boolean,default:!1},isSuspended:{type:Boolean,default:!1},auth:{type:Object,default:null},dartInput:{type:Object,required:!0},submitting:{type:Boolean,default:!1},waitingForTurnUi:{type:Boolean,default:!1},showTurnTimeoutWaitingBanner:{type:Boolean,default:!1},turnTimerRowVisible:{type:Boolean,default:!1},turnTimerProgress:{type:Number,default:0},turnTimerRemainingSec:{type:Number,default:0},scorecardGridStyle:{type:Object,required:!0},scorecardRowGridStyle:{type:Object,required:!0},hitsFor:{type:Function,required:!0},segClosedByAll:{type:Function,required:!0},myHitsFor:{type:Function,required:!0},dartLabel:{type:Function,required:!0},dartValue:{type:Function,required:!0},formatTurnClock:{type:Function,required:!0},addCricketDart:{type:Function,required:!0},removeDart:{type:Function,required:!0},submitThrow:{type:Function,required:!0},undo:{type:Function,required:!0},exitGameSaving:{type:Function,required:!0},onShowAbandon:{type:Function,required:!0}},setup(e){const x=e,T=Oe(),g=N=>T.t(N),c=f(()=>x.layoutKind==="portrait"),v=f(()=>x.layoutKind==="square"),m=f(()=>c.value?430:v.value?800:1280),a=f(()=>c.value?932:v.value?800:720),b=f(()=>{const N=Math.max(1,x.layoutWidth||1),i=Math.max(1,x.layoutHeight||1);return Math.min(N/m.value,i/a.value)}),h=f(()=>{const N=b.value;return{width:`${m.value*N}px`,height:`${a.value*N}px`,flexShrink:"0"}}),r=f(()=>({width:`${m.value}px`,height:`${a.value}px`,transform:`scale(${b.value})`,transformOrigin:"top left"})),k=f(()=>c.value?48:v.value?46:48),S=f(()=>c.value?"100%":v.value?"268px":"320px"),U=f(()=>c.value?"80px":v.value?"120px":"180px");function p(N){var i,$;return Number(N)===Number(($=(i=x.state)==null?void 0:i.current_player)==null?void 0:$.id)}function P(N){return N===25?"25":String(N)}return(N,i)=>{var $,j,G,q,_,ne;return o(),d("div",{class:"flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#040609]","data-cricket-canvas":e.layoutKind},[t("div",ta,[t("div",{class:"relative shrink-0 overflow-hidden rounded-sm shadow-2xl shadow-black/40",style:se(h.value)},[t("div",{class:"absolute left-0 top-0 flex flex-col overflow-hidden bg-[#0b0e14] font-sans text-[#e8eaf0]",style:se(r.value)},[t("div",{class:"flex shrink-0 items-center gap-2 border-b border-[#1e2738] bg-[#0c1018]",style:se({height:k.value+"px",padding:c.value?"0 14px":"0 16px",gap:c.value?"10px":"12px"})},[t("div",sa,[t("div",{class:"flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f5a623] to-[#f5c842]",style:se({width:c.value?"24px":"26px",height:c.value?"24px":"26px"})},[(o(),d("svg",{class:"text-[#0b0e14]",width:c.value?13:14,height:c.value?13:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round"},[...i[2]||(i[2]=[t("circle",{cx:"12",cy:"12",r:"10"},null,-1),t("circle",{cx:"12",cy:"12",r:"6"},null,-1),t("circle",{cx:"12",cy:"12",r:"2"},null,-1)])],8,aa))],4),c.value?z("",!0):(o(),d("span",na,"traindart"))]),c.value?z("",!0):(o(),d("div",ra)),i[7]||(i[7]=t("span",{class:"min-w-0 flex-1 truncate text-[13px] font-bold"},"Cricket",-1)),t("div",la,[t("div",{class:B(["rounded-md border border-[#1e2738] bg-[#131720] text-[10px] font-semibold text-[#7b8ba8]",c.value?"px-2 py-0.5":"px-2.5 py-0.5"])},[X(y(c.value?"L":"Leg"),1),t("span",ia,y(e.state.current_leg),1),X("/"+y(e.legsConfigTotal),1)],2),e.setsConfigTotal>1?(o(),d("div",{key:0,class:B(["rounded-md border border-[#1e2738] bg-[#131720] text-[10px] font-semibold text-[#7b8ba8]",c.value?"px-2 py-0.5":"px-2.5 py-0.5"])},[X(y(c.value?"S":"Set"),1),t("span",oa,y(e.state.current_set),1),X("/"+y(e.setsConfigTotal),1)],2)):z("",!0)]),t("div",da,[t("span",{class:"hidden max-w-[8rem] truncate font-mono text-[9px] text-[#3a4a63] sm:inline",title:e.layoutKind+" · "+e.layoutWidth+"×"+e.layoutHeight},y(e.state.room_code),9,ca),c.value?z("",!0):(o(),d("div",ua,[t("div",ma,[ae(oe(be),{hits:1,closed:!1,size:"board-sm"}),i[3]||(i[3]=t("span",{class:"text-[9px] text-[#7b8ba8]"},"1×",-1))]),t("div",ba,[ae(oe(be),{hits:2,closed:!1,size:"board-sm"}),i[4]||(i[4]=t("span",{class:"text-[9px] text-[#7b8ba8]"},"2×",-1))]),t("div",fa,[ae(oe(be),{hits:3,closed:!1,size:"board-sm"}),i[5]||(i[5]=t("span",{class:"text-[9px] text-[#7b8ba8]"},"slēgts",-1))])])),i[6]||(i[6]=t("div",{class:"h-4 w-px shrink-0 bg-[#1e2738]"},null,-1)),(e.isMatchActive||e.isSuspended)&&(($=e.auth)!=null&&$.user)?(o(),d("button",{key:1,type:"button",class:B(["shrink-0 rounded-md border border-[#252d3d] bg-transparent text-[11px] font-semibold text-[#7b8ba8] hover:bg-[#131720]",c.value?"px-2.5 py-1":"px-3 py-1"]),onClick:i[0]||(i[0]=(...l)=>e.exitGameSaving&&e.exitGameSaving(...l))},y(g("game.exitSave")),3)):z("",!0),e.isMatchActive&&((j=e.auth)!=null&&j.user)?(o(),d("button",{key:2,type:"button",class:B(["shrink-0 rounded-md border border-[#3a1515] bg-[#2a1010] text-[11px] font-semibold text-[#ff5252]",c.value?"px-2.5 py-1":"px-3 py-1"]),onClick:i[1]||(i[1]=(...l)=>e.onShowAbandon&&e.onShowAbandon(...l))}," Pārtraukt ",2)):z("",!0)])],4),e.isMatchActive&&e.showTurnTimeoutWaitingBanner?(o(),d("div",xa,y(g("game.turnTimer.waitingOpponentChoice")),1)):e.turnTimerRowVisible?(o(),d("div",pa,[t("span",ga,y(g("game.turnTimer.label")),1),t("div",ha,[t("div",{class:"h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear",style:se({width:e.turnTimerProgress+"%"})},null,4)]),t("span",va,y(e.formatTurnClock(e.turnTimerRemainingSec)),1)])):z("",!0),c.value?(o(),d(F,{key:2},[t("div",ya,[(o(!0),d(F,null,H(e.players,l=>{var O;return o(),d("div",{key:"pc-"+l.id,class:B(["relative min-w-0 flex-1 overflow-hidden rounded-[12px] border px-3.5 py-3",p(l.id)?"border-[#f5a62345] bg-[#1b2232]":"border-[#1e2738] bg-[#131720]"])},[p(l.id)?(o(),d("div",ka)):z("",!0),t("div",wa,[p(l.id)?(o(),d("span",Ta)):z("",!0),t("span",{class:B(["truncate text-[14px] font-bold",p(l.id)?"text-[#f5a623]":"text-[#8ea0bf]"])},y(l.name),3)]),t("div",Ca,y(((O=l.cricket)==null?void 0:O.points)??0),1),t("div",{class:"mt-1 flex items-center justify-between text-[10px] text-[#7b8ba8]",title:g("game.cricketAvgHint")},[t("span",Aa,y(g("game.cricketAvgShort")),1),t("span",Na,y(l.avg_pts??"—"),1)],8,Sa),t("div",Ba,[i[8]||(i[8]=X(" S:",-1)),t("span",Ma,y(l.sets_won??0),1),i[9]||(i[9]=X(" L:",-1)),t("span",ja,y(l.legs_won??0),1)])],2)}),128))]),t("div",$a,[t("div",Ra,[t("div",Fa,[t("div",La,y(((q=(G=e.leftPlayers[0])==null?void 0:G.name)==null?void 0:q.slice(0,8))||"—"),1),i[10]||(i[10]=t("div",{class:"w-20 shrink-0 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#252d3d]"},"LAUKS",-1)),t("div",Ia,y(((ne=(_=e.rightPlayers[0])==null?void 0:_.name)==null?void 0:ne.slice(0,8))||"—"),1)]),(o(!0),d(F,null,H(e.cricketSdtSegments,(l,O)=>{var L,ue;return o(),d("div",{key:"pr-"+l,class:B(["flex min-h-0 flex-1 basis-0 items-center border-b border-[#0d1016] transition-colors",[e.segClosedByAll(l)?"bg-[#060810]/60":O%2!==0?"bg-[#060910]/35":""]])},[t("div",za,[ae(oe(pe),{hits:e.hitsFor((L=e.leftPlayers[0])==null?void 0:L.id,l),dimmed:e.segClosedByAll(l),size:36},null,8,["hits","dimmed"])]),t("div",Ha,[t("div",{class:B(["flex flex-col items-center justify-center rounded-lg border transition-all",e.segClosedByAll(l)?"border-[#151b26] bg-[#0c1016] opacity-35":l===25?"border-[#ff525328] bg-[#1c0808]":"border-[#252d3d] bg-[#1a2030]"]),style:{width:"50px",height:"68%","max-height":"54px","min-height":"28px"}},[t("span",{class:B(["font-extrabold leading-none tracking-tight",[e.segClosedByAll(l)?"text-[#3a4a63] line-through decoration-[#1e2738]":l===25?"text-[#ff5252]":"text-[#f5a623]",l>=20?"text-[15px]":"text-[14px]"]])},y(P(l)),3),l===25&&!e.segClosedByAll(l)?(o(),d("span",Pa,"BULL")):z("",!0)],2)]),t("div",Da,[ae(oe(pe),{hits:e.hitsFor((ue=e.rightPlayers[0])==null?void 0:ue.id,l),dimmed:e.segClosedByAll(l),size:36},null,8,["hits","dimmed"])])],2)}),128))])]),t("div",{class:"flex shrink-0 flex-col overflow-hidden border-t border-[#1e2738] bg-[#0c1018] px-2 pb-3 pt-2",style:se({height:We+"px",minHeight:We+"px"})},[t("div",Ea,[ae(Ve,{density:"compact",state:e.state,"dart-input":e.dartInput,submitting:e.submitting,"waiting-for-turn-ui":e.waitingForTurnUi,"cricket-pad-split":e.cricketPadSplit,"cricket-sdt-has-bull":e.cricketSdtHasBull,"seg-closed-by-all":e.segClosedByAll,"my-hits-for":e.myHitsFor,"add-cricket-dart":e.addCricketDart,"remove-dart":e.removeDart,"submit-throw":e.submitThrow,undo:e.undo,"dart-label":e.dartLabel,"dart-value":e.dartValue},null,8,["state","dart-input","submitting","waiting-for-turn-ui","cricket-pad-split","cricket-sdt-has-bull","seg-closed-by-all","my-hits-for","add-cricket-dart","remove-dart","submit-throw","undo","dart-label","dart-value"])])],4)],64)):(o(),d("div",Ga,[t("div",Ua,[t("div",{class:B(["flex shrink-0 gap-0 px-2 pt-2",v.value?"px-2":"px-2.5"])},[t("div",Va,[(o(!0),d(F,null,H(e.leftPlayers,l=>{var O;return o(),d("div",{key:"lc-"+l.id,class:B(["relative mb-1 overflow-hidden rounded-[10px] border px-4 py-3 last:mb-0",p(l.id)?"border-[#f5a62348] bg-[#1b2232]":"border-[#1e2738] bg-[#131720]"])},[p(l.id)?(o(),d("div",Wa)):z("",!0),t("div",qa,[p(l.id)?(o(),d("span",Oa)):z("",!0),t("span",{class:B(["truncate text-sm font-semibold",p(l.id)?"text-[#f5a623]":"text-[#7b8ba8]"])},y(l.name),3)]),t("div",Ka,y(((O=l.cricket)==null?void 0:O.points)??0),1),t("div",Xa,[t("div",{class:"flex flex-col gap-0.5",title:g("game.cricketAvgHint")},[t("span",Ja,y(g("game.cricketAvgShort")),1),t("span",Qa,y(l.avg_pts??"—"),1)],8,_a),t("div",Za,[t("div",Ya,[(o(!0),d(F,null,H(e.legsToWin,L=>(o(),d("div",{key:L,class:B(["h-1.5 w-1.5 rounded-full border transition-all",L<=(l.legs_won||0)?"border-amber-400 bg-amber-400":"border-[#1e3050]"])},null,2))),128))]),t("div",en,[t("span",tn,y(l.sets_won??0),1),i[11]||(i[11]=X(" S ",-1)),t("span",sn,y(l.legs_won??0),1),i[12]||(i[12]=X(" L ",-1))])])])],2)}),128))]),t("div",{class:"flex shrink-0 items-center justify-center text-[9px] font-bold uppercase tracking-widest text-[#2e3a50]",style:se({width:U.value})}," LAUKS ",4),t("div",an,[(o(!0),d(F,null,H(e.rightPlayers,l=>{var O;return o(),d("div",{key:"rc-"+l.id,class:B(["relative mb-1 overflow-hidden rounded-[10px] border px-4 py-3 last:mb-0",p(l.id)?"border-[#f5a62348] bg-[#1b2232]":"border-[#1e2738] bg-[#131720]"])},[p(l.id)?(o(),d("div",nn)):z("",!0),t("div",rn,[p(l.id)?(o(),d("span",ln)):z("",!0),t("span",{class:B(["truncate text-sm font-semibold",p(l.id)?"text-[#f5a623]":"text-[#7b8ba8]"])},y(l.name),3)]),t("div",on,y(((O=l.cricket)==null?void 0:O.points)??0),1),t("div",dn,[t("div",{class:"flex flex-col gap-0.5",title:g("game.cricketAvgHint")},[t("span",un,y(g("game.cricketAvgShort")),1),t("span",mn,y(l.avg_pts??"—"),1)],8,cn),t("div",bn,[t("div",fn,[(o(!0),d(F,null,H(e.legsToWin,L=>(o(),d("div",{key:L,class:B(["h-1.5 w-1.5 rounded-full border transition-all",L<=(l.legs_won||0)?"border-amber-400 bg-amber-400":"border-[#1e3050]"])},null,2))),128))]),t("div",xn,[t("span",pn,y(l.sets_won??0),1),i[13]||(i[13]=X(" S ",-1)),t("span",gn,y(l.legs_won??0),1),i[14]||(i[14]=X(" L ",-1))])])])],2)}),128))])],2),t("div",hn,[i[15]||(i[15]=t("div",{class:"flex-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#1e2738]"},"trāpījumi",-1)),t("div",{class:"shrink-0",style:se({width:U.value})},null,4),i[16]||(i[16]=t("div",{class:"flex-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#1e2738]"},"trāpījumi",-1))]),t("div",vn,[t("div",yn,[t("div",{class:"shrink-0 border-b border-[#162540] bg-[#0a1120]/60 py-2",style:se(e.scorecardGridStyle)},[(o(!0),d(F,null,H(e.leftPlayers,l=>(o(),d("div",{key:"lh-"+l.id,class:B(["truncate px-1 text-center text-xs font-bold",p(l.id)?"text-amber-400":"text-slate-500"])},y(l.name),3))),128)),i[17]||(i[17]=t("div",{class:"text-center text-[10px] font-black uppercase tracking-widest text-slate-500"},"Lauks",-1)),(o(!0),d(F,null,H(e.rightPlayers,l=>(o(),d("div",{key:"rh-"+l.id,class:B(["truncate px-1 text-center text-xs font-bold",p(l.id)?"text-amber-400":"text-slate-500"])},y(l.name),3))),128))],4),t("div",kn,[(o(!0),d(F,null,H(e.cricketSdtSegments,(l,O)=>(o(),d("div",{key:"sr-"+l,class:B(["min-h-0 min-w-0 flex-1 basis-0 border-b border-[#162540]/40 transition-all last:border-b-0",[O%2===0?"bg-[#0a1120]/25":"",e.segClosedByAll(l)?"opacity-25":""]]),style:se(e.scorecardRowGridStyle)},[(o(!0),d(F,null,H(e.leftPlayers,L=>(o(),d("div",{key:"lm-"+L.id+"-"+l,class:"flex min-h-0 min-w-0 items-center justify-center border-r border-[#162540]/30 p-1"},[ae(oe(be),{hits:e.hitsFor(L.id,l),closed:e.segClosedByAll(l),size:"board"},null,8,["hits","closed"])]))),128)),t("div",{class:B(["mx-0.5 my-0.5 flex min-h-0 min-w-0 items-center justify-center rounded-lg px-1 shadow-inner",e.segClosedByAll(l)?"border border-[#1e3050] bg-[#0a1120]/95":"border border-rose-900/40 bg-[#1a0a0f]"])},[t("div",wn,[t("span",{class:B(["select-none font-black tabular-nums",[v.value?"text-[20px]":"text-[22px]",e.segClosedByAll(l)?"text-slate-500 line-through":"text-rose-300/90"]])},y(P(l)),3),l===25&&!e.segClosedByAll(l)?(o(),d("span",Tn,"bull")):z("",!0)])],2),(o(!0),d(F,null,H(e.rightPlayers,L=>(o(),d("div",{key:"rm-"+L.id+"-"+l,class:"flex min-h-0 min-w-0 items-center justify-center border-l border-[#162540]/30 p-1"},[ae(oe(be),{hits:e.hitsFor(L.id,l),closed:e.segClosedByAll(l),size:"board"},null,8,["hits","closed"])]))),128))],6))),128))]),t("div",Cn,[i[19]||(i[19]=t("span",null,[t("span",{class:"font-mono font-black text-slate-400"},"0"),X(" nav")],-1)),i[20]||(i[20]=t("span",null,[t("span",{class:"font-mono font-black text-sky-400/90"},"1"),X(" viens")],-1)),i[21]||(i[21]=t("span",null,[t("span",{class:"font-mono font-black text-amber-400/90"},"2"),X(" divi")],-1)),t("span",Sn,[t("span",An,[ae(oe(Te),{boosted:!1})]),i[18]||(i[18]=X(" slēgts ",-1))])])])])]),t("div",{class:"flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-[#1e2738] bg-[#0c1018]",style:se({width:S.value,padding:v.value?"12px 10px":"14px 12px"})},[ae(Ve,{density:"default",state:e.state,"dart-input":e.dartInput,submitting:e.submitting,"waiting-for-turn-ui":e.waitingForTurnUi,"cricket-pad-split":e.cricketPadSplit,"cricket-sdt-has-bull":e.cricketSdtHasBull,"seg-closed-by-all":e.segClosedByAll,"my-hits-for":e.myHitsFor,"add-cricket-dart":e.addCricketDart,"remove-dart":e.removeDart,"submit-throw":e.submitThrow,undo:e.undo,"dart-label":e.dartLabel,"dart-value":e.dartValue},null,8,["state","dart-input","submitting","waiting-for-turn-ui","cricket-pad-split","cricket-sdt-has-bull","seg-closed-by-all","my-hits-for","add-cricket-dart","remove-dart","submit-throw","undo","dart-label","dart-value"])],4)]))],4)],4)])],8,ea)}}},Q=3;function Bn(e){const x=Number(e);return x===25?"seg_bull":`seg_${x}`}function Mn(e,x){const T=e==null?void 0:e.cricket;if(!T)return 0;const g=Bn(x);return Math.max(0,Math.min(Q,Number(T[g]??0)))}function Ke(e,x){const T=(x||[]).map(Number),g=(e||[]).map(v=>Number(v.id)),c={};for(const v of g){c[v]={};const m=(e||[]).find(a=>Number(a.id)===v);for(const a of T)c[v][a]=m?Mn(m,a):0}return{hits:c,playerIds:g}}function Xe(e,x,T){var v;const g=(T||[]).map(Number),c={};for(const m of x){c[m]={};for(const a of g)c[m][a]=((v=e==null?void 0:e[m])==null?void 0:v[a])??0}return c}function Ce(e,x,T){const g=Number(T);return(x||[]).length>0&&x.every(c=>{var v;return(((v=e==null?void 0:e[c])==null?void 0:v[g])??0)>=Q})}function _e(e,x,T,g){var m;const c=Number(g),v=Number(T);for(const a of x||[])if(Number(a)!==v&&(((m=e==null?void 0:e[a])==null?void 0:m[c])??0)<Q)return!0;return!1}function Je(e,x,T,g,c,v){var k;const m=(T||[]).map(Number),a=Number(c),b=Number(v),h=Number(g);if(b<=0||a<=0||!m.includes(a)||Ce(e,x,a))return 0;const r=((k=e==null?void 0:e[h])==null?void 0:k[a])??0;return r>=Q?0:Math.min(b,Q-r)}function Qe(e,x,T,g,c){var S;const v=(c||[]).map(Number),m=Number(T),a=Number(g),b=Number(x);if(a<=0||m<=0||!v.includes(m))return;const h=((S=e==null?void 0:e[b])==null?void 0:S[m])??0;if(h>=Q)return;const r=Q-h,k=Math.min(a,r);e[b][m]=h+k}function jn(e,x,T,g){const c=(x||[]).map(Number),{hits:v,playerIds:m}=Ke(e||[],c),a=Xe(v,m,c),b=Number(T);for(const h of g||[])Qe(a,b,h.segment,h.multiplier,c);return{H:a,playerIds:m,segs:c,tid:b}}function $n({hits:e,playerIds:x,segs:T,throwerId:g,segment:c,multiplier:v}){var j;const m=Number(c??0),a=Number(v??0),b=Number(g),h=m>0?((j=e==null?void 0:e[b])==null?void 0:j[m])??0:0,r=Math.max(0,Q-h),k=m>0?Ce(e,x,m):!1,S=Je(e,x,T,b,m,a),U=m>0?_e(e,x,b,m):!1,p=h>=Q&&U,P=Math.max(0,a-S),i=h<Q&&h+S>=Q&&P>0&&U;let $=0;return k||m<=0||a<=0||!(T||[]).map(Number).includes(m)?$=0:p?$=a:$=S+(i?P:0),{myHitsBefore:h,needToClose:r,allClosedBefore:k,effMarks:S,scoredEligible:p,overflowScoredEligible:i,validAmount:$}}function Rn(e,x,T,g){var p;const c=(x||[]).map(Number),{hits:v,playerIds:m}=Ke(T||[],c),a=Xe(v,m,c),b=Number(g),h=[],r=[],k=[];let S=0,U=0;for(const P of e||[]){const N=Number(P.segment??0),i=Number(P.multiplier??0);let $=0,j=!1,G=0;if(N>0&&i>0&&c.includes(N)){const q=((p=a==null?void 0:a[b])==null?void 0:p[N])??0,_=Ce(a,m,N),ne=_e(a,m,b,N);if(!_)if($=Je(a,m,c,b,N,i),q>=Q&&ne)j=!0,G=i;else{const l=Math.max(0,i-$),L=q<Q&&q+$>=Q&&l>0&&ne;G=$+(L?l:0)}Qe(a,b,N,i,c)}h.push($),k.push(j),r.push(G),S+=$,U+=G}return{totalMarks:S,totalValid:U,perDartMarks:h,perDartValid:r,perDartScored:k}}function Fn(e,x,T,g){const c=(x||[]).map(Number),{perDartValid:v}=Rn(e,c,T,g);let m=0,a=!1;const b={},h=[];let r=0;for(let i=0;i<(e||[]).length;i++){const $=e[i],j=Number($.segment??0),G=Number($.multiplier??0),q=Number(v[i]??0),_=q>0;!j||!G||!c.includes(j)||(j===25&&(m+=q,_&&(a=!0)),j!==25&&_&&(r+=q),G===3&&j!==25&&_&&h.push(j),_&&(b[j]||(b[j]=new Set),b[j].add(G)))}const k=h.length===3&&new Set(h).size===1,S=k?h[0]:null,U=h.length===3&&new Set(h).size===3,p=h.length===3&&new Set(h).size===2,P=Object.keys(b).some(i=>{const $=Number(i);if($===25)return!1;const j=b[$];return!!(j&&j.has(1)&&j.has(2)&&j.has(3))}),N=(i,$,j,G,q,_,ne={})=>({tier:i,emoji:$,title:j,sub:G,color:q,glow:_,shake:!1,fullScreen:!1,duration:2200,...ne});return k?N("holyGrail","✨","Holy Grail",`3× triple vienā laukā · T${S}`,"#fde68a","#f59e0b",{shake:!0,fullScreen:!0,duration:4200}):U?N("whitehorse","🐴","White Horse!","3 triples · 3 dažādi lauki","#e2e8f0","#94a3b8",{fullScreen:!0,duration:3500}):p?N("tripleTriples","💥","9 trāpījumi","2× triple vienā laukā + 1× triple citā","#fcd34d","#f59e0b",{shake:!0,duration:2800}):P?N("shanghai","⛩️","Shanghai!","Single · Double · Triple (vienā laukā)","#fca5a5","#ef4444",{duration:2800}):r>=8?N("insaneMark","🔥","Insane Mark!","8 trāpījumi","#fbbf24","#d97706",{shake:!0,duration:3200}):r>=7?N("ultraMark","💥","Ultra Mark!","7 trāpījumi","#f9a8d4","#ec4899",{shake:!0,duration:2900}):m>=6&&a?N("rodeo","🤠","Rodeo!","3× Double Bull","#fcd34d","#d97706",{duration:3e3}):r>=6?N("megaMark","⚡","Mega Mark!","6 trāpījumi","#fde047","#eab308",{shake:!0,duration:2700}):r>=5?N("superMark","🎇","Super Mark!","5 trāpījumi","#fb923c","#ea580c",{duration:2300}):m>=3&&a?N("bulls3","🎯",`${m} Bull!`,`Bull trāpījumi: ${m}`,"#f87171","#dc2626",{duration:2200}):r>=4?N("bigMark","⬡","Big Mark!","4 trāpījumi","#93c5fd","#3b82f6",{duration:1800}):null}const Gn={props:["matchId"],components:{MatchReport:Jt,CricketMarkCell:be,CricketClosedCheck:Te,CricketGameAdaptiveLayout:Nn},setup(e){Wt("body--game-shell");const{layoutKind:x,layoutLabel:T,layoutWidth:g,layoutHeight:c,layoutAspect:v,syncGameScreenLayout:m}=_t(),a=qt(),b=Dt(),h=Oe(),r=s=>h.t(s),k=Et(),S=Vt({darts:[]}),U=E(!1),p=E(null),P=E(null),N=E(null);let i=null;const $=E(1),j=E(!1),G=E(!1),q=E(!0),_=E(null),ne=E(null);let l=null;const O=E(Date.now()),L=E(!1);let ue=null;const D=f(()=>a.state),ge=f(()=>a.isMyTurn),fe=f(()=>a.isMatchActive),Ze=f(()=>a.isSuspended),Ye=f(()=>fe.value&&!ge.value),et=f(()=>{var s,n;return Math.max(1,Number((n=(s=D.value)==null?void 0:s.legs_config)==null?void 0:n.legs)||1)}),tt=f(()=>{var s,n;return Math.max(1,Number((n=(s=D.value)==null?void 0:s.legs_config)==null?void 0:n.sets)||1)}),Se=f(()=>a.undoAvailable),st=f(()=>a.gameType==="x01"),Ae=f(()=>a.gameType==="cricket"),ee=f(()=>a.players),at=f(()=>a.isFinished),nt=f(()=>{var s,n;return Math.ceil((((n=(s=D.value)==null?void 0:s.legs_config)==null?void 0:n.legs)??1)/2)}),me=f(()=>{var s;return((s=D.value)==null?void 0:s.turn_timer)??null}),xe=f(()=>{var s;return!!((s=D.value)!=null&&s.use_turn_timer)}),Ne=f(()=>{const s=me.value;if(!(s!=null&&s.deadline_at))return 0;const n=new Date(s.deadline_at).getTime();return Math.max(0,Math.ceil((n-O.value)/1e3))}),rt=f(()=>{const s=me.value;if(!(s!=null&&s.deadline_at)||s.pending)return 0;const n=Math.max(1,s.window_seconds||300),u=Ne.value;return Math.min(100,Math.max(0,u/n*100))}),lt=f(()=>{if(!xe.value||!fe.value)return!1;const s=me.value;return!!(s!=null&&s.deadline_at&&!s.pending)}),it=f(()=>{var u,w,C,M;if(!xe.value||!fe.value||!((u=me.value)!=null&&u.pending))return!1;const s=(w=b.user)==null?void 0:w.id,n=(M=(C=D.value)==null?void 0:C.current_player)==null?void 0:M.user_id;return s==null||n==null?!1:Number(n)===Number(s)}),Be=f(()=>{var u,w,C,M;if(!xe.value||!fe.value||!((u=me.value)!=null&&u.pending))return!1;const s=(w=b.user)==null?void 0:w.id,n=(M=(C=D.value)==null?void 0:C.current_player)==null?void 0:M.user_id;return s==null||n==null?!1:Number(n)!==Number(s)});function ot(s){const n=Math.max(0,Number(s)||0),u=Math.floor(n/60),w=n%60;return u+":"+String(w).padStart(2,"0")}async function dt(){var s,n,u,w,C;if(!L.value){L.value=!0;try{await a.turnTimeoutGrantExtra()}catch(M){const A=((n=(s=M.response)==null?void 0:s.data)==null?void 0:n.error)||((w=(u=M.response)==null?void 0:u.data)==null?void 0:w.message)||"Kļūda.";(C=window._dartToast)==null||C.call(window,A,"error")}finally{L.value=!1}}}async function ct(){var s,n,u,w,C;if(!L.value){L.value=!0;try{await a.turnTimeoutEndNoStats()}catch(M){const A=((n=(s=M.response)==null?void 0:s.data)==null?void 0:n.error)||((w=(u=M.response)==null?void 0:u.data)==null?void 0:w.message)||"Kļūda.";(C=window._dartToast)==null||C.call(window,A,"error")}finally{L.value=!1}}}const Me=f(()=>{var u;const s=(u=D.value)==null?void 0:u.cricket_segments;return(Array.isArray(s)&&s.length?s:[20,19,18,17,16,15,25]).map(w=>Number(w))});function he(s,n){if(s==null)return 0;const u=Number(s),w=ee.value.find(A=>Number(A.id)===u),C=w==null?void 0:w.cricket;if(!C)return 0;const M=Number(n);return M===25?C.seg_bull??0:C["seg_"+M]??0}function ut(s){var n,u;return he((u=(n=D.value)==null?void 0:n.current_player)==null?void 0:u.id,s)}function mt(s){const n=Number(s);return ee.value.length>0&&ee.value.every(u=>he(u.id,n)>=3)}const je=f(()=>{const s=ee.value.length,n=Math.ceil(s/2),u=Math.floor(s/2);return[...Array(n).fill("1fr"),"minmax(3.25rem, 5vw)",...Array(u).fill("1fr")].join(" ")}),bt=f(()=>({display:"grid",gridTemplateColumns:je.value,alignItems:"center"})),ft=f(()=>({display:"grid",gridTemplateColumns:je.value,alignItems:"stretch",minHeight:0})),xt=f(()=>ee.value.slice(0,Math.ceil(ee.value.length/2))),pt=f(()=>ee.value.slice(Math.ceil(ee.value.length/2)));function gt(s){const n=(s||[]).map(Number),u=new Set(n),w=[...u].filter(A=>A>=1&&A<=20).sort((A,R)=>A-R),C=[...u].filter(A=>(A<1||A>20)&&A!==25).sort((A,R)=>A-R),M=[...w,...C];return u.has(25)&&M.push(25),M}const ve=f(()=>gt(Me.value)),$e=f(()=>ve.value.filter(s=>s!==25)),ht=f(()=>ve.value.includes(25)),vt=f(()=>{const s=$e.value,n=Math.ceil(s.length/2);return{left:s.slice(0,n),right:s.slice(n)}});function yt(s,n){S.darts.length>=3||S.darts.push({segment:s,multiplier:n})}function kt(){S.darts.length>=3||S.darts.push({segment:0,multiplier:0})}function wt(s,n){var te,re,I;if(S.darts.length>=3)return;const u=(re=(te=D.value)==null?void 0:te.current_player)==null?void 0:re.id,w=(((I=D.value)==null?void 0:I.cricket_segments)??[20,19,18,17,16,15,25]).map(Number),C=[...ee.value],{H:M,playerIds:A,segs:R,tid:Y}=jn(C,w,u,S.darts),ie=$n({hits:M,playerIds:A,segs:R,throwerId:Y,segment:s,multiplier:n});S.darts.push({segment:s,multiplier:n,cricketMeta:ie})}function Re(s){S.darts.splice(s,1)}function Fe(s){return s.segment===0?"Miss":s.segment===25&&s.multiplier===2?"Bull":s.segment===25?"Outer":(s.multiplier===2?"D":s.multiplier===3?"T":"S")+s.segment}function Le(s){return s.segment===0?0:s.segment*s.multiplier}function Z(s){return s[Math.floor(Math.random()*s.length)]}function Ie(s,n,u){return s!=null&&n!=null&&(Number(u.current_leg)!==Number(s)||Number(u.current_set)!==Number(n))}function ze(s){return s>=180?"t180":s>=140?"t140":s>=100?"t100":s>=95?"t95":null}function Tt(s){switch(s){case"t95":return"Pīķa zona";case"t100":return"Labi sit!";case"t140":return"Premium gājiens";case"t180":return"TON 80 · EXCELLENT";default:return""}}function Ct(s){const n=Number(s);return!n||n<=0?{coTier:null,title:"",tag:""}:n<=20?{coTier:"co1",title:Z(["Aizvērts!","Ieejamā!","Čau, score!","Klusi, bet precīzi"]),tag:Z(["Kā ar karoti medu.","Miers ir miers.","Mini finišs, liela sirds."])}:n<=40?{coTier:"co2",title:Z(["Slēdzam!","Aizķēries!","Uz mājām!"]),tag:Z(["Jau redzams gals.","Vēl tuvāk kāpām.","Pretinieks nervozē."])}:n<=80?{coTier:"co3",title:Z(["Labs finišs!","Turpinām kāpt!","Score krīt!"]),tag:Z(["Šis sāp pretiniekam.","Kārtīgs gājiens.","Tā turēt!"])}:n<=120?{coTier:"co4",title:Z(["Iespaidīgs checkout!","Augstākā līga!","Meistarība!"]),tag:Z(["Tu dari to pareizi.","Šķīvis klausa.","Tā ir māksla."])}:n<=169?{coTier:"co5",title:Z(["Augstas raudzes finišs!","Reta putna līmenis!","Ko tu dari ar šķīvi?!"]),tag:Z(["Šito rāda atkārtojumā.","Kā no grāmatas.","Elite."])}:{coTier:"coTop",title:Z(["LEĠENDĀRS!","170 klubs!","Meistarklase!"]),tag:Z(["Aplausi. Tu to nopelnīji.","Šādu redz reti.","Respekts."])}}function St(s){const n=s==null?void 0:s.kind,u=s==null?void 0:s.checkoutTitle,w=u?"ring-2 ring-emerald-500/30 border-emerald-600/45":"";if(n==="bust")return"border-rose-500/75 bg-gradient-to-br from-rose-950/98 via-[#1a0a0f]/95 to-slate-900/98 shadow-xl shadow-rose-900/40 ring-1 ring-rose-500/30";if(n==="miss")return"border-slate-500/70 bg-slate-900/98 shadow-lg shadow-black/40 ring-1 ring-slate-600/30";if(n==="high"){const C=s.highTier;if(C==="t95")return`border-amber-700/50 bg-gradient-to-br from-slate-900/98 to-[#0f172a]/98 shadow-md ${w}`.trim();if(C==="t100")return`border-amber-400/65 bg-gradient-to-br from-amber-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-lg shadow-amber-900/25 ${w}`.trim();if(C==="t140")return`border-fuchsia-400/55 bg-gradient-to-br from-fuchsia-950/85 via-amber-950/50 to-[#0a1120]/98 shadow-xl shadow-fuchsia-900/30 ${w}`.trim();if(C==="t180")return`border-yellow-300/70 bg-gradient-to-br from-yellow-950/90 via-amber-900/60 to-slate-950/98 shadow-2xl shadow-amber-500/35 ${w}`.trim()}return u?"border-emerald-500/55 bg-gradient-to-br from-emerald-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-xl shadow-emerald-900/25":"border-slate-600 bg-slate-800/95"}function At(s){const n=[],u=s==null?void 0:s.kind;return u==="bust"?n.push("dt-x01-toast-bust"):u==="miss"?n.push("dt-x01-toast-miss"):u==="high"&&(s.highTier==="t95"?n.push("dt-x01-tier-95"):s.highTier==="t100"?n.push("dt-x01-tier-100"):s.highTier==="t140"?n.push("dt-x01-tier-140"):s.highTier==="t180"&&n.push("dt-x01-tier-180")),s.checkoutTitle&&n.push("dt-x01-co-pop"),n.join(" ")}function Nt(s){return s.kind==="bust"?"text-rose-300":s.kind==="miss"?"text-slate-400":s.highTier==="t95"?"text-amber-200/90 text-[11px] sm:text-xs font-black tracking-[0.18em]":s.highTier==="t100"?"text-amber-200 text-xs sm:text-sm font-black tracking-wide":s.highTier==="t140"?"text-fuchsia-200 text-sm sm:text-base font-black tracking-tight":s.highTier==="t180"?"text-yellow-200 text-base sm:text-lg font-black drop-shadow-[0_0_14px_rgba(250,204,21,0.4)]":s.checkoutTitle&&s.kind==="normal"?"text-emerald-300 text-xs sm:text-sm font-black":"text-slate-200 text-xs font-bold"}const Bt=["Legs iekārtots!","Šajā legā — tu!","Kāpes augšā!","Punkts pievienots!","Uzvaras aplis!"];function He({winnerName:s,wonSet:n,wonLeg:u},w){setTimeout(()=>{P.value={winnerName:s,wonSet:n,wonLeg:u,line:Z(Bt)},setTimeout(()=>{P.value=null},5e3)},w)}function Mt(s,{throwerId:n,prevLeg:u,prevSet:w,prevRemaining:C,data:M}){const A=s.reduce((ce,ke)=>ce+Le(ke),0),R=s.map(Fe),Y=Ie(u,w,M),ie=M.players||[],te=n!=null?ie.find(ce=>Number(ce.id)===Number(n)):null,re=te==null?void 0:te.remaining;let I="normal";A===0?I="miss":!Y&&C!=null&&re!=null&&Number(C)===Number(re)?I="bust":ze(A)&&(I="high");const V=Y&&A>0&&C!=null&&Number(C)===Number(A),J=V?Ct(C):{title:"",tag:""},K=I==="high"?ze(A):null,W=K?Tt(K):"";let le="";I==="bust"?le="BUST":I==="miss"?le="":W?le=W:J.title&&(le=J.title);const ye=V&&W&&J.title?{title:J.title,tag:J.tag}:null,Ht=V&&!W&&J.tag?J.tag:null;let de=2800;(I==="miss"||I==="bust")&&(de=3500),I==="high"&&(K==="t95"?de=3100:K==="t100"?de=3900:K==="t140"?de=4400:K==="t180"&&(de=5400)),J.title&&(de=Math.max(de,4e3)),p.value={labels:R,pts:A,kind:I,highTier:K,checkoutTitle:V&&J.title?J.title:null,topBanner:le,bannerIsCompact:I==="bust"||I==="miss",checkoutDetail:ye,checkoutFooter:Ht},setTimeout(()=>{p.value=null},de);const Ge=M.status==="finished";if((Y||Ge)&&A>0&&I!=="bust"&&I!=="miss"&&n&&!Ge){const ce=ie.find(ke=>Number(ke.id)===Number(n));He({winnerName:(ce==null?void 0:ce.name)||"—",wonSet:w,wonLeg:u},de+220)}}Gt(()=>{var s,n;return[(s=D.value)==null?void 0:s.current_set,(n=D.value)==null?void 0:n.current_leg]},()=>{S.darts=[]});async function Pe(){var A,R,Y,ie,te,re,I;if(S.darts.length===0)return;U.value=!0,console.log(S.darts);const s=[...S.darts],n=[...ee.value],u=(R=(A=D.value)==null?void 0:A.current_player)==null?void 0:R.id,w=(Y=D.value)==null?void 0:Y.current_leg,C=(ie=D.value)==null?void 0:ie.current_set,M=u!=null?(te=ee.value.find(V=>Number(V.id)===Number(u)))==null?void 0:te.remaining:null;try{const V=await a.submitThrow(s),J=Ie(w,C,V);if(!Ae.value)Mt(s,{throwerId:u,prevLeg:w,prevSet:C,prevRemaining:M,data:V});else{const K=(((re=D.value)==null?void 0:re.cricket_segments)??[20,19,18,17,16,15,25]).map(Number),W=u!=null?Fn(s,K,n,u):null;if(W&&(_.value=W,(W.fullScreen||W.shake)&&(l&&clearTimeout(l),ne.value={color:W.glow},l=setTimeout(()=>{ne.value=null,l=null},550)),W.shake&&typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(W.tier==="holyGrail"?[120,60,120,60,200]:W.tier==="insaneMark"?[80,40,80,40,120]:[60,40,80]),setTimeout(()=>{_.value=null},W.duration)),J&&V.status!=="finished"&&u){const le=(V.players||[]).find(ye=>Number(ye.id)===Number(u));He({winnerName:(le==null?void 0:le.name)||"—",wonSet:C,wonLeg:w},W?2950:450)}}if(V.status==="finished"){const K=V.winner,W=(K==null?void 0:K.name)||((I=(V.players||[]).find(le=>Number(le.id)===Number(K==null?void 0:K.id)))==null?void 0:I.name)||"—";i&&(clearTimeout(i),i=null),N.value={winnerName:W},i=setTimeout(()=>{N.value=null,i=null},5e3)}S.darts=[]}finally{U.value=!1}}async function De(){S.darts.length>0?S.darts.pop():j.value=!0}async function jt(){var n;if(j.value=!1,!Se.value)return;const s=await a.undo();S.darts=[],s||(n=window._dartToast)==null||n.call(window,"Neizdevās atsaukt gājienu.","error")}function $t(){j.value=!1,G.value=!0}async function Rt(){var s,n,u,w,C,M,A;G.value=!1;try{const R=await a.abandonMatch();R!=null&&R.message&&((s=window._dartToast)==null||s.call(window,R.message,"info")),k.push("/")}catch(R){if(((n=R==null?void 0:R.response)==null?void 0:n.status)===404){k.push("/");return}const Y=((w=(u=R.response)==null?void 0:u.data)==null?void 0:w.message)||((M=(C=R.response)==null?void 0:C.data)==null?void 0:M.error)||"Neizdevās pārtraukt spēli.";(A=window._dartToast)==null||A.call(window,Y,"error")}}async function Ft(){var n,u,w,C,M;const s=a.state;if(!(!s||s.status!=="suspended"||s.play_mode!=="local")&&!(!b.user||Number(s.host_user_id)!==Number(b.user.id)))try{await a.resumeMatch()}catch(A){const R=((u=(n=A.response)==null?void 0:n.data)==null?void 0:u.error)||((C=(w=A.response)==null?void 0:w.data)==null?void 0:C.message)||r("common.error");(M=window._dartToast)==null||M.call(window,R,"error"),k.push("/")}}async function Lt(){var C,M,A,R,Y,ie,te,re,I;const s=(C=D.value)==null?void 0:C.play_mode,n=(M=D.value)==null?void 0:M.host_user_id,u=(A=b.user)==null?void 0:A.id,w=s==="local"&&u!=null&&Number(n)===Number(u);try{w&&a.isMatchActive&&(await a.suspendLocalMatch(),(R=window._dartToast)==null||R.call(window,r("game.suspendedExitToast"),"success"))}catch(V){const J=((ie=(Y=V.response)==null?void 0:Y.data)==null?void 0:ie.message)||((re=(te=V.response)==null?void 0:te.data)==null?void 0:re.error)||r("common.error");(I=window._dartToast)==null||I.call(window,J,"error");return}a.reset(),k.push("/")}function It(){a.reset(),k.push("/")}function zt(){G.value=!0}function Ee(s){if(Be.value||!ge.value||U.value)return;const n=s.target;n&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.closest&&n.closest('[contenteditable="true"]'))||(s.key==="Enter"&&S.darts.length>0?(s.preventDefault(),Pe()):s.key==="Escape"?(s.preventDefault(),De()):s.key==="Backspace"&&S.darts.length>0&&(s.preventDefault(),Re(S.darts.length-1)))}return we(async()=>{q.value=!0;try{await a.loadState(e.matchId),await Ft()}finally{q.value=!1}Ut(()=>m()),a.startPolling(1100),document.addEventListener("keydown",Ee),ue=setInterval(()=>{O.value=Date.now()},500)}),qe(()=>{a.stopPolling(),document.removeEventListener("keydown",Ee),ue&&(clearInterval(ue),ue=null),i&&(clearTimeout(i),i=null),l&&(clearTimeout(l),l=null)}),{matchId:f(()=>e.matchId),state:D,isMyTurn:ge,isX01:st,isCricket:Ae,players:ee,finished:at,legsToWin:nt,dartInput:S,submitting:U,turnResult:p,legWonCelebration:P,matchEndCelebration:N,activeMultiplier:$,showUndoConfirm:j,showAbandonConfirm:G,isMatchActive:fe,isSuspended:Ze,waitingForTurnUi:Ye,legsConfigTotal:et,setsConfigTotal:tt,gameBootPending:q,undoAvailable:Se,cricketActiveSegs:Me,cricketSdtSegments:ve,cricketSdtNonBull:$e,cricketSdtHasBull:ht,cricketPadSplit:vt,hitsFor:he,myHitsFor:ut,segClosedByAll:mt,scorecardGridStyle:bt,scorecardRowGridStyle:ft,leftPlayers:xt,rightPlayers:pt,addX01Dart:yt,addX01Miss:kt,addCricketDart:wt,removeDart:Re,dartLabel:Fe,dartValue:Le,turnResultShellClass:St,turnResultMotionClass:At,turnResultTopBannerClass:Nt,submitThrow:Pe,undo:De,confirmUndo:jt,goAbandonFromUndoDialog:$t,confirmAbandon:Rt,exitGameSaving:Lt,goHome:It,auth:b,gameStore:a,cricketAchievement:_,cricketFlash:ne,t:r,useTurnTimer:xe,turnTimer:me,turnTimerRemainingSec:Ne,turnTimerProgress:rt,turnTimerRowVisible:lt,showTurnTimeoutWaitingBanner:it,showTurnTimeoutOpponentModal:Be,formatTurnClock:ot,turnTimeoutBusy:L,onTurnTimeoutGrantExtra:dt,onTurnTimeoutEndNoStats:ct,layoutKind:x,layoutLabel:T,layoutWidth:g,layoutHeight:c,layoutAspect:v,revealAbandonConfirm:zt}},template:`
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
  `};export{Gn as default};
