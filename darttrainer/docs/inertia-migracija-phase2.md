# Phase 2 — Shell + Home + navigācija uz Inertia

Izklāsts un migrācijas plāns. Koda izmaiņas šajā fāzē vēl NAV veiktas — šis ir plāns, ko apstiprināt pirms rakstīšanas.

---

## 1. Kā tas strādā ŠOBRĪD (vecais SPA)

DartTrainer priekšpuse pašlaik ir viena liela **klienta puses Vue SPA**, kas dzīvo mapē `resources/js/dart-app/`. Servera puse (Laravel) to gandrīz neredz — tā tikai atdod tukšu `index.html`, un viss pārējais notiek pārlūkā.

Plūsma īsumā:

1. Lietotājs atver jebkuru URL (piem. `/`, `/friends`, `/stats`).
2. `ServeSpaController` (vai nginx) atdod `index.html` ar vienu skriptu — `main.js`.
3. `main.js` uzmontē Vue lietotni, ieslēdz **Vue Router** un **Pinia**.
4. Vue Router paskatās uz URL un izlemj, kuru lapu (`Home.vue`, `Friends.vue` …) parādīt — viss klientā, bez servera pieprasījuma.
5. Dati (lietotājs, istabas, statistika) nāk atsevišķi caur **Axios** pieprasījumiem uz `/api/*`, un tos glabā **Pinia stores**.

### Galvenie faili un ko tie dara

| Fails | Loma |
|-------|------|
| `main.js` | Ieejas punkts. Uzmontē Vue, pieslēdz Pinia + Router + Axios interceptorus. |
| `app/App.vue` | **Globālais apvalks (shell).** Satur toast paziņojumus, offline banneri, e-pasta apstiprināšanas banneri, cookie consent, draugu modāli. Izlemj, kuru "chrome" apkārt lapai likt (home / spēle / lobby / parastā). |
| `components/layout/HomeCanvasLayout.vue` | **Vizuālais rāmis** parastajām lapām: kreisā sānjosla (navigācija), augšējā josla (nosaukums, valoda, lietotāja izvēlne), reklāmu sleja, mobilā versija. |
| `components/shell/header/HeaderUserMenu.vue` | Lietotāja izvēlne augšā (profils, iziet, admin saite). |
| `components/home/HomeSidebar.vue` | Sākumlapas sānjoslas saturs. |
| `pages/Home.vue` | Sākumlapa. Pati satur savu "canvas chrome" + dzīvo spēļu kopsavilkumu, aktīvās istabas, spēles režīmu izvēli. |
| `router/index.js` | Visi maršruti + `beforeEach` sargi (guest-only lapas, admin, apstiprināts e-pasts, publiskās lapas). |
| `store/auth.js` | Pinia store ar lietotāja stāvokli (`user`, `hydrated`), login/logout/register darbībām — visas caur Axios. |
| `store/locale.js`, `friends.js`, `game.js` | Valoda, draugi, spēles stāvoklis. |

### Kāpēc to maina

- **Divkārša darba plūsma:** katra lapa vispirms ielādējas tukša, tad taisa vēl vienu Axios pieprasījumu pēc datiem. Divi round-trip vienas lapas vietā.
- **Autorizācija dublējas:** Vue Router `beforeEach` sargā klientā, un Laravel middleware sargā serverī — divas patiesības vietas.
- **Sesijas dati caur atsevišķu API:** `/auth/me` katrā ielādē, lai uzzinātu, kas ir lietotājs.

---

## 2. Kā tas strādās PĒC (Inertia)

Inertia noņem atsevišķo API slāni lapu ielādei. **Laravel kontrolieris atdod Vue lapu tieši, kopā ar datiem (props).** Nav atsevišķa `/api/me` vai Axios pieprasījuma, lai uzzīmētu lapu — serveris jau atsūta gan HTML karkasu, gan datus vienā atbildē.

Plūsma pēc:

1. Lietotājs atver `/`.
2. `HomeController` serverī ievāc datus (lietotājs, kopsavilkums, aktīvās istabas) un izsauc `Inertia::render('Home', [...])`.
3. Inertia atdod Vue lapu `resources/js/pages/Home.vue` ar tiem datiem kā **props**.
4. Navigācija starp lapām notiek ar Inertia `<Link>` / `router.visit()` — tas paņem tikai jaunās lapas datus (bez pilnas pārlādes), bet maršrutus un autorizāciju izlemj **serveris**.

### Ko tas nozīmē praktiski

- **Vue Router pazūd.** Maršrutus definē `routes/web.php`. Navigācija = Inertia `<Link href="/friends">`.
- **`store/auth.js` lielā mērā pazūd.** Lietotājs nāk kā kopīgs Inertia prop (`auth.user`, ko jau iestatījām `HandleInertiaRequests` Phase 0). Nav vairs `/auth/me`.
- **Autorizācija tikai serverī.** `beforeEach` sargi → Laravel middleware (`auth`, `verified.email`, `admin`). Viena patiesības vieta.
- **Shell (App.vue + HomeCanvasLayout) → Inertia "persistent layout".** Viena Vue layout komponente, kas paliek uz ekrāna starp lapu maiņām (sānjosla nepārzīmējas katru reizi).

---

## 3. Phase 2 soļi (secībā)

Katrs solis ir atsevišķi testējams — pēc katra var pārbaudīt, ka nekas nav salūzis, pirms ejam tālāk.

### Solis 2.1 — Persistent layout (apvalks)
Izveidot `resources/js/layouts/AppLayout.vue` — tīra Inertia versija no `HomeCanvasLayout.vue`:
- sānjosla + augšējā josla + mobilā versija,
- lietotāja izvēlne, valodas pārslēgs,
- e-pasta apstiprināšanas banneris, toast sistēma, cookie consent.

Navigācijas pogas (`router.push('/friends')`) → Inertia `<Link href="/friends">` vai `router.visit()`.
Atšķirībā no vecā koda, disabled/atļauju loģika (`canPlayGames`, `needsEmailVerify`) nāk no servera props, ne no Pinia.

### Solis 2.2 — Home lapa
Izveidot `resources/js/pages/Home.vue` (jaunā, Inertia) + `HomeController`:
- Kontrolieris atdod `summary` (dzīvās spēles), `activeRooms`, `auth.user` kā props.
- Lapa tos saņem kā props, nevis taisa Axios pieprasījumus `onMounted`.
- DRY: dzīvo spēļu / istabu ievākšanas loģiku ielikt `HomeService` (Laravel), lai kontrolieris paliek tievs (atbilst projekta standartiem).

### Solis 2.3 — Maršruti un middleware
- `routes/web.php`: `/` → `HomeController`, aizsargāts ar attiecīgo middleware.
- Autorizācijas sargus no `router/index.js beforeEach` pārcelt uz Laravel middleware.
- `/login`, `/register` jau ir Inertia (Phase 1) — savienot navigāciju no jaunā layout.

### Solis 2.4 — Pārejas tilts
Kamēr lobby/friends/stats/admin vēl ir vecajā SPA (līdz Phase 3-5), vajag, lai saites no jaunā Inertia layout uz tām joprojām strādā. Divas iespējas (izlemsim solī):
- **A:** Šīs saites pagaidām ir parasti `<a href>` (pilna pārlāde uz veco SPA) — vienkāršākais, drošākais.
- **B:** Uztaisīt visas lapas uzreiz (tas jau ir Phase 3-5, ne Phase 2).

Iesaku **A** — Phase 2 paliek tīri par shell + home, pārējais migrē vēlāk.

### Solis 2.5 — Tīrīšana (šauri)
Phase 2 beigās vecais `Home.vue`, `HomeCanvasLayout.vue` u.c. vēl NETIEK dzēsti (tos dzēš Phase 6, kad viss migrēts). Tikai `/` maršruts pārslēdzas uz Inertia.

---

## 4. Riski un lēmumi

| Jautājums | Piezīme |
|-----------|---------|
| **Divi front-end blakus** | Pārejas periodā `/` (Inertia) un `/friends` (vecais SPA) dzīvo blakus. Pāreja starp tām = pilna pārlāde, ne SPA navigācija. Tas ir ok pagaidām, izzudīs līdz Phase 6. |
| **Pinia stores** | `locale` (valoda) droši vien vēl noderēs Inertia pusē. `auth` lielā mērā aizvietojams ar Inertia shared props. `friends`/`game` paliek līdz to lapu migrācijai. |
| **Toast sistēma** | Vecā balstās uz `window._dartToast`. Inertia pusē to var pārtaisīt uz tīru provide/inject vai flash-message pieeju (`session()->flash()` → Inertia prop). Ieteiktu flash pieeju, jo tā strādā pēc servera darbībām (piem. "Istaba izveidota"). |
| **Dizains** | Vecais shell CSS ir `dart-spa.css` / `home-design.css`. Jaunais layout tos var atkalizmantot (importēt), lai izskats paliek identisks — nav jāpārzīmē no nulles. |
| **Valodas (i18n)** | Vecais `locale.t()` mehānisms. Vari to paturēt (Pinia locale store strādā arī Inertia lapās) — nav jāmaina šajā fāzē. |

---

## 5. Kas paliks "pēc augstākajiem standartiem" (projekta CLAUDE.md prasības)

- **Tievi kontrolieri:** `HomeController` tikai savāc props; datu loģika `HomeService` klasē.
- **camelCase ↔ snake_case tilts:** props uz Vue pusi camelCase (piem. `activeRooms`, `liveMatches`), pat ja DB ir snake_case. Ja izmantojam API Resource, tas veic konversiju.
- **ref() nevis reactive():** jaunajās Vue lapās.
- **JSDoc tipi:** komponenšu props un funkcijām.
- **Kļūdu apstrāde:** Inertia formām `useForm` (automātiski notver 422 → errors); citām darbībām `onError`.
- **Vizuāls feedback:** `processing` disabled pogas, toast pēc veiksmes.

---

## 6. Kā izskatīsies rezultāts

Pēc Phase 2:
- `/` atveras kā Inertia lapa — dati jau klāt pirmajā atbildē, bez otrā Axios pieprasījuma.
- Sānjosla + header ir viena Inertia layout komponente, kas nepārzīmējas navigējot.
- Autorizācija par `/` notiek serverī.
- Lobby/friends/stats/admin joprojām strādā (vecais SPA), līdz tos migrē Phase 3-5.

Aptuvenais jaunizveidojamo failu skaits: `AppLayout.vue`, `pages/Home.vue`, `HomeController.php`, `HomeService.php`, + daži mazi shell apakškomponenti (user menu, sidebar). Vecos neaiztiekam līdz Phase 6.
