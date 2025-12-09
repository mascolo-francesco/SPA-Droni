from app.extensions import db


class Drone(db.Model):
    __tablename__ = 'Drone'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Modello = db.Column(db.String(100))
    Capacita = db.Column(db.Numeric(10, 2))
    Batteria = db.Column(db.Integer)

    # Relazione con Missione
    missioni = db.relationship('Missione', backref='drone', lazy=True)
    
    # Relazione con Traccia
    tracce = db.relationship('Traccia', backref='drone', lazy=True)

    def to_dict(self):
        """Restituisce un dizionario con i dati del drone"""
        return {
            'id': self.ID,
            'modello': self.Modello,
            'capacita': float(self.Capacita) if self.Capacita else None,
            'batteria': self.Batteria
        }

    def __repr__(self):
        return f'<Drone {self.ID} - {self.Modello}>'
