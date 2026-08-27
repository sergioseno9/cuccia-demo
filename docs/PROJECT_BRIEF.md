# cuccia — Project Brief Fase 0

## Tesi di prodotto

Cuccia è il posto di cui fidarsi dove vive tutto ciò che conta del cane, che ricorda in
anticipo le scadenze inserite e che si può condividere con chiunque in pochi secondi.

I tre eroi sono:

1. **Libretto sanitario digitale** completo ma semplice.
2. **Scadenzario in-app** derivato da date confermate manualmente.
3. **Pet Card** offline, stampabile o salvabile in PDF.

Il diario e il feed “chi ha fatto cosa” sostengono questa base, senza dominarla. Ogni evento
resta attribuito a una persona e a un orario. In Fase 0 tutto vive nel `localStorage` del browser:
nessun backend, account, push, sincronizzazione o paywall.

## Principi non negoziabili

1. Informazioni e funzioni vivono in sezioni separate e ordinate.
2. Il logging quotidiano è veloce, utile e sempre opzionale.
3. I dati sanitari sono inseriti e confermati manualmente; niente OCR o auto-save.
4. Il tono è calmo e fattuale: niente diagnosi, health score, target o allarmi.
5. Ogni evento e dose conserva autore, timestamp e audit delle modifiche.
6. La condivisione deve funzionare anche offline tramite stampa o salvataggio PDF.

## L’app cresce col cane

`lifePhase` è una scelta dell’utente: **Cucciolo, Adulto o Senior**. La nascita può suggerirla
nell’onboarding, ma non la imposta. Il default è Adulto e il cambio dal Profilo aggiorna live
home, preset dei moduli e guide pertinenti.

- **Cucciolo:** routine più visibili, guide e tono rassicurante.
- **Adulto:** scadenze, libretto e riepiloghi discreti.
- **Senior:** terapie, visite e peso più accessibili.

I preset sono solo un punto di partenza. `trackedModules` offre interruttori per Uscite, Acqua,
Peso, Farmaci e Toelettatura/bagno. Le condizioni opzionali e neutrali sono
`problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`, `peso_controllato` e
`potty_training`; attivano gli strumenti collegati senza formulare diagnosi.

Pipì e cacca non esistono nell’esperienza standard. Il relativo strumento compare soltanto
con `problemi_urinari` o `potty_training`.

## Architettura a quattro tab

### Oggi

La gerarchia, in particolare per Adulto, è:

1. prossime scadenze come eroe;
2. colpo d’occhio sanitario con peso e ultima/prossima visita;
3. azioni rapide opzionali;
4. accesso in un tap alla Pet Card;
5. card di stato e contenuti pertinenti alla fase;
6. attività recenti della famiglia come layer secondario.

Le azioni standard sono Uscita, Pappa, Acqua, Farmaco e Nota; Toelettatura/bagno appare se
seguita. Il tap registra “adesso”, poi l’evento può essere corretto in ora, durata, caregiver
e nota. Le uscite accettano 15/30/45/60 minuti o una durata personalizzata.

La card **Uscite** mostra ultima uscita con autore/orario, conteggio e durata di oggi, più una
mini-timeline. `outingIntervalHours`, se impostato, produce solo un nudge morbido come
“di solito esce ogni ~3 h · ultima 2 h fa”; mai un allarme o un obbligo.

### Diario

Storico filtrabile per uscite, pappa, acqua, pipì/cacca solo quando attive,
Toelettatura/bagno e note. Ogni categoria ha statistiche descrittive e timeline per giorno.
Gli eventi sono modificabili, eliminabili con soft-delete e conservano l’audit.

### Salute — libretto sanitario digitale

La sezione comprende:

- scadenze con stato `ok / in arrivo / scaduto`;
- vaccinazioni e richiami;
- antiparassitari per pulci e zecche;
- sverminazione;
- farmaci/terapie, orari e storico dosi autore/orario;
- visite passate e future;
- peso attuale e storico;
- allergie e condizioni;
- microchip e relativa verifica dati.

### Profilo

Contiene dati del cane, fase, moduli, condizioni, alimentazione, veterinario, emergenza,
toelettatore, famiglia, documenti fotografici locali, Pet Card e azzeramento dati.

La Pet Card include nome/foto, microchip, veterinario e telefono, emergenza, farmaci attivi,
allergie, alimentazione e note del proprietario. È pensata per sitter, pensione, nuovo
veterinario e viaggi; dal browser si stampa o salva in PDF anche offline.

## Scadenzario locale

Le scadenze derivano esclusivamente da dati inseriti dall’utente:

- vaccini e richiami: prossima data;
- antiparassitari e sverminazione: ultima data + cadenza;
- farmaci: orari e fine terapia;
- visite: data appuntamento;
- controllo annuale, rinnovo assicurazione e verifica microchip: data manuale.

Sono mostrate in Oggi e Salute. In Fase 0 non esistono notifiche push; backend, account,
sincronizzazione affidabile e push appartengono alla Fase 1.

## Guide statiche

La Guida non è un quinto tab. L’icona libro apre l’hub; in modalità Cucciolo Oggi mostra
“Niente panico” e, quando pertinente, la Guida del momento. Ogni guida dichiara
`fase: cucciolo | adulto | senior | tutte`; la rilevanza dipende solo dalla fase scelta,
mai dalla data di creazione del profilo. In Adulto e Senior nessuna card viene forzata se
non esiste contenuto pertinente.

I contenuti sono editoriali statici e locali, senza chatbot o paywall, con soli metodi gentili.
Ogni guida chiude con “Quando chiamare il veterinario” e disclaimer globale. I testi richiedono
revisione professionale prima di un lancio reale.

## Onboarding

Flusso breve, senza gergo e skippabile:

1. nome e foto;
2. data di nascita e fase suggerita ma modificabile;
3. sesso, razza e taglia;
4. peso;
5. microchip;
6. veterinario, telefono ed emergenza;
7. caregiver;
8. moduli da seguire;
9. condizioni particolari.

Tutto è modificabile dal Profilo. È disponibile un profilo demo Adulto di Milo.

## Modello dati locale

- `DogProfile`: identità, `lifePhase`, `trackedModules`, `conditions`,
  `outingIntervalHours`, alimentazione, contatti, date manuali, documenti e caregiver.
- `CareEvent`: tipo, caregiver, `happenedAt`, durata, nota, terapia collegata, audit e soft-delete.
- `HealthData`: vaccinazioni, prevenzioni, terapie, visite e pesi.
- `Deadline`: vista derivata, mai fonte primaria.
- `Guide`: contenuto editoriale locale con `fase`, trigger e sezioni.

La migrazione conserva i dati Fase 0 precedenti: vecchi profili senza fase diventano Adulto,
l’intervallo bisogni diventa intervallo uscite e i vecchi eventi restano nello storico. Pipì,
cacca e sonno legacy non vengono mostrati quando il relativo strumento non è attivo.

## Identità visiva

Usare il sistema in `docs/brand/`: Clay, Honey, Sage, Ink, Cream e Sand; Fraunces per titoli
e numeri, Plus Jakarta Sans per la UI. Il risultato deve sembrare caldo, adulto, affidabile e
ordinato: non una dashboard clinica e non una collezione di card identiche.
