from app.extensions import db


class Traccia(db.Model):
    __tablename__ = 'Traccia'

    ID_Drone = db.Column(db.Integer, db.ForeignKey('Drone.ID'), primary_key=True)
    ID_Missione = db.Column(db.Integer, db.ForeignKey('Missione.ID'), primary_key=True)
    Latitudine = db.Column(db.Numeric(10, 8))
    Longitudine = db.Column(db.Numeric(11, 8))
    TIMESTAMP = db.Column(db.DateTime, primary_key=True)

    def to_dict(self):
        """Restituisce un dizionario con i dati della traccia"""
        return {
            'drone_id': self.ID_Drone,
            'missione_id': self.ID_Missione,
            'lat': float(self.Latitudine) if self.Latitudine else None,
            'lng': float(self.Longitudine) if self.Longitudine else None,
            'timestamp': self.TIMESTAMP.isoformat() if self.TIMESTAMP else None
        }

    def __repr__(self):
        return f'<Traccia Drone:{self.ID_Drone} Missione:{self.ID_Missione}>'
