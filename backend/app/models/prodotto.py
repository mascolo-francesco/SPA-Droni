from app.extensions import db


class Prodotto(db.Model):
    __tablename__ = 'Prodotto'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100))
    peso = db.Column(db.Numeric(10, 2))
    categoria = db.Column(db.String(50))

    # Relazione con Contiene
    ordini = db.relationship('Contiene', backref='prodotto', lazy=True)

    def to_dict(self):
        """Restituisce un dizionario con i dati del prodotto"""
        return {
            'id': self.ID,
            'nome': self.nome,
            'peso': float(self.peso) if self.peso else None,
            'categoria': self.categoria
        }

    def __repr__(self):
        return f'<Prodotto {self.ID} - {self.nome}>'
