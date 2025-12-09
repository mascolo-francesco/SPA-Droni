# Project Brief - DroneDelivery SPA

## Panoramica Progetto

DroneDelivery è un sistema completo di gestione consegne tramite droni con monitoraggio live via Single Page Application. Il progetto è stato sviluppato come elaborato universitario, seguendo specifiche tecniche rigorose.

## Obiettivi Principali

1. **Sistema di Tracking in Tempo Reale**: Permettere ai clienti di monitorare la posizione del drone sulla mappa durante la consegna
2. **Gestione Completa delle Operazioni**: Dashboard admin per controllare droni, piloti, missioni e ordini
3. **Architettura SPA Moderna**: Due applicazioni separate (Cliente e Admin) con routing client-side
4. **API RESTful**: Backend Flask che espone endpoint per tutte le operazioni CRUD

## Requisiti Funzionali

### Area Cliente
- Visualizzare stato ordini (richiesto, assegnato, in consegna, completato, annullato)
- Tracciare posizione drone su mappa interattiva durante la consegna
- Consultare percorso seguito dal drone tramite tracce GPS
- Creare nuovi ordini con selezione prodotti
- Lasciare valutazioni (punteggio + commento) post-consegna

### Area Admin
- Dashboard con KPI e statistiche operative
- CRUD completo: droni, piloti, prodotti, ordini, missioni
- Visualizzazione e gestione missioni
- Analisi prestazioni e report

## Vincoli Tecnici (NON NEGOZIABILI)

| Vincolo | Dettaglio |
|---------|-----------|
| **NO Bootstrap** | Design system CSS custom obbligatorio |
| **NO Gradienti** | Colori flat, stile minimal |
| **NO Emoji** | Solo icone Lucide |
| **Vanilla JS** | Nessun framework React/Vue/Angular |
| **Flask Backend** | Python con SQLAlchemy ORM |
| **MySQL Cloud** | Database su Aiven |

## Deliverables Richiesti

1. ✅ Modello ER del database
2. ✅ Schema relazionale (tabelle, FK, vincoli)
3. ✅ Script SQL per creazione schema
4. ✅ Script INSERT per dati di test
5. ✅ Frontend SPA Cliente
6. ✅ Frontend SPA Admin
7. ✅ Backend Flask (pages + API)
8. ✅ Documentazione README

## Stakeholders

- **Studente**: Francesco Mascolo
- **Utilizzo**: Progetto universitario
- **Repository**: github.com/mascolo-francesco/SPA-Droni

## Criteri di Successo

- L'applicazione deve funzionare su `http://localhost:5000`
- Il tracking mappa deve aggiornarsi automaticamente senza refresh pagina
- Tutte le operazioni CRUD devono essere accessibili via API
- Il design deve essere responsive (mobile-first)
- Autenticazione basata su sessioni Flask
