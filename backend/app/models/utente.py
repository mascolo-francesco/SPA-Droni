from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


class Utente(db.Model):
    __tablename__ = 'Utente'

    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nome = db.Column(db.String(100))
    Mail = db.Column(db.String(100))
    Password = db.Column(db.String(255))
    Ruolo = db.Column(db.String(50))

    # Relazione con Ordine
    ordini = db.relationship('Ordine', backref='utente', lazy=True)

    def set_password(self, password):
        """Imposta la password hashata"""
        self.Password = generate_password_hash(password)

    def check_password(self, password):
        """Verifica la password"""
        return check_password_hash(self.Password, password)

    def to_dict(self):
        """Restituisce un dizionario senza la password"""
        return {
            'id': self.ID,
            'nome': self.Nome,
            'email': self.Mail,
            'ruolo': self.Ruolo
        }

    def __repr__(self):
        return f'<Utente {self.ID} - {self.Nome}>'
