"""
Modello SQLAlchemy per la tabella Traccia.

Rappresenta i punti GPS registrati durante le missioni dei droni.
Ogni traccia è un punto nel percorso del drone, con coordinate geografiche
e timestamp. L'insieme delle tracce di una missione forma il percorso completo.

Questa tabella permette:
- Tracciamento real-time della posizione del drone
- Ricostruzione del percorso storico delle missioni
- Monitoraggio dello stato di avanzamento delle consegne

Chiavi primarie composite:
- ID_Drone: FK verso Drone (parte della chiave primaria)
- ID_Missione: FK verso Missione (parte della chiave primaria)
- TIMESTAMP: Data/ora della rilevazione GPS (parte della chiave primaria)

Campi:
- Latitudine: Coordinata GPS latitudine del drone
- Longitudine: Coordinata GPS longitudine del drone

Relazioni:
- drone: Relazione many-to-one con Drone (via backref)
- missione: Relazione many-to-one con Missione (via backref)
"""

# Import dell'istanza database
from app.extensions import db


class Traccia(db.Model):
    """
    Modello per il tracciamento GPS dei droni durante le missioni.
    
    Registra punti GPS con timestamp per tracking real-time e storico.
    La chiave primaria composita (drone, missione, timestamp) garantisce
    unicità di ogni punto rilevato.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Traccia'

    # Chiave primaria composita: drone + missione + timestamp
    # Questo permette a un drone di avere più tracce per missione in momenti diversi
    ID_Drone = db.Column(db.Integer, db.ForeignKey('Drone.ID'), primary_key=True)
    ID_Missione = db.Column(db.Integer, db.ForeignKey('Missione.ID'), primary_key=True)
    TIMESTAMP = db.Column(db.DateTime, primary_key=True)  # Momento della rilevazione
    
    # Coordinate GPS
    # Numeric(10,8) per precisione: latitudine ±90°, 8 decimali (~1mm precisione)
    Latitudine = db.Column(db.Numeric(10, 8))       # Coordinata latitudine
    # Numeric(11,8) per longitudine: ±180°, 8 decimali
    Longitudine = db.Column(db.Numeric(11, 8))      # Coordinata longitudine

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Converte Decimal in float e DateTime in formato ISO8601 per
        compatibilità con JSON e client JavaScript.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile del punto GPS
        """
        return {
            'drone_id': self.ID_Drone,
            'missione_id': self.ID_Missione,
            # Conversione Decimal -> float per coordinate
            'lat': float(self.Latitudine) if self.Latitudine else None,
            'lng': float(self.Longitudine) if self.Longitudine else None,
            # Conversione DateTime -> ISO8601 string
            'timestamp': self.TIMESTAMP.isoformat() if self.TIMESTAMP else None
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa identificativa del punto traccia
        """
        return f'<Traccia Drone:{self.ID_Drone} Missione:{self.ID_Missione}>'
