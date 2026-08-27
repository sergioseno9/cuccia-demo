# cuccia — Project Brief Fase 0

## Tesi di prodotto

Cuccia è il posto affidabile dove vivono le informazioni importanti del cane, dove le date
inserite dalla famiglia diventano promemoria chiari e dove la Pet Card è pronta da condividere.
I tre eroi sono **scadenzario in-app**, **Pet Card offline** e **libretto sanitario digitale**.

In Fase 0 tutto vive nel `localStorage` del browser: nessun backend, account, push,
sincronizzazione o paywall. Il coordinamento familiare resta trasversale: ogni evento del
Diario conserva autore, timestamp e audit, ma il logging è sempre facoltativo.

## Principi non negoziabili

1. Le funzioni vivono in sezioni separate e ordinate.
2. Home mostra solo ciò che serve sapere subito.
3. Il logging quotidiano è esplicito, leggero e opzionale.
4. I dati sanitari sono inseriti e confermati manualmente; niente OCR o auto-save.
5. Il tono è calmo e fattuale: niente diagnosi, health score, target o allarmi.
6. La condivisione funziona offline tramite stampa/PDF o PNG per i badge.
7. L’interfaccia è mobile-first: base 16px, etichette 14px e target touch almeno 44px.

## Architettura a cinque tab

### Home

Contiene soltanto:

1. **Prossime scadenze**, con stato `ok / in arrivo / scaduto`; il tap apre la voce in Cura.
2. **Pet Card**, stampabile o salvabile in PDF anche offline.

Non contiene azioni rapide, feed, statistiche o guide.

### Diario

Il pulsante **Registra** propone Uscita/Passeggiata, Pappa e Nota; Farmaco compare solo con
una terapia attiva. Pipì e cacca compaiono soltanto con `problemi_urinari` o
`potty_training`. Acqua e Toelettatura non fanno parte del Diario.

Ogni azione apre sempre un popup prima del salvataggio: data, ora con preset, durata delle
uscite 15/30/45/60 o personalizzata, caregiver e nota. Lo storico è un accordion per giorno:
Oggi aperto, giorni precedenti chiusi e data corretta. Ogni voce è modificabile o eliminabile
con soft-delete e audit. Il ritmo uscite, se impostato dall’utente, resta un nudge morbido.

### Cura

È il libretto manuale del cane e comprende:

- scadenze calcolate;
- vaccinazioni e richiami;
- antiparassitari per pulci e zecche;
- sverminazione;
- farmaci/terapie e dosi registrate nel Diario;
- visite veterinarie;
- peso e storico;
- allergie e condizioni;
- microchip;
- igiene e abitudini, inclusa la toelettatura/bagno.

Ogni blocco ha un’azione **Aggiungi** visibile. La toelettatura è una memoria morbida del
tipo “ultima volta / ogni circa X settimane”: non è una scadenza sanitaria e non va nel Diario.

### Scopri

È un’area utile, non un social e non una leva di pressione. Comprende:

1. **Consiglio del momento**, scelto da data, stagione e fase del cane.
2. **Giochi e trucchi** con metodi gentili, stati `da_imparare / in_corso / imparato`.
3. **Badge personali** per trucco e livello, senza streak, classifiche o penalità.
4. **Condividi come immagine**, che genera una card PNG locale nel brand Cuccia.
5. **Guide statiche** filtrate per `lifePhase`; “Niente panico” vive qui solo per Cucciolo.
6. **I tuoi progressi**, con badge ottenuti e prossimo traguardo.

### Profilo

Contiene identità, fase, moduli, condizioni, alimentazione, veterinario, emergenza,
toelettatore, famiglia, documenti fotografici locali, Pet Card, **Rivedi tutorial** e
azzeramento dati.

## L’app cresce col cane

`lifePhase` è una scelta manuale: **Cucciolo, Adulto o Senior**. La nascita può suggerirla,
ma non decide. Il default è Adulto e il cambio dal Profilo aggiorna Scopri e le guide.

I moduli modificabili sono Uscite, Peso, Farmaci e Toelettatura/bagno. Le condizioni neutrali
sono `problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`, `peso_controllato` e
`potty_training`: organizzano l’interfaccia e non formulano diagnosi.

## Scadenzario locale

Le scadenze derivano esclusivamente da dati confermati dall’utente:

- vaccini e richiami: prossima data;
- antiparassitari e sverminazione: ultima data + cadenza;
- farmaci: orari e durata della terapia;
- visite e controllo annuale: data;
- verifica dati microchip: data manuale.

Sono mostrate in Home e Cura. In Fase 0 non esistono notifiche push; backend, account,
sincronizzazione affidabile e push appartengono alla Fase 1.

## Onboarding e tutorial

L’onboarding ha otto passaggi brevi e skippabili:

1. nome e foto;
2. nascita e fase suggerita ma modificabile;
3. sesso, razza e taglia;
4. peso;
5. microchip;
6. veterinario e contatto;
7. caregiver;
8. condizioni particolari.

Dopo l’onboarding parte un tour di quattro coach-mark che naviga automaticamente in Home,
Diario, Cura e Scopri. È skippabile, viene salvato localmente e si riapre dal Profilo.

## Guide e sicurezza editoriale

Le guide sono dati statici locali, senza chatbot o paywall. La pertinenza dipende soltanto
da `lifePhase`, mai da `profile.createdAt`. Il contenuto usa metodi gentili e rinforzo
positivo; ogni guida termina con “Quando chiamare il veterinario” e disclaimer globale.
Prima del lancio reale i testi richiedono revisione professionale.

## Modello dati locale e migrazione

- `DogProfile`: identità, fase, moduli, condizioni, alimentazione, contatti e caregiver.
- `CareEvent`: tipo, autore, `happenedAt`, durata, nota, terapia, audit e soft-delete.
- `HealthData`: vaccinazioni, prevenzioni, terapie, visite, pesi e toelettatura.
- `Deadline`: vista derivata, mai fonte primaria.
- `Guide`, `Tip` e `Trick`: contenuti statici locali.
- `trickProgress` e `badges`: progressi personali locali.

La migrazione conserva profili ed eventi precedenti. Acqua e altri eventi legacy restano nei
dati ma non vengono mostrati nella nuova esperienza; le vecchie toelettature vengono copiate
nella sezione Cura senza comparire nel Diario.

## Identità visiva

Usare `docs/brand/`: Clay, Honey, Sage, Ink, Cream e Sand; Fraunces per titoli e numeri,
Plus Jakarta Sans per UI e testo. L’esperienza deve essere calda, adulta, leggibile a 390px
e semplice anche per una persona anziana poco tecnologica.
