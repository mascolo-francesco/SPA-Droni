from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Drone, Missione
from app.utils.decorators import login_required, admin_required

droni_bp = Blueprint('droni', __name__)


@droni_bp.route('', methods=['GET'])
@login_required
def get_droni():
    """Lista tutti i droni"""
    droni = Drone.query.all()
    items = [d.to_dict() for d in droni]
    return jsonify({
        'items': items,
        'total': len(items)
    })


@droni_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_drone(id):
    """Dettaglio singolo drone"""
    drone = Drone.query.get_or_404(id)
    return jsonify(drone.to_dict())


@droni_bp.route('', methods=['POST'])
@admin_required
def create_drone():
    """Crea nuovo drone (solo admin)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    drone = Drone(
        Modello=data.get('modello'),
        Capacita=data.get('capacita'),
        Batteria=data.get('batteria', 100)
    )
    
    db.session.add(drone)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'drone': drone.to_dict()
    }), 201


@droni_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_drone(id):
    """Modifica drone (solo admin)"""
    drone = Drone.query.get_or_404(id)
    data = request.get_json()
    
    if data.get('modello'):
        drone.Modello = data['modello']
    if data.get('capacita') is not None:
        drone.Capacita = data['capacita']
    if data.get('batteria') is not None:
        drone.Batteria = data['batteria']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'drone': drone.to_dict()
    })


@droni_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_drone(id):
    """Elimina drone (solo admin)"""
    drone = Drone.query.get_or_404(id)
    
    # Verifica che non ci siano missioni attive
    missioni_attive = Missione.query.filter(
        Missione.IdDrone == id,
        Missione.Stato.in_(['programmata', 'in_corso'])
    ).first()
    
    if missioni_attive:
        return jsonify({'error': 'Impossibile eliminare: drone con missioni attive'}), 400
    
    db.session.delete(drone)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Drone eliminato'
    })


@droni_bp.route('/disponibili', methods=['GET'])
@admin_required
def get_disponibili():
    """Lista droni disponibili per nuove missioni"""
    # Droni non impegnati in missioni in corso
    droni_occupati = db.session.query(Missione.IdDrone).filter(
        Missione.Stato.in_(['programmata', 'in_corso'])
    ).subquery()
    
    droni = Drone.query.filter(
        ~Drone.ID.in_(droni_occupati),
        Drone.Batteria >= 20  # Batteria minima 20%
    ).all()
    
    return jsonify({
        'droni': [d.to_dict() for d in droni]
    })


@droni_bp.route('/<int:id>/batteria', methods=['PATCH'])
@login_required
def update_batteria(id):
    """Aggiorna livello batteria drone"""
    drone = Drone.query.get_or_404(id)
    data = request.get_json()
    
    batteria = data.get('batteria')
    
    if batteria is None or not (0 <= batteria <= 100):
        return jsonify({'error': 'Batteria deve essere tra 0 e 100'}), 400
    
    drone.Batteria = batteria
    db.session.commit()
    
    return jsonify({
        'success': True,
        'drone': drone.to_dict()
    })


@droni_bp.route('/<int:id>/missioni', methods=['GET'])
@admin_required
def get_drone_missioni(id):
    """Storico missioni di un drone"""
    drone = Drone.query.get_or_404(id)
    
    missioni = Missione.query.filter_by(IdDrone=id).order_by(
        Missione.DataMissione.desc()
    ).all()
    
    return jsonify({
        'drone': drone.to_dict(),
        'missioni': [m.to_dict() for m in missioni]
    })
