from app.extensions import db


class Contiene(db.Model):
    __tablename__ = 'Contiene'

    ID_Prodotto = db.Column(db.Integer, db.ForeignKey('Prodotto.ID'), primary_key=True)
    ID_Ordine = db.Column(db.Integer, db.ForeignKey('Ordine.ID'), primary_key=True)
    Quantità = db.Column(db.Integer)

    def to_dict(self):
        """Restituisce un dizionario con i dati della relazione"""
        return {
            'prodotto_id': self.ID_Prodotto,
            'ordine_id': self.ID_Ordine,
            'quantita': self.Quantità
        }

    def __repr__(self):
        return f'<Contiene Prodotto:{self.ID_Prodotto} Ordine:{self.ID_Ordine}>'
