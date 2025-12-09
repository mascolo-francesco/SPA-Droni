# System Patterns - DroneDelivery SPA

## Architettura Generale

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   SPA Cliente   │  │   SPA Admin     │                   │
│  │   cliente.html  │  │   admin.html    │                   │
│  │   + JS modules  │  │   + JS modules  │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                             │
│           │    fetch('/api/*') │                             │
│           └────────┬───────────┘                             │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────────┐
│                    │   FLASK SERVER (localhost:5000)        │
│  ┌─────────────────┴─────────────────┐                      │
│  │           ROUTES                   │                      │
│  │  /           → index.html          │                      │
│  │  /cliente    → cliente.html        │                      │
│  │  /admin      → admin.html          │                      │
│  │  /api/*      → JSON responses      │                      │
│  └─────────────────┬─────────────────┘                      │
│                    │                                         │
│  ┌─────────────────┴─────────────────┐                      │
│  │         BLUEPRINTS                 │                      │
│  │  auth, ordini, missioni, droni,   │                      │
│  │  piloti, prodotti, tracce, stats  │                      │
│  └─────────────────┬─────────────────┘                      │
│                    │                                         │
│  ┌─────────────────┴─────────────────┐                      │
│  │         SQLALCHEMY ORM            │                      │
│  │         (Flask-SQLAlchemy)        │                      │
│  └─────────────────┬─────────────────┘                      │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────────┐
│                    │   MYSQL (Aiven Cloud)                  │
│  ┌─────────────────┴─────────────────┐                      │
│  │  Tabelle: Utente, Pilota, Drone,  │                      │
│  │  Prodotto, Ordine, Missione,      │                      │
│  │  Contiene, Traccia                │                      │
│  └───────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Pattern Backend

### Application Factory Pattern

```python
# backend/app/__init__.py
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    register_blueprints(app)
    return app
```

**Vantaggi**:
- Configurazione modulare per test/prod
- Inizializzazione lazy delle estensioni
- Facilita testing con app context isolati

### Blueprint Pattern

```python
# backend/app/routes/__init__.py
def register_blueprints(app):
    from .auth import auth_bp
    from .ordini import ordini_bp
    # ...
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(ordini_bp, url_prefix='/api/ordini')
```

**Struttura Blueprint**:
```
routes/
├── __init__.py      # register_blueprints()
├── auth.py          # /api/auth/*
├── ordini.py        # /api/ordini/*
├── missioni.py      # /api/missioni/*
├── droni.py         # /api/droni/*
├── piloti.py        # /api/piloti/*
├── prodotti.py      # /api/prodotti/*
├── tracce.py        # /api/tracce/*
└── statistiche.py   # /api/statistiche/*
```

### Model Serialization Pattern

```python
class Drone(db.Model):
    # ... campi ...
    
    def to_dict(self):
        return {
            'id': self.ID,
            'modello': self.Modello,
            'capacita': float(self.Capacita),
            'batteria': self.Batteria
        }
```

**Uso**:
```python
@ordini_bp.route('/', methods=['GET'])
def get_ordini():
    ordini = Ordine.query.all()
    return jsonify([o.to_dict() for o in ordini])
```

## Pattern Frontend

### Module Pattern (Global Namespace)

```javascript
// frontend/static/js/cliente/api.js
window.ClienteAPI = {
    baseUrl: '/api',
    
    async getOrdini() {
        const res = await fetch(`${this.baseUrl}/ordini`);
        return res.json();
    }
};
```

**Motivazione**: Senza bundler (Webpack/Vite), i moduli comunicano tramite `window.*`

### Hash-Based SPA Routing

```javascript
// frontend/static/js/cliente/app.js
window.ClienteApp = {
    routes: {
        'ordini': ClienteOrdini.render,
        'tracking': ClienteTracking.render,
        'nuovo-ordine': NuovoOrdine.render
    },
    
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },
    
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'ordini';
        const handler = this.routes[hash];
        if (handler) handler();
    }
};
```

### Component Pattern

```javascript
// Render HTML dinamico
window.ClienteOrdini = {
    async render() {
        const ordini = await ClienteAPI.getOrdini();
        document.getElementById('main-content').innerHTML = `
            <div class="ordini-list">
                ${ordini.map(o => this.renderCard(o)).join('')}
            </div>
        `;
    },
    
    renderCard(ordine) {
        return `
            <div class="card ordine-card" data-id="${ordine.id}">
                <h3>#${ordine.id}</h3>
                <span class="badge badge-${ordine.stato}">${ordine.stato}</span>
            </div>
        `;
    }
};
```

### Polling Pattern (Real-time Updates)

```javascript
// Tracking con polling
window.ClienteTracking = {
    pollInterval: null,
    
    startPolling(missioneId) {
        this.pollInterval = setInterval(async () => {
            const tracce = await ClienteAPI.getTracce(missioneId);
            this.updateMap(tracce);
        }, 5000); // ogni 5 secondi
    },
    
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
};
```

## Pattern Database

### Schema Relazionale

```
Utente (1) ─────────── (*) Ordine
Ordine (*) ─────────── (1) Missione
Missione (*) ────────── (1) Drone
Missione (*) ────────── (1) Pilota
Ordine (*) ─────────── (*) Prodotto  [via Contiene]
Missione (1) ────────── (*) Traccia
```

### Convenzioni Naming

| Entità | Tabella | Modello Python |
|--------|---------|----------------|
| Utente | `Utente` | `Utente` |
| Drone | `Drone` | `Drone` |
| Pilota | `Pilota` | `Pilota` |
| Ordine | `Ordine` | `Ordine` |
| Missione | `Missione` | `Missione` |
| Prodotto | `Prodotto` | `Prodotto` |
| Contiene | `Contiene` | `Contiene` |
| Traccia | `Traccia` | `Traccia` |

## Pattern CSS

### Design Tokens (CSS Variables)

```css
/* frontend/static/css/variables.css */
:root {
    --color-primary: #0A84FF;
    --color-success: #30D158;
    --color-warning: #FF9F0A;
    --color-danger: #FF453A;
    --color-bg: #1C1C1E;
    --color-bg-elevated: #2C2C2E;
    --spacing-unit: 8px;
    --radius-md: 8px;
}
```

### BEM-Like Naming

```css
.ordine-card { }
.ordine-card__header { }
.ordine-card__body { }
.ordine-card--highlighted { }
```

### Utility Classes

```css
.text-center { text-align: center; }
.mt-4 { margin-top: calc(var(--spacing-unit) * 4); }
.hidden { display: none; }
```
