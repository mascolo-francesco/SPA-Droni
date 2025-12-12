"""
Modello SQLAlchemy per la tabella Prodotto.

Rappresenta i prodotti disponibili per l'ordine nel catalogo.
I prodotti sono raggruppati per categoria e hanno un peso specifico
utilizzato per calcolare i requisiti di carico del drone.

Campi:
- ID: Chiave primaria auto-incrementale
- nome: Nome descrittivo del prodotto
- peso: Peso del prodotto in kg (Decimal per precisione)
- categoria: Categoria merceologica del prodotto (es: 'Elettronica', 'Alimentari')

Relazioni:
- ordini: Relazione many-to-many con Ordine tramite tabella Contiene
"""

# Import dell'istanza database
from app.extensions import db


class Prodotto(db.Model):
    """
    Modello per la gestione del catalogo prodotti.
    
    Mantiene informazioni sui prodotti ordinabili dai clienti.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Prodotto'

    # Definizione colonne
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Chiave primaria
    nome = db.Column(db.String(100))          # Nome prodotto
    peso = db.Column(db.Numeric(10, 2))       # Peso in kg (es: 1.25)
    categoria = db.Column(db.String(50))      # Categoria prodotto

    # Relazioni con altre tabelle
    # Relazione many-to-many con Ordine attraverso la tabella associativa Contiene
    # backref='prodotto' crea attributo virtuale 'prodotto' nel modello Contiene
    ordini = db.relationship('Contiene', backref='prodotto', lazy=True)

    def to_dict(self):
        """
        Converte il modello in dizionario per JSON response.
        
        Converte Decimal in float per compatibilità JSON.
        
        Returns:
            dict: Rappresentazione JSON-serializzabile del prodotto
        """
        return {
            'id': self.ID,
            'nome': self.nome,
            'peso': float(self.peso) if self.peso else None,  # Decimal -> float
            'categoria': self.categoria
        }

    def __repr__(self):
        """
        Rappresentazione stringa per debug.
        
        Returns:
            str: Stringa identificativa del prodotto
        """
        return f'<Prodotto {self.ID} - {self.nome}>'
