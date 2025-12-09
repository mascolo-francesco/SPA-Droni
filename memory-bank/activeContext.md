# Active Context - DroneDelivery SPA

## Focus Attuale del Lavoro

**Stato**: Configurazione ambiente e primo avvio

Il codice del progetto è stato completato. L'attività corrente riguarda la configurazione dell'ambiente per avviare l'applicazione.

## Cambiamenti Recenti

### Sessione Corrente (3 Dicembre 2025)

1. **Memory Bank**: Creazione della documentazione di progetto completa
2. **Configurazione .env**: Supporto utente per setup connessione Aiven MySQL

### Sessione Precedente

1. ✅ Creato tutti i moduli JS per SPA Admin:
   - `api.js`, `dashboard.js`, `ordini.js`, `missioni.js`
   - `droni.js`, `piloti.js`, `prodotti.js`, `app.js`

2. ✅ Creato template `admin.html`

3. ✅ Aggiornato `backend/__init__.py` con route `/cliente` e `/admin`

4. ✅ Corretto `index.html` (rimossi `.html` dai redirect)

5. ✅ Completato `README.md` con documentazione completa

## Prossimi Passi Immediati

### 1. Configurare `.env` (PRIORITÀ ALTA)

```env
DATABASE_URL=mysql+pymysql://avnadmin:PASSWORD@mysql-xxx.aivencloud.com:PORT/defaultdb
SECRET_KEY=una-chiave-segreta-qualsiasi
```

### 2. Testare Avvio Server

```bash
cd backend
source venv/bin/activate
python run.py
```

### 3. Verificare Connessione Database

Se errore SSL con Aiven:
```env
DATABASE_URL=mysql+pymysql://USER:PASS@HOST:PORT/DB?ssl_ca=/path/to/ca.pem
```

### 4. Popolare Database

Eseguire script `database/seed.sql` su Aiven dopo verifica schema.

## Decisioni Attive

| Decisione | Scelta | Motivazione |
|-----------|--------|-------------|
| Polling vs WebSocket | Polling 5s | Semplicità, no dipendenze extra |
| Auth | Session-based | Nativo Flask, no JWT complexity |
| CSS Framework | Custom | Requisito progetto (no Bootstrap) |
| State Management | Nessuno | Vanilla JS, stato locale |

## Considerazioni Aperte

### Performance
- Il polling ogni 5 secondi potrebbe essere ottimizzato con long-polling
- Considerare caching per statistiche dashboard

### Sicurezza
- Aggiungere rate limiting sulle API
- Validare tutti gli input lato server
- Implementare CSRF protection

### UX
- Aggiungere skeleton loading durante caricamenti
- Gestire stati di errore in modo più user-friendly
- Toast notifications per feedback azioni

## File Modificati di Recente

| File | Ultima Modifica | Note |
|------|-----------------|------|
| `backend/.env` | Oggi | Da configurare con credenziali Aiven |
| `backend/app/__init__.py` | Oggi | Aggiunto route cliente/admin |
| `frontend/templates/index.html` | Oggi | Fix redirect URLs |
| `README.md` | Oggi | Documentazione completa |

## Blocchi e Dipendenze

### Bloccante
- ⚠️ **Connessione Database**: Senza `.env` corretto, l'app non parte

### Non Bloccante
- Script seed.sql da eseguire manualmente
- Test end-to-end da completare
