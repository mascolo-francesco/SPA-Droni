# Importazione dei moduli necessari per gestire autenticazione e sessioni
from flask import Blueprint, request, jsonify, session
from app.extensions import db
from app.models import Utente

# Definizione del Blueprint per le route di autenticazione
# Questo raggruppa tutti gli endpoint relativi a login/logout/registrazione
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint per il login degli utenti.
    
    Riceve email e password in formato JSON, verifica le credenziali
    nel database e crea una sessione server-side se valide.
    
    Returns:
        200: Login riuscito con dati utente
        400: Dati mancanti o malformati
        401: Credenziali non valide
    """
    # Estrazione del payload JSON dalla richiesta
    data = request.get_json()
    
    # Validazione presenza dati
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    # Estrazione credenziali dal payload
    email = data.get('email')
    password = data.get('password')
    
    # Validazione presenza email e password
    if not email or not password:
        return jsonify({'error': 'Email e password richiesti'}), 400
    
    # Ricerca utente nel database tramite email
    utente = Utente.query.filter_by(Mail=email).first()
    
    # Verifica esistenza utente e correttezza password (hash bcrypt)
    if not utente or not utente.check_password(password):
        return jsonify({'error': 'Credenziali non valide'}), 401
    
    # Creazione sessione server-side con Flask session
    # Salva ID, nome e ruolo per gestire autorizzazioni
    session['user_id'] = utente.ID
    session['nome'] = utente.Nome
    session['ruolo'] = utente.Ruolo
    session.permanent = True  # Mantiene sessione anche dopo chiusura browser
    
    return jsonify({
        'success': True,
        'user': utente.to_dict()
    })


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Endpoint per il logout degli utenti.
    
    Distrugge completamente la sessione server-side,
    invalidando tutti i dati di autenticazione.
    
    Returns:
        200: Logout eseguito con successo
    """
    # Cancella tutti i dati dalla sessione Flask
    session.clear()
    return jsonify({'success': True, 'message': 'Logout effettuato'})


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Endpoint per la registrazione di nuovi utenti.
    
    Crea un nuovo account cliente (non admin/pilota) con hash della password.
    Verifica che l'email non sia già registrata prima di procedere.
    
    Returns:
        201: Registrazione completata con successo
        400: Dati mancanti o email già esistente
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    # Estrazione dati di registrazione
    nome = data.get('nome')
    email = data.get('email')
    password = data.get('password')
    
    # Validazione campi obbligatori
    if not nome or not email or not password:
        return jsonify({'error': 'Nome, email e password richiesti'}), 400
    
    # Verifica univocità email - controlla se già esistente nel DB
    if Utente.query.filter_by(Mail=email).first():
        return jsonify({'error': 'Email già registrata'}), 400
    
    # Creazione nuovo oggetto Utente
    # Il ruolo è hardcoded a 'cliente' per sicurezza
    # Admin e piloti vanno creati manualmente tramite script o pannello admin
    utente = Utente(
        Nome=nome,
        Mail=email,
        Ruolo='cliente'
    )
    # Hashing password con bcrypt tramite metodo del model
    utente.set_password(password)
    
    # Salvataggio nel database con transazione
    db.session.add(utente)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Registrazione completata',
        'user': utente.to_dict()
    }), 201


@auth_bp.route('/me', methods=['GET'])
def me():
    """
    Endpoint per ottenere i dati dell'utente autenticato.
    
    Legge user_id dalla sessione e restituisce i dati completi
    dell'utente dal database. Utile per aggiornare il profilo
    o verificare permessi lato client.
    
    Returns:
        200: Dati utente
        401: Non autenticato
        404: Utente non trovato (sessione invalida)
    """
    # Verifica presenza sessione attiva
    if 'user_id' not in session:
        return jsonify({'error': 'Non autenticato'}), 401
    
    # Recupera dati completi dal database
    utente = Utente.query.get(session['user_id'])
    
    # Gestione caso utente cancellato ma sessione ancora valida
    if not utente:
        session.clear()  # Invalida sessione
        return jsonify({'error': 'Utente non trovato'}), 404
    
    return jsonify({
        'user': utente.to_dict()  # Serializzazione tramite metodo del model
    })


@auth_bp.route('/check', methods=['GET'])
def check():
    """
    Endpoint leggero per verificare lo stato di autenticazione.
    
    Usato dal frontend all'avvio per controllare se esiste
    una sessione valida senza caricare tutti i dati utente.
    
    Returns:
        200: Stato autenticazione con dati base dalla sessione
    """
    # Verifica presenza chiave user_id in sessione
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user_id': session['user_id'],
            'nome': session.get('nome'),
            'ruolo': session.get('ruolo')  # Permette routing lato client
        })
    return jsonify({'authenticated': False})
