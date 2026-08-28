# cuccia — Project Brief Fase 0

## Tesi di prodotto

Cuccia è il posto affidabile dove vivono le informazioni importanti di cani e gatti, dove
le date confermate dalla famiglia diventano promemoria chiari e dove la Pet Card è pronta da
condividere. I tre eroi sono **scadenzario in-app**, **Pet Card offline** e **libretto di Cura**.

In Fase 0 tutto vive nel `localStorage`: nessun backend, account, push, sincronizzazione o
paywall. Ogni evento del Diario conserva autore, timestamp e audit, ma il logging è facoltativo.

## Principi non negoziabili

1. Le funzioni vivono in sezioni separate e ordinate.
2. Home mostra identità del pet, scadenze e Pet Card; nessun logging o feed.
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

Non contiene azioni rapide, feed, statistiche o guide.

### Diario

Il pulsante **Registra** apre sempre prima un popup. Per il cane propone Uscita/Passeggiata,
Pappa e Nota; Farmaco compare con terapia attiva. Pipì e cacca compaiono solo con
`problemi_urinari` o `potty_training`. Per il gatto non esistono passeggiate di default e
Lettiera compare soltanto quando il modulo è attivo. Acqua e Toelettatura non compaiono.

Il popup contiene data, ora con preset, durata uscita 15/30/45/60 o personalizzata,
caregiver e nota. Lo storico è un accordion per giorno: Oggi aperto, giorni precedenti chiusi.
Ogni voce è modificabile o eliminabile con soft-delete e audit. Il nudge uscite, se impostato,
descrive un ritmo scelto dall’utente e non usa mai tono prescrittivo.

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

Ogni dettaglio ha un’azione **Aggiungi** visibile. Tutto entra solo dopo conferma manuale.

### Scopri

La schermata principale ha tre soli ingressi: **Che tipo è?**, **Consiglio del momento** e
**Giochi & trucchi**. Quest’ultimo apre la libreria completa. Scopri è contenuto utile, non
social, commerce o leva di pressione, e comprende:

1. **Consiglio del momento**, scelto da data, stagione, specie e fase.
2. **Addestramento cane** con metodi gentili e stati `da_imparare / in_corso / imparato`.
3. **Percorsi guidati**: Cucciolo appena arrivato, Le basi, Passeggiata tranquilla.
4. **Badge positivi** per trucco, livello e percorso; niente streak o penalità.
5. **Condividi come immagine**, card PNG locale nel brand Cuccia.
6. **Clicker e fischietto**, due utility audio locali.
7. **Guide statiche** filtrate per `species` e `lifePhase`; Niente panico solo per cucciolo.
8. **I tuoi progressi**, con badge ottenuti e prossimo traguardo.
9. **Che tipo è?**, mini-quiz di archetipo per cane e gatto: gioco dichiarato, risultato
   deterministico e rigiocabile, salvato localmente per singolo pet e condivisibile come PNG.

I contenuti di addestramento e le guide attuali sono da cane. Il quiz usa due domande
specifiche per il gatto; per il resto Scopri mostra consigli dedicati e comunica con chiarezza
che guide e attività sono in arrivo. Il quiz è solo un momento leggero: non è una valutazione
comportamentale e non produce diagnosi o consigli.

### Profilo

La schermata principale contiene card identità, animali in famiglia e quattro menu:
Alimentazione, Contatti utili, Famiglia e Impostazioni. I dettagli mantengono fase del pet,
indoor/outdoor per il gatto, moduli, condizioni, veterinario, emergenza, toelettatore,
documenti locali, backup/export, tutorial riapribile e azzeramento dati. La Pet Card resta
accessibile dalla Home. Il selettore globale permette di passare tra schede e aggiungere pet.

## Multi-animale e personalizzazione

Il modello è `household → pets[]`. `household` contiene i caregiver; ogni `pet` contiene
profilo, eventi, Cura, progressi e badge indipendenti. Le uniche specie ammesse sono `cane`
e `gatto`. Il cane esistente viene migrato automaticamente nel primo elemento di `pets[]`.

`lifePhase` è una scelta manuale: **Cucciolo/Gattino, Adulto o Senior**. La nascita può
suggerirla, ma non decide; il default è Adulto.

I moduli sono per pet: Uscite, Peso, Farmaci, Toelettatura/bagno e Lettiera per il gatto.
Le condizioni neutrali sono `problemi_urinari`, `terapia_in_corso`, `mobilita_ridotta`,
`peso_controllato` e `potty_training`: organizzano l’interfaccia e non sono diagnosi.

## Scadenzario locale

Le scadenze derivano esclusivamente da dati confermati dall’utente:

- vaccini e richiami: prossima data;
- antiparassitari e sverminazione: ultima data + cadenza, rispettando la pausa stagionale;
- farmaci: orari e durata terapia;
- visite e controllo annuale: data;
- assicurazione e verifica dati microchip: data manuale.

Home mostra la vista derivata delle scadenze; Cura usa gli stessi dati per valori chiave e
sezioni di dettaglio. La logica è separata dai componenti per potersi collegare in Fase 1 a
reminder affidabili in background. In Fase 0 non esiste push.

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

Non esiste lo step “Cosa seguo”: i moduli partono da specie/fase e si regolano dal Profilo.
Dopo l’onboarding parte un tour skippabile di quattro coach-mark: Home, Diario, Cura, Scopri.

## Backup, export e migrazione

- Storage corrente versionato: schema 2.
- A ogni scrittura importante vengono aggiornati dati correnti, copia precedente e backup JSON.
- L’export JSON comprende famiglia, tutti i pet, eventi, audit, Cura, documenti, progressi e
  ultimo risultato del quiz per ciascun pet.
- L’import sostituisce i dati solo dopo conferma e passa dalla stessa migrazione versionata.
- Il PDF è una copia leggibile di tutti i pet; il JSON è il formato di ripristino.
- Il comando **Azzera** elimina dati correnti, legacy e backup dal browser.

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
