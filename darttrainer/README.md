# TrainDart — izstrādātāju dokumentācija

Šis fails ir dzīvs, augošs kodabāzes apraksts (Confluence stila), ko veidojam pakāpeniski, izejot cauri katrai spēles plūsmas daļai. Katra sadaļa apraksta, kas notiek kodā solis pa solim, sākot no entrypointa (route/controller) līdz Vue komponentei ekrānā.

## Saturs

- [X01 (501) spēle](#x01-501-spēle)
  - [Entrypoints — lobby izveide](#entrypoints--lobby-izveide)
  - [Spēles iesetošana (lobby konfigurācija → starts)](#spēles-iesetošana-lobby-konfigurācija--starts)
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

### Veiktspēja

Projektam gaidāms liels trafiks, tāpēc biežākajiem ceļiem (lietotājam jau ir aktīvs/lobby matčs — tas notiek pie katras atgriešanās spēlē) query skaits ir apzināti minimizēts:

- `index()` izmanto `currentMatchFor()`, NEVIS `activeLobbyFor()`. Atšķirība: `activeLobbyFor()` papildus dara `$match->loadMissing(['config', 'players'])` (2 papildu queries), lai uzbūvētu `mode`/`is_host`/`player_count` laukus — bet `index()` pārvirzīšanas lēmumam vajag tikai `uuid` un `status`. Rezultāts: 1 query 3 vietā biežākajā ceļā.
- `activeLobbyFor()` (ar pilno eager-load) joprojām ir pareizā izvēle vietās, kur šie lauki tiešām tiek lietoti — piem. `HandleInertiaRequests` middleware (`app/Http/Middleware/HandleInertiaRequests.php:57`) to padod kā shared `activeLobby` propu VISOS Inertia render'os (banner UI), un tur `mode`/`player_count` tiešām ir vajadzīgi.
- Indeksi pārbaudīti (2026-07-25): `matches.status` (single-column index), `matches.host_user_id` (implicit FK index), `match_players(match_id, user_id)` (composite index) — pietiekami pašreizējam query veidam (`WHERE status IN (...) AND (host_user_id = ? OR EXISTS (...))`). Nav pievienotas jaunas kolonnas/indeksi, jo nebija konkrētu pierādījumu (EXPLAIN/slow query log), ka tas ir šaurākā vieta — tikai tad, ja profiling to parādīs.

### Vēsture / lēmumi

- **2026-07-25:** `index()` sākotnēji pārvirzīja tikai statusam `active`; ja lietotājam bija "iesāls" `Lobby`-statusa matčs, viņš vienmēr redzēja tukšu "izveidot jaunu" ekrānu (nevis tika atvests atpakaļ). Tas NEBIJA strupceļš — `store()` to jau noķēra un pārvirzīja pareizi — bet radīja nevajadzīgu papildu soli. Salabots: `index()` tagad pārvirza abiem statusiem (`active` → play, `lobby` → lobby.show), konsekventi ar `store()` uzvedību.
- **2026-07-25:** `index()` pārrakstīts, lai izmantotu `currentMatchFor()` `activeLobbyFor()` vietā — izvairās no 2 liekām queries (config/players eager-load) biežākajā ceļā. Sk. "Veiktspēja" augstāk.
- **2026-07-25:** Atrasts un salabots trūkums — `LobbySetupService` (`updateThrowOrder`, `setFirstThrower`, `updatePlayerStartingPoints`) nekad neizsūtīja `LobbyUpdated` broadcast, atšķirībā no `MatchLobbyService` metodēm, kas to dara. Rezultātā online lobby: kad hosts mainīja metēšanas secību/pirmo metēju/starta punktus, pārējie dalībnieki to nedabūja reāllaikā (nebija websocket push → nenotika partial reload) un redzēja vecos datus, kamēr paši nesagenerēja citu notikumu vai manuāli neatsvaidzināja lapu. Salabots: visas trīs metodes tagad izsauc `broadcast(new LobbyUpdated($match->fresh(['players', 'config'])))->toOthers()` pēc veiksmīgas izmaiņas (izlaižot `setFirstThrower` agrīnās atgriešanās, kur reāli nekas nemainījās).
