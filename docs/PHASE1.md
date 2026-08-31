# Cuccia · Fase 1 — Supabase, Auth e migrazione

Questa fase aggiunge infrastruttura cloud senza rimuovere la modalità locale. Un utente non
autenticato continua a usare Cuccia come prima; nessun dato viene caricato senza un login e una
conferma esplicita dell’importazione.

## Stato dell’ambiente

- Regione progetto: **West EU · Ireland**.
- Variabili client: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- La chiave ammessa nel browser è soltanto publishable/anon.
- `.env.local` è ignorato e non è tracciato da Git.
- La CLI è fissata nel progetto; per lo stack locale serve Docker Desktop o Podman.
- Per applicare migrations al progetto remoto serve `supabase login`, non una service-role key.

## Configurazione

```bash
cp .env.example .env.local
```

Compilare in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Non aggiungere password del database, access token Supabase o chiavi server a file `VITE_*`:
Vite le include nel bundle pubblico.

Nel pannello Supabase, Auth deve avere:

- accesso email/password attivo;
- conferma email attiva;
- Site URL e Redirect URL dell’ambiente in uso;
- per locale: `http://127.0.0.1:5173` e `http://localhost:5173`.

## Avvio applicazione

```bash
npm install
npm run dev
```

Senza login, onboarding, Diario, Cura, Scopri, Profilo, backup e reset usano ancora il repository
locale. L’account è facoltativo e vive in **Profilo → Impostazioni → Account cloud**.

## Database locale

Prerequisito: Docker Desktop o Podman avviato e disponibile nel `PATH`.

```bash
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run test:cloud
npm run supabase:stop
```

`supabase db reset` parte da un database pulito e applica, in ordine, tutti i file in
`supabase/migrations/`. `supabase test db` esegue i test pgTAP in
`supabase/tests/database/`. `npm run test:cloud` usa soltanto chiavi dello stack locale, crea un
account temporaneo e verifica auth, doppio import idempotente e rollback prima di ripulire i dati.

Il test RLS impersona quattro account e verifica:

- owner: lettura e scrittura complete;
- family: attività, salute, dosi e documenti; niente membri o eliminazioni;
- caregiver: attività quotidiane e dosi programmate; niente libretto o documenti;
- estraneo: nessuna lettura o scrittura su pet altrui;
- revoca: perdita immediata di query e accesso Storage;
- FK: rifiuto di membership tra household diversi.

## Progetto remoto

Prima verificare migrations e RLS in locale. Poi:

```bash
npx supabase login
npx supabase link --project-ref PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

La login CLI usa un access token personale conservato dalla CLI; non va inserito in `.env.local`
e non deve essere committato.

## Auth

Il flusso disponibile nel Profilo comprende:

1. registrazione con nome, email e password;
2. conferma tramite email;
3. login email/password;
4. richiesta reset e scelta della nuova password;
5. logout.

La sessione è gestita da Supabase Auth. Nessuna chiave server è usata dal client.

## Importazione locale → cloud

Il flusso è sempre esplicito:

1. **Controlla importazione** esegue il dry-run senza rete e mostra i conteggi.
2. **Scarica backup e importa** crea un JSON v2 e ne verifica il round-trip prima di scaricarlo.
3. Il client crea o riusa un household owner e apre un `migration_batch`.
4. `migrateAppData` normalizza lo snapshot prima di qualsiasi scrittura.
5. I record vengono mappati su tabelle relazionali con `legacy_source_id` e
   `client_mutation_id` univoci per pet.
6. Foto e documenti Data URL diventano Blob nel bucket privato `pet-documents`; nel database
   restano solo metadata e path.
7. I conteggi per tabella vengono riletti dal database e confrontati con il backup.
8. Solo dopo la corrispondenza il batch diventa `completed` e viene salvato il link cloud locale.

Un secondo import dello stesso snapshot riusa il fingerprint e il batch completato: non crea
doppioni. Il backup e la cache locali non vengono cancellati.

La sincronizzazione continua, realtime e i conflitti multiutente appartengono alla Fase 2. In
Fase 1 il link cloud viene attivato solo dopo import verificato; la copia locale resta il fallback
offline e non viene mai eliminata automaticamente.

## Rollback

Se un import fallisce, il client:

1. elimina gli oggetti Storage caricati durante quel tentativo;
2. chiama `rollback_migration_batch`;
3. elimina solo righe e pet collegati al batch incompleto;
4. lascia invariato il backup locale.

Un batch completato non è cancellabile automaticamente. Per annullare lo schema su un database
di sviluppo vuoto:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/rollbacks/20260831_phase1_down.sql
```

Non eseguire il rollback globale su un progetto con dati reali senza backup verificato.

## Verifiche

```bash
npm test
npm run build
npm run security
npm run audit
```

`npm run security` verifica che `.env.local` sia ignorato, `.env.example` sia vuoto, i file
tracciati non contengano pattern di chiavi private e il bundle non incorpori segreti riconoscibili.

## File principali

- `supabase/migrations/`: schema, indici, RLS, RPC e Storage privata.
- `supabase/tests/database/`: test pgTAP schema/RLS.
- `supabase/rollbacks/`: rollback completo per database di sviluppo.
- `src/auth/`: sessione e comandi Auth.
- `src/repositories/`: boundary persistence compatibile con `useAppState`.
- `src/cloud/`: dry-run, mapping, import, deduplicazione e rollback.
- `src/components/CloudAccountPanel.tsx`: UI account.
- `src/components/CloudMigrationPanel.tsx`: UI import esplicito.

## Fuori scope

Fase 1 non introduce inviti/famiglia reale, realtime, outbox offline, push, GPS, Capacitor o
background location. Non cambia il design system né le funzioni Cura, Diario, Pet Card e Scopri.
