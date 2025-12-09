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
