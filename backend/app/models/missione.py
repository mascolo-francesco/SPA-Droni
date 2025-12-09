from app.extensions import db


class Missione(db.Model):
    __tablename__ = 'Missione'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    DataMissione = db.Column(db.Date)
    Ora = db.Column(db.Time)
    LatPrelievo = db.Column(db.Numeric(10, 8))
    LongPrelievo = db.Column(db.Numeric(11, 8))
    LatConsegna = db.Column(db.Numeric(10, 8))
    LongConsegna = db.Column(db.Numeric(11, 8))
    Valutazione = db.Column(db.Integer)
    Commento = db.Column(db.String(255))
    IdDrone = db.Column(db.Integer, db.ForeignKey('Drone.ID'))
    IdPilota = db.Column(db.Integer, db.ForeignKey('Pilota.ID'))
    Stato = db.Column(db.String(50))

    # Relazione con Ordine
    ordini = db.relationship('Ordine', backref='missione', lazy=True)
    
    # Relazione con Traccia
    tracce = db.relationship('Traccia', backref='missione', lazy=True)

    def to_dict(self):
        """Restituisce un dizionario con i dati della missione e drone/pilota embedded"""
        return {
            'id': self.ID,
            'data_missione': self.DataMissione.isoformat() if self.DataMissione else None,
            'ora': self.Ora.isoformat() if self.Ora else None,
            'lat_prelievo': float(self.LatPrelievo) if self.LatPrelievo else None,
            'long_prelievo': float(self.LongPrelievo) if self.LongPrelievo else None,
            'lat_consegna': float(self.LatConsegna) if self.LatConsegna else None,
            'long_consegna': float(self.LongConsegna) if self.LongConsegna else None,
            'valutazione': self.Valutazione,
            'commento': self.Commento,
            'drone_id': self.IdDrone,
            'pilota_id': self.IdPilota,
            'stato': self.Stato,
            'drone': self.drone.to_dict() if self.drone else None,
            'pilota': self.pilota.to_dict() if self.pilota else None
        }

    def __repr__(self):
        return f'<Missione {self.ID} - {self.DataMissione}>'
