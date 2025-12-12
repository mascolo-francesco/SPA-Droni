"""
Modello SQLAlchemy per la tabella Contiene.

Tabella associativa (junction table) che implementa la relazione many-to-many
tra Ordine e Prodotto. Ogni record rappresenta un prodotto specifico
in un ordine specifico, con la sua quantità.

Questa tabella permette che:
- Un ordine possa contenere più prodotti diversi
- Uno stesso prodotto possa apparire in molti ordini diversi
- Ogni associazione ordine-prodotto abbia una quantità specifica

Chiavi primarie composite:
- ID_Prodotto: FK verso Prodotto (parte della chiave primaria)
- ID_Ordine: FK verso Ordine (parte della chiave primaria)

Campi:
- Quantità: Numero di unità del prodotto in questo ordine

Relazioni:
- prodotto: Relazione many-to-one con Prodotto (via backref)
- ordine: Relazione many-to-one con Ordine (via backref)
"""

# Import dell'istanza database
from app.extensions import db


class Contiene(db.Model):
    """
    Tabella associativa per la relazione many-to-many Ordine-Prodotto.
    
    Implementa il pattern di junction table con dati aggiuntivi (quantità).
    La chiave primaria è composita (ID_Prodotto + ID_Ordine).
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Contiene'

    # Chiave primaria composita: combinazione di foreign keys
    # primary_key=True su entrambe le colonne crea la chiave composita
    ID_Prodotto = db.Column(db.Integer, db.ForeignKey('Prodotto.ID'), primary_key=True)
    ID_Ordine = db.Column(db.Integer, db.ForeignKey('Ordine.ID'), primary_key=True)
    
    # Dati specifici della relazione: quantità del prodotto nell'ordine
    Quantità = db.Column(db.Integer)  # Numero unità del prodotto

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile della relazione ordine-prodotto
        """
        return {
            'prodotto_id': self.ID_Prodotto,
            'ordine_id': self.ID_Ordine,
            'quantita': self.Quantità
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa che identifica la relazione ordine-prodotto
        """
        return f'<Contiene Prodotto:{self.ID_Prodotto} Ordine:{self.ID_Ordine}>'
