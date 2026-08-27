# cuccia — Standard di Qualità (non negoziabili)

Ricavato dall'analisi di **184 recensioni negative uniche** del principale concorrente
(11pets) + recensioni internazionali. Non sono buoni propositi: sono le cause esatte per cui
un'app amata è stata abbandonata. Ogni feature che costruiamo deve rispettare questo documento.

**Il cuore emotivo da non tradire mai:** la rabbia più forte non è "l'app è brutta", è
*"mi avevate dato qualcosa di buono e me l'avete tolto"* (≈"era perfetta prima"). Non togliere
mai valore a chi ce l'ha già.

**I 3 killer (in ordine di frequenza):**
1. Un aggiornamento ha rotto tutto — 28%
2. Perdita di dati — 15%
3. Monetizzazione sleale — 15%

---

## 1. I dati sono sacri
- **Non si perde MAI un dato dell'utente.** È la promessa numero uno del prodotto.
- **Backup automatico locale** a ogni scrittura importante.
- **Esportazione one-tap che funziona davvero** (JSON completo + PDF leggibile) e
  **re-importabile**. → Da TESTARE su dati reali: il concorrente dava file di export vuoti.
- I dati sono dell'utente: sempre leggibili ed esportabili, in qualsiasi momento, gratis.
- **Definition of done:** creo dati → esporto → cancello tutto → re-importo → i dati tornano identici.

## 2. Aggiornamenti & migrazioni
- **Niente big-bang rewrite** che mettano a rischio i dati esistenti. Modifiche incrementali.
- Ogni cambio di struttura dati richiede una **migrazione testata su dati reali esistenti**,
  mai distruttiva, con fallback. (Il crollo del concorrente è stato dati "rimescolati" da un update.)
- **Nessun aggiornamento può rimuovere funzioni o dati** che l'utente aveva. Se una cosa c'era,
  continua a esserci.
- **Definition of done:** simulo l'upgrade partendo da uno stato "vecchio" popolato → nessun
  dato perso, nessuna funzione sparita.

## 3. Notifiche & promemoria affidabili (è un nostro "eroe" → vita o morte)
I reminder sono tra le cose più amate, ma i loro fallimenti fanno più danni di tutti. Regole:
- Devono **partire in background da soli**, anche ad app chiusa. Un reminder che "suona" solo
  se apri l'app è inutile (lamentela ricorrente).
- Devono **sopravvivere agli aggiornamenti** (mai azzerare/sballare i promemoria impostati).
- Impostare un reminder deve essere **ovvio e scopribile** (gli utenti non trovavano come fare).
- Devono essere **sensati per quel cane** (mai "vaccina la tartaruga"): coerenti con specie/profilo.
- Includere gli **alert per i richiami** (vaccinali) e per il controllo annuale.
- *In Fase 0 (locale) non c'è push:* i reminder sono in-app, ma il codice va predisposto a
  queste regole per quando aggiungeremo le notifiche.

## 4. Monetizzazione onesta (quando arriverà — MAI nel prototipo)
- **Mai mettere dietro paywall i dati che l'utente ha già inserito.** Restano accessibili ed
  esportabili gratis, per sempre. Bloccare i propri dati dietro pagamento = tradimento n.1.
- **Nessun addebito a sorpresa.** Prezzo scritto in modo cristallino (una tantum vs ricorrente:
  gli utenti del concorrente non capivano nemmeno cosa pagavano).
- **Niente funzioni tolte** a chi già le usava. Utenti storici *grandfathered*.
- Un piano gratuito **utile e non mutilato a posteriori**.

## 5. Localizzazione: italiano umano
- Testi scritti/riletti da un umano madrelingua, **mai traduzione automatica** (9% di
  lamentele solo su questo). Zero gergo tecnico.

## 6. Rispetto dell'utente (anti dark-pattern)
- Niente banner a tutto schermo non chiudibili, niente pop-up che bloccano l'uso.
- Niente assillo per lasciare recensioni.
- **Cancellazione account e reset password devono funzionare** (quando ci saranno gli account):
  il concorrente aveva codici di conferma che non arrivavano mai → utenti intrappolati.
- Bug base da non fare mai: testo bianco su bianco, campi non salvati, schermate senza "avanti".

## 7. Cosa PRESERVARE (dai 5★ — sono i nostri punti di forza, non perderli)
Gli utenti amano, in quest'ordine: **tutto in un posto/completa · multi-animale · promemoria
utili · facile da usare · libretto sanitario.** Sono esattamente i nostri "eroi"
(libretto/scadenze/PetCard). Teniamo la rotta.

## 8. Dettagli-contenuto validati dalle recensioni (da integrare)
Cose che gli utenti hanno chiesto esplicitamente:
- **Multi-cane**: un utente, più cani (molto richiesto). Almeno predisporre il modello dati.
- **Stampa/condivisione della cartella clinica** da portare dal vet / pronto soccorso → è la
  nostra **PetCard/export**. Richiesta testualmente.
- **Nascondere le categorie che non servono** → i nostri **moduli attivabili/disattivabili**.
- **Backup in locale** → richiesto testualmente.
- **Documenti/foto degli esami** e voce **condizioni/malattie** → già previsti.
- **Lotto + data di scadenza** nella scheda vaccino.
- **Pausa stagionale** per antiparassitari/repellenti (es. sospendere d'inverno) nella cadenza.
- **Promemoria per il controllo annuale**.

---

## Gate di qualità (prima di considerare "fatta" QUALSIASI feature)
- [ ] Nessun percorso può far perdere dati all'utente.
- [ ] Export/backup funziona ed è re-importabile (testato).
- [ ] La migrazione dati non rompe uno stato preesistente popolato (testato).
- [ ] Leggibile su mobile: testo ≥16px, tap target ≥44px, testato a 390px.
- [ ] Testi in italiano umano, zero gergo.
- [ ] Nessun dark pattern, nessun dato/funzione tolto rispetto a prima.
