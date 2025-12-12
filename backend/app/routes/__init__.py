"""
Modulo per la registrazione dei Blueprint dell'applicazione.

I Blueprint sono componenti modulari di Flask che raggruppano route correlate.
Questo approccio permette di:
- Organizzare il codice in moduli logici e manutenibili
- Evitare file singoli con centinaia di route
- Riutilizzare blueprint in diverse applicazioni
- Testare moduli indipendentemente

Ogni blueprint gestisce un'area funzionale dell'applicazione:
- auth: Autenticazione e gestione sessioni (login, logout, register)
- ordini: Gestione ordini clienti (CRUD ordini, tracking)
- missioni: Gestione missioni droni (CRUD missioni, valutazioni)
- droni: Gestione flotta droni (CRUD droni, disponibilità)
- piloti: Gestione piloti (CRUD piloti, turni)
- prodotti: Catalogo prodotti (CRUD prodotti, ricerca)
- tracce: Tracciamento GPS (endpoint tracking real-time)
- statistiche: Dashboard e report (KPI, statistiche)

Tutti i blueprint sono registrati sotto il prefix '/api/' per mantenere
separazione tra API backend e routing frontend.
"""

# Import classe Blueprint da Flask
from flask import Blueprint

def register_blueprints(app):
    """
    Registra tutti i blueprint API nell'applicazione Flask.
    
    Questa funzione viene chiamata dalla factory create_app() durante
    l'inizializzazione dell'applicazione. Importa tutti i blueprint
    e li registra con i loro URL prefix.
    
    Gli import sono fatti all'interno della funzione (late import) per evitare
    import circolari, dato che i blueprint importano spesso modelli e utility
    che a loro volta potrebbero importare l'app.
    
    Args:
        app (Flask): Istanza dell'applicazione Flask dove registrare i blueprint
    
    Returns:
        None
    """
    # Import di tutti i blueprint dai rispettivi moduli
    # Ogni modulo esporta un blueprint con nome convenzionale *_bp
    from app.routes.auth import auth_bp                   # Blueprint autenticazione
    from app.routes.ordini import ordini_bp               # Blueprint ordini
    from app.routes.missioni import missioni_bp           # Blueprint missioni
    from app.routes.droni import droni_bp                 # Blueprint droni
    from app.routes.piloti import piloti_bp               # Blueprint piloti
    from app.routes.prodotti import prodotti_bp           # Blueprint prodotti
    from app.routes.tracce import tracce_bp               # Blueprint tracciamento GPS
    from app.routes.statistiche import statistiche_bp     # Blueprint statistiche
    
    # Registrazione blueprint con URL prefix
    # Tutte le route dei blueprint saranno sotto /api/*
    
    # /api/auth/* - Login, logout, register, verifica sessione
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # /api/ordini/* - CRUD ordini, tracking ordini specifici
    app.register_blueprint(ordini_bp, url_prefix='/api/ordini')
    
    # /api/missioni/* - CRUD missioni, assegnazione droni/piloti, valutazioni
    app.register_blueprint(missioni_bp, url_prefix='/api/missioni')
    
    # /api/droni/* - CRUD droni, disponibilità, storico missioni per drone
    app.register_blueprint(droni_bp, url_prefix='/api/droni')
    
    # /api/piloti/* - CRUD piloti, turni, disponibilità, performance
    app.register_blueprint(piloti_bp, url_prefix='/api/piloti')
    
    # /api/prodotti/* - CRUD prodotti, ricerca, filtri per categoria
    app.register_blueprint(prodotti_bp, url_prefix='/api/prodotti')
    
    # /api/tracce/* - Tracce GPS, posizioni real-time, storico percorsi
    app.register_blueprint(tracce_bp, url_prefix='/api/tracce')
    
    # /api/stats/* - Dashboard KPI, statistiche droni/piloti, report
    app.register_blueprint(statistiche_bp, url_prefix='/api/stats')
