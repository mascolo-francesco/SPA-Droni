"""
Modello SQLAlchemy per la tabella Pilota.

Rappresenta i piloti che controllano i droni per le missioni di consegna.
Ogni pilota ha informazioni personali, turno di lavoro e brevetto.

Campi:
- ID: Chiave primaria auto-incrementale
- Nome: Nome del pilota
- Cognome: Cognome del pilota
- Turno: Turno di lavoro (es: 'mattina', 'pomeriggio', 'notte')
- Brevetto: Codice/tipo di brevetto posseduto dal pilota

Relazioni:
- missioni: Relazione one-to-many con Missione (storico missioni del pilota)
"""

# Import dell'istanza database
from app.extensions import db


class Pilota(db.Model):
    """
    Modello per la gestione dei piloti di droni.
    
    Mantiene i dati anagrafici e operativi dei piloti.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Pilota'

    # Definizione colonne
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Chiave primaria
    Nome = db.Column(db.String(100))         # Nome pilota
    Cognome = db.Column(db.String(100))      # Cognome pilota
    Turno = db.Column(db.String(50))         # Turno lavoro (mattina/pomeriggio/notte)
    Brevetto = db.Column(db.String(50))      # Codice brevetto/licenza pilota

    # Relazioni con altre tabelle
    # backref='pilota' crea attributo virtuale 'pilota' nel modello Missione
    # Permette di accedere al pilota di una missione tramite missione.pilota
    missioni = db.relationship('Missione', backref='pilota', lazy=True)

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile del pilota
        """
        return {
            'id': self.ID,
            'nome': self.Nome,
            'cognome': self.Cognome,
            'turno': self.Turno,
            'brevetto': self.Brevetto
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa identificativa del pilota
        """
        return f'<Pilota {self.ID} - {self.Nome} {self.Cognome}>'
