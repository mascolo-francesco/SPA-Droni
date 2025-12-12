"""
Script di avvio del server Flask.

Questo file è il punto di ingresso dell'applicazione backend.
Importa la factory function create_app dal modulo app e crea
un'istanza dell'applicazione Flask configurata.

Quando eseguito direttamente, avvia il server di sviluppo Flask
con le seguenti configurazioni:
- debug=True: Abilita la modalità debug con auto-reload e traceback dettagliati
- host='0.0.0.0': Rende l'app accessibile da tutti gli indirizzi di rete
- port=5000: Server in ascolto sulla porta 5000
"""

# Importa la factory function per creare l'applicazione Flask
from app import create_app

# Crea un'istanza dell'applicazione Flask chiamando la factory function
# Questa funzione configura il database, registra i blueprint, ecc.
app = create_app()

# Blocco eseguito solo quando lo script viene eseguito direttamente
# (non quando viene importato come modulo)
if __name__ == '__main__':
    # Avvia il server di sviluppo Flask
    # IMPORTANTE: Usare un server WSGI (gunicorn, uWSGI) in produzione
    app.run(debug=True, host='0.0.0.0', port=5000)
