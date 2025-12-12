"""
Servizio per la logica di business del tracking GPS.

Fornisce funzioni riutilizzabili per il recupero e gestione
delle tracce GPS dei droni durante le missioni.

Funzioni:
- get_mission_tracking(missione_id): Ritorna tutte le tracce di una
  missione ordinate cronologicamente per ricostruire il percorso
  
- get_latest_position(missione_id): Ritorna l'ultima posizione nota
  del drone per una missione, utile per tracking real-time

Queste funzioni centralizzano la logica di query del tracking,
rendendola riutilizzabile sia dalle route API che da eventuali
task di background o report.

Uso tipico:
    from app.services.tracking_service import get_latest_position
    
    ultima_pos = get_latest_position(missione_id)
    if ultima_pos:
        lat, lng = ultima_pos.Latitudine, ultima_pos.Longitudine
        # Aggiorna UI con posizione corrente
"""
from app.models import Traccia, Missione
from app.extensions import db

def get_mission_tracking(missione_id):
    """
    Ritorna tutte le tracce di una missione ordinate per timestamp.
    
    Args:
        missione_id: ID della missione
        
    Returns:
        Lista di tracce ordinate per timestamp ascendente
    """
    tracce = Traccia.query.filter_by(ID_Missione=missione_id)\
        .order_by(Traccia.TIMESTAMP.asc())\
        .all()
    return tracce

def get_latest_position(missione_id):
    """
    Ritorna l'ultima posizione registrata del drone per una missione.
    
    Args:
        missione_id: ID della missione
        
    Returns:
        Ultima traccia (posizione) o None se non trovata
    """
    traccia = Traccia.query.filter_by(ID_Missione=missione_id)\
        .order_by(Traccia.TIMESTAMP.desc())\
        .first()
    return traccia
