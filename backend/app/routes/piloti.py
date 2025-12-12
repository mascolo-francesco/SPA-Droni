"""
Blueprint per la gestione dei piloti.

Questo modulo fornisce tutti gli endpoint API per la gestione CRUD dei piloti
e operazioni correlate come:
- Lista piloti con filtro opzionale per turno
- Dettaglio singolo pilota con dati anagrafici
- Creazione/modifica/eliminazione piloti (solo admin)
- Verifica disponibilità piloti per nuove missioni  
- Storico missioni e statistiche performance per pilota

I piloti sono le risorse umane che controllano i droni durante le missioni.
Ogni pilota ha un turno assegnato e un brevetto che certifica le competenze.

Autorizzazioni:
- GET (list/detail): Richiede login (qualsiasi utente autenticato)
- POST/PUT/DELETE: Richiede ruolo admin
- Statistiche: Richiede ruolo admin

Tutti gli endpoint sono sotto il prefix '/api/piloti'.
"""
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Pilota, Missione
from app.utils.decorators import login_required, admin_required

piloti_bp = Blueprint('piloti', __name__)


@piloti_bp.route('', methods=['GET'])
@login_required
def get_piloti():
    """Lista tutti i piloti"""
    turno = request.args.get('turno')
    
    query = Pilota.query
    
    if turno:
        query = query.filter_by(Turno=turno)
    
    piloti = query.all()
    items = [p.to_dict() for p in piloti]
    return jsonify({
        'items': items,
        'total': len(items)
    })


@piloti_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_pilota(id):
    """Dettaglio singolo pilota"""
    pilota = Pilota.query.get_or_404(id)
    return jsonify(pilota.to_dict())


@piloti_bp.route('', methods=['POST'])
@admin_required
def create_pilota():
    """Crea nuovo pilota (solo admin)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    pilota = Pilota(
        Nome=data.get('nome'),
        Cognome=data.get('cognome'),
        Turno=data.get('turno'),
        Brevetto=data.get('brevetto')
    )
    
    db.session.add(pilota)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'pilota': pilota.to_dict()
    }), 201


@piloti_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_pilota(id):
    """Modifica pilota (solo admin)"""
    pilota = Pilota.query.get_or_404(id)
    data = request.get_json()
    
    if data.get('nome'):
        pilota.Nome = data['nome']
    if data.get('cognome'):
        pilota.Cognome = data['cognome']
    if data.get('turno'):
        pilota.Turno = data['turno']
    if data.get('brevetto'):
        pilota.Brevetto = data['brevetto']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'pilota': pilota.to_dict()
    })


@piloti_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_pilota(id):
    """Elimina pilota (solo admin)"""
    pilota = Pilota.query.get_or_404(id)
    
    # Verifica che non ci siano missioni attive
    missioni_attive = Missione.query.filter(
        Missione.IdPilota == id,
        Missione.Stato.in_(['programmata', 'in_corso'])
    ).first()
    
    if missioni_attive:
        return jsonify({'error': 'Impossibile eliminare: pilota con missioni attive'}), 400
    
    db.session.delete(pilota)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Pilota eliminato'
    })


@piloti_bp.route('/turno/<turno>', methods=['GET'])
@login_required
def get_by_turno(turno):
    """Lista piloti per turno specifico"""
    piloti = Pilota.query.filter_by(Turno=turno).all()
    return jsonify({
        'turno': turno,
        'piloti': [p.to_dict() for p in piloti]
    })


@piloti_bp.route('/disponibili', methods=['GET'])
@admin_required
def get_disponibili():
    """Lista piloti disponibili (non in missione attiva)"""
    turno = request.args.get('turno')
    
    # Piloti non impegnati in missioni in corso
    piloti_occupati = db.session.query(Missione.IdPilota).filter(
        Missione.Stato.in_(['programmata', 'in_corso'])
    ).subquery()
    
    query = Pilota.query.filter(~Pilota.ID.in_(piloti_occupati))
    
    if turno:
        query = query.filter_by(Turno=turno)
    
    piloti = query.all()
    
    return jsonify({
        'piloti': [p.to_dict() for p in piloti]
    })


@piloti_bp.route('/<int:id>/missioni', methods=['GET'])
@admin_required
def get_pilota_missioni(id):
    """Storico missioni di un pilota"""
    pilota = Pilota.query.get_or_404(id)
    
    missioni = Missione.query.filter_by(IdPilota=id).order_by(
        Missione.DataMissione.desc()
    ).all()
    
    # Calcola statistiche
    totale = len(missioni)
    completate = sum(1 for m in missioni if m.Stato == 'completata')
    valutazioni = [m.Valutazione for m in missioni if m.Valutazione is not None]
    media_valutazione = sum(valutazioni) / len(valutazioni) if valutazioni else None
    
    return jsonify({
        'pilota': pilota.to_dict(),
        'statistiche': {
            'totale_missioni': totale,
            'completate': completate,
            'media_valutazione': round(media_valutazione, 1) if media_valutazione else None
        },
        'missioni': [m.to_dict() for m in missioni]
    })
