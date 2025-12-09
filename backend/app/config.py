import os
from dotenv import load_dotenv

# Carica variabili d'ambiente dal file .env
basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
load_dotenv(os.path.join(basedir, '.env'))


class Config:
    """Configurazione base dell'applicazione"""
    
    # Secret key per sessioni e sicurezza
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Configurazione database MySQL
    # Formato: mysql+pymysql://user:password@host:port/database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:password@localhost:3306/Droni'
    
    # Disabilita tracking modifiche per performance
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurazione pool connessioni database
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'pool_size': 10,
        'max_overflow': 20
    }
    
    # Debug mode
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
    
    # JSON configuration
    JSON_AS_ASCII = False
    JSON_SORT_KEYS = False
