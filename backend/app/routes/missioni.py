"""
Blueprint per la gestione delle missioni di consegna.

Le missioni sono l'elemento operativo centrale che coordina:
- Droni (risorsa tecnica)
- Piloti (risorsa umana) 
- Ordini (richieste clienti)
- Tracce GPS (tracking real-time)

Funzionalità fornite:
- CRUD missioni con assegnazione drone/pilota
- Filtri per stato e data
- Aggiornamento stato missione (piloti)
- Gestione valutazioni post-consegna (clienti)
- Visualizzazione e aggiunta tracce GPS
- Storico completo percorso missione

Stati missione: programmata, in_corso, completata, annullata

Autorizzazioni:
- Lista/dettaglio: Login richiesto
- Creazione/modifica: Solo admin
- Aggiornamento stato: Piloti e admin
- Valutazione: Clienti (solo missioni completate)
- Tracce GPS: Piloti per inserimento

Tutti gli endpoint sono sotto il prefix '/api/missioni'.
"""
from flask import Blueprint, request, jsonify, session
from app.extensions import db
from app.models import Missione, Drone, Pilota, Traccia
from app.utils.decorators import login_required, admin_required, pilota_required

missioni_bp = Blueprint('missioni', __name__)


@missioni_bp.route('', methods=['GET'])
@login_required
def get_missioni():
    """Lista missioni"""
    stato = request.args.get('stato')
    data = request.args.get('data')
    
    query = Missione.query
    
    if stato:
        query = query.filter_by(Stato=stato)
    if data:
        query = query.filter_by(DataMissione=data)
    
    missioni = query.order_by(Missione.DataMissione.desc(), Missione.Ora.desc()).all()
    
    items = [m.to_dict() for m in missioni]
    return jsonify({
        'items': items,
        'total': len(items)
    })


@missioni_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_missione(id):
    """Dettaglio missione"""
    missione = Missione.query.get_or_404(id)
    
    result = missione.to_dict()
    
    # Aggiungi tracce
    tracce = Traccia.query.filter_by(ID_Missione=id).order_by(Traccia.TIMESTAMP.asc()).all()
    result['tracce'] = [{
        'lat': float(t.Latitudine),
        'lng': float(t.Longitudine),
        'timestamp': t.TIMESTAMP.isoformat() if t.TIMESTAMP else None
    } for t in tracce]
    
    return jsonify(result)


@missioni_bp.route('', methods=['POST'])
@admin_required
def create_missione():
    """Crea nuova missione (solo admin)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    missione = Missione(
        DataMissione=data.get('data'),
        Ora=data.get('ora'),
        LatPrelievo=data.get('lat_prelievo'),
        LongPrelievo=data.get('long_prelievo'),
        LatConsegna=data.get('lat_consegna'),
        LongConsegna=data.get('long_consegna'),
        IdDrone=data.get('id_drone'),
        IdPilota=data.get('id_pilota'),
        Stato=data.get('stato', 'programmata')
    )
    
    db.session.add(missione)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'missione': missione.to_dict()
    }), 201


@missioni_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_missione(id):
    """Modifica missione (solo admin)"""
    missione = Missione.query.get_or_404(id)
    data = request.get_json()
    
    if data.get('data'):
        missione.DataMissione = data['data']
    if data.get('ora'):
        missione.Ora = data['ora']
    if data.get('lat_prelievo'):
        missione.LatPrelievo = data['lat_prelievo']
    if data.get('long_prelievo'):
        missione.LongPrelievo = data['long_prelievo']
    if data.get('lat_consegna'):
        missione.LatConsegna = data['lat_consegna']
    if data.get('long_consegna'):
        missione.LongConsegna = data['long_consegna']
    if data.get('id_drone'):
        missione.IdDrone = data['id_drone']
    if data.get('id_pilota'):
        missione.IdPilota = data['id_pilota']
    if data.get('stato'):
        missione.Stato = data['stato']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'missione': missione.to_dict()
    })


@missioni_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_missione(id):
    """Elimina missione (solo admin)"""
    missione = Missione.query.get_or_404(id)
    
    # Elimina tracce associate
    Traccia.query.filter_by(ID_Missione=id).delete()
    
    db.session.delete(missione)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Missione eliminata'
    })


@missioni_bp.route('/<int:id>/stato', methods=['PATCH'])
@pilota_required
def update_stato(id):
    """Aggiorna stato missione (pilota o admin)"""
    missione = Missione.query.get_or_404(id)
    data = request.get_json()
    
    nuovo_stato = data.get('stato')
    stati_validi = ['programmata', 'in_corso', 'completata', 'annullata']
    
    if nuovo_stato not in stati_validi:
        return jsonify({'error': f'Stato non valido. Valori ammessi: {stati_validi}'}), 400
    
    missione.Stato = nuovo_stato
    db.session.commit()
    
    return jsonify({
        'success': True,
        'missione': missione.to_dict()
    })


@missioni_bp.route('/<int:id>/valutazione', methods=['POST'])
@login_required
def add_valutazione(id):
    """Aggiungi valutazione missione (cliente)"""
    missione = Missione.query.get_or_404(id)
    data = request.get_json()
    
    if missione.Stato != 'completata':
        return jsonify({'error': 'Puoi valutare solo missioni completate'}), 400
    
    valutazione = data.get('valutazione')
    commento = data.get('commento')
    
    if not valutazione or not (1 <= valutazione <= 10):
        return jsonify({'error': 'Valutazione deve essere tra 1 e 10'}), 400
    
    missione.Valutazione = valutazione
    missione.Commento = commento
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'missione': missione.to_dict()
    })


@missioni_bp.route('/<int:id>/tracce', methods=['GET'])
@login_required
def get_tracce(id):
    """Ottieni tutte le tracce GPS di una missione"""
    missione = Missione.query.get_or_404(id)
    
    tracce = Traccia.query.filter_by(ID_Missione=id).order_by(Traccia.TIMESTAMP.asc()).all()
    
    return jsonify({
        'missione_id': id,
        'tracce': [{
            'lat': float(t.Latitudine),
            'lng': float(t.Longitudine),
            'timestamp': t.TIMESTAMP.isoformat() if t.TIMESTAMP else None
        } for t in tracce]
    })


@missioni_bp.route('/<int:id>/tracce', methods=['POST'])
@pilota_required
def add_traccia(id):
    """Aggiungi traccia GPS (pilota o sistema)"""
    missione = Missione.query.get_or_404(id)
    data = request.get_json()
    
    if not missione.IdDrone:
        return jsonify({'error': 'Missione senza drone assegnato'}), 400
    
    traccia = Traccia(
        ID_Drone=missione.IdDrone,
        ID_Missione=id,
        Latitudine=data.get('lat'),
        Longitudine=data.get('lng')
    )
    
    db.session.add(traccia)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'traccia': traccia.to_dict()
    }), 201
