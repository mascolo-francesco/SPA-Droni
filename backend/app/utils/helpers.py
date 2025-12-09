from flask import session
from app.models import Utente

def get_current_user():
    """Ritorna l'utente corrente dalla sessione"""
    user_id = session.get('user_id')
    if user_id:
        return Utente.query.get(user_id)
    return None

def format_decimal(value):
    """Formatta un Decimal per JSON"""
    if value is None:
        return None
    return float(value)

def paginate_query(query, page=1, per_page=20):
    """Helper per paginazione"""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        'items': [item.to_dict() for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'per_page': per_page
    }
