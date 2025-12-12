"""
Modulo factory per la creazione dell'applicazione Flask.

Implementa il pattern Application Factory che permette di creare
multiple istanze dell'app con configurazioni diverse (test, dev, prod).

Funzionalità principali:
- Configurazione Flask app con template e static folders custom
- Inizializzazione estensioni (SQLAlchemy, CORS)
- Registrazione blueprints per routing modulare
- Setup sessioni sicure con cookies
- Gestione routing SPA (Single Page Application)

Il pattern factory evita l'uso di variabili globali e permette
migliore testabilità e isolamento tra diverse istanze dell'app.
"""

# Import moduli standard
import os
# Import dotenv per gestione variabili d'ambiente
from dotenv import load_dotenv
# Import componenti core Flask
from flask import Flask, send_from_directory
# Import CORS per gestire Cross-Origin Resource Sharing
from flask_cors import CORS
# Import configurazione e estensioni locali
from .config import Config
from .extensions import db

# Carica variabili d'ambiente dal file .env
load_dotenv()

def create_app(config_class=Config):
    """
    Application Factory per creare e configurare l'applicazione Flask.
    
    Questo pattern permette di:
    - Creare multiple istanze dell'app con configurazioni diverse
    - Facilitare il testing con configurazioni dedicate
    - Evitare import circolari usando late initialization
    
    Args:
        config_class: Classe di configurazione (default: Config)
                     Può essere sostituita per test o ambienti diversi
    
    Returns:
        Flask: Istanza configurata dell'applicazione Flask
    """
    
    # ========== CONFIGURAZIONE PERCORSI ==========
    
    # Configura percorsi assoluti per template e file statici del frontend
    # Questo permette a Flask di servire la SPA frontend dalla cartella separata
    
    # Percorso assoluto alla cartella template HTML (frontend/templates)
    template_folder = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'templates')
    )
    
    # Percorso assoluto alla cartella file statici (frontend/static)
    static_folder = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'static')
    )
    
    # ========== CREAZIONE APP ==========
    
    # Crea istanza Flask con percorsi custom per frontend
    app = Flask(
        __name__,                        # Nome del modulo
        template_folder=template_folder,  # Path ai template HTML
        static_folder=static_folder,      # Path ai file statici (CSS, JS, immagini)
        static_url_path='/static'         # URL prefix per file statici
    )
    
    # ========== CARICAMENTO CONFIGURAZIONE ==========
    
    # Carica configurazione dalla classe Config
    # Questo popola app.config con tutti i valori definiti in config_class
    app.config.from_object(config_class)
    
    # ========== INIZIALIZZAZIONE ESTENSIONI ==========
    
    # Inizializza SQLAlchemy con questa istanza app
    # Questo configura db.session e rende disponibile l'ORM
    db.init_app(app)
    
    # ========== CONFIGURAZIONE CORS ==========
    
    # Abilita Cross-Origin Resource Sharing per le API
    # Permette al frontend (anche se servito da dominio diverso) di chiamare le API
    CORS(app, resources={
        r"/api/*": {                                    # Applica CORS solo a route /api/*
            "origins": "*",                             # Permetti tutti i domini (TODO: limitare in prod)
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Metodi HTTP permessi
            "allow_headers": ["Content-Type", "Authorization"]       # Header permessi
        }
    })
    
    # ========== CONFIGURAZIONE SESSIONI SICURE ==========
    
    # Cookie sicuri: inviati solo su HTTPS in produzione (quando DEBUG=False)
    app.config['SESSION_COOKIE_SECURE'] = not app.config['DEBUG']
    
    # HttpOnly: cookie non accessibile da JavaScript (previene XSS)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    
    # SameSite: protegge da CSRF limitando invio cookie cross-site
    # 'Lax' permette navigazione normale ma blocca richieste POST cross-site
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # ========== REGISTRAZIONE BLUEPRINTS ==========
    
    # Importa e registra tutti i blueprint API
    # I blueprint organizzano route correlate in moduli separati
    from .routes import register_blueprints
    register_blueprints(app)
    
    # ========== ROUTE SPA ==========
    
    # Route per servire i template HTML della Single Page Application
    
    @app.route('/')
    def index():
        """
        Route homepage - serve la landing page con login/registrazione.
        
        Returns:
            HTML: Template index.html
        """
        return send_from_directory(template_folder, 'index.html')
    
    @app.route('/cliente')
    def cliente():
        """
        Route area cliente - serve l'interfaccia cliente per ordini e tracking.
        
        Returns:
            HTML: Template cliente.html
        """
        return send_from_directory(template_folder, 'cliente.html')
    
    @app.route('/admin')
    def admin():
        """
        Route pannello admin - serve l'interfaccia amministrazione.
        
        Returns:
            HTML: Template admin.html
        """
        return send_from_directory(template_folder, 'admin.html')
    
    # ========== ROUTE FALLBACK SPA ==========
    
    @app.route('/<path:path>')
    def catch_all(path):
        """
        Route catch-all per gestire routing client-side della SPA.
        
        Questa route cattura tutte le richieste non gestite dalle route precedenti.
        Gestisce due scenari:
        1. Se il path corrisponde a un file statico esistente, lo serve
        2. Altrimenti serve il template HTML appropriato per il routing client-side
        
        Questo permette:
        - Refresh della pagina senza errore 404
        - Deep linking a route client-side
        - Condivisione URL con parametri
        
        Args:
            path (str): Percorso richiesto (es: 'cliente/ordini', 'admin/droni')
        
        Returns:
            HTML o File: File statico se esiste, altrimenti template HTML appropriato
        """
        # Costruisce path completo al file statico
        static_file_path = os.path.join(static_folder, path)
        
        # Se esiste un file statico con questo path, servilo
        # Questo gestisce CSS, JS, immagini, fonts, etc.
        if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
            return send_from_directory(static_folder, path)
        
        # Se il path inizia con 'cliente', serve il template cliente
        # Gestisce route come /cliente/ordini, /cliente/tracking, etc.
        if path.startswith('cliente'):
            return send_from_directory(template_folder, 'cliente.html')
        
        # Se il path inizia con 'admin', serve il template admin
        # Gestisce route come /admin/droni, /admin/missioni, etc.
        if path.startswith('admin'):
            return send_from_directory(template_folder, 'admin.html')
        
        # Per tutti gli altri path, serve index.html (fallback)
        # Il router JavaScript client-side gestirà il routing
        return send_from_directory(template_folder, 'index.html')
    
    # Ritorna l'istanza app configurata
    return app
