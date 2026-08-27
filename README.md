# cuccia — Fase 0

Prototipo web locale del posto affidabile dove vivono tutte le informazioni importanti del
cane. I tre elementi centrali sono **libretto sanitario digitale**, **scadenzario in-app** e
**Pet Card condivisibile**. Diario e coordinamento familiare restano disponibili come supporto.

## Cosa include

- Home con scadenze in evidenza, peso e visite a colpo d’occhio;
- libretto Salute con vaccini, antiparassitari, sverminazione, terapie, visite, peso,
  allergie/condizioni e microchip;
- scadenze calcolate localmente da date e cadenze confermate a mano;
- Pet Card stampabile o salvabile in PDF anche offline;
- fase Cucciolo, Adulto o Senior scelta dall’utente;
- moduli Uscite, Acqua, Peso, Farmaci e Toelettatura/bagno personalizzabili;
- pipì e cacca solo per problemi urinari o apprendimento dei bisogni fuori;
- quick log opzionale con ora, durata, caregiver e nota modificabili;
- audit locale delle modifiche e soft-delete degli eventi;
- Profilo con alimentazione, contatti, famiglia e foto di documenti locali;
- Guide statiche pertinenti alla fase, senza chatbot o paywall;
- persistenza in `localStorage` e comando **Azzera dati**.

Non ci sono backend, account reali, sincronizzazione tra dispositivi o notifiche push.
Cuccia non formula diagnosi, score o consigli veterinari personalizzati e non legge documenti.

## Avvio locale

Serve Node.js 20.19+ oppure 22.12+.

```bash
npm install
npm run dev
```

Apri l’indirizzo mostrato da Vite, normalmente `http://localhost:5173`.

Al primo avvio compare l’onboarding. Ogni passaggio è skippabile e modificabile in seguito.
Per esplorare subito il prototipo usa **Prova con Milo**. I dati restano nel browser corrente.

## Build

```bash
npm run build
npm run preview
```

La build statica viene creata in `dist/`.

## Pet Card e PDF

Apri la Pet Card da **Oggi** o **Profilo**, seleziona **Stampa / salva PDF** e scegli
**Salva come PDF** nella finestra del browser. Questa funzione non richiede connessione.

## GitHub Pages

1. Crea un repository GitHub e collega questa cartella come remote.
2. Pubblica il codice sul branch principale.
3. Esegui:

```bash
npm run deploy
```

4. In **Settings → Pages** scegli **Deploy from a branch**.
5. Seleziona `gh-pages` e la cartella `/ (root)`.

`vite.config.ts` usa `base: './'`, quindi gli asset funzionano anche nella sottocartella
del repository.

## Limiti della Fase 0

- I reminder sono solo in-app e derivati da date inserite manualmente.
- Push, account e sincronizzazione affidabile arrivano in Fase 1 con il backend.
- Nessun OCR, import o salvataggio automatico di dati sanitari.
- Foto e documenti occupano lo spazio locale del browser e non si sincronizzano.
- Non usare dati reali o sensibili su una pubblicazione pubblica GitHub Pages.
