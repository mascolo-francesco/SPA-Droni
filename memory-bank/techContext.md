# Tech Context - DroneDelivery SPA

## Stack Tecnologico

### Backend

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| Python | 3.10+ | Runtime |
| Flask | 3.0.0 | Framework web |
| Flask-SQLAlchemy | 3.1.1 | ORM database |
| Flask-CORS | 4.0.0 | Cross-Origin support |
| PyMySQL | 1.1.0 | Driver MySQL |
| python-dotenv | 1.0.0 | Environment variables |

### Frontend

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| HTML5 | - | Struttura |
| CSS3 | - | Design system custom |
| JavaScript | ES6+ | Logica applicativa |
| Leaflet.js | 1.9.4 | Mappe interattive |
| Lucide Icons | CDN | Iconografia |

### Database

| Servizio | Dettagli |
|----------|----------|
| Provider | Aiven (MySQL Cloud) |
| Versione | MySQL 8.x |
| SSL | Richiesto (ca.pem) |

### Fonts

- **DM Sans**: Headings (400, 500, 600, 700)
- **Inter**: Body text (400, 500, 600)
- **Source**: Google Fonts CDN

## Setup Ambiente di Sviluppo

### Prerequisiti
```bash
# macOS
brew install python@3.10
# oppure pyenv per gestione versioni
```

### Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Variabili d'Ambiente

File `.env` nella root del progetto:

```env
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/DATABASE
SECRET_KEY=your-secret-key-here
```

**IMPORTANTE per Aiven**:
- Formato: `mysql+pymysql://avnadmin:PASSWORD@HOST:PORT/defaultdb`
- Se SSL richiesto: aggiungere `?ssl_ca=/path/to/ca.pem`

## Vincoli Tecnici

### Architettura
- **Monolitico**: Un unico server Flask serve sia API che frontend
- **Factory Pattern**: `create_app()` per configurazione modulare
- **Blueprints**: Route organizzate per dominio (auth, ordini, droni, etc.)

### Frontend
- **NO Framework JS**: Proibito React, Vue, Angular, Svelte
- **NO Bootstrap**: CSS completamente custom
- **Moduli Globali**: Ogni file JS espone oggetti su `window.*`
- **Hash Routing**: Navigazione tramite `#section`

### Database
- **ORM Only**: Nessuna query SQL raw nel codice Python
- **Relazioni**: Definite con `db.relationship()` e `back_populates`
- **Serializzazione**: Metodo `to_dict()` su ogni modello

### Design
- **NO Gradienti**: Solo colori flat
- **NO Emoji**: Solo icone Lucide
- **Dark Theme**: Obbligatorio
- **Mobile-First**: Breakpoint standard (sm, md, lg, xl)

## Dipendenze Esterne

### CDN
```html
<!-- Leaflet -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest"></script>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

## Porte e Endpoint

| Servizio | URL |
|----------|-----|
| Flask Server | `http://localhost:5000` |
| Landing Page | `/` |
| SPA Cliente | `/cliente` |
| SPA Admin | `/admin` |
| API Base | `/api/*` |

## Comandi Utili

```bash
# Avvio server development
cd backend && python run.py

# Test database connection
python -c "from app import create_app; app = create_app(); print('OK')"

# Freeze requirements
pip freeze > requirements.txt
```
