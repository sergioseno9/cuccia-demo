**CUCCIA**

**Specifica funzionale e tecnica per l’evoluzione della demo**

*Documento da fornire a Claude per generare un prompt operativo
destinato a Codex*

Versione 1.0 · Agosto 2026

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Scopo del documento</strong></p>
<p>Questo documento non è un prompt di coding. È la specifica di
prodotto e implementazione che Claude deve usare, insieme al repository
GitHub, per costruire un prompt unico, completo e ordinato per Codex.
Claude dovrà prima analizzare il repository esistente e poi trasformare
queste specifiche in istruzioni operative per modificare il codice con
il minimo impatto possibile.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Contesto del progetto

Cuccia è una consumer app dedicata alla gestione quotidiana di cani e
gatti, con focus iniziale soprattutto sul cane. L’obiettivo non è creare
una semplice agenda per animali, ma un prodotto che riduca il lavoro
mentale del proprietario e della famiglia, aumenti la continuità nella
cura e renda più semplice sapere cosa è stato fatto, cosa manca e cosa
sta succedendo nella vita dell’animale.

La demo esistente contiene già diverse schermate e funzionalità:
gestione multi-pet, scadenze, diario, vaccinazioni, antiparassitari,
farmaci, visite, peso, documenti, grooming, Pet Card e una sezione
Scopri. Il nuovo lavoro deve preservare ciò che funziona e trasformare
la demo locale in una vera app condivisa, sincronizzata e mobile-ready.

Il valore principale da dimostrare nella prima fase è l’uso ricorrente:
una famiglia deve poter usare Cuccia ogni giorno per coordinarsi sullo
stesso animale, ricevere reminder, registrare rapidamente attività e
gestire passeggiate, cucciolo, crescita e viaggi.

# 2. Principi di prodotto non negoziabili

| **Principio**                                         | **Regola operativa**                                                                                                                                                                                       |
|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Non deve essere solo un calendario**                | Ogni nuova funzione deve risolvere un problema concreto o ridurre attrito. Se una funzione può essere sostituita facilmente da un promemoria generico, deve avere un valore aggiunto specifico per il pet. |
| **Meno input manuale possibile**                      | I flussi frequenti devono richiedere idealmente 1–3 tap. Dove possibile l’app deve assistere il logging, ma senza inventare dati.                                                                          |
| **Conferma umana sui dati sensibili**                 | Vaccini, farmaci, dosaggi, terapie, scadenze sanitarie o dati estratti da eventuale OCR/AI non devono mai essere salvati automaticamente senza conferma esplicita dell’utente.                             |
| **Niente diagnosi o health score inventati**          | Cuccia non deve sostituire il veterinario, diagnosticare patologie o assegnare punteggi di salute non validati.                                                                                            |
| **Distinguere attività registrata da attività reale** | Senza wearable, Cuccia può conoscere soltanto le passeggiate registrate o confermate. Le metriche devono usare wording come “passeggiate registrate”, non “attività totale del cane”.                      |
| **Multiutente come core**                             | La condivisione familiare non è un extra. È una delle ragioni principali per preferire Cuccia a calendario, note o WhatsApp.                                                                               |
| **Affidabilità prima delle feature**                  | Reminder, sincronizzazione, medicine e attività condivise devono essere più affidabili di qualsiasi funzione secondaria.                                                                                   |

# 3. Obiettivo architetturale

Prima di implementare le feature, Claude deve chiedere a Codex di fare
un audit completo del repository: stack, routing, componenti, stato
globale, persistence locale, tipi TypeScript, dipendenze, design system
e funzionalità già presenti. Non deve riscrivere l’app da zero se non
necessario.

La preferenza è mantenere quanto più possibile il frontend React/Vite
esistente e aggiungere un layer mobile nativo con Capacitor, se
tecnicamente adeguato, per ottenere push notification, GPS,
geofencing/background location e activity recognition. Se l’audit
dimostra che una migrazione diversa è realmente necessaria, Codex deve
motivarla prima di procedere.

Per il backend utilizzare Supabase come soluzione primaria, salvo
incompatibilità concreta emersa dall’audit.

| **Layer**          | **Requisito**                                                                                                |
|--------------------|--------------------------------------------------------------------------------------------------------------|
| **Authentication** | Registrazione, login, recupero password, persistenza sessione, onboarding.                                   |
| **Database**       | PostgreSQL via Supabase con schema relazionale, FK, indici, timestamps, RLS.                                 |
| **Realtime**       | Sincronizzazione immediata tra membri della famiglia sullo stesso animale.                                   |
| **Storage**        | Documenti e immagini del pet, con permessi coerenti con household/pet membership.                            |
| **Push**           | Reminder e azioni rapide da notifica.                                                                        |
| **Native layer**   | Capacitor o alternativa motivata per GPS, background location, geofencing/activity recognition e deep links. |
| **Offline**        | Optimistic UI/queue locale per azioni frequenti, deduplicazione al ritorno online.                           |

# 4. Funzione 1 — Account, famiglia e sincronizzazione

Questa è la priorità assoluta del progetto. Oggi una demo locale può
simulare più caregiver, ma la versione reale deve permettere a persone
diverse, su telefoni diversi, di usare lo stesso animale.

## Flusso atteso

- Sergio crea il proprio account e registra Milo.

- Sergio invita sua madre tramite email/link/codice.

- La madre crea un account o accede e accetta l’invito.

- Entrambi vedono lo stesso Milo e le stesse informazioni consentite dal
  proprio ruolo.

- Se la madre registra “Pappa · 19:04”, Sergio deve vedere quasi
  immediatamente “Mamma · Pappa · 19:04”.

- Se Sergio conferma un farmaco, la madre deve vedere che è già stato
  somministrato e non deve ricevere un doppio reminder operativo.

## Ruoli iniziali

- owner: controllo completo, inviti, revoca accessi, gestione permessi e
  dati.

- family: accesso ampio alle attività quotidiane e alle informazioni
  consentite.

- caregiver: accesso limitabile a routine, pasti, passeggiate, farmaci e
  note operative.

Il modello deve essere permission-based e ampliabile. Ogni attività deve
registrare almeno pet_id, user_id, tipo attività, timestamp, eventuale
caregiver visualizzato e metadata.

# 5. Funzione 2 — Reminder e push notification reali

I reminder devono uscire dall’app. La persona non deve ricordarsi di
aprire Cuccia per scoprire che esiste una scadenza.

- Antiparassitario: “Milo · Antiparassitario domani”.

- Vaccino/visita: reminder anticipato configurabile e reminder il giorno
  dell’evento.

- Farmaco: “Milo · Farmaco X · 20:00” con azione rapida “Somministrato”.

- Puppy Mode: notifica probabilistica quando emerge un pattern di
  possibile uscita.

- Smart Walk Detection: notifica “Sei fuori con Milo? Sì / No”.

Requisito critico: evitare notifiche duplicate tra membri della famiglia
e mantenere uno stato coerente se un caregiver completa l’azione. Quando
un’attività viene confermata da un membro, il dato deve sincronizzarsi e
gli altri membri devono vedere lo stato aggiornato.

# 6. Funzione 3 — Passeggiata manuale

Deve esistere un flusso esplicito e affidabile per iniziare e terminare
una passeggiata con il cane.

## Start walk

- CTA evidente “Inizia passeggiata”.

- Registrare start_time.

- Attivare tracking GPS con strategia a consumo ragionevole.

- Mostrare stato persistente di passeggiata in corso.

- Associare la passeggiata all’utente/caregiver che l’ha avviata.

## End walk

- CTA “Termina passeggiata”.

- Salvare durata, distanza e route se disponibile.

- Creare attività nella timeline.

- Sincronizzare con famiglia.

- Aggiornare statistiche passeggiate registrate.

# 7. Funzione 4 — Smart Walk Detection

Questa funzione nasce dal problema reale che l’utente può dimenticarsi
di aprire Cuccia quando esce col cane. Il sistema deve assistere il
logging, non attribuire automaticamente attività.

## Comportamento desiderato

Se il telefono rileva una possibile camminata fuori casa per alcuni
minuti e non esiste già una passeggiata Cuccia attiva, può inviare una
notifica: “Sei fuori con Milo?” con azioni Sì / No.

- Sì: avviare o registrare la passeggiata secondo ciò che è tecnicamente
  recuperabile in modo affidabile.

- No: non registrare nulla.

- Nessuna risposta: non attribuire mai automaticamente la camminata al
  cane.

- Evitare prompt continui e falsi positivi con cooldown, geofencing e
  activity recognition dove disponibili.

- Non usare polling GPS continuo se non necessario.

- Documentare differenze e limitazioni reali tra iOS e Android.

- Prevedere fallback quando background detection non è disponibile o
  affidabile.

Per privacy e batteria, la location deve essere raccolta solo nella
misura necessaria alla funzione e dopo consenso esplicito e
comprensibile.

# 8. Funzione 5 — Andamento delle passeggiate

Creare una vista dedicata alle passeggiate registrate. Non deve generare
diagnosi o giudizi sul benessere.

- Numero passeggiate registrate nella settimana/mese.

- Durata totale.

- Distanza totale.

- Media delle ultime 4 settimane.

- Confronto percentuale rispetto alla baseline personale.

- Eventuale trend per caregiver o fascia oraria, se utile e non
  invasivo.

Esempio corretto: “Questa settimana: 5h 12m di passeggiate registrate,
-12% rispetto alla media delle ultime 4 settimane.” Esempio da evitare:
“Milo sta al 72% di benessere”.

# 9. Funzione 6 — Puppy Mode

Puppy Mode è una modalità ad alta frequenza per i primi mesi del cane.
Il suo obiettivo è rendere molto rapido il tracking della routine e
restituire pattern utili, senza trasformarsi in una registrazione
obbligatoria per tutta la vita del cane.

- Pipì.

- Cacca.

- Pasto.

- Acqua.

- Sonno.

- Passeggiata.

- Peso, se già presente nel flusso generale.

Il quick logging deve richiedere pochissimi tap e deve essere
sincronizzato con gli altri caregiver.

# 10. Funzione 7 — Predizione della prossima uscita del cucciolo

La prediction deve usare lo storico individuale del cucciolo, non
prescrizioni cliniche generiche. Deve cercare pattern osservati, per
esempio intervallo dopo pasto, risveglio o ultima pipì.

- Mostrare la prediction solo quando esiste una quantità minima di dati
  sufficiente.

- Usare range, non precisione falsa: “Possibile prossima uscita tra
  circa 20–35 minuti”.

- Usare wording probabilistico: “Potrebbe essere il momento di portare
  fuori Milo”.

- Mostrare, quando utile, il motivo: “Negli ultimi giorni Milo ha fatto
  spesso pipì 18–30 minuti dopo il pasto”.

- La prediction deve migliorare con più dati ma deve rimanere
  interpretabile.

- Prevedere notifica opzionale e possibilità di disattivarla.

# 11. Funzione 8 — Crescita, età e compleanno

La data di nascita già presente deve diventare una funzione viva
dell’app.

- Nei primi mesi: mostrare giorni e mesi, per esempio “Milo ha 127
  giorni” o “4 mesi e 5 giorni”.

- Successivamente mostrare l’età in anni in modo naturale.

- Notifica di compleanno: “Oggi Milo compie 3 anni 🎂”.

- Collegare la crescita allo storico peso e alle milestone, senza
  generare valutazioni cliniche automatiche.

# 12. Funzione 9 — Timeline / Memories

Creare una timeline emozionale secondaria della vita dell’animale. Non
deve rubare spazio ai flussi quotidiani, ma può aumentare attachment e
retention.

- Arrivo a casa.

- Primo bagno.

- Primo viaggio.

- Primo compleanno.

- Peso/milestone.

- Foto.

- Eventi importanti aggiunti manualmente.

- Possibile integrazione automatica di alcuni eventi già presenti nel
  database.

# 13. Funzione 10 — Travel Mode

Travel Mode deve aiutare il proprietario a preparare il cane per un
viaggio utilizzando i dati già presenti in Cuccia.

## Creazione viaggio

- Destinazione.

- Data partenza.

- Data ritorno.

- Animale/i coinvolti.

## Checklist proposta

| **Categoria**   | **Elementi**                                                                    |
|-----------------|---------------------------------------------------------------------------------|
| **Documenti**   | libretto, eventuale passaporto, microchip, assicurazione se presente.           |
| **Salute**      | farmaci attivi, antiparassitario se rilevante, altre voci inserite dall’utente. |
| **Cibo**        | cibo, ciotola cibo, ciotola acqua.                                              |
| **Passeggiata** | guinzaglio, pettorina, sacchetti.                                               |
| **Comfort**     | coperta/cuccia, giochi.                                                         |
| **Altro**       | voci personalizzate.                                                            |

Regola importante: se il database contiene un farmaco attivo, Travel
Mode deve proporlo automaticamente nella checklist. L’utente deve poter
aggiungere, eliminare, completare e ripristinare le voci.

# 14. Funzione 11 — Pet Card condivisibile

Potenziare la Pet Card esistente come scheda sintetica dell’animale da
condividere con sitter, pensione, veterinario o familiare.

- Nome, foto, specie, razza, sesso, età.

- Microchip.

- Proprietario e telefono.

- Veterinario e contatti.

- Allergie dichiarate.

- Farmaci attivi.

- Alimentazione e routine utile.

- Contatto di emergenza.

Prevedere condivisione selettiva: l’utente decide quali campi rendere
disponibili. Preferibile link pubblico temporaneo e/o QR code con
scadenza. Nessun dato sensibile deve diventare pubblico per default.

# 15. Funzione 12 — Documenti

Usare Supabase Storage per documenti e immagini. Tipi iniziali:
libretto, vaccino, referto, prescrizione, assicurazione, documento
generico. I metadata vanno salvati nel database e protetti da RLS.

Non implementare OCR che salva dati automaticamente. Se in futuro viene
introdotto: file/foto → AI/OCR propone → schermata di revisione → utente
modifica/conferma → salvataggio. Mai AI/OCR → database direttamente.

# 16. Funzioni Care già esistenti da preservare

- Vaccinazioni.

- Antiparassitari.

- Medicinali.

- Visite.

- Peso.

- Grooming.

- Documenti.

- Alimentazione.

- Veterinario.

- Contatti.

- Multi-pet cane/gatto.

Queste funzioni devono essere collegate al backend e rese coerenti con
account, household, pet membership, realtime e notifiche senza
peggiorare l’UX esistente.

# 17. Sezione Scopri: stop all’espansione in questa fase

La demo contiene già contenuti come guide, quiz, giochi/trucchi, badge e
strumenti simili. Non aggiungere nuove funzioni a Scopri nel ciclo di
sviluppo oggetto di questo documento. La priorità deve restare sul core
operativo: famiglia, sync, notifiche, passeggiate, Smart Walk Detection
e Puppy Mode.

# 18. Supporto cane e gatto

Non rompere il supporto multi-pet esistente. Le funzioni dog-first come
Smart Walk Detection, walk analytics e Puppy Mode devono essere rese
condizionali tramite specie/feature flag. Il gatto può continuare a
usare Care, documenti, reminder, famiglia, peso e altre funzioni
generiche.

# 19. Schema dati indicativo

Claude deve chiedere a Codex di proporre lo schema definitivo dopo
l’audit, ma la struttura minima dovrebbe coprire almeno:

- profiles

- households

- household_members

- pets

- pet_members

- activities

- walks

- health_events

- medications

- medication_logs

- reminders

- weight_logs

- documents

- travel_plans

- travel_items

- milestones

- pet_share_links

- push_tokens

Usare UUID, created_at, updated_at, foreign key, indici e Row Level
Security. Un utente non deve poter leggere o scrivere dati di un animale
a cui non ha accesso.

# 20. Offline, deduplicazione e affidabilità

- Quick action come pappa, medicina, pipì, cacca e passeggiata devono
  avere un comportamento ragionevole anche senza rete.

- Valutare optimistic UI con queue locale e sincronizzazione al ritorno
  online.

- Ogni operazione critica deve essere idempotente o avere meccanismi
  anti-duplicazione.

- Particolare attenzione ai farmaci: due caregiver non devono poter
  creare facilmente una doppia somministrazione per un errore di sync.

- Gestire retry, error state e feedback utente in modo chiaro.

# 21. UX e home quotidiana

La nuova infrastruttura non deve trasformare Cuccia in un gestionale
complesso. L’home deve rispondere rapidamente a: cosa è stato fatto
oggi, cosa manca, cosa sta per scadere e come registro un’azione.

Esempio di home:

> MILO  
>   
> Oggi  
> ✓ Passeggiata mattina · Mamma · 08:14  
> ✓ Colazione · Sergio · 08:30  
> ○ Farmaco X · 20:00  
> ○ Antiparassitario · domani  
>   
> + REGISTRA

I flussi frequenti devono rimanere a 1–3 tap quando possibile.

# 22. Privacy e permessi

- Consenso esplicito alle notifiche.

- Consenso esplicito alla location.

- Spiegazione chiara del perché serve background location/activity
  recognition.

- Possibilità di disattivare Smart Walk Detection.

- Revoca accesso caregiver/familiare.

- Eliminazione account e dati.

- Export dati.

- Condivisione Pet Card con scadenza e selezione campi.

# 23. Analytics di prodotto

Preparare un abstraction layer per analytics, evitando SDK invasivi
nella prima fase. Eventi minimi consigliati:

- signup_completed

- pet_created

- family_member_invited

- family_member_joined

- activity_logged

- walk_started

- walk_completed

- smart_walk_prompt_shown

- smart_walk_yes

- smart_walk_no

- puppy_event_logged

- puppy_prediction_shown

- reminder_completed

- travel_created

- pet_card_shared

# 24. Ordine di implementazione obbligatorio

| **Fase**     | **Obiettivo**                                                |
|--------------|--------------------------------------------------------------|
| **Phase 0**  | Audit completo repository e decisione architetturale minima. |
| **Phase 1**  | Supabase, auth, schema, migrations, RLS.                     |
| **Phase 2**  | Family Mode e realtime sync.                                 |
| **Phase 3**  | Reminder e push notification.                                |
| **Phase 4**  | Manual Walk Tracking.                                        |
| **Phase 5**  | Smart Walk Detection.                                        |
| **Phase 6**  | Walk Analytics.                                              |
| **Phase 7**  | Puppy Mode e prediction.                                     |
| **Phase 8**  | Travel Mode.                                                 |
| **Phase 9**  | Crescita, timeline e compleanno.                             |
| **Phase 10** | Pet Card sharing.                                            |

Claude deve trasformare questo ordine in un prompt Codex che lavori per
fasi/commit separati e verificabili. Evitare un unico mega-commit.

# 25. Test e criteri di accettazione minimi

- Sergio crea Milo e invita Mamma; Mamma accetta e vede Milo.

- Mamma registra pappa; Sergio la vede quasi in realtime.

- Sergio conferma farmaco; Mamma vede “somministrato” e l’app evita
  doppio completamento.

- Sergio avvia e termina una passeggiata; vengono salvati
  durata/distanza e timeline.

- Smart Walk Detection mostra “Sei fuori con Milo?”; NO non crea
  attività, SÌ crea/avvia la passeggiata.

- Un cucciolo con dati insufficienti non riceve prediction precisa.

- Con dati sufficienti, Puppy Mode genera una prediction probabilistica
  spiegabile.

- Travel Mode include automaticamente un farmaco attivo.

- Un caregiver revocato perde accesso ai dati.

- Un utente estraneo non può accedere al pet via query diretta grazie a
  RLS.

Aggiungere test sulle parti critiche: membership/permissions, attività,
deduplicazione farmaci, walk start/stop, prediction, travel checklist
generation e RLS.

# 26. Cosa NON deve fare Codex

- Non riscrivere da zero UI o design system senza necessità.

- Non ampliare Scopri.

- Non introdurre diagnosi veterinarie o health score.

- Non salvare automaticamente dati sanitari estratti da OCR/AI.

- Non dichiarare implementata una funzione background se funziona solo
  con app aperta.

- Non inventare compatibilità iOS/Android: documentare limitazioni
  reali.

- Non hardcodare chiavi o secrets.

- Non lasciare RLS permissive in produzione.

- Non fare un unico commit enorme: separare fasi e rendere semplice il
  rollback.

# 27. Deliverable che Claude deve chiedere a Codex

- Audit iniziale sintetico del repository.

- Piano di implementazione con dipendenze e rischi.

- Modifiche reali al codice, non solo esempi.

- Migrations Supabase e RLS.

- Configurazione env con .env.example.

- Configurazione Capacitor/native layer se scelta.

- README aggiornato con setup, build iOS/Android, permessi location/push
  e limitazioni.

- Test automatici sulle parti critiche.

- Elenco file modificati.

- Elenco feature completate e feature parziali.

- Cose che richiedono device fisico o credenziali Apple/Google.

- Debito tecnico e bug noti.

- Istruzioni esatte per avviare e verificare il progetto.

# 28. Obiettivo finale

Cuccia deve passare da demo locale ricca di funzioni a prodotto mobile
condiviso che una famiglia può usare davvero ogni giorno. Il salto di
qualità non deriva dall’aggiungere altre decine di feature, ma dal
rendere affidabili, condivise e proattive le funzioni centrali:
famiglia, sincronizzazione, reminder, passeggiate, rilevamento
intelligente e Puppy Mode.

Claude deve usare questo documento come specifica e il repository come
fonte di verità tecnica. Il prompt finale per Codex deve preservare il
più possibile il lavoro già fatto, implementare per fasi e chiedere
verifiche concrete dopo ogni fase.
