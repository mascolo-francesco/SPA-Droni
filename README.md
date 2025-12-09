# DroneDelivery SPA

Sistema di gestione consegne tramite droni con interfaccia web moderna.

## Panoramica

DroneDelivery è una Single Page Application (SPA) completa per la gestione di un servizio di consegne via drone. Il sistema include:

- **Area Cliente**: Creazione ordini, tracking in tempo reale, valutazione consegne
- **Pannello Admin**: Dashboard, gestione ordini/missioni/droni/piloti/prodotti

## Tech Stack

### Backend
- **Flask 3.0** - Framework web Python
- **Flask-SQLAlchemy** - ORM per database
- **Flask-CORS** - Cross-Origin Resource Sharing
- **PyMySQL** - Driver MySQL
- **MySQL** (Aiven) - Database cloud

### Frontend
- **Vanilla JavaScript** (ES6+) - Nessun framework
- **CSS Custom** - Design system proprietario (no Bootstrap)
- **Leaflet.js** - Mappe interattive per tracking
- **DM Sans + Inter** - Typography

## Struttura Progetto

```
SPA-Droni/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Factory Flask
│   │   ├── config.py            # Configurazione
│   │   ├── extensions.py        # SQLAlchemy init
│   │   ├── models/              # Modelli DB
│   │   │   ├── utente.py
│   │   │   ├── pilota.py
│   │   │   ├── drone.py
│   │   │   ├── prodotto.py
│   │   │   ├── ordine.py
│   │   │   ├── missione.py
│   │   │   ├── contiene.py
│   │   │   └── traccia.py
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── ordini.py
│   │   │   ├── missioni.py
│   │   │   ├── droni.py
│   │   │   ├── piloti.py
│   │   │   ├── prodotti.py
│   │   │   ├── tracce.py
│   │   │   └── statistiche.py
│   │   ├── services/            # Business logic
│   │   └── utils/               # Helper functions
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── templates/
│   │   ├── index.html           # Landing/Login
│   │   ├── cliente.html         # SPA Cliente
│   │   └── admin.html           # SPA Admin
│   └── static/
│       ├── css/
│       │   ├── variables.css    # Design tokens
│       │   ├── common.css       # Base styles
│       │   ├── mappa.css        # Map styling
│       │   ├── cliente.css      # Cliente styles
│       │   └── admin.css        # Admin styles
│       └── js/
│           ├── shared/          # Moduli condivisi
│           │   ├── utils.js
│           │   ├── auth.js
│           │   ├── router.js
│           │   └── components.js
│           ├── cliente/         # Moduli cliente
│           │   ├── api.js
│           │   ├── mappa.js
│           │   ├── ordini.js
│           │   ├── tracking.js
│           │   ├── valutazione.js
│           │   ├── nuovo-ordine.js
│           │   └── app.js
│           └── admin/           # Moduli admin
│               ├── api.js
│               ├── dashboard.js
│               ├── ordini.js
│               ├── missioni.js
│               ├── droni.js
│               ├── piloti.js
│               ├── prodotti.js
│               └── app.js
│
└── database/
    └── schema.sql               # Schema DB
```

## Setup

### 1. Prerequisiti

- Python 3.10+
- MySQL (o account Aiven)
- Git

### 2. Clone del repository

```bash
git clone https://github.com/mascolo-francesco/SPA-Droni.git
cd SPA-Droni
```

### 3. Setup ambiente Python

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# oppure: venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 4. Configurazione ambiente

Crea un file `.env` nella root del progetto:

```env
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/DATABASE
SECRET_KEY=your-secret-key-here
```

### 5. Avvio server

```bash
cd backend
python run.py
```

L'applicazione sarà disponibile su `http://localhost:5000`

## API Endpoints

### Autenticazione
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login utente |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/register` | Registrazione |
| GET | `/api/auth/me` | Utente corrente |
| GET | `/api/auth/check` | Verifica sessione |

### Ordini
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/ordini` | Lista ordini |
| POST | `/api/ordini` | Crea ordine |
| GET | `/api/ordini/:id` | Dettaglio ordine |
| PATCH | `/api/ordini/:id` | Aggiorna ordine |
| GET | `/api/ordini/:id/tracking` | Tracking ordine |

### Missioni
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/missioni` | Lista missioni |
| POST | `/api/missioni` | Crea missione |
| GET | `/api/missioni/:id` | Dettaglio missione |
| PATCH | `/api/missioni/:id` | Aggiorna missione |
| POST | `/api/missioni/:id/valutazione` | Valuta missione |

### Droni
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/droni` | Lista droni |
| POST | `/api/droni` | Aggiungi drone |
| GET | `/api/droni/:id` | Dettaglio drone |
| PATCH | `/api/droni/:id` | Aggiorna drone |
| DELETE | `/api/droni/:id` | Elimina drone |
| GET | `/api/droni/disponibili` | Droni disponibili |

### Piloti
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/piloti` | Lista piloti |
| POST | `/api/piloti` | Aggiungi pilota |
| GET | `/api/piloti/:id` | Dettaglio pilota |
| PATCH | `/api/piloti/:id` | Aggiorna pilota |
| DELETE | `/api/piloti/:id` | Elimina pilota |
| GET | `/api/piloti/disponibili` | Piloti disponibili |

### Prodotti
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/prodotti` | Lista prodotti |
| POST | `/api/prodotti` | Aggiungi prodotto |
| GET | `/api/prodotti/:id` | Dettaglio prodotto |
| PATCH | `/api/prodotti/:id` | Aggiorna prodotto |
| DELETE | `/api/prodotti/:id` | Elimina prodotto |
| GET | `/api/prodotti/categorie` | Lista categorie |
| GET | `/api/prodotti/search` | Ricerca prodotti |

### Statistiche (Admin)
| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/statistiche` | KPI dashboard |

## Design System

### Palette Colori (Dark Theme)

| Variabile | Valore | Uso |
|-----------|--------|-----|
| `--color-primary` | `#0A84FF` | Azioni principali, link |
| `--color-success` | `#30D158` | Conferme, stati positivi |
| `--color-warning` | `#FF9F0A` | Avvisi |
| `--color-danger` | `#FF453A` | Errori, eliminazioni |
| `--color-bg` | `#1C1C1E` | Background principale |
| `--color-bg-elevated` | `#2C2C2E` | Card, modal |
| `--color-text` | `#FFFFFF` | Testo principale |
| `--color-text-secondary` | `#8E8E93` | Testo secondario |

### Tipografia

- **Headings**: DM Sans (400, 500, 600, 700)
- **Body**: Inter (400, 500, 600)
- **Scala**: 1.25 modulare

## Ruoli Utente

| Ruolo | Accesso |
|-------|---------|
| `cliente` | Area cliente, ordini propri |
| `admin` | Pannello admin completo |
| `pilota` | (Futuro) App pilota |

## Licenza

MIT License