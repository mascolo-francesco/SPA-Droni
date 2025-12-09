from flask import Blueprint

def register_blueprints(app):
    """Registra tutti i blueprint API"""
    from app.routes.auth import auth_bp
    from app.routes.ordini import ordini_bp
    from app.routes.missioni import missioni_bp
    from app.routes.droni import droni_bp
    from app.routes.piloti import piloti_bp
    from app.routes.prodotti import prodotti_bp
    from app.routes.tracce import tracce_bp
    from app.routes.statistiche import statistiche_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(ordini_bp, url_prefix='/api/ordini')
    app.register_blueprint(missioni_bp, url_prefix='/api/missioni')
    app.register_blueprint(droni_bp, url_prefix='/api/droni')
    app.register_blueprint(piloti_bp, url_prefix='/api/piloti')
    app.register_blueprint(prodotti_bp, url_prefix='/api/prodotti')
    app.register_blueprint(tracce_bp, url_prefix='/api/tracce')
    app.register_blueprint(statistiche_bp, url_prefix='/api/stats')
