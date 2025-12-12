"""
Modello SQLAlchemy per la tabella Utente.

Rappresenta gli utenti del sistema (clienti, amministratori, piloti).
Gestisce l'autenticazione tramite hash delle password e fornisce
metodi per il login sicuro.

Campi:
- ID: Chiave primaria auto-incrementale
- Nome: Nome completo dell'utente
- Mail: Email univoca per il login
- Password: Password hashata con bcrypt (mai salvata in chiaro)
- Ruolo: Tipo di utente (cliente, admin, pilota)

Relazioni:
- ordini: Relazione one-to-many con Ordine (un utente può avere molti ordini)
"""

# Import dell'istanza database configurata
from app.extensions import db
# Import funzioni per gestione sicura delle password con bcrypt
from werkzeug.security import generate_password_hash, check_password_hash


class Utente(db.Model):
    """
    Modello per la gestione degli utenti del sistema.
    
    Utilizza hashing bcrypt per le password e fornisce metodi
    per autenticazione e serializzazione JSON sicura.
    """
    
    # Nome della tabella nel database
    __tablename__ = 'Utente'

    # Definizione colonne della tabella
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Chiave primaria
    Nome = db.Column(db.String(100))        # Nome completo utente
    Mail = db.Column(db.String(100))        # Email per login (dovrebbe essere UNIQUE)
    Password = db.Column(db.String(255))    # Password hashata (bcrypt genera stringhe ~60 char)
    Ruolo = db.Column(db.String(50))        # Ruolo: 'cliente', 'admin', 'pilota'

    # Definizione relazioni con altre tabelle
    # backref='utente' crea attributo virtuale 'utente' nel modello Ordine
    # lazy=True carica gli ordini solo quando acceduti (lazy loading)
    ordini = db.relationship('Ordine', backref='utente', lazy=True)

    def set_password(self, password):
        """
        Imposta la password hashata per l'utente.
        
        Utilizza bcrypt tramite generate_password_hash per creare
        un hash sicuro della password. L'hash include automaticamente
        un salt casuale per prevenire attacchi rainbow table.
        
        Args:
            password (str): Password in chiaro da hashare
        """
        self.Password = generate_password_hash(password)

    def check_password(self, password):
        """
        Verifica se una password corrisponde all'hash salvato.
        
        Confronta la password fornita con l'hash bcrypt salvato
        nel database usando un algoritmo timing-safe.
        
        Args:
            password (str): Password in chiaro da verificare
            
        Returns:
            bool: True se la password è corretta, False altrimenti
        """
        return check_password_hash(self.Password, password)

    def to_dict(self):
        """
        Converte il modello in un dizionario per serializzazione JSON.
        
        IMPORTANTE: La password NON viene inclusa nel dizionario
        per motivi di sicurezza. Viene esposta solo ai client
        l'informazione necessaria.
        
        Returns:
            dict: Dizionario con i dati dell'utente (senza password)
        """
        return {
            'id': self.ID,
            'nome': self.Nome,
            'email': self.Mail,
            'ruolo': self.Ruolo
        }

    def __repr__(self):
        """
        Rappresentazione stringa del modello per debug.
        
        Returns:
            str: Stringa rappresentativa del modello
        """
        return f'<Utente {self.ID} - {self.Nome}>'
