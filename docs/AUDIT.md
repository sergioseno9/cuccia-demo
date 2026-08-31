# Cuccia — Audit architetturale · Phase 0

Stato: **solo analisi e decisione architetturale**. In questa fase non vengono aggiunti backend,
SDK, chiavi, migrazioni o funzionalità. Il repository continua a essere la demo locale esistente.

## 1. Decisione in breve

Confermare **React + Vite + TypeScript**, aggiungere **Supabase** come backend e **Capacitor** come
contenitore nativo, senza riscrivere UI e design system. React Native/Expo non offre oggi un
vantaggio sufficiente a giustificare una riscrittura delle schermate già responsive.

Capacitor è adeguato per shell iOS/Android, push, deep link e tracking GPS avviato esplicitamente.
Non basta, da solo, a garantire Smart Walk Detection: il plugin Geolocation ufficiale dichiara
che non supporta direttamente la geolocalizzazione in background; Background Runner esegue
burst non garantiti, circa 30 secondi su iOS e con intervallo minimo di 15 minuti su Android.
La Phase 5 deve quindi iniziare con un gate tecnico su device fisici e potrà richiedere un plugin
nativo Swift/Kotlin o un plugin esterno mantenuto. Fino a quel gate non dichiarare disponibile il
rilevamento in background.

Fonti tecniche: [Capacitor](https://capacitorjs.com/docs),
[Geolocation](https://capacitorjs.com/docs/apis/geolocation),
[Background Runner](https://capacitorjs.com/docs/apis/background-runner),
[Push Notifications](https://capacitorjs.com/docs/apis/push-notifications),
[RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e
[Storage RLS](https://supabase.com/docs/guides/storage/security/access-control).

## 2. Audit sintetico del repository

### Stack e dipendenze

- SPA mobile-first: React 19, Vite 8, TypeScript strict, React Router e Lucide.
- Font locali `@fontsource`: Fraunces e Plus Jakarta Sans; nessun font remoto necessario.
- Versioni fissate in `package.json`; nessun client HTTP, backend SDK, state manager o database.
- Test attuali: `node:test`, 7 casi su migrazione, backup, reminder e quiz; nessun test UI/E2E.
- `.env.example` contiene soltanto URL pubblici vuoti; non risultano credenziali nel codice.

### Routing e struttura UI

- `HashRouter`, scelto correttamente per GitHub Pages e `base: './'`.
- Cinque tab persistenti: Home, Diario, Cura, Scopri, Profilo.
- Sottopagine Scopri per quiz, guide, giochi, percorsi e trucchi; i dettagli Care/Profile sono
  prevalentemente dialog controllati da stato locale.
- Onboarding fuori dal router finché `pets[]` è vuoto; tutorial a quattro coach-mark dopo l’avvio.
- Il path esistente `/scopri/traucco/:id` contiene un refuso, ma non viene corretto in Phase 0.
- Per futuri deep link nativi si può mantenere HashRouter e tradurre `appUrlOpen` in una rotta;
  non serve cambiare router prima che esista un requisito verificato.

### Componenti e stato

- 18 componenti, 13 screen, 15 moduli di dominio/storage e 17 fogli CSS.
- `AppStateProvider` è l’unico stato globale: conserva l’intero `AppData`, il pet attivo, il
  caregiver simulato, toast e tutte le mutazioni.
- Le schermate dipendono dal contratto `useAppState`; questo contratto è il punto migliore in cui
  innestare repository e sincronizzazione mantenendo invariata la UI.
- Non esiste separazione tra comandi dominio, cache e persistence: ogni modifica aggiorna React e
  un `useEffect` riscrive tutto lo snapshot locale.
- Gli ID sono UUID browser quando disponibili, con fallback timestamp/casuale.

### Persistence, backup e tipi

- Modello versionato `AppData schemaVersion: 2`: `household → pets[] → profile/events/health`.
- Chiavi principali: `cuccia:household:v2`, salvataggio precedente e backup automatico; fallback
  al formato legacy v1 e recupero dal backup se il dato principale è corrotto.
- Export JSON completo e re-importabile; PDF leggibile; reset esplicito.
- Foto e allegati sono compressi localmente e salvati come Data URL. I file non immagine sono
  limitati a 2,5 MB; resta un limite strutturale di quota del `localStorage`.
- `StorageQuotaError` avvisa senza scartare lo stato React corrente.
- Checklist guide in chiavi `cuccia:guide-checklist:*`, separate da `AppData`.
- Tipi TS espliciti per pet, eventi, Care, quiz e progressi; nessun `any` applicativo dichiarato.
- Audit degli eventi già presente tramite `editedBy/editedAt` e soft-delete `deletedBy/deletedAt`.

### Design system

- Token brand centralizzati in CSS: Clay, Honey, Sage, Ink, Cream, Sand e `--soft-shadow`.
- Restyle minimal stratificato sopra fogli legacy: canvas caldo, card bianche, Lucide, avatar tondi,
  Fraunces selettivo e Jakarta per l’interfaccia, coerenti con `docs/mockups/min_all.png`.
- Rischio tecnico: molti override in 17 CSS importati in ordine; `base.css` contiene ancora misure
  piccole e superfici legacy poi corrette dai fogli successivi. Non va riscritto ora, ma ogni fase
  deve mantenere il gate a 390 px e introdurre test visuali/accessibilità prima di grandi refactor.

### Funzionalità già presenti

- Multi-pet cane/gatto, selettore globale, fase di vita, moduli e condizioni organizzative.
- Home con identità, massimo tre scadenze derivate e Pet Card offline.
- Diario opzionale con autore/orario, pappa, nota, passeggiata cane, farmaco, bisogni/lettiera
  condizionali, durata, modifica, soft-delete e accordion per giorno.
- Cura: vaccini con richiamo/lotto/scadenza, antiparassitari e sverminazione con cadenza/pausa,
  farmaci e dosi, visite, peso/grafico, grooming, documenti, microchip, allergie e condizioni.
- Profilo: alimentazione, veterinario, emergenza, toelettatore, famiglia simulata, preferenze,
  backup/export/import/PDF, reset e riapertura tutorial.
- Scadenzario in-app da dati confermati per vaccini, prevenzione, farmaci, visite, controllo
  annuale, assicurazione e verifica microchip.
- Pet Card offline stampabile/PDF e condivisibile come testo.
- Scopri: quiz deterministico per pet, guide statiche/checklist, giochi, trucchi, percorsi e badge.
- Onboarding in nove passaggi e tutorial skippabile in quattro passaggi.
- Assenti: account reali, inviti, sync/realtime, Storage cloud, push, GPS, background location,
  deduplicazione distribuita, Travel Mode, timeline/memories e link Pet Card temporanei.

### Drift documentale rilevato

`AGENTS.md` e il codice mostrano Scopri con Quiz, Guide e Giochi; `PROJECT_BRIEF.md` cita ancora
“Consiglio del momento”, clicker e fischietto, già rimossi dal codice. La spec impone di fermare
l’espansione di Scopri: nelle fasi successive il codice corrente è la fonte di verità e il brief
andrà riallineato in un commit documentale separato.

## 3. Architettura minima proposta

```text
Schermate React esistenti
        ↓ contratto useAppState compatibile
Comandi/use case (pet, diario, care, household)
        ↓
Repository tipizzati ── Local cache/outbox ── Supabase Auth/Postgres/Realtime/Storage
        ↓                                        ↓
Adapter Capacitor: push, share, deep link, GPS e plugin nativi verificati
```

1. Conservare i tipi dominio usati dalla UI; generare tipi DB separati e usare mapper espliciti.
2. Estrarre gradualmente da `AppStateProvider` repository e comandi, mantenendo inizialmente la
   stessa API pubblica per evitare modifiche alle schermate.
3. Separare stato UI locale (pet selezionato, toast, tutorial) da dati condivisi cloud.
4. Usare Supabase come fonte canonica solo dopo import verificato; realtime aggiorna la cache ma
   non sostituisce query iniziale, retry e riconciliazione.
5. Per l’offline, introdurre in Phase 2 una outbox persistente con `client_mutation_id`, retry e
   stato `pending/synced/failed`. `localStorage` resta sorgente legacy e preferenze; media e queue
   non devono crescere lì. Valutare IndexedDB prima di introdurre SQLite nativo.
6. Nessuna service-role key nel client. Solo URL e publishable key via `import.meta.env`; segreti
   push/service role esclusivamente in Edge Functions o CI protetta.

## 4. Migrazione locale → cloud senza perdita

1. Prima dell’account cloud, creare e far scaricare un backup JSON v2 verificato.
2. Dopo login, mostrare un import esplicito con household destinazione, pet, record e allegati;
   nessun upload sanitario automatico senza conferma.
3. Normalizzare sempre con `migrateAppData`, poi calcolare un fingerprint dello snapshot e creare
   un `migration_batch_id` cloud. Ogni riga importata mantiene `legacy_source_id` e/o
   `client_mutation_id` con vincolo univoco: ripetere l’import non duplica dati.
4. Il caregiver locale scelto viene associato all’account solo dopo conferma. Gli altri nomi non
   diventano account: restano snapshot autore sui vecchi eventi e suggerimenti di invito.
5. Convertire Data URL in Blob, caricare su Storage in area privata temporanea, creare metadata e
   promuovere il batch solo dopo verifica. Pulire gli orfani in caso di errore.
6. Confrontare conteggi e campi chiave per pet; creare un export cloud di controllo.
7. Solo dopo esito completo passare la sessione alla fonte cloud. Non cancellare il backup locale:
   conservarlo come fallback leggibile finché l’utente non sceglie di rimuoverlo.
8. Il rollback elimina soltanto il batch cloud incompleto; il dato locale originale resta intatto.

## 5. Schema dati proposto

Convenzioni: UUID, `created_at`/`updated_at timestamptz`, UTC, FK esplicite, enum/check per valori
chiusi, soft-delete dove esiste audit. Tutte le colonne usate da RLS o join frequenti sono indicizzate.

| Tabella | Colonne principali e relazioni | Indici/vincoli chiave |
|---|---|---|
| `profiles` | `id → auth.users`, nome, avatar, telefono, locale, timezone | PK `id`; update solo proprio profilo |
| `households` | `id`, nome, `created_by → profiles` | index `created_by`; soft-delete |
| `household_members` | `id`, `household_id`, `user_id`, ruolo, permessi JSON, stato, invited/joined/revoked | unique `(household_id,user_id)`; index `(user_id,status)` |
| `pets` | `id`, `household_id`, `created_by`, specie, fase, dati profilo, moduli, condizioni, alimentazione JSON, foto path | index `household_id`; unique `(id,household_id)` |
| `pet_members` | `id`, `pet_id`, `household_id`, `user_id`, ruolo, permessi, stato | unique `(pet_id,user_id)`; FK composte verificano stesso household; index `user_id` |
| `activities` | `id`, `pet_id`, attore user nullable, nome autore snapshot, tipo, `happened_at`, durata, nota, `medication_id`, audit edit/delete, mutation ID | index `(pet_id,happened_at desc)`; unique `(pet_id,client_mutation_id)` |
| `walks` | `id`, `pet_id`, start/end user/time, stato, durata, distanza, route codificata, accuratezza, conferma, mutation ID | un solo walk `in_progress` per pet; index start time |
| `health_events` | `id`, `pet_id`, autore, tipo, titolo, `occurred_on`, `due_on`, dettagli JSON, conferma manuale, audit | index `(pet_id,type,due_on)`; nessun dato OCR auto-confermato |
| `medications` | `id`, `pet_id`, nome, dose/testo, istruzioni, orari, timezone, inizio/fine, attivo | index `(pet_id,active)` |
| `medication_logs` | `id`, `pet_id`, `medication_id`, user, autore snapshot, scheduled/administered at, stato, note, mutation ID | unique mutation; unique dose slot somministrato; index med/data |
| `reminders` | `id`, `pet_id`, source type/id, due time, timezone, stato, assegnatario, completamento, `dedupe_key` | unique `dedupe_key`; index `(pet_id,status,due_at)` |
| `weight_logs` | `id`, `pet_id`, user, `weighed_on`, `value_kg`, nota, source manual | index `(pet_id,weighed_on desc)` |
| `documents` | `id`, `pet_id`, autore, kind, nome, mime, byte, private storage path, FK opzionale a health/medication/weight | index `pet_id` e FK; check massimo un collegamento |
| `travel_plans` | `id`, `household_id`, autore, destinazione, partenza/ritorno, stato | index `(household_id,departure_date)` |
| `travel_items` | `id`, `travel_plan_id`, `pet_id` nullable, categoria, testo, ordine, source type/id, completed by/at, deleted at | index `(travel_plan_id,sort_order)` |
| `milestones` | `id`, `pet_id`, autore, tipo, titolo, data, descrizione, `document_id`, source type/id | index `(pet_id,occurred_on desc)` |
| `pet_share_links` | `id`, `pet_id`, autore, **token hash**, campi consentiti JSON, scadenza, revoca, ultimo accesso | unique token hash; index `(pet_id,expires_at)` |
| `push_tokens` | `id`, `user_id`, device ID, piattaforma, provider token, stato, app version, last seen | unique provider token; index `(user_id,active)` |

Tabelle di supporto necessarie, senza ampliare il prodotto: `household_invites` per invitare email
non ancora registrate; `migration_batches` per import idempotenti; `pet_content_progress` per non
perdere quiz/trucchi/badge già salvati. Checklist guide e preferenze dispositivo possono restare locali.

## 6. Mappatura del modello locale

| Locale | Cloud |
|---|---|
| `household.caregivers` | account confermato → membership; altri nomi → inviti suggeriti e autore legacy |
| `PetProfile` | `pets`; foto → Storage privata; veterinario, emergenza, allergie e alimentazione restano campi manuali |
| `CareEvent` | `activities`; eventi farmaco anche in `medication_logs`; audit e soft-delete preservati |
| vaccinazioni, prevenzioni, visite, grooming | `health_events` con dettagli tipizzati nel payload |
| farmaci | `medications`; dosi del Diario → `medication_logs` |
| pesi e `profile.weight` | `weight_logs`; creare il valore profilo solo se non già presente nello storico |
| documenti profilo/record | Blob in Storage privata + metadata `documents` e FK al record origine |
| scadenze calcolate | non importarle come verità; rigenerare `reminders` dai dati confermati |
| quiz, trucchi, badge | `pet_content_progress`; nessuna nuova funzione Scopri |
| pet/caregiver selezionato, tutorial | preferenze locali per dispositivo, non dati condivisi |

## 7. Strategia RLS

- RLS attiva su ogni tabella esposta; policy sempre `to authenticated`, nessun `using (true)`.
- Funzioni `private.is_household_member`, `private.can_access_pet` e `private.is_pet_owner`,
  `security definer`, `stable`, `search_path=''`, execute revocato a `public` e testato con pgTAP.
- Tutte le tabelle pet-scoped usano `can_access_pet(pet_id,'read'|'write'|'health'|'share')` sia
  in `using` sia in `with check`; attore/creator non può essere falsificato dal client.
- Creazione pet + membership owner e accettazione inviti avvengono tramite RPC transazionali.
- Owner gestisce inviti/revoche/condivisione; family e caregiver ricevono solo permessi espliciti.
  La revoca rende subito invisibili query, realtime e Storage del pet.
- Realtime pubblica solo tabelle necessarie e consegna esclusivamente righe già leggibili via RLS.
- Storage usa path `households/{household}/pets/{pet}/{document}` e policy su `storage.objects`
  collegate a `pet_members`; bucket privati e signed URL brevi. Service role mai nel client.
- `pet_share_links` non rende `pets` pubblica: una Edge Function valida token hash, scadenza,
  revoca e whitelist campi, con rate limit. Nessuna policy anon diretta sui dati sanitari.
- `push_tokens`: ciascun utente gestisce i propri; solo funzione server può leggerli per inviare.
- Test obbligatori: owner/family/caregiver/estraneo, revoca, write fuori permesso, FK cross-household,
  realtime dopo revoca, Storage e link scaduto/revocato.

## 8. Piano Phase 1 → 10

| Fase | Dipendenze e risultato verificabile | Rischi principali | Device/credenziali |
|---|---|---|---|
| 1 · Supabase/Auth | Schema, migrations, RLS/test, repository boundary, login/reset, import locale dry-run e rollback | perdita dati, policy ricorsive, doppio import | Supabase dev; nessun device; service role solo CI/server |
| 2 · Family/Realtime | Inviti, ruoli/permessi, pet membership, outbox, sync e revoca immediata | conflitti, eventi duplicati, caregiver legacy | due account/browser; SMTP production in seguito |
| 3 · Reminder/Push | Motore server, dedupe, token device, deep link e completamento farmaco atomico | push doppi/ritardati, timezone, token stale | Capacitor; device iOS/Android; Apple Developer/APNs e Firebase/FCM |
| 4 · Manual Walk | start/stop persistente, foreground GPS, durata/distanza/route e recupero crash | batteria, permessi negati, route incompleta | device fisici; Xcode signing iOS; Android Studio |
| 5 · Smart Detection | spike nativo, consenso, cooldown, prompt Sì/No; nessun auto-log | falsi positivi, OS kill, privacy; possibile plugin custom | device reali e test fuori debugger; background/location/activity permission |
| 6 · Walk Analytics | aggregati delle sole passeggiate registrate e baseline 4 settimane | metriche fuorvianti, query pesanti | dataset realistico; device consigliato, nessuna nuova credenziale |
| 7 · Puppy Mode | quick log condiviso, soglia dati, range spiegabile, reminder opzionale | falsa precisione, logging oppressivo | push su device per accettazione; nessuna credenziale nuova |
| 8 · Travel Mode | piani/checklist, farmaci attivi proposti, offline e ripristino voci | snapshot obsoleto, checklist duplicata | nessun device obbligatorio; test offline mobile consigliato |
| 9 · Crescita/Timeline | età, compleanno, peso, milestone e media privata | timezone compleanno, storage foto, scope creep | camera/device consigliato; push già disponibile |
| 10 · Pet Card sharing | campi selettivi, link/QR temporaneo, revoca, audit e fallback offline/PDF | esposizione dati, cache link scaduti | endpoint deploy; share sheet su device; account store solo per release |

Ogni fase deve essere un insieme piccolo di commit: schema/RLS, adapter, UI wiring e test separati,
con rollback documentato. Non iniziare la fase successiva finché i criteri della precedente non passano.

## 9. Collegamento delle funzioni esistenti senza peggiorare la UX

- **Cura:** moduli e dialog restano; al salvataggio manuale il comando scrive subito nella cache e
  mette la mutation in outbox. Un indicatore discreto compare solo se offline/errore; niente spinner
  che blocchi. Realtime aggiorna storico e scadenze senza cambiare il layout.
- **Farmaci:** conferma dose tramite RPC idempotente con dose slot univoco. Se un familiare ha già
  confermato, mostrare “Già registrato da … alle …”, non errore né doppio record/reminder.
- **Diario:** CTA e popup restano in 1–3 tap. L’utente autenticato è l’autore reale; il selettore
  caregiver simulato scompare solo quando l’account è attivo. Eventi importati conservano il nome
  storico. Realtime inserisce la nuova riga mantenendo ordinamento e audit.
- **Pet Card:** continua a funzionare offline dalla cache. Stampa/PDF resta locale; il link cloud è
  un’azione separata con scelta campi, scadenza e revoca, mai pubblicazione implicita.
- **Home/scadenze:** la forma visiva non cambia; i dati derivano dalla cache sincronizzata. Push
  apre la sezione corretta, ma Home non dipende dall’apertura della notifica per aggiornarsi.
- **Famiglia/multi-pet:** selettore pet invariato. Account e membership vivono nel Profilo; inviti,
  ruoli e revoca non entrano nei flussi quotidiani.
- **Offline:** ogni azione mostra esito locale immediato; la sincronizzazione non sovrascrive dati
  più recenti in silenzio. Conflitti sanitari richiedono conferma, non last-write-wins cieco.

## 10. Gate prima della Phase 1

1. Approvare questa decisione architetturale e il confine repository/outbox.
2. Definire matrice permessi owner/family/caregiver per Care, Diario, documenti e condivisione.
3. Decidere provider login iniziale e regione Supabase; nessuna chiave prima dell’approvazione.
4. Definire bundle ID iOS e application ID Android prima della Phase 3.
5. Accettare che Smart Walk Detection abbia un gate go/no-go su device e non sia promessa finché
   background location/activity recognition non supera test reali su entrambe le piattaforme.
