# cuccia — Project Brief · Stato attuale

## Tesi di prodotto

Cuccia è il posto affidabile dove vivono le informazioni importanti di cani e gatti, dove
le date confermate dalla famiglia diventano promemoria chiari e dove la Pet Card è pronta da
condividere. I tre eroi sono **scadenzario in-app**, **Pet Card offline** e **libretto di Cura**.

Cuccia conserva la modalità locale in `localStorage` e offre una modalità account con Supabase
Fase 1: Auth, schema Postgres, Storage privato, RLS e import locale→cloud idempotente. Profilo,
Cura e documenti hanno persistenza cloud; la sincronizzazione completa del Diario e il realtime
familiare restano lavoro successivo. Non esistono ancora push, app nativa o paywall. Ogni evento
del Diario conserva autore, timestamp e audit, ma il logging è facoltativo.

## Principi non negoziabili

1. Le funzioni vivono in sezioni separate e ordinate.
2. Home mostra identità del pet, scadenze, uscite e Pet Card; nessun logging o feed.
3. Il logging quotidiano è esplicito, leggero e opzionale.
4. I dati sanitari sono inseriti e confermati a mano; niente OCR o auto-import.
5. Il tono è calmo e fattuale: niente diagnosi, score, target o allarmi.
6. I dati non si perdono: backup automatico, export completo e migrazioni testate.
7. Mobile-first: testo base 16px, etichette 14px e target touch almeno 44px.

## Architettura a cinque tab

### Home

Contiene soltanto:

1. **Selettore globale e identità**, con foto grande, nome, età e fase.
2. **Prossime scadenze**, massimo tre, con stato `ok / in arrivo / scaduto`; il tap apre Cura.
3. **Pet Card**, stampabile o salvabile in PDF anche offline.
4. **Uscite** per i cani, con gli orari configurati, gli avvisi in-app scelti e lo stato fatto.

Non contiene azioni rapide, feed, statistiche o guide.

### Diario

Il pulsante **Registra** apre sempre prima un popup. Per il cane propone Uscita/Passeggiata,
Pappa e Nota; Farmaco compare con terapia attiva. Pipì e cacca compaiono solo con
`problemi_urinari` o `potty_training`. Per il gatto non esistono passeggiate e Lettiera è
disponibile per specie. Acqua e Toelettatura non compaiono.

Il popup contiene data, ora con preset, durata uscita 15/30/45/60 o personalizzata,
caregiver e nota. Lo storico è un accordion per giorno: Oggi aperto, giorni precedenti chiusi.
Ogni voce è modificabile o eliminabile con soft-delete e audit. Gli orari precisi configurati
dall’utente alimentano soltanto promemoria in-app gentili quando Cuccia è aperta.

### Cura

La schermata principale è un indice del libretto: due dati chiave in alto, poi righe per
Vaccinazioni, Antiparassitari, Farmaci, Visite, Peso e crescita e Documenti. Sverminazione,
igiene, microchip e condizioni restano in un gruppo secondario. Ogni riga apre un dettaglio
dedicato con storico e azione **Aggiungi**. Il libretto comprende:

- prossime scadenze;
- vaccinazioni con richiamo, lotto e scadenza prodotto;
- antiparassitari con cadenza ed eventuale pausa stagionale;
- sverminazione;
- farmaci/terapie e dosi registrate nel Diario;
- visite veterinarie;
- peso e storico;
- allergie, condizioni organizzative e campo condizioni/malattie annotate;
- microchip;
- igiene e toelettatura come memoria morbida;
- documenti allegabili alle singole voci.

Ogni dettaglio ha un’azione **Aggiungi** visibile e card con **Modifica/Elimina** per tutti i
record sanitari e i documenti. Tutto entra o cambia solo dopo conferma manuale.

### Scopri

La schermata principale ha esattamente tre ingressi: **Che tipo è?**, **Guide** e
**Giochi & trucchi**. Ognuno apre una pagina dedicata; guide di cura e attività ludiche non
condividono la stessa libreria. Scopri è contenuto utile, non social, commerce o leva di
pressione, e comprende:

1. **Guide statiche** filtrate per `species` e `lifePhase`, con checklist locali e disclaimer.
2. **Addestramento cane** con metodi gentili e stati `da_imparare / in_corso / imparato`.
3. **Percorsi guidati**: Cucciolo appena arrivato, Le basi, Passeggiata tranquilla.
4. **Badge positivi** per trucco, livello e percorso; niente streak o penalità.
5. **Che tipo è?**, mini-quiz di archetipo per cane e gatto: gioco dichiarato, risultato
   deterministico e rigiocabile, salvato localmente per singolo pet e condivisibile come PNG.

I contenuti di addestramento e le guide attuali sono da cane. Il quiz usa due domande
specifiche per il gatto; le pagine senza contenuti adatti mostrano uno stato vuoto chiaro. Il
quiz è solo un momento leggero: non è una valutazione comportamentale e non produce diagnosi
o consigli.

### Profilo

La schermata principale contiene card identità, animali in famiglia e quattro menu:
Alimentazione, Contatti utili, Famiglia e Impostazioni. **Modifica pet** è una pagina completa,
non un popup, e raccoglie fase, condizioni, veterinario, emergenza, toelettatore, alimentazione
e famiglia. Impostazioni contiene orari uscite, documenti, backup/export, tutorial riapribile e
reset distinto tra browser e account cloud. La Pet Card resta accessibile dalla Home. Il
selettore globale permette di passare tra schede e aggiungere pet.

## Multi-animale e personalizzazione

Il modello è `household → pets[]`. `household` contiene i caregiver; ogni `pet` contiene
profilo, eventi, Cura, progressi e badge indipendenti. Le uniche specie ammesse sono `cane`
e `gatto`. Il cane esistente viene migrato automaticamente nel primo elemento di `pets[]`.

`lifePhase` è una scelta manuale: **Cucciolo/Gattino, Adulto o Senior**. La nascita può
suggerirla, ma non decide; il default è Adulto.

Le condizioni neutrali sono `problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`,
`peso_controllato` e `potty_training`: organizzano l’interfaccia e non sono diagnosi. Il campo
legacy `trackedModules` resta nel modello per compatibilità, ma non ha UI e non pilota la
visibilità: Diario deriva le azioni da specie, condizioni e terapie attive.

## Scadenzario e promemoria

Le scadenze derivano esclusivamente da dati confermati dall’utente:

- vaccini e richiami: prossima data;
- antiparassitari e sverminazione: ultima data + cadenza, rispettando la pausa stagionale;
- farmaci: orari e durata terapia;
- visite e controllo annuale: data;
- assicurazione e verifica dati microchip: data manuale.

Home mostra la vista derivata delle scadenze; Cura usa gli stessi dati per valori chiave e
sezioni di dettaglio. Gli orari uscite usano la stessa fonte in Home e Impostazioni e possono
generare soltanto promemoria in-app ad app aperta. Le push richiedono la futura fase nativa e
test reali su device: non sono disponibili oggi.

## Onboarding e tutorial

L’onboarding ha nove passaggi:

1. specie Cane/Gatto;
2. nome e foto;
3. nascita e fase suggerita ma modificabile;
4. sesso, razza e taglia, più indoor/outdoor per il gatto;
5. peso;
6. microchip;
7. veterinario e contatti;
8. caregiver;
9. condizioni opzionali.

Non esiste uno step di selezione moduli. Dopo l’onboarding parte un tour skippabile di cinque
coach-mark per il cane — Home, Uscite, Diario, Cura, Scopri — e quattro per il gatto.

## Backup, export e migrazione

- Storage corrente versionato: schema 2.
- A ogni scrittura importante vengono aggiornati dati correnti, copia precedente e backup JSON.
- L’export JSON comprende famiglia, tutti i pet, eventi, audit, Cura, documenti, progressi e
  ultimo risultato del quiz per ciascun pet.
- L’import sostituisce i dati solo dopo conferma e passa dalla stessa migrazione versionata.
- Il PDF è una copia leggibile di tutti i pet; il JSON è il formato di ripristino.
- Il comando **Azzera** elimina dati correnti, legacy e backup dal browser.
- Con account attivo, il reset cloud è separato dal reset browser e lascia l’utente loggato senza
  pet; l’onboarding crea quindi una nuova scheda. L’import locale→cloud usa batch e ID legacy per
  evitare duplicati.

Il gate automatico verifica: stato legacy popolato → migrazione senza perdita; creazione dati →
export → reset → import → identità completa; recupero da backup automatico se il salvataggio
principale è corrotto.

## Guide e sicurezza editoriale

Le guide sono dati statici locali, senza chatbot o paywall. La pertinenza dipende da
`species` e `lifePhase`, mai da `profile.createdAt`. Usano metodi gentili e rinforzo positivo;
ogni guida termina con “Quando chiamare il veterinario” e disclaimer globale. Prima del
lancio reale i testi richiedono revisione professionale.

## Identità visiva

Usare `docs/brand/` con un sistema minimale: canvas bianco caldo `#FDFCFA`, card bianche con
ombra `0 8px 30px rgba(43,35,32,.05)`, raggi 20–22px e accenti Clay/Honey/Sage molto dosati.
Il blu `#5E7C8B` identifica farmaci e contatti. Fraunces compare soltanto nei titoli di
schermata e nei nomi/numeri chiave; Plus Jakarta Sans governa tutta la UI. Icone Lucide a
linea, avatar perfettamente tondi, molto spazio bianco e nessuna mattonella beige. La bottom
navigation è pulita e ariosa. Il riferimento vincolante resta `docs/mockups/min_*.png`.

Foto e allegati immagine vengono ridimensionati localmente fino a circa 1400px e convertiti
in JPEG prima del salvataggio, per proteggere lo spazio del browser. Se la quota è quasi
esaurita, Cuccia avvisa di esportare un backup senza scartare la modifica ancora in memoria.
