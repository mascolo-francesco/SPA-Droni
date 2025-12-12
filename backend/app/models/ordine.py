"""
Modello SQLAlchemy per la tabella Ordine.

Rappresenta gli ordini effettuati dai clienti nel sistema.
Un ordine contiene uno o più prodotti (relazione many-to-many tramite Contiene)
e può essere associato a una missione di consegna.

Campi:
- ID: Chiave primaria auto-incrementale
- Tipo: Tipo di ordine (es: 'Standard', 'Express', 'Fragile')
- PesoTotale: Peso totale dell'ordine calcolato sommando i pesi dei prodotti
- Orario: Data e ora di creazione dell'ordine
- IndirizzoDestinazione: Indirizzo completo per la consegna
- ID_Missione: FK verso Missione (NULL se ordine non ancora assegnato)
- ID_Utente: FK verso Utente (cliente che ha effettuato l'ordine)

Relazioni:
- prodotti: Relazione many-to-many con Prodotto tramite tabella Contiene
- utente: Relazione many-to-one con Utente (via backref)
- missione: Relazione many-to-one con Missione (via backref)
"""

# Import dell'istanza database
from app.extensions import db


class Ordine(db.Model):
    """
    Modello per la gestione degli ordini dei clienti.
    
    Collega utenti, prodotti e missioni per tracciare il flusso completo
    dalla richiesta alla consegna.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Ordine'

    # Definizione colonne
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Chiave primaria
    Tipo = db.Column(db.String(50))                    # Tipo ordine (Standard/Express/etc)
    PesoTotale = db.Column(db.Numeric(10, 2))          # Peso totale in kg
    Orario = db.Column(db.DateTime)                    # Timestamp creazione ordine
    IndirizzoDestinazione = db.Column(db.String(255))  # Indirizzo consegna
    
    # Foreign keys verso altre tabelle
    ID_Missione = db.Column(db.Integer, db.ForeignKey('Missione.ID'))  # Missione assegnata (nullable)
    ID_Utente = db.Column(db.Integer, db.ForeignKey('Utente.ID'))      # Cliente proprietario

    # Relazioni con altre tabelle
    # Relazione many-to-many con Prodotto attraverso Contiene
    # backref='ordine' permette di accedere all'ordine da un oggetto Contiene
    prodotti = db.relationship('Contiene', backref='ordine', lazy=True)

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Include anche lo stato della missione associata se presente.
        Lo stato è derivato dalla missione collegata, altrimenti 'in_attesa'.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile dell'ordine con stato missione
        """
        return {
            'id': self.ID,
            'tipo': self.Tipo,
            'peso_totale': float(self.PesoTotale) if self.PesoTotale else None,  # Decimal -> float
            'data_ordine': self.Orario.isoformat() if self.Orario else None,     # DateTime -> ISO8601
            'indirizzo': self.IndirizzoDestinazione,
            'missione_id': self.ID_Missione,
            'utente_id': self.ID_Utente,
            # Accede alla relazione 'missione' (backref da Missione) per ottenere lo stato
            'stato': self.missione.Stato if self.missione else 'in_attesa'
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa identificativa dell'ordine
        """
        return f'<Ordine {self.ID} - {self.Tipo}>'
