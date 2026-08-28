# cuccia — Fase 0

Web app mobile-first per tenere in ordine scadenze, Pet Card, libretto di Cura e quotidianità
di cani e gatti. È un prototipo locale Vite + React + TypeScript: nessun backend, account,
paywall o sincronizzazione tra dispositivi.

## Cosa include

- **Multi-animale:** schede separate per cani e gatti, con selettore globale.
- **Home:** soltanto prossime scadenze e Pet Card stampabile/salvabile in PDF.
- **Diario:** popup esplicito con data, ora, durata, caregiver e nota; storico in accordion,
  modificabile con audit e soft-delete.
- **Cura:** vaccini con lotto/scadenza, antiparassitari con pausa stagionale, sverminazione,
  terapie, visite, peso, microchip, condizioni/malattie annotate, igiene e allegati locali.
- **Scopri:** consigli per specie e fase; per il cane addestramento gentile, percorsi, badge,
  clicker, fischietto e guide. Per il gatto i contenuti dedicati sono indicati “in arrivo”.
- **Profilo:** dati pet, alimentazione, contatti, famiglia, moduli, documenti e Pet Card.
- **Backup:** copia automatica a ogni modifica, export JSON re-importabile e PDF leggibile.
- **Onboarding:** nove passaggi specie-first e tutorial iniziale riapribile dal Profilo.

Cuccia non formula diagnosi, score o consigli veterinari personalizzati. I dati sanitari
sono sempre inseriti e confermati a mano.

## Avvio locale

Serve Node.js 20.19+ oppure 22.12+.

```bash
npm install
npm run dev
```

Apri l’indirizzo mostrato da Vite, normalmente `http://localhost:5173`.

Al primo avvio compare l’onboarding. Per esplorare subito il prototipo usa **Prova con dati
dimostrativi**. I dati restano nel browser corrente.

## Test e build

```bash
npm test
npm run build
npm run preview
npm run audit
```

`npm test` verifica tre reti di sicurezza:

1. migrazione di uno stato precedente popolato senza perdita di dati;
2. creazione → export JSON → azzeramento → import con dati identici;
3. recupero dal backup automatico se il salvataggio principale è danneggiato.

La build statica viene creata in `dist/`.

## Backup ed export

Nel Profilo, **Esporta tutto in JSON** scarica famiglia, tutti i pet, Diario, audit, Cura,
documenti e progressi. **Importa JSON** ripristina un backup dopo conferma.

**Crea PDF leggibile** prepara un riepilogo stampabile di tutti i pet. Il PDF serve per
consultazione e condivisione; per un ripristino completo usa sempre il JSON.

La Pet Card del pet selezionato si apre dalla Home e funziona anche offline. Un badge cane
segnato come imparato può essere condiviso come card PNG.

## Pubblicazione su Vercel

1. Pubblica il repository su GitHub.
2. In Vercel scegli **Add New → Project** e importa il repository.
3. Lascia **Framework Preset: Vite** e **Root Directory: `./`**.
4. Non servono variabili d’ambiente.
5. Seleziona **Deploy** e condividi l’URL generato.

Ogni push sul branch principale crea un nuovo deploy. I dati di ciascun utente restano nel
suo browser: due telefoni non condividono automaticamente le stesse schede.

## GitHub Pages

```bash
npm run deploy
```

Poi, in **Settings → Pages**, scegli **Deploy from a branch**, branch `gh-pages` e cartella
`/ (root)`. `vite.config.ts` usa `base: './'`, quindi gli asset funzionano in sottocartella.

## Limiti della Fase 0

- reminder soltanto in-app da date inserite manualmente;
- nessun push, account o sincronizzazione affidabile;
- nessun OCR o salvataggio automatico di dati sanitari;
- foto, file e backup occupano lo spazio locale del browser;
- guide statiche da revisionare professionalmente prima del lancio reale;
- evitare dati reali o sensibili in una demo pubblica.

Il motore scadenze è separato dalla UI per collegarsi in Fase 1 a reminder in background.
Push, account e sincronizzazione arrivano soltanto con il backend futuro.

## Sicurezza

- Non inserire chiavi, token, password o credenziali nel codice: il repository è pubblico.
- Le configurazioni locali vanno in `.env`, che Git ignora. Parti dall’esempio:

```bash
cp .env.example .env
```

- Nel browser le variabili Vite `VITE_*` sono pubbliche e finiscono nella build: usarle solo
  per URL o identificatori pubblici, mai per veri segreti. Le chiavi private dovranno vivere
  in un backend futuro, non in questa web app.
- Il prototipo non espone backend o credenziali. `localStorage` è adatto solo a dati demo o
  non sensibili: evita informazioni sanitarie o personali reali su dispositivi condivisi.
- Prima di pubblicare esegui `npm test`, `npm run audit`, `npm run build` e controlla
  `git status`.
