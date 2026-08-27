# cuccia — Fase 0

Prototipo web mobile-first per tenere in ordine scadenze, Pet Card, libretto di Cura e
quotidianità del cane. È una web app locale Vite + React + TypeScript: nessun backend,
account, paywall o sincronizzazione tra dispositivi.

## Cosa include

- **Home:** solo prossime scadenze e Pet Card stampabile/salvabile in PDF;
- **Diario:** registrazione esplicita con data, ora, durata, caregiver e nota;
- storico in accordion per giorno, modificabile con audit e soft-delete;
- **Cura:** vaccini, antiparassitari, sverminazione, terapie, visite, peso, microchip,
  allergie e toelettatura come abitudine morbida;
- **Scopri:** consigli stagionali, giochi gentili, trucchi, badge locali e guide per fase;
- condivisione dei badge come immagine PNG, senza feed interno o classifiche;
- **Profilo:** dati cane, alimentazione, contatti, famiglia, documenti e preferenze;
- onboarding in otto passaggi e tutorial iniziale riapribile dal Profilo;
- persistenza e migrazione dei dati in `localStorage`, con comando **Azzera dati**.

Cuccia non formula diagnosi, score o consigli veterinari personalizzati. I dati sanitari
sono sempre inseriti e confermati a mano.

## Avvio locale

Serve Node.js 20.19+ oppure 22.12+.

```bash
npm install
npm run dev
```

Apri l’indirizzo mostrato da Vite, normalmente `http://localhost:5173`.

Al primo avvio compare l’onboarding; dopo il salvataggio parte il tutorial di quattro passi.
Per esplorare subito il prototipo usa **Prova con Milo**. I dati restano nel browser corrente.

## Build e anteprima

```bash
npm run build
npm run preview
```

La build statica viene creata in `dist/`.

## Pet Card e condivisione

Dalla Home apri la Pet Card, seleziona **Stampa / salva PDF** e scegli **Salva come PDF**.
La funzione è disponibile anche offline dopo il caricamento della web app. In Scopri, un
trucco segnato come imparato può essere condiviso come card PNG.

## Pubblicazione su Vercel

1. Pubblica il repository su GitHub.
2. In Vercel scegli **Add New → Project** e importa il repository.
3. Lascia **Framework Preset: Vite** e **Root Directory: `./`**.
4. Non servono variabili d’ambiente.
5. Seleziona **Deploy** e condividi l’URL generato.

Ogni push successivo sul branch principale crea un nuovo deploy. I dati di ciascun utente
restano nel suo browser: due telefoni non condividono automaticamente lo stesso profilo.

## GitHub Pages

```bash
npm run deploy
```

Poi, in **Settings → Pages**, scegli **Deploy from a branch**, branch `gh-pages` e cartella
`/ (root)`. `vite.config.ts` usa `base: './'`, quindi gli asset funzionano nella sottocartella.

## Limiti della Fase 0

- reminder solo in-app da date inserite manualmente;
- nessun push, account o sincronizzazione affidabile;
- nessun OCR o salvataggio automatico di dati sanitari;
- foto e documenti occupano lo spazio locale del browser;
- guide statiche da revisionare professionalmente prima del lancio reale;
- evitare dati reali o sensibili in una demo pubblica.

Push, account e sincronizzazione arrivano in Fase 1 con il backend.

## Sicurezza

- Non inserire chiavi, token, password o credenziali nel codice: il repository è pubblico.
- Le configurazioni locali vanno in `.env`, che Git ignora. Parti sempre dall’esempio:

```bash
cp .env.example .env
```

- Nel browser le variabili Vite `VITE_*` sono pubbliche e finiscono nella build: usarle solo
  per URL o identificatori pubblici, mai per veri segreti. Eventuali chiavi private dovranno
  vivere in un backend futuro, non in questa web app.
- Il prototipo non espone backend o credenziali. `localStorage` è adatto solo a dati demo o
  non sensibili: evita informazioni sanitarie o personali reali su dispositivi condivisi.
- Prima di pubblicare esegui `npm run audit`, `npm run build` e controlla `git status`.
