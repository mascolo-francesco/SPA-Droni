"""
Servizio per il calcolo di statistiche e metriche aggregate.

NOTA: Questo file contiene funzioni legacy che NON sono attualmente
utilizzate dall'applicazione. Le statistiche sono calcolate direttamente
nelle route (backend/app/routes/statistiche.py).

Funzioni fornite (non utilizzate):
- get_overview_stats(): Calcola KPI principali dashboard
- get_missions_stats(): Statistiche missioni per stato
- get_ratings_distribution(): Distribuzione valutazioni

Differenze rispetto alle route attuali:
- Usa nomi campi diversi (stato vs Stato, id vs ID)
- Valutazioni 1-5 invece di 1-10
- Riferimenti a campo 'stato' in Drone (non presente nel modello attuale)

Questo suggerisce un'evoluzione del modello dati e delle API,
con il codice nelle route che rappresenta la versione attuale
e questo servizio una versione precedente del sistema.

Potenziale utilizzo futuro:
Potrebbe essere allineato al modello attuale e riattivato per
centralizzare la logica statistica, facilitando test e riuso.
"""
from sqlalchemy import func
from app.models import Ordine, Missione, Drone
from app.extensions import db

def get_overview_stats():
    """
    Ritorna i KPI principali del sistema.
    
    Returns:
        Dict con totale ordini, missioni completate, droni attivi
    """
    totale_ordini = Ordine.query.count()
    missioni_completate = Missione.query.filter_by(stato='completata').count()
    droni_attivi = Drone.query.filter_by(stato='attivo').count()
    
    return {
        'totale_ordini': totale_ordini,
        'missioni_completate': missioni_completate,
        'droni_attivi': droni_attivi
    }

def get_missions_stats():
    """
    Ritorna statistiche delle missioni raggruppate per stato.
    
    Returns:
        Dict con conteggio missioni per ogni stato
    """
    stats = db.session.query(
        Missione.stato,
        func.count(Missione.id).label('count')
    ).group_by(Missione.stato).all()
    
    return {stato: count for stato, count in stats}

def get_ratings_distribution():
    """
    Ritorna la distribuzione delle valutazioni degli ordini.
    
    Returns:
        Dict con conteggio per ogni valutazione (1-5)
    """
    stats = db.session.query(
        Ordine.valutazione,
        func.count(Ordine.id).label('count')
    ).filter(Ordine.valutazione.isnot(None))\
    .group_by(Ordine.valutazione)\
    .all()
    
    # Inizializza tutte le valutazioni possibili
    distribution = {i: 0 for i in range(1, 6)}
    
    # Popola con i dati reali
    for valutazione, count in stats:
        if valutazione in distribution:
            distribution[valutazione] = count
    
    return distribution
