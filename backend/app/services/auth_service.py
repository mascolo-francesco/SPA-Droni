"""
Servizio per la logica di business dell'autenticazione.

NOTA: Questo file contiene funzioni legacy che NON sono attualmente
utilizzate dall'applicazione. La logica di autenticazione è implementata
direttamente nelle route (backend/app/routes/auth.py).

Funzioni fornite (non utilizzate):
- login(): Verifica credenziali utente
- register(): Registra nuovo utente con hash password

Questo servizio era probabilmente parte di un refactoring iniziale
per separare business logic dalle route, ma la logica è stata poi
mantenuta direttamente nelle route per semplicità.

Potenziale utilizzo futuro:
Se si volesse centralizzare la logica auth (ad es. per riutilizzarla
in test o altre parti dell'app), queste funzioni potrebbero essere
riattivate e chiamate dalle route invece di duplicare il codice.
"""
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import Utente
from app.extensions import db

def login(email, password):
    """
    Effettua il login di un utente.
    
    Args:
        email: Email dell'utente
        password: Password in chiaro
        
    Returns:
        Utente se credenziali valide, None altrimenti
    """
    utente = Utente.query.filter_by(email=email).first()
    if utente and check_password_hash(utente.password_hash, password):
        return utente
    return None

def register(nome, email, password, ruolo='cliente'):
    """
    Registra un nuovo utente.
    
    Args:
        nome: Nome dell'utente
        email: Email dell'utente
        password: Password in chiaro
        ruolo: Ruolo dell'utente (default: 'cliente')
        
    Returns:
        Utente creato se successo, None se email già esistente
    """
    # Verifica se l'email è già registrata
    if Utente.query.filter_by(email=email).first():
        return None
    
    # Crea il nuovo utente
    utente = Utente(
        nome=nome,
        email=email,
        password_hash=generate_password_hash(password),
        ruolo=ruolo
    )
    
    db.session.add(utente)
    db.session.commit()
    
    return utente
