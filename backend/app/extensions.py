"""
Modulo per le estensioni Flask.

Centralizza l'inizializzazione delle estensioni Flask utilizzate nell'applicazione.
Questo pattern permette di evitare import circolari creando le istanze delle estensioni
qui e inizializzandole successivamente con l'app nel file __init__.py tramite init_app().
"""

# Importa la classe SQLAlchemy per l'ORM database
from flask_sqlalchemy import SQLAlchemy

# Inizializzazione dell'istanza SQLAlchemy
# Questa istanza sarà configurata successivamente con l'applicazione Flask
# usando il pattern db.init_app(app) nel file app/__init__.py
# SQLAlchemy fornisce:
# - ORM (Object-Relational Mapping) per mappare modelli Python a tabelle database
# - Session management per gestire transazioni database
# - Query builder per costruire query SQL in modo pythonic
db = SQLAlchemy()
