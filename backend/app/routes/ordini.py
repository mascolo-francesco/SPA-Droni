from flask import Blueprint, request, jsonify, session
from app.extensions import db
from app.models import Ordine, Missione, Contiene, Prodotto, Traccia
from app.utils.decorators import login_required, admin_required

ordini_bp = Blueprint('ordini', __name__)


@ordini_bp.route('', methods=['GET'])
@login_required
def get_ordini():
    """Lista ordini - filtrata per utente se cliente"""
    ruolo = session.get('ruolo')
    user_id = session.get('user_id')
    
    if ruolo == 'cliente':
        ordini = Ordine.query.filter_by(ID_Utente=user_id).order_by(Ordine.Orario.desc()).all()
    else:
        ordini = Ordine.query.order_by(Ordine.Orario.desc()).all()
    
    items = [o.to_dict() for o in ordini]
    return jsonify({
        'items': items,
        'total': len(items)
    })


@ordini_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_ordine(id):
    """Dettaglio singolo ordine con prodotti"""
    ordine = Ordine.query.get_or_404(id)
    
    # Verifica accesso: cliente può vedere solo i propri ordini
    if session.get('ruolo') == 'cliente' and ordine.ID_Utente != session.get('user_id'):
        return jsonify({'error': 'Accesso negato'}), 403
    
    # Recupera prodotti dell'ordine
    contenuti = Contiene.query.filter_by(ID_Ordine=id).all()
    prodotti = []
    for c in contenuti:
        prodotto = Prodotto.query.get(c.ID_Prodotto)
        if prodotto:
            prodotti.append({
                **prodotto.to_dict(),
                'quantita': c.Quantità
            })
    
    # Recupera missione se esiste
    missione = None
    if ordine.ID_Missione:
        missione = Missione.query.get(ordine.ID_Missione)
    
    result = ordine.to_dict()
    result['prodotti'] = prodotti
    if missione:
        result['missione'] = missione.to_dict()
    
    return jsonify(result)


@ordini_bp.route('', methods=['POST'])
@login_required
def create_ordine():
    """Crea nuovo ordine"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    # Calcola peso totale dai prodotti
    prodotti = data.get('prodotti', [])
    peso_totale = 0
    for p in prodotti:
        prodotto = Prodotto.query.get(p.get('id'))
        if prodotto:
            peso_totale += float(prodotto.peso) * p.get('quantita', 1)
    
    ordine = Ordine(
        Tipo=data.get('tipo', 'Standard'),
        PesoTotale=peso_totale,
        IndirizzoDestinazione=data.get('indirizzo'),
        ID_Utente=session.get('user_id')
    )
    
    db.session.add(ordine)
    db.session.flush()  # Per ottenere ID
    
    # Aggiungi prodotti
    for p in prodotti:
        contenuto = Contiene(
            ID_Prodotto=p.get('id'),
            ID_Ordine=ordine.ID,
            Quantità=p.get('quantita', 1)
        )
        db.session.add(contenuto)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'ordine': ordine.to_dict()
    }), 201


@ordini_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_ordine(id):
    """Modifica ordine (solo admin)"""
    ordine = Ordine.query.get_or_404(id)
    data = request.get_json()
    
    if data.get('tipo'):
        ordine.Tipo = data['tipo']
    if data.get('indirizzo'):
        ordine.IndirizzoDestinazione = data['indirizzo']
    if data.get('id_missione') is not None:
        ordine.ID_Missione = data['id_missione']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'ordine': ordine.to_dict()
    })


@ordini_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_ordine(id):
    """Elimina ordine (solo admin)"""
    ordine = Ordine.query.get_or_404(id)
    
    # Elimina contenuti associati
    Contiene.query.filter_by(ID_Ordine=id).delete()
    
    db.session.delete(ordine)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Ordine eliminato'
    })


@ordini_bp.route('/<int:id>/tracking', methods=['GET'])
@login_required
def get_tracking(id):
    """Tracking live ordine"""
    ordine = Ordine.query.get_or_404(id)
    
    # Verifica accesso
    if session.get('ruolo') == 'cliente' and ordine.ID_Utente != session.get('user_id'):
        return jsonify({'error': 'Accesso negato'}), 403
    
    if not ordine.ID_Missione:
        return jsonify({
            'stato': 'richiesto',
            'messaggio': 'Ordine in attesa di assegnazione'
        })
    
    missione = Missione.query.get(ordine.ID_Missione)
    
    if not missione:
        return jsonify({
            'stato': 'richiesto',
            'messaggio': 'Missione non trovata'
        })
    
    # Recupera tracce GPS
    tracce = Traccia.query.filter_by(
        ID_Missione=missione.ID
    ).order_by(Traccia.TIMESTAMP.asc()).all()
    
    # Ultima posizione
    ultima_posizione = None
    if tracce:
        ultima = tracce[-1]
        ultima_posizione = {
            'lat': float(ultima.Latitudine),
            'lng': float(ultima.Longitudine),
            'timestamp': ultima.TIMESTAMP.isoformat() if ultima.TIMESTAMP else None
        }
    
    return jsonify({
        'stato': missione.Stato,
        'missione': missione.to_dict(),
        'posizione_attuale': ultima_posizione,
        'percorso': [{
            'lat': float(t.Latitudine),
            'lng': float(t.Longitudine),
            'timestamp': t.TIMESTAMP.isoformat() if t.TIMESTAMP else None
        } for t in tracce],
        'pickup': {
            'lat': float(missione.LatPrelievo) if missione.LatPrelievo else None,
            'lng': float(missione.LongPrelievo) if missione.LongPrelievo else None
        },
        'destinazione': {
            'lat': float(missione.LatConsegna) if missione.LatConsegna else None,
            'lng': float(missione.LongConsegna) if missione.LongConsegna else None
        }
    })
