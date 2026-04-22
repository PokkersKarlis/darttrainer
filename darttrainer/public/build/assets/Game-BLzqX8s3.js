import{o as pe,W as ct,q as _,p as i,u as mt,a as ut,b as pt,w as bt,G as xt,B as ft}from"./main-r1w74p6_.js";import{u as gt}from"./useBodyShellClass-BWr-wUZp.js";import{useGameStore as vt}from"./game-1YtrHl2c.js";/* empty css            */import"./index-BuNY4Ty6.js";const ht={props:{matchId:{type:[String,Number],required:!0}},emits:["home"],setup(A,{emit:m}){const C=_(!0),F=_(null),N=_(null),R=i(()=>{var d,M;return((M=(d=N.value)==null?void 0:d.match)==null?void 0:M.game_type)==="cricket"}),u=i(()=>{var d,M;return((M=(d=N.value)==null?void 0:d.match)==null?void 0:M.game_type)==="x01"}),S=i(()=>{var d;return((d=N.value)==null?void 0:d.report)??null}),v=i(()=>{var d;return((d=S.value)==null?void 0:d.meta)??{}}),y=i(()=>{var d;return((d=S.value)==null?void 0:d.player_rows)??[]}),V=i(()=>{var d;return((d=S.value)==null?void 0:d.agp)??null}),L=i(()=>{var d;return((d=S.value)==null?void 0:d.leg_rows)??[]});function E(d){if(!d)return"—";try{return new Date(d).toLocaleString("lv-LV",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return d}}function W(){window.print()}return pe(async()=>{C.value=!0,F.value=null;try{const{data:d}=await ct.protocol(A.matchId);N.value=d}catch{F.value="Neizdevās ielādēt protokolu."}finally{C.value=!1}}),{loading:C,error:F,payload:N,isCricket:R,isX01:u,report:S,meta:v,rows:y,agp:V,legRows:L,fmtDateTime:E,printReport:W,goHome:()=>m("home")}},template:`
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
  `},be={props:{boosted:{type:Boolean,default:!0},prominent:{type:Boolean,default:!1}},template:`
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
  `},yt={components:{CricketClosedCheck:be},props:{hits:{type:Number,default:0},closed:{type:Boolean,default:!1},size:{type:String,default:"md"}},setup(A){function m(v){const y=v??0;return y===2?"2":y===1?"1":"0"}function C(v){const y=v??0;return y>=3?"Slēgts (3 trāpījumi)":y===2?"Divi trāpījumi":y===1?"Viens trāpījums":"Nav trāpījumu"}function F(v){return v>=3?"text-emerald-300":v===2?"text-amber-200":v===1?"text-sky-200":"text-slate-500"}function N(v){const y=v??0;return y>=3?"bg-emerald-500/20 ring-1 ring-emerald-400/35 shadow-[0_0_20px_rgba(52,211,153,.12)]":y===2?"bg-amber-500/18 ring-1 ring-amber-400/30":y===1?"bg-sky-500/18 ring-1 ring-sky-400/28":"bg-[#0c1528]/90 ring-1 ring-[#1e3050]/80"}const R=i(()=>{const v={sm:"text-xl",md:"text-2xl",lg:"text-3xl",board:"text-[clamp(1.35rem,4.2vmin,2.75rem)] sm:text-[clamp(1.5rem,3.8vmin,2.5rem)]","board-sm":"text-[clamp(0.7rem,2.6vmin,1.05rem)]"};return v[A.size]??v.md}),u=i(()=>A.size==="board"||A.size==="board-sm"),S=i(()=>A.size==="board-sm");return{symbol:m,hitTitle:C,colorClass:F,pillClass:N,sizeClass:R,isBoard:u,isBoardCompact:S}},template:`
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
  `},jt={props:["matchId"],components:{MatchReport:ht,CricketMarkCell:yt,CricketClosedCheck:be},setup(A){gt("body--game-shell");const m=vt(),C=mt(),F=ut(),N=e=>F.t(e),R=pt(),u=ft({darts:[]}),S=_(!1),v=_(null),y=_(null),V=_(1),L=_(!1),E=_(!1),W=_(!0),d=_(null),M=_(Date.now()),H=_(!1);let X=null;const h=i(()=>m.state),O=i(()=>m.isMyTurn),G=i(()=>m.isMatchActive),xe=i(()=>m.isSuspended),fe=i(()=>G.value&&!O.value),ge=i(()=>{var e,t;return Math.max(1,Number((t=(e=h.value)==null?void 0:e.legs_config)==null?void 0:t.legs)||1)}),ve=i(()=>{var e,t;return Math.max(1,Number((t=(e=h.value)==null?void 0:e.legs_config)==null?void 0:t.sets)||1)}),Z=i(()=>m.undoAvailable),he=i(()=>m.gameType==="x01"),Q=i(()=>m.gameType==="cricket"),j=i(()=>m.players),ye=i(()=>m.isFinished),ke=i(()=>{var e,t;return Math.ceil((((t=(e=h.value)==null?void 0:e.legs_config)==null?void 0:t.legs)??1)/2)}),P=i(()=>{var e;return((e=h.value)==null?void 0:e.turn_timer)??null}),K=i(()=>{var e;return!!((e=h.value)!=null&&e.use_turn_timer)}),Y=i(()=>{const e=P.value;if(!(e!=null&&e.deadline_at))return 0;const t=new Date(e.deadline_at).getTime();return Math.max(0,Math.ceil((t-M.value)/1e3))}),we=i(()=>{const e=P.value;if(!(e!=null&&e.deadline_at)||e.pending)return 0;const t=Math.max(1,e.window_seconds||300),s=Y.value;return Math.min(100,Math.max(0,s/t*100))}),Te=i(()=>{if(!K.value||!G.value)return!1;const e=P.value;return!!(e!=null&&e.deadline_at&&!e.pending)}),_e=i(()=>{var s,r,a,l;if(!K.value||!G.value||!((s=P.value)!=null&&s.pending))return!1;const e=(r=C.user)==null?void 0:r.id,t=(l=(a=h.value)==null?void 0:a.current_player)==null?void 0:l.user_id;return e==null||t==null?!1:Number(t)===Number(e)}),ee=i(()=>{var s,r,a,l;if(!K.value||!G.value||!((s=P.value)!=null&&s.pending))return!1;const e=(r=C.user)==null?void 0:r.id,t=(l=(a=h.value)==null?void 0:a.current_player)==null?void 0:l.user_id;return e==null||t==null?!1:Number(t)!==Number(e)});function Ce(e){const t=Math.max(0,Number(e)||0),s=Math.floor(t/60),r=t%60;return s+":"+String(r).padStart(2,"0")}async function Ne(){var e,t,s,r,a;if(!H.value){H.value=!0;try{await m.turnTimeoutGrantExtra()}catch(l){const n=((t=(e=l.response)==null?void 0:e.data)==null?void 0:t.error)||((r=(s=l.response)==null?void 0:s.data)==null?void 0:r.message)||"Kļūda.";(a=window._dartToast)==null||a.call(window,n,"error")}finally{H.value=!1}}}async function Se(){var e,t,s,r,a;if(!H.value){H.value=!0;try{await m.turnTimeoutEndNoStats()}catch(l){const n=((t=(e=l.response)==null?void 0:e.data)==null?void 0:t.error)||((r=(s=l.response)==null?void 0:s.data)==null?void 0:r.message)||"Kļūda.";(a=window._dartToast)==null||a.call(window,n,"error")}finally{H.value=!1}}}const te=i(()=>{var s;const e=(s=h.value)==null?void 0:s.cricket_segments;return(Array.isArray(e)&&e.length?e:[20,19,18,17,16,15,25]).map(r=>Number(r))});function $(e,t){if(e==null)return 0;const s=Number(e),r=j.value.find(n=>Number(n.id)===s),a=r==null?void 0:r.cricket;if(!a)return 0;const l=Number(t);return l===25?a.seg_bull??0:a["seg_"+l]??0}function je(e){var t,s;return $((s=(t=h.value)==null?void 0:t.current_player)==null?void 0:s.id,e)}function Ae(e){const t=Number(e);return j.value.length>0&&j.value.every(s=>$(s.id,t)>=3)}const se=i(()=>{const e=j.value.length,t=Math.ceil(e/2),s=Math.floor(e/2);return[...Array(t).fill("1fr"),"minmax(3.25rem, 5vw)",...Array(s).fill("1fr")].join(" ")}),Me=i(()=>({display:"grid",gridTemplateColumns:se.value,alignItems:"center"})),Be=i(()=>({display:"grid",gridTemplateColumns:se.value,alignItems:"stretch",minHeight:0})),Re=i(()=>j.value.slice(0,Math.ceil(j.value.length/2))),Ie=i(()=>j.value.slice(Math.ceil(j.value.length/2)));function De(e){const t=(e||[]).map(Number),s=new Set(t),r=[...s].filter(n=>n>=1&&n<=20).sort((n,c)=>n-c),a=[...s].filter(n=>(n<1||n>20)&&n!==25).sort((n,c)=>n-c),l=[...r,...a];return s.has(25)&&l.push(25),l}const q=i(()=>De(te.value)),ae=i(()=>q.value.filter(e=>e!==25)),Fe=i(()=>q.value.includes(25)),He=i(()=>{const e=ae.value,t=Math.ceil(e.length/2);return{left:e.slice(0,t),right:e.slice(t)}});function ze(e,t){u.darts.length>=3||u.darts.push({segment:e,multiplier:t})}function Le(){u.darts.length>=3||u.darts.push({segment:0,multiplier:0})}function Pe(e,t){u.darts.length>=3||u.darts.push({segment:e,multiplier:t})}function re(e){u.darts.splice(e,1)}function ne(e){return e.segment===0?"Miss":e.segment===25&&e.multiplier===2?"Bull":e.segment===25?"Outer":(e.multiplier===2?"D":e.multiplier===3?"T":"S")+e.segment}function le(e){return e.segment===0?0:e.segment*e.multiplier}function T(e){return e[Math.floor(Math.random()*e.length)]}function ie(e,t,s){return e!=null&&t!=null&&(Number(s.current_leg)!==Number(e)||Number(s.current_set)!==Number(t))}function oe(e){return e>=180?"t180":e>=140?"t140":e>=100?"t100":e>=95?"t95":null}function Ue(e){switch(e){case"t95":return"Pīķa zona";case"t100":return"Labi sit!";case"t140":return"Premium gājiens";case"t180":return"TON 80 · EXCELLENT";default:return""}}function Ee(e){const t=Number(e);return!t||t<=0?{coTier:null,title:"",tag:""}:t<=20?{coTier:"co1",title:T(["Aizvērts!","Ieejamā!","Čau, score!","Klusi, bet precīzi"]),tag:T(["Kā ar karoti medu.","Miers ir miers.","Mini finišs, liela sirds."])}:t<=40?{coTier:"co2",title:T(["Slēdzam!","Aizķēries!","Uz mājām!"]),tag:T(["Jau redzams gals.","Vēl tuvāk kāpām.","Pretinieks nervozē."])}:t<=80?{coTier:"co3",title:T(["Labs finišs!","Turpinām kāpt!","Score krīt!"]),tag:T(["Šis sāp pretiniekam.","Kārtīgs gājiens.","Tā turēt!"])}:t<=120?{coTier:"co4",title:T(["Iespaidīgs checkout!","Augstākā līga!","Meistarība!"]),tag:T(["Tu dari to pareizi.","Šķīvis klausa.","Tā ir māksla."])}:t<=169?{coTier:"co5",title:T(["Augstas raudzes finišs!","Reta putna līmenis!","Ko tu dari ar šķīvi?!"]),tag:T(["Šito rāda atkārtojumā.","Kā no grāmatas.","Elite."])}:{coTier:"coTop",title:T(["LEĠENDĀRS!","170 klubs!","Meistarklase!"]),tag:T(["Aplausi. Tu to nopelnīji.","Šādu redz reti.","Respekts."])}}function We(e){const t=e==null?void 0:e.kind,s=e==null?void 0:e.checkoutTitle,r=s?"ring-2 ring-emerald-500/30 border-emerald-600/45":"";if(t==="bust")return"border-rose-500/75 bg-gradient-to-br from-rose-950/98 via-[#1a0a0f]/95 to-slate-900/98 shadow-xl shadow-rose-900/40 ring-1 ring-rose-500/30";if(t==="miss")return"border-slate-500/70 bg-slate-900/98 shadow-lg shadow-black/40 ring-1 ring-slate-600/30";if(t==="high"){const a=e.highTier;if(a==="t95")return`border-amber-700/50 bg-gradient-to-br from-slate-900/98 to-[#0f172a]/98 shadow-md ${r}`.trim();if(a==="t100")return`border-amber-400/65 bg-gradient-to-br from-amber-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-lg shadow-amber-900/25 ${r}`.trim();if(a==="t140")return`border-fuchsia-400/55 bg-gradient-to-br from-fuchsia-950/85 via-amber-950/50 to-[#0a1120]/98 shadow-xl shadow-fuchsia-900/30 ${r}`.trim();if(a==="t180")return`border-yellow-300/70 bg-gradient-to-br from-yellow-950/90 via-amber-900/60 to-slate-950/98 shadow-2xl shadow-amber-500/35 ${r}`.trim()}return s?"border-emerald-500/55 bg-gradient-to-br from-emerald-950/90 via-[#0f172a]/98 to-slate-900/98 shadow-xl shadow-emerald-900/25":"border-slate-600 bg-slate-800/95"}function Ge(e){const t=[],s=e==null?void 0:e.kind;return s==="bust"?t.push("dt-x01-toast-bust"):s==="miss"?t.push("dt-x01-toast-miss"):s==="high"&&(e.highTier==="t95"?t.push("dt-x01-tier-95"):e.highTier==="t100"?t.push("dt-x01-tier-100"):e.highTier==="t140"?t.push("dt-x01-tier-140"):e.highTier==="t180"&&t.push("dt-x01-tier-180")),e.checkoutTitle&&t.push("dt-x01-co-pop"),t.join(" ")}function Xe(e){return e.kind==="bust"?"text-rose-300":e.kind==="miss"?"text-slate-400":e.highTier==="t95"?"text-amber-200/90 text-[11px] sm:text-xs font-black tracking-[0.18em]":e.highTier==="t100"?"text-amber-200 text-xs sm:text-sm font-black tracking-wide":e.highTier==="t140"?"text-fuchsia-200 text-sm sm:text-base font-black tracking-tight":e.highTier==="t180"?"text-yellow-200 text-base sm:text-lg font-black drop-shadow-[0_0_14px_rgba(250,204,21,0.4)]":e.checkoutTitle&&e.kind==="normal"?"text-emerald-300 text-xs sm:text-sm font-black":"text-slate-200 text-xs font-bold"}const Ke=["Legs iekārtots!","Šajā legā — tu!","Kāpes augšā!","Punkts pievienots!","Uzvaras aplis!"];function de({winnerName:e,wonSet:t,wonLeg:s},r){setTimeout(()=>{y.value={winnerName:e,wonSet:t,wonLeg:s,line:T(Ke)},setTimeout(()=>{y.value=null},3600)},r)}function Ve(e,{throwerId:t,prevLeg:s,prevSet:r,prevRemaining:a,data:l}){const n=e.reduce((D,J)=>D+le(J),0),c=e.map(ne),p=ie(s,r,l),x=l.players||[],f=t!=null?x.find(D=>Number(D.id)===Number(t)):null,b=f==null?void 0:f.remaining;let o="normal";n===0?o="miss":!p&&a!=null&&b!=null&&Number(a)===Number(b)?o="bust":oe(n)&&(o="high");const k=p&&n>0&&a!=null&&Number(a)===Number(n),g=k?Ee(a):{title:"",tag:""},w=o==="high"?oe(n):null,I=w?Ue(w):"";let z="";o==="bust"?z="BUST":o==="miss"?z="":I?z=I:g.title&&(z=g.title);const it=k&&I&&g.title?{title:g.title,tag:g.tag}:null,ot=k&&!I&&g.tag?g.tag:null;let B=2800;(o==="miss"||o==="bust")&&(B=3500),o==="high"&&(w==="t95"?B=3100:w==="t100"?B=3900:w==="t140"?B=4400:w==="t180"&&(B=5400)),g.title&&(B=Math.max(B,4e3)),v.value={labels:c,pts:n,kind:o,highTier:w,checkoutTitle:k&&g.title?g.title:null,topBanner:z,bannerIsCompact:o==="bust"||o==="miss",checkoutDetail:it,checkoutFooter:ot},setTimeout(()=>{v.value=null},B);const dt=l.status==="finished";if((p||dt)&&n>0&&o!=="bust"&&o!=="miss"&&t){const D=x.find(J=>Number(J.id)===Number(t));de({winnerName:(D==null?void 0:D.name)||"—",wonSet:r,wonLeg:s},B+220)}}bt(()=>{var e,t;return[(e=h.value)==null?void 0:e.current_set,(t=h.value)==null?void 0:t.current_leg]},()=>{u.darts=[]});const U=3;function Oe(e){const t=Number(e);return t===25?"seg_bull":`seg_${t}`}function $e(e,t){const s=e==null?void 0:e.cricket;if(!s)return 0;const r=Oe(t);return Math.max(0,Math.min(U,Number(s[r]??0)))}function qe(e,t){const s=e.map(a=>Number(a.id)),r={};for(const a of s){r[a]={};const l=e.find(n=>Number(n.id)===a);for(const n of t)r[a][n]=l?$e(l,n):0}return{hits:r,playerIds:s}}function Je(e,t,s){const r={};for(const a of t){r[a]={};for(const l of s)r[a][l]=e[a][l]??0}return r}function Ze(e,t,s,r,a,l){const n=Number(a),c=Number(l);if(c<=0||n<=0||!s.includes(n))return 0;let p=!0;for(const f of t)if((e[f][n]??0)<U){p=!1;break}if(p)return 0;const x=e[r][n]??0;return x>=U?0:Math.min(c,U-x)}function Qe(e,t,s,r,a){const l=Number(s),n=Number(r);if(n<=0||l<=0||!a.includes(l))return;const c=e[t][l]??0;if(c>=U)return;const p=U-c,x=Math.min(n,p);e[t][l]=c+x}function Ye(e,t,s,r){const a=t.map(Number),{hits:l,playerIds:n}=qe(s,a),c=Je(l,n,a),p=Number(r),x=[];let f=0;for(const b of e){const o=Ze(c,n,a,p,b.segment,b.multiplier);x.push(o),f+=o,Qe(c,p,b.segment,b.multiplier,a)}return{total:f,perDart:x}}function et(e,t,s,r){const a=t.map(Number),{total:l,perDart:n}=Ye(e,a,s,r);let c=0,p=0;const x=new Set;for(let b=0;b<e.length;b++){const o=e[b],k=Number(o.segment),g=Number(o.multiplier),w=n[b]??0;!k||!g||!a.includes(k)||(k===25&&(c+=w),g===3&&w>0&&(p++,x.add(k)))}const f=(b,o,k,g,w)=>({emoji:b,title:o,sub:k,color:g,glow:w});if(p>=3&&x.size>=3&&l>=9)return f("🐎🔥","Baltais zirgs!","Trīs trīskārši · trīs lauki · 9 trāpījumi","#6ee7b7","#10b981");if(l>=9)return f("🔥",`${l} trāpījumi!`,"Maksimums","#fca5a5","#f43f5e");if(p>=3&&x.size>=3)return f("🐎","Baltais zirgs!","Trīs trīskārši dažādos laukos","#6ee7b7","#10b981");if(p>=3&&x.size===1)return f("💥","Trīs trīskārši!","Vienā laukā","#fcd34d","#f59e0b");if(c>=3){const b=c>=6?"!!":"!";return f("🎯",`${c} Bull${b}`,`${c} trāpījumi bullā`,"#7dd3fc","#0ea5e9")}return l>=4?f("⬡",`${l} trāpījumi!`,null,"#c4b5fd","#8b5cf6"):null}async function ce(){var n,c,p,x,f,b;if(u.darts.length===0)return;S.value=!0;const e=[...u.darts],t=[...j.value],s=(c=(n=h.value)==null?void 0:n.current_player)==null?void 0:c.id,r=(p=h.value)==null?void 0:p.current_leg,a=(x=h.value)==null?void 0:x.current_set,l=s!=null?(f=j.value.find(o=>Number(o.id)===Number(s)))==null?void 0:f.remaining:null;try{const o=await m.submitThrow(e),k=ie(r,a,o);if(!Q.value)Ve(e,{throwerId:s,prevLeg:r,prevSet:a,prevRemaining:l,data:o});else{const g=(((b=h.value)==null?void 0:b.cricket_segments)??[20,19,18,17,16,15,25]).map(Number),w=s!=null?et(e,g,t,s):null;if(w&&(d.value=w,setTimeout(()=>{d.value=null},2800)),(k||o.status==="finished")&&s){const I=(o.players||[]).find(z=>Number(z.id)===Number(s));de({winnerName:(I==null?void 0:I.name)||"—",wonSet:a,wonLeg:r},w?2950:450)}}u.darts=[]}finally{S.value=!1}}async function me(){u.darts.length>0?u.darts.pop():L.value=!0}async function tt(){var t;if(L.value=!1,!Z.value)return;const e=await m.undo();u.darts=[],e||(t=window._dartToast)==null||t.call(window,"Neizdevās atsaukt gājienu.","error")}function st(){L.value=!1,E.value=!0}async function at(){var e,t,s,r,a,l;E.value=!1;try{const n=await m.abandonMatch();n!=null&&n.message&&((e=window._dartToast)==null||e.call(window,n.message,"info")),R.push("/")}catch(n){const c=((s=(t=n.response)==null?void 0:t.data)==null?void 0:s.message)||((a=(r=n.response)==null?void 0:r.data)==null?void 0:a.error)||"Neizdevās pārtraukt spēli.";(l=window._dartToast)==null||l.call(window,c,"error")}}async function rt(){var t,s,r,a,l;const e=m.state;if(!(!e||e.status!=="suspended"||e.play_mode!=="local")&&!(!C.user||Number(e.host_user_id)!==Number(C.user.id)))try{await m.resumeMatch()}catch(n){const c=((s=(t=n.response)==null?void 0:t.data)==null?void 0:s.error)||((a=(r=n.response)==null?void 0:r.data)==null?void 0:a.message)||N("common.error");(l=window._dartToast)==null||l.call(window,c,"error"),R.push("/")}}async function nt(){var a,l,n,c,p,x,f,b,o;const e=(a=h.value)==null?void 0:a.play_mode,t=(l=h.value)==null?void 0:l.host_user_id,s=(n=C.user)==null?void 0:n.id,r=e==="local"&&s!=null&&Number(t)===Number(s);try{r&&m.isMatchActive&&(await m.suspendLocalMatch(),(c=window._dartToast)==null||c.call(window,N("game.suspendedExitToast"),"success"))}catch(k){const g=((x=(p=k.response)==null?void 0:p.data)==null?void 0:x.message)||((b=(f=k.response)==null?void 0:f.data)==null?void 0:b.error)||N("common.error");(o=window._dartToast)==null||o.call(window,g,"error");return}m.reset(),R.push("/")}function lt(){m.reset(),R.push("/")}function ue(e){if(ee.value||!O.value||S.value)return;const t=e.target;t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.closest&&t.closest('[contenteditable="true"]'))||(e.key==="Enter"&&u.darts.length>0?(e.preventDefault(),ce()):e.key==="Escape"?(e.preventDefault(),me()):e.key==="Backspace"&&u.darts.length>0&&(e.preventDefault(),re(u.darts.length-1)))}return pe(async()=>{W.value=!0;try{await m.loadState(A.matchId),await rt()}finally{W.value=!1}m.startPolling(1100),document.addEventListener("keydown",ue),X=setInterval(()=>{M.value=Date.now()},500)}),xt(()=>{m.stopPolling(),document.removeEventListener("keydown",ue),X&&(clearInterval(X),X=null)}),{matchId:i(()=>A.matchId),state:h,isMyTurn:O,isX01:he,isCricket:Q,players:j,finished:ye,legsToWin:ke,dartInput:u,submitting:S,turnResult:v,legWonCelebration:y,activeMultiplier:V,showUndoConfirm:L,showAbandonConfirm:E,isMatchActive:G,isSuspended:xe,waitingForTurnUi:fe,legsConfigTotal:ge,setsConfigTotal:ve,gameBootPending:W,undoAvailable:Z,cricketActiveSegs:te,cricketSdtSegments:q,cricketSdtNonBull:ae,cricketSdtHasBull:Fe,cricketPadSplit:He,hitsFor:$,myHitsFor:je,segClosedByAll:Ae,scorecardGridStyle:Me,scorecardRowGridStyle:Be,leftPlayers:Re,rightPlayers:Ie,addX01Dart:ze,addX01Miss:Le,addCricketDart:Pe,removeDart:re,dartLabel:ne,dartValue:le,turnResultShellClass:We,turnResultMotionClass:Ge,turnResultTopBannerClass:Xe,submitThrow:ce,undo:me,confirmUndo:tt,goAbandonFromUndoDialog:st,confirmAbandon:at,exitGameSaving:nt,goHome:lt,auth:C,gameStore:m,cricketAchievement:d,t:N,useTurnTimer:K,turnTimer:P,turnTimerRemainingSec:Y,turnTimerProgress:we,turnTimerRowVisible:Te,showTurnTimeoutWaitingBanner:_e,showTurnTimeoutOpponentModal:ee,formatTurnClock:Ce,turnTimeoutBusy:H,onTurnTimeoutGrantExtra:Ne,onTurnTimeoutEndNoStats:Se}},template:`
    <div class="flex h-full min-h-0 flex-1 flex-col w-full min-w-0 overflow-hidden bg-[#060d18] text-slate-200">

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

      <!-- Cricket achievement popup -->
      <Teleport to="body">
        <Transition name="achieve">
          <div v-if="cricketAchievement"
               class="fixed z-50 pointer-events-none"
               style="top: 26%; left: 50%; transform: translateX(-50%); width: min(22rem, 90vw)">
            <div class="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/70"
                 style="background: #080f1e; border: 1px solid rgba(255,255,255,0.08)">
              <!-- colour accent bar -->
              <div class="h-1 w-full" :style="{ background: cricketAchievement.glow }"></div>
              <div class="px-6 py-5 flex flex-col items-center text-center gap-1">
                <div class="text-6xl leading-none mb-1 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {{ cricketAchievement.emoji }}
                </div>
                <div class="text-xl font-black text-white tracking-tight leading-snug">
                  {{ cricketAchievement.title }}
                </div>
                <div v-if="cricketAchievement.sub"
                     class="text-sm font-semibold leading-snug"
                     :style="{ color: cricketAchievement.color }">
                  {{ cricketAchievement.sub }}
                </div>
              </div>
              <!-- subtle glow overlay -->
              <div class="absolute inset-0 pointer-events-none rounded-2xl"
                   :style="{ boxShadow: '0 0 60px 0 ' + cricketAchievement.glow + '33' }"></div>
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
        <div v-if="finished" class="flex min-h-0 flex-1 flex-col overflow-hidden w-full">
          <MatchReport :match-id="matchId" class="min-h-0 flex-1" @home="goHome" />
        </div>

        <!-- ════════════════ CRICKET ════════════════ -->
        <div v-else-if="isCricket"
             class="flex flex-1 min-h-0 flex-col overflow-hidden bg-gradient-to-b from-[#060d18] via-[#070d16] to-[#0a1120]">

          <!-- ── Desktop layout (lg+) ── -->
          <div class="hidden lg:flex flex-1 min-h-0">

            <!-- Center: player cards + scoreboard -->
            <div class="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

              <!-- Room/leg bar + multiplayer darbības -->
              <div class="flex-shrink-0 px-3 sm:px-5 py-2 border-b border-[#162540] bg-[#0a1120]/80
                          flex flex-wrap items-center justify-between gap-2">
                <span class="text-amber-400 font-mono font-black text-sm tracking-widest">{{ state.room_code }}</span>
                <div class="flex items-center gap-2 flex-wrap justify-end">
                  <span class="text-slate-500 text-xs tabular-nums">
                    Leg {{ state.current_leg }}/{{ legsConfigTotal }}<template v-if="setsConfigTotal > 1"> · Set {{ state.current_set }}/{{ setsConfigTotal }}</template>
                  </span>
                  <template v-if="(isMatchActive || isSuspended) && auth.user">
                    <button type="button" @click="exitGameSaving"
                            class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
                                   border border-slate-600/60 text-slate-400 hover:text-white hover:bg-[#162540] transition touch-manipulation">
                      {{ t('game.exitSave') }}
                    </button>
                    <button v-if="isMatchActive" type="button" @click="showAbandonConfirm = true"
                            class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide
                                   border border-rose-800/50 text-rose-400 hover:bg-rose-950/40 transition touch-manipulation">
                      Pārtraukt
                    </button>
                  </template>
                </div>
              </div>

              <div v-if="isMatchActive && showTurnTimeoutWaitingBanner"
                   class="shrink-0 px-3 py-2.5 bg-amber-950/50 border-b border-amber-700/40 text-center text-xs sm:text-sm font-semibold text-amber-100 leading-snug">
                {{ t('game.turnTimer.waitingOpponentChoice') }}
              </div>
              <div v-else-if="turnTimerRowVisible"
                   class="shrink-0 flex items-center gap-3 px-3 sm:px-5 py-2 border-b border-[#162540] bg-[#0d1526]/95">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 hidden md:inline">{{ t('game.turnTimer.label') }}</span>
                <div class="flex-1 min-w-0 h-2 rounded-full bg-[#1e3050] overflow-hidden ring-1 ring-black/25">
                  <div class="h-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-[width] duration-500 ease-linear"
                       :style="{ width: turnTimerProgress + '%' }"></div>
                </div>
                <span class="text-sm font-mono font-black tabular-nums text-amber-400 w-[4.75rem] text-right shrink-0">{{ formatTurnClock(turnTimerRemainingSec) }}</span>
              </div>

              <!-- Player cards -->
              <div class="flex-shrink-0 px-4 pt-3 pb-2 grid gap-2"
                   :class="players.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'">
                <div v-for="player in players" :key="player.id"
                     class="rounded-2xl px-4 py-3 transition-all duration-300"
                     :class="Number(player.id) === Number(state.current_player?.id)
                       ? 'bg-[#1a2540] border border-amber-500/35 shadow-md shadow-black/20'
                       : 'bg-[#0f1c30] border border-[#162540]'">
                  <div class="flex items-center gap-1.5 mb-1 min-w-0">
                    <span v-if="Number(player.id) === Number(state.current_player?.id)"
                          class="text-amber-400 text-xs animate-pulse flex-shrink-0">▶</span>
                    <span class="text-xs font-bold truncate flex-1"
                          :class="Number(player.id) === Number(state.current_player?.id) ? 'text-amber-300' : 'text-slate-500'">
                      {{ player.name }}
                    </span>
                    <!-- Leg / Set score -->
                    <div class="flex-shrink-0 flex items-center gap-1 ml-1">
                      <template v-if="state.legs_config?.sets > 1">
                        <span class="text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md"
                              :class="Number(player.id) === Number(state.current_player?.id) ? 'bg-amber-500/20 text-amber-300' : 'bg-[#1a2a42] text-slate-400'">
                          {{ player.sets_won }}S · {{ player.legs_won }}L
                        </span>
                      </template>
                      <template v-else>
                        <span class="text-lg font-black tabular-nums leading-none"
                              :class="player.legs_won > 0
                                ? (Number(player.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-300')
                                : 'text-slate-700'">
                          {{ player.legs_won }}
                        </span>
                        <span class="text-slate-700 text-xs font-bold">/{{ legsToWin }}</span>
                      </template>
                    </div>
                  </div>
                  <div class="text-3xl font-black tabular-nums leading-none mb-1.5"
                       :class="player.cricket?.all_closed ? 'text-emerald-400' : 'text-slate-100'">
                    {{ player.cricket?.points ?? 0 }}
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex gap-0.5">
                      <div v-for="i in legsToWin" :key="i"
                           class="w-1.5 h-1.5 rounded-full border transition-all"
                           :class="i <= player.legs_won ? 'bg-amber-400 border-amber-400' : 'border-[#1e3050]'"></div>
                    </div>
                    <div class="flex flex-col items-end shrink-0" :title="t('game.cricketAvgHint')">
                      <span class="text-[9px] font-black uppercase tracking-wide text-amber-500 leading-none mb-0.5">{{ t('game.cricketAvgShort') }}</span>
                      <span class="text-base font-black tabular-nums text-amber-100 leading-none">{{ player.avg_pts ?? '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Scoreboard -->
              <div class="flex-1 min-h-0 mx-4 mb-4 rounded-xl overflow-hidden
                          border border-[#162540] bg-[#0f1c30]/90 flex flex-col shadow-inner">
                <!-- Headers -->
                <div class="flex-shrink-0 border-b border-[#162540] py-2 px-1 bg-[#0a1120]/60"
                     :style="scorecardGridStyle">
                  <div v-for="p in leftPlayers" :key="'lhd-'+p.id"
                       class="text-center text-xs font-bold truncate px-1"
                       :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                    {{ p.name }}
                  </div>
                  <div class="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest">Lauks</div>
                  <div v-for="p in rightPlayers" :key="'rhd-'+p.id"
                       class="text-center text-xs font-bold truncate px-1"
                       :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                    {{ p.name }}
                  </div>
                </div>
                <!-- Segment rows -->
                <div class="flex-1 min-h-0 flex flex-col overflow-y-auto">
                  <div v-for="(seg, idx) in cricketSdtSegments" :key="seg"
                       class="flex-1 min-h-0 basis-0 border-b border-[#162540]/40 last:border-b-0 transition-all duration-300"
                       :class="[idx % 2 === 0 ? 'bg-[#0a1120]/25' : '', segClosedByAll(seg) ? 'opacity-25' : '']"
                       :style="scorecardRowGridStyle">
                    <div v-for="p in leftPlayers" :key="'lmd-'+p.id+'-'+seg"
                         class="flex items-center justify-center min-h-0 min-w-0 border-r border-[#162540]/30 p-1">
                      <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board" />
                    </div>
                    <div class="flex items-center justify-center min-h-0 min-w-0 px-1 rounded-lg mx-0.5 my-0.5 shadow-inner"
                         :class="segClosedByAll(seg)
                           ? 'bg-[#0a1120]/95 border border-[#1e3050]'
                           : 'border border-rose-900/40 bg-[#1a0a0f]'">
                      <div class="flex flex-col items-center justify-center leading-none gap-0.5 py-0.5">
                        <span class="font-black tabular-nums select-none text-[clamp(1.125rem,2.8vmin,1.75rem)]"
                              :class="segClosedByAll(seg) ? 'text-slate-500 line-through' : 'text-rose-300/90'">
                          {{ seg === 25 ? '25' : seg }}
                        </span>
                        <span v-if="seg === 25 && !segClosedByAll(seg)"
                              class="text-[8px] font-bold uppercase tracking-widest text-rose-400/80">bull</span>
                      </div>
                    </div>
                    <div v-for="p in rightPlayers" :key="'rmd-'+p.id+'-'+seg"
                         class="flex items-center justify-center min-h-0 min-w-0 border-l border-[#162540]/30 p-1">
                      <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board" />
                    </div>
                  </div>
                </div>
                <!-- Legend -->
                <div class="flex-shrink-0 border-t border-[#162540] py-1.5 px-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 bg-[#0a1120]/40">
                  <span><span class="font-mono font-black text-slate-400">0</span> nav</span>
                  <span><span class="font-mono font-black text-sky-400/90">1</span> viens</span>
                  <span><span class="font-mono font-black text-amber-400/90">2</span> divi</span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="inline-flex items-center justify-center text-emerald-400/95 w-4 h-4 flex-shrink-0">
                      <CricketClosedCheck :boosted="false" />
                    </span>
                    slēgts
                  </span>
                </div>
              </div>

            </div>

            <!-- Right: input panel -->
            <div class="flex-shrink-0 w-[min(22rem,40vw)] min-w-[18rem] flex flex-col border-l border-[#162540] bg-[#0a1120]/95 overflow-hidden">

              <div v-if="waitingForTurnUi"
                   class="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div class="text-slate-500 text-xs uppercase tracking-widest font-semibold">Gaida</div>
                <div class="text-slate-100 font-black text-xl">{{ state.current_player?.name }}</div>
                <div class="flex gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>

              <template v-else>
                <div class="flex-1 flex flex-col gap-3 p-3 overflow-hidden min-h-0">

                  <div class="flex items-center justify-between gap-2 flex-shrink-0">
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Šīs kārtas</span>
                    <div class="flex gap-1" aria-hidden="true">
                      <span v-for="i in 3" :key="i"
                            class="h-1.5 w-1.5 rounded-full transition-all"
                            :class="i <= dartInput.darts.length ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,.5)]' : 'bg-[#1e3050]'"></span>
                    </div>
                  </div>

                  <!-- Dart slots -->
                  <div class="flex gap-2 flex-shrink-0">
                    <div v-for="(d, i) in dartInput.darts" :key="i"
                         class="flex-1 bg-[#0f1c30] border border-[#162540] rounded-xl
                                px-1.5 py-2 text-center relative group min-w-0 touch-manipulation min-h-[3.5rem] flex flex-col justify-center">
                      <div class="text-amber-400 font-mono font-black text-sm sm:text-base truncate">{{ dartLabel(d) }}</div>
                      <div class="text-slate-500 text-[11px] tabular-nums">{{ dartValue(d) > 0 ? dartValue(d) : '—' }}</div>
                      <button type="button" @click="removeDart(i)"
                              class="absolute -top-1 -right-1 w-7 h-7 sm:w-6 sm:h-6 bg-red-700 hover:bg-red-600 text-white
                                     rounded-full text-xs flex items-center justify-center shadow-md
                                     opacity-100 transition">✕</button>
                    </div>
                    <div v-for="i in (3 - dartInput.darts.length)" :key="'ed'+i"
                         class="flex-1 min-h-[3.5rem] bg-[#060d18]/80 border border-dashed border-[#1e3050]
                                rounded-xl flex items-center justify-center text-[#1e3050] text-xs font-mono">—</div>
                  </div>


                  <!-- Segment cards — scrollable -->
                  <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-0.5">
                    <div class="grid grid-cols-2 gap-x-2 gap-y-2">
                      <div class="flex flex-col gap-2">
                        <div v-for="seg in cricketPadSplit.left" :key="'dl'+seg"
                             class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]">
                          <div class="mb-1.5 flex items-center justify-between gap-2">
                            <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                            <span class="min-w-[2.25rem] rounded-xl px-2.5 py-1 text-center text-xl font-black tabular-nums border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90">{{ seg }}</span>
                          </div>
                          <div class="grid grid-cols-3 gap-1.5">
                            <button type="button" @click="addCricketDart(seg, 1)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10 hover:from-slate-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">1×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 2)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-1 ring-inset ring-sky-300/15 hover:from-sky-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">2×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 3)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-1 ring-inset ring-amber-300/15 hover:from-amber-500/50"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">3×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-col gap-2">
                        <div v-for="seg in cricketPadSplit.right" :key="'dr'+seg"
                             class="rounded-2xl border border-slate-500/25 bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg shadow-black/25 ring-1 ring-white/[0.06]">
                          <div class="mb-1.5 flex items-center justify-between gap-2">
                            <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Lauks</span>
                            <span class="min-w-[2.25rem] rounded-xl px-2.5 py-1 text-center text-xl font-black tabular-nums border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90">{{ seg }}</span>
                          </div>
                          <div class="grid grid-cols-3 gap-1.5">
                            <button type="button" @click="addCricketDart(seg, 1)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-slate-400/35 bg-gradient-to-b from-slate-600/50 to-slate-950/95 text-white ring-1 ring-inset ring-white/10 hover:from-slate-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">1×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 2)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-sky-400/40 bg-gradient-to-b from-sky-600/45 to-sky-950/95 text-sky-50 ring-1 ring-inset ring-sky-300/15 hover:from-sky-500/55"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">2×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                            <button type="button" @click="addCricketDart(seg, 3)"
                                    :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                                    class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                           border-amber-400/45 bg-gradient-to-b from-amber-600/40 to-amber-950/95 text-amber-50 ring-1 ring-inset ring-amber-300/15 hover:from-amber-500/50"
                                    :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/15' : ''">
                              <span class="text-xl font-black leading-none tabular-nums">3×</span>
                              <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[8px] text-emerald-400">✓</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Bull block — always visible, above Miss -->
                  <div v-if="cricketSdtHasBull"
                       class="flex-shrink-0 rounded-2xl border border-[#1e3050] bg-gradient-to-b from-[#101c32] via-[#0a1424] to-[#060d14] p-2 shadow-lg ring-1 ring-white/[0.06]">
                    <div class="mb-1.5 flex items-center justify-between gap-2 px-0.5">
                      <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Bull</span>
                      <span class="rounded-xl px-2.5 py-1 text-xl font-black tabular-nums border border-rose-900/40 bg-[#1a0a0f] text-rose-300/90">25</span>
                    </div>
                    <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-1.5">
                      <button type="button" @click="addCricketDart(25, 1)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-emerald-700/45 bg-gradient-to-b from-emerald-800/50 to-emerald-950/95 text-emerald-100 ring-1 ring-inset ring-emerald-500/15 hover:from-emerald-700/55"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950' : ''">
                        <span class="text-xl font-black tabular-nums leading-none">1×</span>
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-1 text-[8px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(25, 2)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center overflow-hidden rounded-xl border px-1 py-2.5 shadow-md transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-red-800/50 bg-gradient-to-b from-red-800/55 to-red-950/95 text-red-50 ring-1 ring-inset ring-red-500/20 hover:from-red-700/60"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/50 !from-emerald-950/90 !to-emerald-950 !ring-emerald-500/30' : ''">
                        <span class="text-2xl font-black tabular-nums leading-none">2×</span>
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-1 text-[8px] text-emerald-400">✓</span>
                      </button>
                    </div>
                  </div>

                  <!-- Miss -->
                  <button type="button" @click="addCricketDart(0, 0)"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-shrink-0 w-full rounded-2xl text-xs font-black uppercase tracking-wide bg-[#1a0a0f] text-rose-300/90
                                 hover:bg-[#2a1218] transition active:scale-95 touch-manipulation select-none
                                 disabled:opacity-20 border border-rose-900/40 py-3">
                    Miss
                  </button>

                  <div class="flex gap-2 flex-shrink-0 pt-1">
                    <button type="button" @click="undo"
                            class="flex-1 py-3.5 bg-[#162540] hover:bg-[#1e3050] text-slate-200 rounded-2xl
                                   font-bold transition text-sm active:scale-[0.97] border border-[#1e3050] touch-manipulation">
                      ↩ Atsaukt
                    </button>
                    <button type="button" @click="submitThrow"
                            :disabled="dartInput.darts.length === 0 || submitting"
                            class="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl
                                   font-black transition disabled:opacity-40 text-sm
                                   active:scale-[0.97] shadow-lg shadow-amber-950/30 touch-manipulation">
                      {{ submitting ? '...' : 'Iesniegt →' }}
                    </button>
                  </div>

                </div>
              </template>

            </div>

          </div>

          <!-- ── Mobile layout ── -->
          <div class="lg:hidden grid flex-1 min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden overscroll-none pb-[env(safe-area-inset-bottom)]">

            <div class="flex-shrink-0 px-2 py-1.5 border-b border-[#162540] bg-[#0a1120]/90 flex items-center justify-between gap-1 flex-wrap">
              <span class="text-amber-400 font-mono font-black text-xs tracking-wider truncate min-w-0">{{ state.room_code }}</span>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-slate-500 text-[10px] tabular-nums">
                  L{{ state.current_leg }}/{{ legsConfigTotal }}<template v-if="setsConfigTotal > 1">·S{{ state.current_set }}/{{ setsConfigTotal }}</template>
                </span>
                <template v-if="(isMatchActive || isSuspended) && auth.user">
                  <button type="button" @click="exitGameSaving"
                          class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-600/50 text-slate-400 active:bg-[#162540] touch-manipulation">
                    Prom
                  </button>
                  <button v-if="isMatchActive" type="button" @click="showAbandonConfirm = true"
                          class="px-1.5 py-0.5 rounded text-[9px] font-black border border-rose-800/40 text-rose-400 active:bg-rose-950/30 touch-manipulation">
                    Stop
                  </button>
                </template>
              </div>
            </div>

            <div v-if="isMatchActive && showTurnTimeoutWaitingBanner"
                 class="shrink-0 px-2 py-1.5 bg-amber-950/50 border-b border-amber-700/40 text-center text-[10px] font-semibold text-amber-100 leading-snug">
              {{ t('game.turnTimer.waitingOpponentChoice') }}
            </div>
            <div v-else-if="turnTimerRowVisible"
                 class="shrink-0 flex items-center gap-2 px-2 py-1.5 border-b border-[#162540] bg-[#0d1526]/95">
              <div class="flex-1 min-w-0 h-1.5 rounded-full bg-[#1e3050] overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 transition-[width] duration-500 ease-linear"
                     :style="{ width: turnTimerProgress + '%' }"></div>
              </div>
              <span class="text-[11px] font-mono font-black tabular-nums text-amber-400 w-11 text-right shrink-0">{{ formatTurnClock(turnTimerRemainingSec) }}</span>
            </div>

            <div class="flex-shrink-0 px-2 pt-1.5 pb-1 grid gap-1"
                 :class="players.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'">
              <div v-for="player in players" :key="player.id"
                   class="rounded-xl px-2 py-1.5 transition-all duration-300 min-w-0"
                   :class="Number(player.id) === Number(state.current_player?.id)
                     ? 'bg-[#1a2540] border border-amber-500/35'
                     : 'bg-[#0f1c30] border border-[#162540]'">
                <div class="flex items-center gap-0.5 min-w-0 mb-0.5">
                  <span v-if="Number(player.id) === Number(state.current_player?.id)"
                        class="text-amber-400 text-[10px] flex-shrink-0">▶</span>
                  <span class="text-[11px] font-bold truncate leading-tight flex-1"
                        :class="Number(player.id) === Number(state.current_player?.id) ? 'text-amber-300' : 'text-slate-500'">
                    {{ player.name }}
                  </span>
                  <!-- Score badge -->
                  <span class="flex-shrink-0 font-black tabular-nums leading-none text-xs ml-0.5"
                        :class="player.legs_won > 0
                          ? (Number(player.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-300')
                          : 'text-slate-700'">
                    <template v-if="state.legs_config?.sets > 1">{{ player.sets_won }}S·{{ player.legs_won }}L</template>
                    <template v-else>{{ player.legs_won }}<span class="text-slate-700">/{{ legsToWin }}</span></template>
                  </span>
                </div>
                <div class="flex items-end justify-between gap-1">
                  <span class="text-lg font-black tabular-nums leading-none"
                        :class="player.cricket?.all_closed ? 'text-emerald-400' : 'text-slate-100'">
                    {{ player.cricket?.points ?? 0 }}
                  </span>
                  <div class="flex items-end gap-1.5">
                    <div class="flex flex-col items-end min-w-0" :title="t('game.cricketAvgHint')">
                      <span class="text-[7px] font-black uppercase text-amber-500 leading-none mb-px">{{ t('game.cricketAvgShort') }}</span>
                      <span class="text-sm font-black tabular-nums text-amber-100 leading-none">{{ player.avg_pts ?? '—' }}</span>
                    </div>
                    <div class="flex gap-0.5 flex-shrink-0 pb-0.5">
                      <div v-for="i in legsToWin" :key="i"
                           class="w-1 h-1 rounded-full border transition-all"
                           :class="i <= player.legs_won ? 'bg-amber-400 border-amber-400' : 'border-[#1e3050]'"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Scoreboard -->
            <div class="min-h-0 mx-2 mb-1 rounded-lg overflow-hidden border border-[#162540] bg-[#0f1c30]/95 flex flex-col shadow-inner">
              <div class="flex-shrink-0 border-b border-[#162540] py-1 px-0.5 bg-[#0a1120]/60"
                   :style="scorecardGridStyle">
                <div v-for="p in leftPlayers" :key="'lhm-'+p.id"
                     class="text-center text-[10px] font-bold truncate px-0.5 leading-tight"
                     :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                  {{ p.name }}
                </div>
                <div class="text-center text-[8px] text-slate-500 font-black uppercase tracking-wider leading-tight px-0.5">Lauks</div>
                <div v-for="p in rightPlayers" :key="'rhm-'+p.id"
                     class="text-center text-[10px] font-bold truncate px-0.5 leading-tight"
                     :class="Number(p.id) === Number(state.current_player?.id) ? 'text-amber-400' : 'text-slate-500'">
                  {{ p.name }}
                </div>
              </div>
              <div class="flex-1 min-h-0 flex flex-col overflow-y-auto">
                <div v-for="(seg, idx) in cricketSdtSegments" :key="seg"
                     class="flex-1 min-h-0 basis-0 border-b border-[#162540]/40 last:border-b-0 transition-all duration-300"
                     :class="[idx % 2 === 0 ? 'bg-[#0a1120]/25' : '', segClosedByAll(seg) ? 'opacity-30' : '']"
                     :style="scorecardRowGridStyle">
                  <div v-for="p in leftPlayers" :key="'lmm-'+p.id+'-'+seg"
                       class="flex items-center justify-center min-h-0 min-w-0 border-r border-[#162540]/30 p-px">
                    <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board-sm" />
                  </div>
                  <div class="flex items-center justify-center min-h-0 min-w-0 px-px rounded mx-px my-px shadow-inner"
                       :class="segClosedByAll(seg)
                         ? 'bg-[#0a1120]/95 border border-[#1e3050]'
                         : 'border border-rose-900/40 bg-[#1a0a0f]'">
                    <div class="flex flex-col items-center justify-center leading-none gap-px">
                      <span class="font-black tabular-nums select-none text-[clamp(0.65rem,2.4vmin,0.95rem)]"
                            :class="segClosedByAll(seg) ? 'text-slate-500 line-through' : 'text-rose-300/90'">
                        {{ seg === 25 ? '25' : seg }}
                      </span>
                      <span v-if="seg === 25 && !segClosedByAll(seg)"
                            class="text-[6px] font-bold uppercase tracking-wider text-rose-400/80 leading-none">bull</span>
                    </div>
                  </div>
                  <div v-for="p in rightPlayers" :key="'rmm-'+p.id+'-'+seg"
                       class="flex items-center justify-center min-h-0 min-w-0 border-l border-[#162540]/30 p-px">
                    <CricketMarkCell :hits="hitsFor(p.id, seg)" :closed="segClosedByAll(seg)" size="board-sm" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile input area -->
            <div class="min-h-0 flex flex-col overflow-y-auto overscroll-y-contain border-t border-[#162540] bg-[#0a1120]
                        px-2 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))]">

              <div v-if="waitingForTurnUi" class="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 py-2">
                <span class="text-slate-500 text-[10px] uppercase tracking-widest">Gaida</span>
                <span class="text-slate-100 font-bold text-sm text-center px-2">{{ state.current_player?.name }}</span>
                <div class="flex gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style="animation-delay:300ms"></span>
                </div>
              </div>

              <template v-else>

                <!-- Segment rows + Miss column side by side -->
                <div class="flex-shrink-0 flex gap-0.5 mb-0.5">

                  <!-- Left: segment rows + bull -->
                  <div class="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div v-for="seg in cricketSdtNonBull" :key="'mr'+seg"
                         class="grid gap-0.5 items-stretch"
                         style="grid-template-columns: 1.5rem 1fr 1fr 1fr; min-height: 1.75rem">
                      <div class="flex items-center justify-center text-[11px] font-black tabular-nums leading-none rounded-md border px-0.5 min-w-0"
                           :class="segClosedByAll(seg)
                             ? 'text-slate-600 line-through opacity-40 border-[#1e3050] bg-[#0a1120]'
                             : myHitsFor(seg) >= 3
                             ? 'text-emerald-300 border-emerald-800/40 bg-emerald-950/50'
                             : 'text-rose-300/90 border-rose-900/40 bg-[#1a0a0f]'">
                        {{ seg }}
                      </div>
                      <button type="button" @click="addCricketDart(seg, 1)"
                              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-slate-500/35 bg-gradient-to-b from-slate-600/40 to-slate-900/90 text-white"
                              :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        1×
                        <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(seg, 2)"
                              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-sky-500/40 bg-gradient-to-b from-sky-700/40 to-sky-950/90 text-sky-100"
                              :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        2×
                        <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(seg, 3)"
                              :disabled="segClosedByAll(seg) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-amber-500/40 bg-gradient-to-b from-amber-700/35 to-amber-950/90 text-amber-100"
                              :class="myHitsFor(seg) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        3×
                        <span v-if="myHitsFor(seg) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                    </div>

                    <!-- Bull row -->
                    <div v-if="cricketSdtHasBull"
                         class="grid gap-0.5 items-stretch"
                         style="grid-template-columns: 1.5rem 1fr 2fr; min-height: 1.75rem">
                      <div class="flex items-center justify-center text-[11px] font-black rounded-md border px-0.5"
                           :class="segClosedByAll(25)
                             ? 'text-slate-600 opacity-40 border-[#1e3050] bg-[#0a1120]'
                             : myHitsFor(25) >= 3
                             ? 'text-emerald-300 border-emerald-800/40 bg-emerald-950/50'
                             : 'text-rose-300/90 border-rose-900/40 bg-[#1a0a0f]'">B</div>
                      <button type="button" @click="addCricketDart(25, 1)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-emerald-700/45 bg-gradient-to-b from-emerald-800/45 to-emerald-950/95 text-emerald-100"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        1×
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-0.5 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                      <button type="button" @click="addCricketDart(25, 2)"
                              :disabled="segClosedByAll(25) || dartInput.darts.length >= 3"
                              class="relative flex items-center justify-center rounded-md border font-black text-sm transition active:scale-[0.96] touch-manipulation select-none disabled:opacity-20
                                     border-red-800/50 bg-gradient-to-b from-red-800/50 to-red-950/95 text-red-50"
                              :class="myHitsFor(25) >= 3 ? '!border-emerald-600/40 !from-emerald-950/80 !to-emerald-950' : ''">
                        2×
                        <span v-if="myHitsFor(25) >= 3" class="absolute right-1 top-0.5 text-[6px] text-emerald-400">✓</span>
                      </button>
                    </div>
                  </div>

                  <!-- Right: Miss vertical button -->
                  <button type="button" @click="addCricketDart(0, 0)"
                          :disabled="dartInput.darts.length >= 3"
                          class="flex-shrink-0 w-7 self-stretch flex items-center justify-center rounded-md border
                                 bg-[#1a0a0f] border-rose-900/40 touch-manipulation disabled:opacity-20
                                 active:scale-[0.97] transition">
                    <span class="text-rose-300/90 font-black text-[9px] uppercase tracking-widest"
                          style="writing-mode: vertical-rl; transform: rotate(180deg)">Miss</span>
                  </button>
                </div>

                <!-- Undo / Submit -->
                <div class="grid grid-cols-2 gap-1.5 flex-shrink-0 mb-1">
                  <button type="button" @click="undo"
                          class="py-1.5 bg-[#162540] hover:bg-[#1e3050] text-slate-200 rounded-xl font-bold text-xs
                                 active:scale-[0.98] border border-[#1e3050] touch-manipulation">
                    ↩ Atsaukt
                  </button>
                  <button type="button" @click="submitThrow"
                          :disabled="dartInput.darts.length === 0 || submitting"
                          class="py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-xs transition disabled:opacity-40
                                 active:scale-[0.98] shadow-md shadow-amber-950/25 touch-manipulation">
                    {{ submitting ? '...' : 'Iesniegt →' }}
                  </button>
                </div>

                <!-- Dart display — fills remaining space -->
                <div class="flex-1 min-h-0 flex gap-2 items-stretch overflow-hidden">
                  <div v-for="(d, i) in dartInput.darts" :key="i"
                       class="flex-1 min-w-0 min-h-0 bg-[#0d1a2e] border border-amber-500/25 rounded-xl
                              flex flex-col items-center justify-center gap-0.5 relative overflow-hidden">
                    <div class="font-mono font-black text-amber-400 leading-none tabular-nums
                                text-[clamp(1.1rem,6vw,2rem)]">{{ dartLabel(d) }}</div>
                    <div class="text-slate-500 text-[10px] tabular-nums leading-none">{{ dartValue(d) || 0 }}</div>
                    <button type="button" @click="removeDart(i)"
                            class="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-950/80 border border-rose-700/40
                                   text-rose-400 text-[9px] flex items-center justify-center active:bg-rose-800 touch-manipulation">✕</button>
                  </div>
                  <div v-for="i in (3 - dartInput.darts.length)" :key="'ep'+i"
                       class="flex-1 min-w-0 min-h-0 border border-dashed border-[#1a2a42] rounded-xl
                              flex items-center justify-center text-[#1e3050] font-mono text-xl"></div>
                </div>
              </template>

            </div>

          </div>

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

            <!-- Scoreboard -->
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
  `};export{jt as default};
