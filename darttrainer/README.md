# TrainDart — izstrādātāju dokumentācija

Šis fails ir dzīvs, augošs kodabāzes apraksts (Confluence stila), ko veidojam pakāpeniski, izejot cauri katrai spēles plūsmas daļai. Katra sadaļa apraksta, kas notiek kodā solis pa solim, sākot no entrypointa (route/controller) līdz Vue komponentei ekrānā.

## Saturs

- [X01 (501) spēle](#x01-501-spēle)
  - [Entrypoints — lobby izveide](#entrypoints--lobby-izveide)
  - [Spēles iesetošana (lobby konfigurācija → starts)](#spēles-iesetošana-lobby-konfigurācija--starts)
  - [Spēles gaita (play ekrāns)](#spēles-gaita-play-ekrāns)
  - [Veiktspēja](#veiktspēja)

---

## X01 (501) spēle

X01 ir klasiskais dārtu formāts (parasti 501), kur spēlētāji met, lai novestu atlikušo punktu skaitu tieši līdz 0. Multiplayer plūsma sastāv no divām daļām: **lobby** (spēlētāju/konfigurācijas savākšana pirms starta) un **play** (pats spēles ekrāns).

Route grupa: `routes/darts.php`, prefikss `darts/x01`, middleware `auth` + `verified.darts`.

### Entrypoints — lobby izveide

**Route:** `GET /darts/x01/multiplayer` → `darts.x01.lobby.index` → `DartsLobbyController::index()`

**Solis pa solim:**

1. **Middleware.** Pirms controller metode vispār izpildās, Laravel pārbauda `auth` (lietotājs pieslēdzies) un `verified.darts` (darts-specifisks verifikācijas statuss). Ja nesakrīt — lietotājs tiek pārvirzīts prom, controller kods neizpildās.

2. **Pārbauda esošu matču.** `PlayerMatchAvailabilityService::currentMatchFor($user)` meklē `DartMatch` ierakstu ar statusu `Lobby` vai `Active`, kur lietotājs ir host VAI spēlētājs (`host_user_id` vai `players` relācija), ņemot jaunāko (`latest('id')`). Ja nekā nav — atgriež `null`. (`index()` apzināti izmanto `currentMatchFor()`, nevis `activeLobbyFor()` — sk. "Veiktspēja" zemāk.)

3. **Pārvirza, ja matčs jau eksistē** (labots — sk. zemāk "Vēsture/lēmumi"):
   - Statuss `active` (spēle jau sākta) → `redirect()->route('darts.x01.play', $uuid)` — tieši uz `DartsPlay.vue`.
   - Statuss `lobby` (izveidots, bet vēl nesākts) → `redirect()->route('darts.x01.lobby.show', $uuid)` — atpakaļ uz to pašu lobby, nevis tukšu "izveidot jaunu" ekrānu.

4. **Citādi renderē lobby izveides ekrānu.** `Inertia::render('darts/DartsLobby', [...])` ielādē `resources/js/pages/darts/DartsLobby.vue`, padodot:
   - `friends` — draugu saraksts ar aktivitātes statusu (`MatchLobbyService::friendsWithActivity()`), izmantojams uzaicināšanai online režīmā.
   - `savedGuests` — iepriekš izmantoti local/guest spēlētāju vārdi, ātrai pievienošanai "local" (pass-and-play) režīmā bez atkārtotas rakstīšanas.
   - `user` — minimāla pašreizējā lietotāja info (`id`, `name`, `is_premium`) UI personalizācijai.

**Divi režīmi, ko lietotājs izvēlas `DartsLobby.vue` ekrānā:**
- **`online`** — īsti spēlētāji, katrs ar savu kontu/pārlūku, uzaicinājumi caur `friends`/lobby kodu.
- **`local`** — pass-and-play viena pārlūka sesijā, vairāki spēlētāji (2-4) tiek pievienoti manuāli tajā pašā ierīcē (ērti lokālai testēšanai).

**Nākamais solis pēc "Izveidot":** `POST /darts/x01/multiplayer` → `DartsLobbyController::store()` — validē `mode`/`match_type`, pārbauda vai jau nav esoša matča (ja ir — pārvirza uz to ar `already-in-lobby` statusu, nevis met kļūdu), citādi izveido jaunu `DartMatch` caur `MatchLobbyService::createLobby()` un pārvirza uz `lobby.show`.

### Spēles iesetošana (lobby konfigurācija → starts)

Viss caur `DartsLobbyController`, servisi: `MatchLobbyService` (spēlētāji/config/starts), `LobbySetupService` (metēšanas secība/starta punkti), `MatchAccessService` (tiesības), `LobbyInviteService` (uzaicinājumi).

**1. Izveide** (`POST /darts/x01/multiplayer` → `store()`): validē `mode` (`online`/`local`) un `match_type` (`solo`/`team`). Ja lietotājam jau ir matčs — pārvirza uz to (`already-in-lobby`), nemet kļūdu. Citādi `MatchLobbyService::createLobby()` transakcijā:
- izveido `DartMatch` (status `lobby`; `online` režīmā ģenerē unikālu `lobby_code` ar retry-loop līdz 10 mēģinājumiem pret `UniqueConstraintViolationException`),
- izveido noklusējuma `DartX01MatchConfig` (501, `first_to` 1 leg/1 set, in=straight, out=double, `track_checkout_rate=false`),
- pievieno hostu kā pirmo `MatchPlayer` (slot 1, status `ready`).

**2. Lobby ekrāns** (`GET /darts/x01/multiplayer/{uuid}` → `show()`): pārbauda dalību (`isParticipant`), ja statuss jau `active` — pārvirza tieši uz play. Citādi renderē `DartsLobby.vue` ar pilnu `serializeLobby()` momentuzņēmumu (spēlētāji, config, `can_proceed`, gaidošie ielūgumi).

**3. Konfigurēšana** — visas šīs darbības prasa `authorizeHost()` (tikai hosts drīkst mainīt) un `assertLobbyEditable()`/statusa pārbaudi (tikai `lobby` statusā):
- `updateConfig` — formāts, legu/setu skaits, starta punkti (301/501), in/out noteikumi, checkout rate tracking, publiskums.
- `updateMatchType` — solo/team.
- `addPlayer` — reģistrēts lietotājs (tikai `local` režīmā tiešā veidā; `online` režīmā jāiet caur ielūgumu — `lobby-invite-required`) vai guest (ar iespēju saglabāt kā "saved guest" nākamajām reizēm).
- `updateThrowOrder` / `setFirstThrower` — metēšanas secība; iekšēji pārkārto `slot` laukus (pagaidu novieto uz `100+id`, tad pārnumurē), lai izvairītos no unique/kolīzijas starpstāvokļiem.
- `updatePlayerStartingPoints` — individuāls starta punktu skaits konkrētam spēlētājam (pārraksta match-level noklusējumu).
- `sendInvite` / `acceptInvite` / `declineInvite` — `online` režīma uzaicinājumi caur `LobbyInviteService`.

**4. Vai var startēt?** `MatchLobbyService::canProceed()`: `team` — vajag ≥4 spēlētājus un pāra skaitu; `solo` — ≥2. Ja režīms `online` — visiem spēlētājiem jābūt `ready` statusā (`local` režīmam šī prasība netiek piemērota, jo viena persona kontrolē visus).

**5. Starts** (`POST .../start` → `start()` → `startMatch()`): pārbauda `canProceed()`, atceļ visus gaidošos ielūgumus, tad transakcijā: statuss → `active`, `lobby_code` → `null`, visi spēlētāji → `playing`, izveido pirmo `DartX01ActiveLeg`, un iedarbina gājiena taimeri pirmajam metējam (`MatchStateService::resolveActivePlayerId` + `MatchTurnTimerService::startForPlayer`). Pārvirza uz play ekrānu.

**Reāllaika sinhronizācija (online lobby).** `DartsLobby.vue` klausās websocket `LobbyUpdated` eventu (tikai `online` režīmā — `local` nemaz neklausās, jo viens pārlūks) un pie katra eventa izsauc Inertia partial reload (`only: ['lobby', 'friends']`), lai pārējiem dalībniekiem lapa atsvaidzinātos bez manuālas darbības.

### Spēles gaita (play ekrāns)

Pēc `start()` lietotājs nonāk `DartsPlay.vue` ekrānā. Šī sadaļa apraksta, kas notiek no metiena reģistrēšanas līdz spēles beigām.

**Entrypoint.** `GET /darts/x01/play/{uuid}` → `DartsPlayController::show()`:
1. Meklē `DartMatch` pēc `uuid` ar `first()` (ne `firstOrFail()`) — ja matčs nav atrasts, NEmet 404, bet pārvirza uz `darts.x01.match-gone?reason=all_left`. Tas pats notiek, ja `MatchAccessService` liedz piekļuvi (nedz dalībnieks, nedz var skatīties kā spectator) — mīksta "matčs pazuda" pārvirze, ne kļūdas lapa.
2. Renderē `Inertia::render('darts/DartsPlay', [...])` ar minimālu identitātes/lomas payload'u (`matchUuid`, `role` — `player`/`spectator`, `user`, `playerId`, `isHost`, `isLocal`). **Pats spēles stāvoklis (rezultāti, gājieni) NETIEK sūtīts caur Inertia** — to `DartsPlay.vue` ielādē atsevišķi caur `GET /v1/darts/matches/{uuid}/state`.

**Stāvokļa būvēšana — `MatchStateService::buildState()`.** Šī ir centrālā metode, ko izsauc katrs endpoint pēc katras mutācijas (un vienkārši nolasot stāvokli):
- Eager-load `config, players, legs.soloTurns.throws, activeLeg.soloTurns.throws.player`.
- `turnTimer->syncExpiry()` — ja gājiena taimeris tikko beidzies, uzreiz šeit pārslēdz statusu uz `expired` un izraisa broadcast (nozīmē: **stāvokļa nolasīšana pati var izraisīt blakusefektu**, ne tikai lasīt).
- Katram spēlētājam sarullē visus attiecīgā leg gājienus, aprēķinot atlikušos punktus, 3-metienu vidējo (leg un match līmenī), un identificē "atvērto" (aktīvo, vēl nepabeigto) gājienu — kalkulatora vizītes NEKAD nav "atvērtas" tālākai metienu pievienošanai, tās ir atomiskas.
- `resolveActivePlayerId()`: rotācija pēc `slot`. Kalkulatora vizīte VIENMĒR beidz gājienu uzreiz (neatkarīgi no metienu skaita); dēļa režīmā gājiens beidzas tikai pēc bullēšanas, uzvaras vai 3 metieniem. Team režīmā katrs jauns leg maina, kurš sāk metot (nepāra leg → 1. slots, pāra → 2. slots).
- Atgrieztais JSON ietver `config`, `current_state` (aktīvais spēlētājs, pašreizējais gājiens, `checkout_context`, `turn_timer`, pēdējie 40 gājieni) un `scoreboard` (katram spēlētājam atlikums, legi, average, `scoring_mode`, `stats_tier`).
- `buildSpectatorState()` — tas pats, bet apzināti noņemts viss identificējošais/detalizētais (nav `player_id`, nav metienu, nav checkout norādes) — spectatoriem tikai vārds, atlikums, kam gājiens.
- **Sets vēl nav ieviesti** — `current_set` vienmēr hardkodēts `1`, `sets_target` config laukā netiek izmantots. Pašreiz spēle ir tikai "best-of-legs" viena seta ietvaros.

**Metiena/vizītes reģistrēšana — `X01MatchPlayService`.** Divi ceļi, atkarībā no `scoring_mode`:
- **Dēļa režīms** (`recordThrow` → `recordThrowInternal`): viens metiens (`sector`+`multiplier`) reizē. Katru reizi pārrēķina VISU gājienu no jauna (`X01ScoringService::evaluateTurn`) ar visiem līdzšinējiem šī gājiena metieniem — tā korekti apstrādā "double-in" noteikumu, kam jāzina iepriekšējie metieni tajā pašā vizītē.
- **Kalkulatora režīms** (`recordPointsThrow` → `recordCalculatorVisit`): visa vizīte (punktu summa) uzreiz. Ja gājienam jau bija metieni (labošana) — tie tiek dzēsti un aizstāti, kalkulatora vizītes ir atomiskas/aizstājamas, ne pakāpeniskas. Punktu summa vai nu tiek dekomponēta metienos automātiski (`X01DartPointsMapper::buildVisitDarts`, ievērojot `checkoutDart`/`doubleDarts` ierobežojumus), vai klients var pats padot precīzus metienus (`throws_detail`).
- **Bullēšanas/double noteikumi** (`X01ScoringService::evaluateTurn`): pāriet zem 0 → bullēšana (atgriežas uz gājiena sākuma atlikumu). Atstāt tieši 1, kad izeja ir "double" → automātiska bullēšana (uz 1 nekad nevar aiztaisīt ar dubultnieku). Precīzi 0, bet pēdējais metiens nav dubultnieks (kad `out_rule=double`) → arī bullēšana. "Double-in": kamēr spēlētājs vēl nav iesities (nav bijis punktu šajā leg), metieni, kas nav dubultnieki, vienkārši netiek ieskaitīti (nav bullēšana, tikai 0 punkti), kamēr nepienāk pirmais dubultnieks.
- **Autorizācija** (`assertCanThrow`): drīkst mest, ja tu esi aktīvā `MatchPlayer` īpašnieks; VAI matčs ir `local` režīmā un tu esi hosts (viena ierīce — hosts kontrolē visus); VAI aktīvais spēlētājs ir viesis (`user_id=null`) un tu esi hosts (hosts drīkst mest arī online matčā nereģistrētu viesu vietā). Citādi 403 `not-your-turn`.

**Scoring mode / stats tier (`MatchScoringModeService`).** `stats_tier` ir vienvirziena "trencis" `full` → `basic`: tiklīdz spēlētājs iesniedz jebkuru kalkulatora vizīti (`ensureCalculatorMode`, izsaukts automātiski no `recordCalculatorVisit`) vai eksplicīti izsauc `lockCalculatorMode`, viņš tiek pārslēgts uz `scoring_mode=calculator, stats_tier=basic` un **atpakaļceļa uz `full` nav** šajā matčā. No `basic` tier drīkst brīvi pārslēgties starp dēļa/kalkulatora ievadi (`switchToBoardMode`/`switchToCalculatorMode`), bet statistika paliek "samazinātā" tier līdz spēles beigām.

**Checkout aprēķini (`CheckoutCalculationService`).** Klasiskais neaizmestamo double-out rezultātu saraksts (`159, 162, 163, 165, 166, 168, 169, 172, 173, 175, 176, 178, 179`) — `checkoutContext()` atgriež, vai atlikums ir aizmetams un ieteikto ceļu (`getCheckoutRoutes`, formatēts kā `D20`/`T19`/`B50` u.tml.). `requiresDoubleAttemptsPrompt()` nosaka, kad frontend'am jāprasa "cik dubultniekus mēģināji" (checkout mēģinājumu statistikai) — ja iepriekšējais atlikums bija checkout diapazonā un vizīte vai nu bullēja, vai nesasniedza tieši nepieciešamo, vai bija tieša finiša mēģinājums.

**Gājienu rediģēšana un audits (`X01TurnEditService` / `X01TurnEditAuditService`).** `PATCH /v1/darts/matches/{uuid}/turns/{turn}` — pieņem vai nu precīzus metienus, vai punktu summu (kalkulators to pašu dekomponē). Rediģēt drīkst hosts (jebkuru gājienu) VAI spēlētājs pats savu. Tā kā agrāka gājiena labojums var mainīt VISU turpmāko gājienu atlikumus/bullēšanas, `recalculateLegFromTurn()` **pārsimulē visus leg gājienus hronoloģiski no labotā punkta uz priekšu**, izmantojot to pašu `evaluateTurn` dzinēju; ja pārsimulācija kādā punktā rada uzvaru, leg tiek pabeigts un tālākie (jau nebūtiskie) gājieni paliek neaiztikti. Katrs labojums tiek **pastāvīgi auditēts** (`DartX01TurnEdit`: pirms/pēc metieni, punkti, atlikums, bullēšana, kas un kad labojis) — noderīgi strīdu risināšanai/anti-cheat.

**Gājiena taimeris (`MatchTurnTimerService`).** 180 sekundes uz gājienu, **atslēgts pilnībā `local` režīmā** (viena ierīce, nav ko gaidīt). `syncExpiry()` tiek izsaukts pie katras stāvokļa nolasīšanas. Kad taimeris beidzies, **tikai pretinieks** (ne pats aizkavējies spēlētājs, ne hosts par savu viesi) drīkst vai nu `extend` (jauns 180s logs), vai `abandon` (dzēš matču pilnībā caur `MatchAbandonService`).

**Iziešana/pamešana.** `leave` (`MatchPlayLeaveService`) dzēš spēlētāja `MatchPlayer` rindu (izkrīt no rotācijas); ja pēc tam reģistrētu (ne-viesu) spēlētāju palicis ≤1, matčs tiek pilnībā dzēsts (`abandonAndDelete`, iemesls `all_left`). `MatchAbandonService::abandonAndDelete()` dzēš čatu, broadcastē `MatchAbandoned` VISIEM (ne tikai citiem) un **hard-dzēš matča rindu** — nekāda statistikas arhivēšana nenotiek pamestiem matčiem.

**Čats (`MatchChatService`).** Līdz 500 rakstzīmēm, `strip_tags` normalizācija, glabājas 7 dienas (`pruneExpired`), tiek dzēsts arī pie matča pamešanas/pabeigšanas — pilnībā efemērs, nav domāts ilgtermiņa vēsturei. Spectatori drīkst lasīt čatu, bet ne rakstīt.

**Spēles pabeigšana.** `finishLeg()`: skaita spēlētāja uzvarētos leg; ja sasniegts `legsRequiredToWin` (`BestOf` → `ceil(legs_target/2)`, `FirstTo` → `legs_target`) → `finishMatch()`; citādi izveido nākamo leg un iedarbina taimeri jaunajam sācējam. `finishMatch()` iestata `status=finished`, `winner_id`, un dispatcho `CompleteDartsMatchJob` (queued): arhivē gājienu labojumus, agregē katra reģistrētā spēlētāja statistiku (`DartX01PlayerStat` — legi, metieni, punkti, checkout mēģinājumi/veiksmes), premium lietotājiem arhivē katru individuālo metienu (`DartX01SoloArchivedThrow`), un **pēc tam dzēš visas dzīvās spēles tabulas** (legs/turns/throws) — pēc pabeigšanas paliek tikai `matches` rinda, `MatchPlayer` rindas un arhivētā/agregētā statistika.

**API maršrutu saraksts (`routes/api.php`, prefikss `v1`, middleware `web+auth+verified.darts`):**

| Metode | Ceļš | Controller |
|---|---|---|
| GET | `darts/matches/{uuid}/state` | `MatchStateController::show` |
| POST | `darts/matches/{uuid}/throws` | `MatchPlayController::store` |
| POST | `darts/matches/{uuid}/scoring-mode/calculator` | `MatchScoringModeController::storeCalculator` |
| POST | `darts/matches/{uuid}/scoring-mode/board` | `MatchScoringModeController::storeBoard` |
| POST | `darts/matches/{uuid}/leave` | `MatchPlayLeaveController::store` |
| PATCH | `darts/matches/{uuid}/turns/{turn}` | `MatchTurnEditController::update` |
| POST | `darts/matches/{uuid}/turn-timer/extend` | `MatchTurnTimerController::extend` |
| POST | `darts/matches/{uuid}/turn-timer/abandon` | `MatchTurnTimerController::abandon` |
| GET | `darts/matches/{uuid}/chat` | `MatchChatController::index` |
| POST | `darts/matches/{uuid}/chat` | `MatchChatController::store` |

Visi gated caur `MatchAccessService` — vairums prasa `canAccessFullState` (dalībnieks); `state` un `chat.index` papildus pieļauj `canAccessSpectatorState` (publisks + aktīvs matčs, nedalībniekiem).

**Frontend sinhronizācija (`resources/js/stores/dartsPlay.ts`).** `listenToMatch()` dara **abus reizē**: polls `GET .../state` ik pēc 1000ms UN klausās privāto Echo kanālu `match.{uuid}` (`.MatchStateUpdated`, `.MatchAbandoned`). Abi ceļi iet caur `handleSnapshot`, kas de-duplicē pēc JSON "paraksta" (status/leg/aktīvais spēlētājs/taimeris/pēdējais gājiens/scoreboard), lai polling un websocket kopā neizraisītu dubultu re-renderi. 404 no polling → `matchEnded=true`. Kļūdu kartēšana (`resolveThrowError`): 403 + `not-your-turn` → tāds pats kods; `calculator-mode-active`/`calculator-mode-locked` → tas pats; cits 403 → `throw-forbidden`; citādi `throw-failed` — šo divu pirmo gadījumā store uzreiz klusi pārsinhronizē stāvokli (aizsardzība pret novecojušu klienta stāvokli, kas izraisa liekas noraidītas darbības).

### Veiktspēja

Projektam gaidāms liels trafiks, tāpēc biežākajiem ceļiem (lietotājam jau ir aktīvs/lobby matčs — tas notiek pie katras atgriešanās spēlē) query skaits ir apzināti minimizēts:

- `index()` izmanto `currentMatchFor()`, NEVIS `activeLobbyFor()`. Atšķirība: `activeLobbyFor()` papildus dara `$match->loadMissing(['config', 'players'])` (2 papildu queries), lai uzbūvētu `mode`/`is_host`/`player_count` laukus — bet `index()` pārvirzīšanas lēmumam vajag tikai `uuid` un `status`. Rezultāts: 1 query 3 vietā biežākajā ceļā.
- `activeLobbyFor()` (ar pilno eager-load) joprojām ir pareizā izvēle vietās, kur šie lauki tiešām tiek lietoti — piem. `HandleInertiaRequests` middleware (`app/Http/Middleware/HandleInertiaRequests.php:57`) to padod kā shared `activeLobby` propu VISOS Inertia render'os (banner UI), un tur `mode`/`player_count` tiešām ir vajadzīgi.
- Indeksi pārbaudīti (2026-07-25): `matches.status` (single-column index), `matches.host_user_id` (implicit FK index), `match_players(match_id, user_id)` (composite index) — pietiekami pašreizējam query veidam (`WHERE status IN (...) AND (host_user_id = ? OR EXISTS (...))`). Nav pievienotas jaunas kolonnas/indeksi, jo nebija konkrētu pierādījumu (EXPLAIN/slow query log), ka tas ir šaurākā vieta — tikai tad, ja profiling to parādīs.

### Vēsture / lēmumi

- **Atrasts, nesalabots (piezīme turpmākai tīrīšanai):** `X01ScoringService::isValidTurn()` satur mirušu kodu — lokālais mainīgais `$openedWithDouble` tiek uzstādīts, bet nekad nav lasīts/atgriezts. Šī metode arī šķiet neizmantota reālajā plūsmā — faktiskā scoring loģika visur iet caur `evaluateTurn()`. Nav dzēsts, jo nebija skaidrs vai kāds tests/cita vieta uz to paļaujas — pirms dzēšanas jāpārbauda ar grep pēc `isValidTurn(`.
- **Veiktspējas piezīme:** `MatchStateUpdated` events `broadcastWith()` PATS no jauna izsauc `MatchStateService::buildState()` no svaigi ielādēta matča, nevis atkārtoti izmanto stāvokli, ko jau aprēķināja izsaucošā darbība (piem. `recordThrow`). Tas nozīmē **stāvoklis tiek būvēts divreiz uz katru mutējošo darbību** — vienreiz HTTP atbildei, vienreiz broadcast payload'am. Nav pierādīts, ka tas reāli ir šaurākā vieta, bet augsta trafika/biežu metienu gadījumā der paturēt prātā.
- **2026-07-25:** `index()` sākotnēji pārvirzīja tikai statusam `active`; ja lietotājam bija "iesāls" `Lobby`-statusa matčs, viņš vienmēr redzēja tukšu "izveidot jaunu" ekrānu (nevis tika atvests atpakaļ). Tas NEBIJA strupceļš — `store()` to jau noķēra un pārvirzīja pareizi — bet radīja nevajadzīgu papildu soli. Salabots: `index()` tagad pārvirza abiem statusiem (`active` → play, `lobby` → lobby.show), konsekventi ar `store()` uzvedību.
- **2026-07-25:** `index()` pārrakstīts, lai izmantotu `currentMatchFor()` `activeLobbyFor()` vietā — izvairās no 2 liekām queries (config/players eager-load) biežākajā ceļā. Sk. "Veiktspēja" augstāk.
- **2026-07-25:** Atrasts un salabots trūkums — `LobbySetupService` (`updateThrowOrder`, `setFirstThrower`, `updatePlayerStartingPoints`) nekad neizsūtīja `LobbyUpdated` broadcast, atšķirībā no `MatchLobbyService` metodēm, kas to dara. Rezultātā online lobby: kad hosts mainīja metēšanas secību/pirmo metēju/starta punktus, pārējie dalībnieki to nedabūja reāllaikā (nebija websocket push → nenotika partial reload) un redzēja vecos datus, kamēr paši nesagenerēja citu notikumu vai manuāli neatsvaidzināja lapu. Salabots: visas trīs metodes tagad izsauc `broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers()` pēc veiksmīgas izmaiņas (izlaižot `setFirstThrower` agrīnās atgriešanās, kur reāli nekas nemainījās).
