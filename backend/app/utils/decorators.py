from functools import wraps
from flask import session, jsonify

def login_required(f):
    """Verifica che l'utente sia autenticato"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Autenticazione richiesta'}), 401
        return f(*args, **kwargs)
    return decorated_function

def role_required(*roles):
    """Verifica che l'utente abbia uno dei ruoli specificati"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Autenticazione richiesta'}), 401
            if session.get('ruolo') not in roles:
                return jsonify({'error': 'Accesso negato'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    """Shortcut per role_required('admin')"""
    return role_required('admin')(f)

def pilota_required(f):
    """Shortcut per role_required('pilota', 'admin')"""
    return role_required('pilota', 'admin')(f)
