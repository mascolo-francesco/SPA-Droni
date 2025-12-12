"""
File __init__ del package models.

Questo file definisce l'interfaccia pubblica del package models, esportando
tutti i modelli SQLAlchemy utilizzati nell'applicazione. Importando da questo
file, altri moduli possono accedere ai modelli senza dover conoscere
la struttura interna del package.

Modelli esportati:
- Utente: Rappresenta gli utenti del sistema (clienti, admin, piloti)
- Pilota: Rappresenta i piloti che conducono i droni
- Drone: Rappresenta i droni per le consegne
- Prodotto: Rappresenta i prodotti disponibili per l'ordine
- Missione: Rappresenta le missioni di consegna assegnate ai droni
- Ordine: Rappresenta gli ordini effettuati dai clienti
- Contiene: Tabella associativa che collega Ordine e Prodotto (molti-a-molti)
- Traccia: Rappresenta i punti GPS del percorso dei droni durante le missioni

L'ordine degli import è importante per gestire correttamente le relazioni
tra i modelli (foreign keys).
"""

# Import dei modelli principali
from app.models.utente import Utente      # Modello utente con autenticazione
from app.models.pilota import Pilota      # Modello pilota
from app.models.drone import Drone        # Modello drone
from app.models.prodotto import Prodotto  # Modello prodotto
from app.models.missione import Missione  # Modello missione
from app.models.ordine import Ordine      # Modello ordine
from app.models.contiene import Contiene  # Tabella associativa ordine-prodotto
from app.models.traccia import Traccia    # Modello tracciamento GPS

# Definizione dei modelli esportati quando si fa "from app.models import *"
# Questo controlla quali simboli sono pubblici nel package
__all__ = [
    'Utente',
    'Pilota',
    'Drone',
    'Prodotto',
    'Missione',
    'Ordine',
    'Contiene',
    'Traccia'
]
