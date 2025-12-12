"""
Blueprint per la gestione del catalogo prodotti.

Questo modulo fornisce tutti gli endpoint API per la gestione dei prodotti
disponibili per l'ordinazione. Include funzionalità per:
- Lista prodotti con paginazione e filtri per categoria
- Ricerca prodotti per nome (LIKE query)
- Dettaglio singolo prodotto
- CRUD prodotti (solo admin)
- Lista categorie disponibili

Caratteristiche:
- Endpoint pubblici per consultazione catalogo (GET list/detail)
- Endpoint protetti per gestione (POST/PUT/DELETE richiedono admin)
- Supporto paginazione nativa per grandi cataloghi
- Ricerca full-text per nome prodotto

Tutti gli endpoint sono sotto il prefix '/api/prodotti'.
"""
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Prodotto
from app.utils.decorators import login_required, admin_required

prodotti_bp = Blueprint('prodotti', __name__)


@prodotti_bp.route('', methods=['GET'])
def get_prodotti():
    """Lista prodotti (pubblica, paginata)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    categoria = request.args.get('categoria')
    
    query = Prodotto.query
    
    if categoria:
        query = query.filter_by(categoria=categoria)
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'items': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page
    })


@prodotti_bp.route('/<int:id>', methods=['GET'])
def get_prodotto(id):
    """Dettaglio singolo prodotto (pubblico)"""
    prodotto = Prodotto.query.get_or_404(id)
    return jsonify(prodotto.to_dict())


@prodotti_bp.route('', methods=['POST'])
@admin_required
def create_prodotto():
    """Crea nuovo prodotto (solo admin)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Dati mancanti'}), 400
    
    prodotto = Prodotto(
        nome=data.get('nome'),
        peso=data.get('peso'),
        categoria=data.get('categoria')
    )
    
    db.session.add(prodotto)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'prodotto': prodotto.to_dict()
    }), 201


@prodotti_bp.route('/<int:id>', methods=['PUT'])
@admin_required
def update_prodotto(id):
    """Modifica prodotto (solo admin)"""
    prodotto = Prodotto.query.get_or_404(id)
    data = request.get_json()
    
    if data.get('nome'):
        prodotto.nome = data['nome']
    if data.get('peso') is not None:
        prodotto.peso = data['peso']
    if data.get('categoria'):
        prodotto.categoria = data['categoria']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'prodotto': prodotto.to_dict()
    })


@prodotti_bp.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_prodotto(id):
    """Elimina prodotto (solo admin)"""
    prodotto = Prodotto.query.get_or_404(id)
    
    db.session.delete(prodotto)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Prodotto eliminato'
    })


@prodotti_bp.route('/categoria/<categoria>', methods=['GET'])
def get_by_categoria(categoria):
    """Lista prodotti per categoria"""
    prodotti = Prodotto.query.filter_by(categoria=categoria).all()
    return jsonify({
        'categoria': categoria,
        'prodotti': [p.to_dict() for p in prodotti]
    })


@prodotti_bp.route('/categorie', methods=['GET'])
def get_categorie():
    """Lista tutte le categorie disponibili"""
    categorie = db.session.query(Prodotto.categoria).distinct().all()
    return jsonify({
        'categorie': [c[0] for c in categorie if c[0]]
    })


@prodotti_bp.route('/search', methods=['GET'])
def search_prodotti():
    """Ricerca prodotti per nome"""
    q = request.args.get('q', '')
    
    if len(q) < 2:
        return jsonify({'error': 'Query troppo corta (min 2 caratteri)'}), 400
    
    prodotti = Prodotto.query.filter(
        Prodotto.nome.ilike(f'%{q}%')
    ).limit(20).all()
    
    return jsonify({
        'query': q,
        'prodotti': [p.to_dict() for p in prodotti]
    })
