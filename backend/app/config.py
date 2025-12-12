"""
Modulo di configurazione dell'applicazione Flask.

Definisce la classe Config che contiene tutte le impostazioni di configurazione
dell'applicazione, caricando valori da variabili d'ambiente quando disponibili,
altrimenti utilizzando valori di default per sviluppo.

Configurazioni principali:
- SECRET_KEY: Chiave segreta per sessioni e firma cookie
- DATABASE_URL: Stringa connessione MySQL via SQLAlchemy
- Pool connessioni database: Ottimizzazioni per gestione connessioni
- Debug mode: Abilita/disabilita modalità sviluppo
- JSON settings: Configurazione serializzazione JSON
"""

# Import moduli standard Python
import os
# Import dotenv per caricare variabili d'ambiente da file .env
from dotenv import load_dotenv

# Determina la directory base del progetto (2 livelli sopra questo file)
# __file__ = backend/app/config.py
# basedir = root del progetto
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Carica variabili d'ambiente dal file .env nella root del progetto
# Questo permette di configurare l'app senza modificare il codice
load_dotenv(os.path.join(basedir, '.env'))


class Config:
    """
    Classe di configurazione per l'applicazione Flask.
    
    Tutte le configurazioni sono centralizzate qui e vengono caricate
    dall'applicazione tramite app.config.from_object(Config).
    
    Segue il pattern di configurazione tramite variabili d'ambiente
    con fallback a valori di default per sviluppo.
    """
    
    # ========== SICUREZZA ==========
    
    # Chiave segreta per firmare session cookies e token CSRF
    # IMPORTANTE: In produzione DEVE essere impostata tramite variabile d'ambiente
    # La chiave di default serve SOLO per sviluppo locale
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # ========== DATABASE ==========
    
    # URI di connessione al database MySQL usando PyMySQL driver
    # Formato: mysql+pymysql://username:password@host:port/database_name
    # Esempio: mysql+pymysql://root:mypass@localhost:3306/Droni
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:password@localhost:3306/Droni'
    
    # Disabilita il tracking automatico delle modifiche agli oggetti
    # Migliora le performance disabilitando una feature non necessaria
    # che consuma memoria per tracciare ogni modifica agli oggetti ORM
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Opzioni del connection pool SQLAlchemy per gestione efficiente connessioni
    SQLALCHEMY_ENGINE_OPTIONS = {
        # Ricicla connessioni dopo 300 secondi (5 min) per evitare timeout MySQL
        'pool_recycle': 300,
        # Verifica connessioni prima dell'uso (ping al DB) per rilevare connessioni morte
        'pool_pre_ping': True,
        # Numero base di connessioni mantenute aperte nel pool
        'pool_size': 10,
        # Numero massimo di connessioni aggiuntive oltre pool_size
        'max_overflow': 20
    }
    
    # ========== APPLICAZIONE ==========
    
    # Modalità debug: abilita auto-reload, traceback dettagliati, etc.
    # In produzione impostare FLASK_DEBUG=False nella variabile d'ambiente
    # Accetta valori: 'true', '1', 'yes' (case-insensitive) per True
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
    
    # ========== JSON ==========
    
    # Non convertire caratteri non-ASCII in escape sequences (\uXXXX)
    # Permette output JSON con caratteri Unicode diretti (es: "città" invece di "citt\u00E0")
    JSON_AS_ASCII = False
    
    # Non ordinare alfabeticamente le chiavi nei JSON response
    # Mantiene l'ordine di inserimento per readability
    JSON_SORT_KEYS = False
