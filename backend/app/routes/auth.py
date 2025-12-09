from flask import Blueprint, request, jsonify, session
from app.extensions import db
from app.models import Utente

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login utente con email e password"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email e password richiesti'}), 400
    
    utente = Utente.query.filter_by(Mail=email).first()
    
    if not utente or not utente.check_password(password):
        return jsonify({'error': 'Credenziali non valide'}), 401
    
    # Salva dati in sessione
    session['user_id'] = utente.ID
    session['nome'] = utente.Nome
    session['ruolo'] = utente.Ruolo
    session.permanent = True
    
    return jsonify({
        'success': True,
        'user': utente.to_dict()
    })


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout utente"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logout effettuato'})


@auth_bp.route('/register', methods=['POST'])
def register():
    """Registra nuovo utente (cliente)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    nome = data.get('nome')
    email = data.get('email')
    password = data.get('password')
    
    if not nome or not email or not password:
        return jsonify({'error': 'Nome, email e password richiesti'}), 400
    
    # Verifica email non già registrata
    if Utente.query.filter_by(Mail=email).first():
        return jsonify({'error': 'Email già registrata'}), 400
    
    # Crea nuovo utente
    utente = Utente(
        Nome=nome,
        Mail=email,
        Ruolo='cliente'
    )
    utente.set_password(password)
    
    db.session.add(utente)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Registrazione completata',
        'user': utente.to_dict()
    }), 201


@auth_bp.route('/me', methods=['GET'])
def me():
    """Ritorna info utente corrente"""
    if 'user_id' not in session:
        return jsonify({'error': 'Non autenticato'}), 401
    
    utente = Utente.query.get(session['user_id'])
    
    if not utente:
        session.clear()
        return jsonify({'error': 'Utente non trovato'}), 404
    
    return jsonify({
        'user': utente.to_dict()
    })


@auth_bp.route('/check', methods=['GET'])
def check():
    """Verifica se utente è autenticato"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user_id': session['user_id'],
            'nome': session.get('nome'),
            'ruolo': session.get('ruolo')
        })
    return jsonify({'authenticated': False})
