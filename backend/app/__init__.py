import os
from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS
from .config import Config
from .extensions import db

load_dotenv()
def create_app(config_class=Config):
    """Application factory per Flask"""
    
    # Configura i path per frontend templates e static
    template_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'templates'))
    static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'static'))
    
    app = Flask(
        __name__,
        template_folder=template_folder,
        static_folder=static_folder,
        static_url_path='/static'
    )
    
    # Carica configurazione
    app.config.from_object(config_class)
    
    # Inizializza estensioni
    db.init_app(app)
    
    # Abilita CORS per tutte le API routes
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Configurazione sessioni sicure
    app.config['SESSION_COOKIE_SECURE'] = not app.config['DEBUG']
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Registra blueprints
    from .routes import register_blueprints
    register_blueprints(app)
    
    # Route per servire il frontend SPA
    @app.route('/')
    def index():
        return send_from_directory(template_folder, 'index.html')
    
    @app.route('/cliente')
    def cliente():
        return send_from_directory(template_folder, 'cliente.html')
    
    @app.route('/admin')
    def admin():
        return send_from_directory(template_folder, 'admin.html')
    
    # Route fallback per SPA routing
    @app.route('/<path:path>')
    def catch_all(path):
        # Se è un file statico, servilo
        static_file_path = os.path.join(static_folder, path)
        if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
            return send_from_directory(static_folder, path)
        
        # Route SPA specifiche
        if path.startswith('cliente'):
            return send_from_directory(template_folder, 'cliente.html')
        if path.startswith('admin'):
            return send_from_directory(template_folder, 'admin.html')
        
        # Altrimenti ritorna index.html per gestione routing SPA
        return send_from_directory(template_folder, 'index.html')
    
    return app
