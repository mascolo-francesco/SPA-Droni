Sistema di gestione consegne tramite droni con monitoraggio live via SPA
Un’azienda locale di consegne sperimentali utilizza droni per recapitare piccoli pacchi in varie zone della città. Ogni Drone è identificato da un codice univoco, un modello, una capacità di carico e un livello di autonomia residua. I droni vengono assegnati a diversi Piloti, giovani tecnici certificati che possono controllare uno o più droni durante il loro turno di lavoro.
I clienti effettuano Ordini di consegna, specificando il tipo di servizio richiesto, il peso complessivo del pacco, l’indirizzo di destinazione e l’orario preferito per la consegna. All’interno di ogni ordine viene registrato anche il contenuto dettagliato del pacco, composto da uno o più Prodotti, ciascuno con nome, categoria, peso stimato e quantità. Questa informazione è fondamentale per la verifica del peso, la sicurezza e l’eventuale tracciabilità interna. ***
Il sistema assegna ogni ordine a un drone compatibile: l’assegnazione tiene conto della capacità massima di carico, dell’autonomia residua e della disponibilità operativa del drone. Ogni assegnazione genera una Missione, che memorizza il drone coinvolto, il pilota responsabile, la data e ora di partenza, la posizione di pickup, la posizione di destinazione e lo stato della missione (programmata, in corso, completata, annullata).
Durante lo svolgimento della missione, il drone registra automaticamente una serie di Tracce di volo, ovvero punti GPS rilevati a intervalli regolari. Queste tracce consentono di ricostruire il percorso effettuato, monitorare la performance del drone e individuare eventuali criticità tecniche.
Per i clienti è prevista una Single Page Application (SPA) accessibile da desktop e dispositivi mobili. Questa SPA consente di:
verificare lo stato attuale del proprio ordine (richiesto, assegnato, in consegna, completato, annullato);
visualizzare, nel caso di consegna in corso, la posizione attuale del drone su una mappa interattiva;
consultare il percorso seguito dal drone, visualizzato tramite la sequenza delle tracce di volo raccolte durante la missione;
ricevere aggiornamenti automatici senza ricaricare la pagina, tramite chiamate periodiche all’API del server.
Al termine della consegna, il cliente può lasciare una Valutazione sulla missione, con punteggio e commento.
Il sistema comprende anche una sezione di amministrazione, accessibile solo ai responsabili dell’azienda, che permette di:
gestire droni, piloti e missioni;
analizzare le prestazioni operative;
elaborare statistiche e report basati sui dati storici;
utilizzare i dati acquisiti (missioni, tracce, valutazioni, carichi) per effettuare analisi predittive tramite modelli di machine learning. ***




Gli studenti, fatte le opportune specifiche integrative, dovranno consegnare:
Modello ER


Diagramma Entity-Relationship completo e corretto che rappresenti entità, attributi e relazioni del sistema di consegne con droni (inclusi piloti, droni, ordini, prodotti, missioni, tracce di volo, valutazioni, ecc.).


Modello logico-relazionale


Trasformazione completa del modello ER in schema relazionale: tabelle, chiavi primarie, chiavi esterne, tipi di dato e vincoli di integrità.


Creazione del database


Script SQL per creare lo schema del database
Il database dovrà essere predisposto su un servizio cloud (come Aiven).


Popolamento del database


Script INSERT che inseriscano dati fake realistici: almeno esempi di piloti, droni, ordini (con prodotti nel pacco), missioni e tracce di volo.
I dati devono permettere di testare tutte le funzionalità principali (monitoraggio in volo, calcolo carico, valutazioni).


Frontend (client & customer SPA) – HTML / Bootstrap / JavaScript


Single Page Application per i clienti che: mostra lo stato dell’ordine, visualizza la posizione del drone e il percorso in volo su mappa, aggiorna dinamicamente senza ricaricare la pagina.
Single Page Application o sezione SPA per gli amministratori (o interfaccia amministrativa) con dashboard per visualizzare missioni, tracce e statistiche.
Interfaccia realizzata con HTML, Bootstrap per il layout/styling e JavaScript per la logica e le chiamate alle API.


Backend Web (Flask) che serve le pagine SPA


Applicazione Flask che fornisce le risorse statiche e le pagine HTML/CSS/JS necessarie per la SPA (routing per il web server).
Gestione di autenticazione, login e sessioni utente per clienti, piloti e amministratori (sessioni sicure).


Backend API (Flask) che accede al database


REST API (endpoints) implementata in Flask per tutte le operazioni richieste dal frontend: consultazione stato ordine, recupero tracce di volo, invio aggiornamenti missione, CRUD su entità amministrative, ecc.
Il server API interagisce direttamente con il database relazionale per leggere/scrivere i dati.
Le API devono prevedere meccanismi di autenticazione/autorizzazione adeguati per proteggere accessi e operazioni sensibili.


Note aggiuntive (obbligatorie)
L’interazione frontend → backend deve avvenire tramite le API; la SPA non deve leggere direttamente il database.
Devono essere incluse istruzioni chiare (README) per avviare: database, backend Flask e frontend SPA.
Tutto il materiale di progetto (modelli, script SQL, sorgenti frontend e backend, README) deve essere caricato su GitHub come concordato.
—---------------------------------------
