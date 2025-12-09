from app.extensions import db


class Pilota(db.Model):
    __tablename__ = 'Pilota'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nome = db.Column(db.String(100))
    Cognome = db.Column(db.String(100))
    Turno = db.Column(db.String(50))
    Brevetto = db.Column(db.String(50))

    # Relazione con Missione
    missioni = db.relationship('Missione', backref='pilota', lazy=True)

    def to_dict(self):
        """Restituisce un dizionario con i dati del pilota"""
        return {
            'id': self.ID,
            'nome': self.Nome,
            'cognome': self.Cognome,
            'turno': self.Turno,
            'brevetto': self.Brevetto
        }

    def __repr__(self):
        return f'<Pilota {self.ID} - {self.Nome} {self.Cognome}>'
