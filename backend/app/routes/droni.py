"""
Blueprint per la gestione dei droni.

Questo modulo fornisce tutti gli endpoint API per la gestione CRUD dei droni
e operazioni correlate come:
- Lista droni con filtri
- Dettaglio singolo drone
- Creazione/modifica/eliminazione droni (solo admin)
- Gestione livello batteria
- Verifica disponibilità per nuove missioni
- Storico missioni per drone

Tutti gli endpoint sono sotto il prefix '/api/droni'.

Autorizzazioni:
- GET (list/detail): Richiede login (qualsiasi utente autenticato)
- POST/PUT/DELETE: Richiede ruolo admin
- PATCH batteria: Richiede login
"""

# Import componenti Flask per gestione request/response
from flask import Blueprint, request, jsonify
# Import istanza database e modelli
from app.extensions import db
from app.models import Drone, Missione
# Import decoratori autorizzazione
from app.utils.decorators import login_required, admin_required

# Crea blueprint per le route droni
# Il nome 'droni' identifica il blueprint nell'applicazione
droni_bp = Blueprint('droni', __name__)


@droni_bp.route('', methods=['GET'])
@login_required
def get_droni():
    """
    GET /api/droni - Lista tutti i droni.
    
    Ritorna l'elenco completo dei droni registrati nel sistema
    con le loro specifiche tecniche e stato corrente.
    
    Autorizzazione: Richiede autenticazione (qualsiasi utente).
    
    Returns:
        JSON: {
            'items': Array di oggetti drone,
            'total': Numero totale droni
        }
    """
    # Query tutti i droni dal database
    droni = Drone.query.all()
    
    # Serializza ogni drone usando il metodo to_dict()
    items = [d.to_dict() for d in droni]
    
    # Ritorna response JSON con lista e conteggio
    return jsonify({
        'items': items,
        'total': len(items)
    })


@droni_bp.route('/<int:id>', methods=['GET'])
@login_required
def get_drone(id):
    """
    GET /api/droni/<id> - Dettaglio singolo drone.
    
    Recupera i dati completi di un drone specifico identificato per ID.
    
    Args:
        id (int): ID univoco del drone
        
    Autorizzazione: Richiede autenticazione.
    
    Returns:
        JSON: Oggetto drone serializzato
        404: Se drone non trovato
    """
    # Cerca drone per ID, solleva 404 se non trovato
    # get_or_404 è una shortcut Flask per gestire automaticamente il 404
    drone = Drone.query.get_or_404(id)
    
    # Ritorna drone serializzato
    return jsonify(drone.to_dict())


@droni_bp.route('', methods=['POST'])
@admin_required
def create_drone():
    """
    POST /api/droni - Crea nuovo drone.
    
    Aggiunge un nuovo drone alla flotta. Solo amministratori possono
    creare nuovi droni. La batteria viene inizializzata a 100% se non specificata.
    
    Autorizzazione: Solo admin.
    
    Body JSON:
        {
            "modello": "Nome modello drone",
            "capacita": Peso max in kg (float),
            "batteria": Percentuale batteria (int, 0-100, default: 100)
        }
        
    Returns:
        201 Created: {
            'success': True,
            'drone': Oggetto drone creato
        }
        400: Se dati mancanti
    """
    # Estrae payload JSON dalla richiesta
    data = request.get_json()
    
    # Valida presenza dati
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    # Crea nuovo oggetto Drone con dati forniti
    # get() permette valori None se chiave non presente
    drone = Drone(
        Modello=data.get('modello'),
        Capacita=data.get('capacita'),
        Batteria=data.get('batteria', 100)  # Default 100% se non specificato
    )
    
    # Aggiunge drone alla sessione database
    db.session.add(drone)
    # Salva modifiche nel database (INSERT)
    db.session.commit()
    
    # Ritorna success con drone creato (201 Created)
    return jsonify({
        'success': True,
        'drone': drone.to_dict()
    }), 201


@droni_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_drone(id):
    """
    PUT /api/droni/<id> - Modifica drone esistente.
    
    Aggiorna i dati di un drone. Solo campi forniti nel payload
    vengono modificati (partial update).
    
    Args:
        id (int): ID del drone da modificare
        
    Autorizzazione: Solo admin.
    
    Body JSON (tutti campi opzionali):
        {
            "modello": "Nuovo modello",
            "capacita": Nuova capacità,
            "batteria": Nuovo livello batteria
        }
        
    Returns:
        200 OK: {
            'success': True,
            'drone': Oggetto drone aggiornato
        }
        404: Se drone non trovato
    """
    # Recupera drone esistente o 404
    drone = Drone.query.get_or_404(id)
    # Estrae dati aggiornamento
    data = request.get_json()
    
    # Aggiorna solo i campi forniti (partial update)
    # Verifica presenza chiave prima di modificare
    if data.get('modello'):
        drone.Modello = data['modello']
    if data.get('capacita') is not None:  # 0 è un valore valido
        drone.Capacita = data['capacita']
    if data.get('batteria') is not None:  # 0 è un valore valido
        drone.Batteria = data['batteria']
    
    # Salva modifiche (UPDATE)
    db.session.commit()
    
    # Ritorna drone aggiornato
    return jsonify({
        'success': True,
        'drone': drone.to_dict()
    })


@droni_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_drone(id):
    """
    DELETE /api/droni/<id> - Elimina drone.
    
    Rimuove un drone dalla flotta. Non permette eliminazione se il drone
    ha missioni attive (programmata o in_corso) per preservare integrità dati.
    
    Args:
        id (int): ID del drone da eliminare
        
    Autorizzazione: Solo admin.
    
    Returns:
        200 OK: {
            'success': True,
            'message': 'Drone eliminato'
        }
        400: Se drone ha missioni attive
        404: Se drone non trovato
    """
    # Recupera drone o 404
    drone = Drone.query.get_or_404(id)
    
    # Verifica che non ci siano missioni attive associate al drone
    # Cerca missioni con questo drone in stato programmata o in_corso
    missioni_attive = Missione.query.filter(
        Missione.IdDrone == id,
        Missione.Stato.in_(['programmata', 'in_corso'])  # Stati che bloccano eliminazione
    ).first()
    
    # Se trovate missioni attive, blocca eliminazione
    if missioni_attive:
        return jsonify({'error': 'Impossibile eliminare: drone con missioni attive'}), 400
    
    # Nessuna missione attiva - procedi con eliminazione
    db.session.delete(drone)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Drone eliminato'
    })


@droni_bp.route('/disponibili', methods=['GET'])
@admin_required
def get_disponibili():
    """
    GET /api/droni/disponibili - Lista droni disponibili per nuove missioni.
    
    Ritorna solo i droni che possono essere assegnati a nuove missioni:
    - Non impegnati in missioni programmata o in_corso
    - Livello batteria >= 20% (soglia minima operativa)
    
    Autorizzazione: Solo admin.
    
    Returns:
        JSON: {
            'droni': Array droni disponibili
        }
    """
    # Subquery per trovare ID droni occupati in missioni attive
    droni_occupati = db.session.query(Missione.IdDrone).filter(
        Missione.Stato.in_(['programmata', 'in_corso'])
    ).subquery()
    
    # Query droni escludendo quelli occupati e con batteria bassa
    droni = Drone.query.filter(
        ~Drone.ID.in_(droni_occupati),  # NOT IN droni occupati
        Drone.Batteria >= 20             # Batteria minima 20%
    ).all()
    
    return jsonify({
        'droni': [d.to_dict() for d in droni]
    })


@droni_bp.route('/<int:id>/batteria', methods=['PATCH'])
@login_required
def update_batteria(id):
    """
    PATCH /api/droni/<id>/batteria - Aggiorna livello batteria drone.
    
    Endpoint dedicato per aggiornare solo il livello batteria.
    Usato dal sistema di monitoraggio o piloti per tracciare autonomia.
    
    Args:
        id (int): ID del drone
        
    Autorizzazione: Richiede autenticazione.
    
    Body JSON:
        {
            "batteria": Nuovo livello (int, 0-100)
        }
        
    Returns:
        200 OK: {
            'success': True,
            'drone': Drone aggiornato
        }
        400: Se batteria fuori range 0-100
        404: Se drone non trovato
    """
    # Recupera drone
    drone = Drone.query.get_or_404(id)
    data = request.get_json()
    
    # Estrae e valida nuovo livello batteria
    batteria = data.get('batteria')
    
    # Validazione: batteria deve essere tra 0 e 100
    if batteria is None or not (0 <= batteria <= 100):
        return jsonify({'error': 'Batteria deve essere tra 0 e 100'}), 400
    
    # Aggiorna batteria
    drone.Batteria = batteria
    db.session.commit()
    
    return jsonify({
        'success': True,
        'drone': drone.to_dict()
    })


@droni_bp.route('/<int:id>/missioni', methods=['GET'])
@admin_required
def get_drone_missioni(id):
    """
    GET /api/droni/<id>/missioni - Storico missioni di un drone.
    
    Recupera tutte le missioni eseguite da un drone specifico,
    ordinate dalla più recente. Utile per analisi performance e manutenzione.
    
    Args:
        id (int): ID del drone
        
    Autorizzazione: Solo admin.
    
    Returns:
        JSON: {
            'drone': Dati drone,
            'missioni': Array missioni ordinate per data desc
        }
        404: Se drone non trovato
    """
    # Recupera drone
    drone = Drone.query.get_or_404(id)
    
    # Query missioni del drone ordinate per data decrescente (più recenti prima)
    missioni = Missione.query.filter_by(IdDrone=id).order_by(
        Missione.DataMissione.desc()
    ).all()
    
    return jsonify({
        'drone': drone.to_dict(),
        'missioni': [m.to_dict() for m in missioni]
    })
