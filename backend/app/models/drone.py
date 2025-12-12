"""
Modello SQLAlchemy per la tabella Drone.

Rappresenta i droni utilizzati per le consegne nel sistema.
Ogni drone ha specifiche tecniche (modello, capacità di carico)
e uno stato operativo (livello batteria).

Campi:
- ID: Chiave primaria auto-incrementale
- Modello: Nome/identificatore del modello di drone
- Capacita: Capacità massima di carico in kg (Decimal per precisione)
- Batteria: Livello batteria in percentuale (0-100)

Relazioni:
- missioni: Relazione one-to-many con Missione (storico missioni del drone)
- tracce: Relazione one-to-many con Traccia (punti GPS registrati dal drone)
"""

# Import dell'istanza database
from app.extensions import db


class Drone(db.Model):
    """
    Modello per la gestione dei droni nel sistema di consegna.
    
    Traccia informazioni tecniche e stato operativo di ogni drone.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Drone'

    # Definizione colonne
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Chiave primaria
    Modello = db.Column(db.String(100))           # Modello/nome del drone
    Capacita = db.Column(db.Numeric(10, 2))       # Capacità carico in kg (es: 5.50)
    Batteria = db.Column(db.Integer)              # Batteria percentuale 0-100

    # Relazioni con altre tabelle
    # backref='drone' crea attributo virtuale 'drone' nel modello Missione
    missioni = db.relationship('Missione', backref='drone', lazy=True)
    
    # Relazione con le tracce GPS registrate dal drone
    tracce = db.relationship('Traccia', backref='drone', lazy=True)

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Converte il tipo Decimal in float per compatibilità JSON.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile del drone
        """
        return {
            'id': self.ID,
            'modello': self.Modello,
            'capacita': float(self.Capacita) if self.Capacita else None,  # Decimal -> float
            'batteria': self.Batteria
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa identificativa del drone
        """
        return f'<Drone {self.ID} - {self.Modello}>'
