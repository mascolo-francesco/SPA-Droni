from flask import Blueprint, jsonify
from sqlalchemy import func
from app.extensions import db
from app.models import Ordine, Missione, Drone, Pilota, Utente
from app.utils.decorators import admin_required

statistiche_bp = Blueprint('statistiche', __name__)


@statistiche_bp.route('/overview', methods=['GET'])
@admin_required
def get_overview():
    """KPI principali per dashboard"""
    totale_ordini = Ordine.query.count()
    totale_missioni = Missione.query.count()
    totale_droni = Drone.query.count()
    totale_piloti = Pilota.query.count()
    totale_clienti = Utente.query.filter_by(Ruolo='cliente').count()
    
    missioni_completate = Missione.query.filter_by(Stato='completata').count()
    missioni_in_corso = Missione.query.filter_by(Stato='in_corso').count()
    
    # Media valutazioni
    media_val = db.session.query(func.avg(Missione.Valutazione)).filter(
        Missione.Valutazione.isnot(None)
    ).scalar()
    
    # Droni disponibili (batteria > 20% e non in missione)
    droni_occupati = db.session.query(Missione.IdDrone).filter(
        Missione.Stato.in_(['programmata', 'in_corso'])
    ).subquery()
    
    droni_disponibili = Drone.query.filter(
        ~Drone.ID.in_(droni_occupati),
        Drone.Batteria >= 20
    ).count()
    
    return jsonify({
        'ordini': {
            'totale': totale_ordini
        },
        'missioni': {
            'totale': totale_missioni,
            'completate': missioni_completate,
            'in_corso': missioni_in_corso
        },
        'droni': {
            'totale': totale_droni,
            'disponibili': droni_disponibili
        },
        'piloti': {
            'totale': totale_piloti
        },
        'clienti': {
            'totale': totale_clienti
        },
        'valutazioni': {
            'media': round(float(media_val), 1) if media_val else None
        }
    })


@statistiche_bp.route('/missioni', methods=['GET'])
@admin_required
def get_missioni_stats():
    """Statistiche dettagliate missioni"""
    # Conteggio per stato
    stati = db.session.query(
        Missione.Stato,
        func.count(Missione.ID)
    ).group_by(Missione.Stato).all()
    
    per_stato = {stato: count for stato, count in stati}
    
    # Missioni per data (ultimi 30 giorni)
    per_data = db.session.query(
        Missione.DataMissione,
        func.count(Missione.ID)
    ).group_by(Missione.DataMissione).order_by(
        Missione.DataMissione.desc()
    ).limit(30).all()
    
    return jsonify({
        'per_stato': per_stato,
        'per_data': [{
            'data': str(data) if data else None,
            'count': count
        } for data, count in per_data]
    })


@statistiche_bp.route('/droni', methods=['GET'])
@admin_required
def get_droni_stats():
    """Statistiche performance droni"""
    droni = Drone.query.all()
    
    stats = []
    for drone in droni:
        missioni = Missione.query.filter_by(IdDrone=drone.ID).all()
        completate = sum(1 for m in missioni if m.Stato == 'completata')
        valutazioni = [m.Valutazione for m in missioni if m.Valutazione]
        media_val = sum(valutazioni) / len(valutazioni) if valutazioni else None
        
        stats.append({
            'id': drone.ID,
            'modello': drone.Modello,
            'batteria': drone.Batteria,
            'capacita': float(drone.Capacita) if drone.Capacita else None,
            'missioni_totali': len(missioni),
            'missioni_completate': completate,
            'media_valutazione': round(media_val, 1) if media_val else None
        })
    
    # Ordinati per numero missioni
    stats.sort(key=lambda x: x['missioni_totali'], reverse=True)
    
    return jsonify({
        'droni': stats
    })


@statistiche_bp.route('/piloti', methods=['GET'])
@admin_required
def get_piloti_stats():
    """Statistiche performance piloti"""
    piloti = Pilota.query.all()
    
    stats = []
    for pilota in piloti:
        missioni = Missione.query.filter_by(IdPilota=pilota.ID).all()
        completate = sum(1 for m in missioni if m.Stato == 'completata')
        valutazioni = [m.Valutazione for m in missioni if m.Valutazione]
        media_val = sum(valutazioni) / len(valutazioni) if valutazioni else None
        
        stats.append({
            'id': pilota.ID,
            'nome': f"{pilota.Nome} {pilota.Cognome}",
            'turno': pilota.Turno,
            'brevetto': pilota.Brevetto,
            'missioni_totali': len(missioni),
            'missioni_completate': completate,
            'media_valutazione': round(media_val, 1) if media_val else None
        })
    
    # Ordinati per valutazione media
    stats.sort(key=lambda x: x['media_valutazione'] or 0, reverse=True)
    
    return jsonify({
        'piloti': stats
    })


@statistiche_bp.route('/valutazioni', methods=['GET'])
@admin_required
def get_valutazioni_stats():
    """Distribuzione valutazioni"""
    # Conteggio per voto (1-10)
    distribuzione = db.session.query(
        Missione.Valutazione,
        func.count(Missione.ID)
    ).filter(
        Missione.Valutazione.isnot(None)
    ).group_by(Missione.Valutazione).all()
    
    # Crea array con tutti i voti 1-10
    dist_completa = {i: 0 for i in range(1, 11)}
    for voto, count in distribuzione:
        if voto:
            dist_completa[voto] = count
    
    # Media e totale
    valutazioni = Missione.query.filter(Missione.Valutazione.isnot(None)).all()
    totale = len(valutazioni)
    media = sum(m.Valutazione for m in valutazioni) / totale if totale else None
    
    return jsonify({
        'distribuzione': dist_completa,
        'totale': totale,
        'media': round(media, 2) if media else None
    })


@statistiche_bp.route('/ordini', methods=['GET'])
@admin_required
def get_ordini_stats():
    """Statistiche ordini"""
    # Per tipo
    per_tipo = db.session.query(
        Ordine.Tipo,
        func.count(Ordine.ID)
    ).group_by(Ordine.Tipo).all()
    
    # Peso medio
    peso_medio = db.session.query(func.avg(Ordine.PesoTotale)).scalar()
    
    return jsonify({
        'per_tipo': {tipo: count for tipo, count in per_tipo},
        'peso_medio': round(float(peso_medio), 2) if peso_medio else None,
        'totale': Ordine.query.count()
    })
