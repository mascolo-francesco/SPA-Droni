"""
Modello SQLAlchemy per la tabella Missione.

Rappresenta le missioni di consegna assegnate ai droni con piloti.
Una missione coordina un drone, un pilota e definisce il percorso
(punto di prelievo e punto di consegna) con timestamp e stato.

Campi:
- ID: Chiave primaria auto-incrementale
- DataMissione: Data della missione
- Ora: Orario della missione
- LatPrelievo/LongPrelievo: Coordinate GPS punto di prelievo (magazzino)
- LatConsegna/LongConsegna: Coordinate GPS punto di consegna (cliente)
- Valutazione: Voto cliente da 1 a 10 (NULL se non ancora valutata)
- Commento: Commento testuale del cliente sulla missione
- IdDrone: FK verso Drone assegnato
- IdPilota: FK verso Pilota assegnato
- Stato: Stato missione ('programmata', 'in_corso', 'completata', 'annullata')

Relazioni:
- ordini: Relazione one-to-many con Ordine (una missione può consegnare più ordini)
- tracce: Relazione one-to-many con Traccia (punti GPS del percorso effettivo)
- drone: Relazione many-to-one con Drone (via backref)
- pilota: Relazione many-to-one con Pilota (via backref)
"""

# Import dell'istanza database
from app.extensions import db


class Missione(db.Model):
    """
    Modello per la gestione delle missioni di consegna.
    
    Coordina droni, piloti e ordini, tracciando il percorso e lo stato
    della consegna.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Missione'

    # Definizione colonne
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Chiave primaria
    DataMissione = db.Column(db.Date)                # Data missione
    Ora = db.Column(db.Time)                         # Orario missione
    
    # Coordinate GPS punto di prelievo (magazzino/deposito)
    # Numeric(10,8) per precisione GPS: 10 cifre totali, 8 decimali
    LatPrelievo = db.Column(db.Numeric(10, 8))       # Latitudine prelievo
    LongPrelievo = db.Column(db.Numeric(11, 8))      # Longitudine prelievo (11 per ±180°)
    
    # Coordinate GPS punto di consegna (cliente)
    LatConsegna = db.Column(db.Numeric(10, 8))       # Latitudine consegna
    LongConsegna = db.Column(db.Numeric(11, 8))      # Longitudine consegna
    
    # Valutazione del cliente post-consegna
    Valutazione = db.Column(db.Integer)              # Voto 1-10 (NULL se non valutata)
    Commento = db.Column(db.String(255))             # Commento testuale cliente
    
    # Foreign keys
    IdDrone = db.Column(db.Integer, db.ForeignKey('Drone.ID'))    # Drone assegnato
    IdPilota = db.Column(db.Integer, db.ForeignKey('Pilota.ID'))  # Pilota assegnato
    
    # Stato missione
    Stato = db.Column(db.String(50))                 # programmata/in_corso/completata/annullata

    # Relazioni con altre tabelle
    # Una missione può essere associata a più ordini (consegna multipla)
    ordini = db.relationship('Ordine', backref='missione', lazy=True)
    
    # Tracce GPS registrate durante la missione (tracciamento real-time)
    tracce = db.relationship('Traccia', backref='missione', lazy=True)

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Include dati embedded di drone e pilota per ridurre le query client-side.
        Converte Decimal e Date/Time in formati JSON-serializzabili.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile della missione
        """
        return {
            'id': self.ID,
            # Conversione Date/Time in formato ISO8601
            'data_missione': self.DataMissione.isoformat() if self.DataMissione else None,
            'ora': self.Ora.isoformat() if self.Ora else None,
            # Conversione Decimal -> float per coordinate GPS
            'lat_prelievo': float(self.LatPrelievo) if self.LatPrelievo else None,
            'long_prelievo': float(self.LongPrelievo) if self.LongPrelievo else None,
            'lat_consegna': float(self.LatConsegna) if self.LatConsegna else None,
            'long_consegna': float(self.LongConsegna) if self.LongConsegna else None,
            # Valutazione e feedback cliente
            'valutazione': self.Valutazione,
            'commento': self.Commento,
            # Foreign keys
            'drone_id': self.IdDrone,
            'pilota_id': self.IdPilota,
            # Stato corrente
            'stato': self.Stato,
            # Embedded objects: include dati completi di drone e pilota
            # Usa i backref 'drone' e 'pilota' creati dalle relazioni inverse
            'drone': self.drone.to_dict() if self.drone else None,
            'pilota': self.pilota.to_dict() if self.pilota else None
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa identificativa della missione
        """
        return f'<Missione {self.ID} - {self.DataMissione}>'
