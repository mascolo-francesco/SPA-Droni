from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Traccia, Missione
from app.utils.decorators import login_required, pilota_required

tracce_bp = Blueprint('tracce', __name__)


@tracce_bp.route('/missione/<int:missione_id>', methods=['GET'])
@login_required
def get_tracce_missione(missione_id):
    """Ottieni tutte le tracce di una missione"""
    missione = Missione.query.get_or_404(missione_id)
    
    tracce = Traccia.query.filter_by(
        ID_Missione=missione_id
    ).order_by(Traccia.TIMESTAMP.asc()).all()
    
    return jsonify({
        'missione_id': missione_id,
        'drone_id': missione.IdDrone,
        'tracce': [t.to_dict() for t in tracce]
    })


@tracce_bp.route('/missione/<int:missione_id>/latest', methods=['GET'])
@login_required
def get_latest_traccia(missione_id):
    """Ottieni ultima posizione drone per una missione"""
    missione = Missione.query.get_or_404(missione_id)
    
    traccia = Traccia.query.filter_by(
        ID_Missione=missione_id
    ).order_by(Traccia.TIMESTAMP.desc()).first()
    
    if not traccia:
        return jsonify({
            'missione_id': missione_id,
            'posizione': None,
            'messaggio': 'Nessuna traccia disponibile'
        })
    
    return jsonify({
        'missione_id': missione_id,
        'posizione': traccia.to_dict()
    })


@tracce_bp.route('/drone/<int:drone_id>', methods=['GET'])
@login_required
def get_tracce_drone(drone_id):
    """Ottieni tutte le tracce di un drone"""
    tracce = Traccia.query.filter_by(
        ID_Drone=drone_id
    ).order_by(Traccia.TIMESTAMP.desc()).limit(100).all()
    
    return jsonify({
        'drone_id': drone_id,
        'tracce': [t.to_dict() for t in tracce]
    })


@tracce_bp.route('', methods=['POST'])
@pilota_required
def add_traccia():
    """Aggiungi nuova traccia GPS"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    missione_id = data.get('missione_id')
    drone_id = data.get('drone_id')
    lat = data.get('lat')
    lng = data.get('lng')
    
    if not all([missione_id, lat, lng]):
        return jsonify({'error': 'missione_id, lat e lng richiesti'}), 400
    
    # Se drone_id non specificato, usa quello della missione
    if not drone_id:
        missione = Missione.query.get(missione_id)
        if missione:
            drone_id = missione.IdDrone
    
    if not drone_id:
        return jsonify({'error': 'drone_id richiesto'}), 400
    
    traccia = Traccia(
        ID_Drone=drone_id,
        ID_Missione=missione_id,
        Latitudine=lat,
        Longitudine=lng
    )
    
    db.session.add(traccia)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'traccia': traccia.to_dict()
    }), 201


@tracce_bp.route('/bulk', methods=['POST'])
@pilota_required
def add_tracce_bulk():
    """Aggiungi multiple tracce GPS in batch"""
    data = request.get_json()
    
    if not data or not data.get('tracce'):
        return jsonify({'error': 'Array tracce richiesto'}), 400
    
    tracce_inserite = []
    
    for t in data['tracce']:
        missione_id = t.get('missione_id')
        drone_id = t.get('drone_id')
        lat = t.get('lat')
        lng = t.get('lng')
        
        if not all([missione_id, lat, lng]):
            continue
        
        if not drone_id:
            missione = Missione.query.get(missione_id)
            if missione:
                drone_id = missione.IdDrone
        
        if drone_id:
            traccia = Traccia(
                ID_Drone=drone_id,
                ID_Missione=missione_id,
                Latitudine=lat,
                Longitudine=lng
            )
            db.session.add(traccia)
            tracce_inserite.append(traccia)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'inserite': len(tracce_inserite)
    }), 201
