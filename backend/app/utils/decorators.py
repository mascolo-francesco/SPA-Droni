"""
Decoratori di autorizzazione per route Flask.

Fornisce decoratori per proteggere endpoint API richiedendo autenticazione
e/o specifici ruoli utente. Implementa un sistema di controllo accessi
basato su ruoli (RBAC - Role-Based Access Control).

Decoratori disponibili:
- @login_required: Richiede solo autenticazione (qualsiasi utente loggato)
- @role_required(*roles): Richiede autenticazione E uno dei ruoli specificati
- @admin_required: Shortcut per @role_required('admin')
- @pilota_required: Shortcut per @role_required('pilota', 'admin')

Uso tipico:
    @app.route('/api/sensitive')
    @admin_required
    def sensitive_endpoint():
        return {'data': 'only for admins'}

I decoratori verificano la presenza di 'user_id' e 'ruolo' nella
sessione Flask server-side, ritornando 401 (non autenticato) o
403 (non autorizzato) se i controlli falliscono.
"""

# Import per preservare metadata delle funzioni decorate
from functools import wraps
# Import componenti Flask per gestione sessioni e response JSON
from flask import session, jsonify

def login_required(f):
    """
    Decoratore che richiede autenticazione per accedere alla route.
    
    Verifica la presenza di 'user_id' nella sessione Flask.
    Se non presente, ritorna 401 Unauthorized.
    
    Questo decoratore deve essere applicato a tutte le route che
    richiedono un utente autenticato, indipendentemente dal ruolo.
    
    Args:
        f: Funzione view da decorare
        
    Returns:
        function: Funzione decorata con controllo autenticazione
        
    Example:
        @app.route('/api/profile')
        @login_required
        def get_profile():
            # Solo utenti autenticati possono accedere
            return {'name': session['nome']}
    """
    @wraps(f)  # Preserva nome e docstring della funzione originale
    def decorated_function(*args, **kwargs):
        # Verifica presenza chiave 'user_id' in sessione
        if 'user_id' not in session:
            # Utente non autenticato - ritorna errore 401
            return jsonify({'error': 'Autenticazione richiesta'}), 401
        # Utente autenticato - prosegui con la route
        return f(*args, **kwargs)
    return decorated_function

def role_required(*roles):
    """
    Decoratore factory che richiede autenticazione E uno dei ruoli specificati.
    
    Crea un decoratore personalizzato che verifica se l'utente ha uno dei
    ruoli passati come argomenti. Utile per endpoint con accesso ristretto.
    
    Args:
        *roles: Tuple di ruoli permessi (es: 'admin', 'pilota', 'cliente')
        
    Returns:
        function: Decoratore che verifica autenticazione e ruolo
        
    Example:
        @app.route('/api/reports')
        @role_required('admin', 'pilota')
        def get_reports():
            # Solo admin e piloti possono accedere
            return {'reports': [...]}
    """
    def decorator(f):
        """Decoratore interno che riceve la funzione da decorare."""
        @wraps(f)  # Preserva metadata funzione originale
        def decorated_function(*args, **kwargs):
            # Prima verifica: utente autenticato?
            if 'user_id' not in session:
                # Non autenticato - ritorna 401
                return jsonify({'error': 'Autenticazione richiesta'}), 401
            
            # Seconda verifica: ruolo corretto?
            # Ottiene il ruolo dalla sessione e verifica se è nella lista permessa
            if session.get('ruolo') not in roles:
                # Autenticato ma ruolo non autorizzato - ritorna 403
                return jsonify({'error': 'Accesso negato'}), 403
            
            # Tutte le verifiche passate - esegui la route
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    """
    Decoratore shortcut che richiede autenticazione E ruolo 'admin'.
    
    Equivalente a @role_required('admin') ma più leggibile.
    Usare per endpoint che solo gli amministratori possono accedere.
    
    Args:
        f: Funzione view da decorare
        
    Returns:
        function: Funzione decorata con controllo admin
        
    Example:
        @app.route('/api/admin/users')
        @admin_required
        def manage_users():
            # Solo admin possono gestire utenti
            return {'users': [...]}
    """
    # Applica role_required('admin') alla funzione
    return role_required('admin')(f)

def pilota_required(f):
    """
    Decoratore shortcut che richiede autenticazione E ruolo 'pilota' o 'admin'.
    
    Permette accesso sia ai piloti che agli admin (che hanno accesso a tutto).
    Usare per endpoint di gestione operativa missioni che piloti devono accedere.
    
    Args:
        f: Funzione view da decorare
        
    Returns:
        function: Funzione decorata con controllo pilota/admin
        
    Example:
        @app.route('/api/missioni/<id>/stato', methods=['PATCH'])
        @pilota_required
        def update_mission_status(id):
            # Piloti e admin possono aggiornare stato missioni
            return {'status': 'updated'}
    """
    # Applica role_required permettendo sia 'pilota' che 'admin'
    return role_required('pilota', 'admin')(f)
