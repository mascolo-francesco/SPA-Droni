from app.extensions import db


class Ordine(db.Model):
    __tablename__ = 'Ordine'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Tipo = db.Column(db.String(50))
    PesoTotale = db.Column(db.Numeric(10, 2))
    Orario = db.Column(db.DateTime)
    IndirizzoDestinazione = db.Column(db.String(255))
    ID_Missione = db.Column(db.Integer, db.ForeignKey('Missione.ID'))
    ID_Utente = db.Column(db.Integer, db.ForeignKey('Utente.ID'))

    # Relazione con Contiene
    prodotti = db.relationship('Contiene', backref='ordine', lazy=True)

    def to_dict(self):
        """Restituisce un dizionario con i dati dell'ordine e stato missione"""
        return {
            'id': self.ID,
            'tipo': self.Tipo,
            'peso_totale': float(self.PesoTotale) if self.PesoTotale else None,
            'data_ordine': self.Orario.isoformat() if self.Orario else None,
            'indirizzo': self.IndirizzoDestinazione,
            'missione_id': self.ID_Missione,
            'utente_id': self.ID_Utente,
            'stato': self.missione.Stato if self.missione else 'in_attesa'
        }

    def __repr__(self):
        return f'<Ordine {self.ID} - {self.Tipo}>'
