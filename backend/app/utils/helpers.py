"""
Funzioni helper di utilità generale.

Fornisce funzioni di supporto riutilizzabili in tutta l'applicazione
per operazioni comuni come:
- Recupero utente corrente dalla sessione
- Conversione tipi database per JSON
- Paginazione query database

Queste utility riducono la duplicazione di codice e centralizzano
logica comune utilizzata in multiple route.
"""

# Import componenti Flask per gestione sessioni
from flask import session
# Import modelli database
from app.models import Utente

def get_current_user():
    """
    Recupera l'oggetto Utente corrente dalla sessione.
    
    Legge user_id dalla sessione Flask e carica i dati completi
    dell'utente dal database. Utile quando serve accesso a informazioni
    utente oltre a quelle salvate in sessione.
    
    Returns:
        Utente: Oggetto modello Utente se autenticato, None altrimenti
        
    Example:
        current_user = get_current_user()
        if current_user:
            print(f"Email: {current_user.Mail}")
    """
    # Ottiene user_id dalla sessione (None se non presente)
    user_id = session.get('user_id')
    
    # Se c'è un user_id, carica l'utente dal database
    if user_id:
        # Query database per ID utente
        return Utente.query.get(user_id)
    
    # Nessun utente in sessione
    return None

def format_decimal(value):
    """
    Converte un valore Decimal in float per serializzazione JSON.
    
    SQLAlchemy usa il tipo Decimal per campi NUMERIC/DECIMAL del database
    per preservare precisione. Tuttavia, JSON non supporta Decimal nativamente,
    quindi va convertito in float prima della serializzazione.
    
    Args:
        value: Valore Decimal da convertire (o None)
        
    Returns:
        float: Valore convertito, o None se input era None
        
    Example:
        peso = Decimal('15.75')
        peso_json = format_decimal(peso)  # 15.75 (float)
    """
    # Se None, ritorna None (evita errore conversione)
    if value is None:
        return None
    # Converti Decimal in float
    return float(value)

def paginate_query(query, page=1, per_page=20):
    """
    Pagina una query SQLAlchemy e ritorna risultati formattati.
    
    Helper per implementare paginazione consistente nelle API.
    Prende una query SQLAlchemy, la pagina e ritorna un dizionario
    con i risultati e metadati di paginazione.
    
    Args:
        query: Query SQLAlchemy da paginare
        page (int): Numero pagina da recuperare (default: 1)
        per_page (int): Risultati per pagina (default: 20)
        
    Returns:
        dict: Dizionario con:
            - items: Lista di oggetti serializzati (to_dict())
            - total: Numero totale risultati
            - pages: Numero totale pagine
            - page: Pagina corrente
            - per_page: Risultati per pagina
            
    Example:
        query = Prodotto.query.filter_by(categoria='Elettronica')
        result = paginate_query(query, page=2, per_page=10)
        # result = {
        #   'items': [...],
        #   'total': 45,
        #   'pages': 5,
        #   'page': 2,
        #   'per_page': 10
        # }
    """
    # Esegue la paginazione usando il metodo paginate() di SQLAlchemy
    # error_out=False evita eccezioni se la pagina richiesta non esiste
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Costruisce dizionario risposta con risultati e metadati
    return {
        # Serializza ogni item usando il metodo to_dict() del modello
        'items': [item.to_dict() for item in pagination.items],
        # Numero totale di risultati (tutte le pagine)
        'total': pagination.total,
        # Numero totale di pagine
        'pages': pagination.pages,
        # Pagina corrente richiesta
        'page': page,
        # Numero risultati per pagina
        'per_page': per_page
    }
