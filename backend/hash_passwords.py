#!/usr/bin/env python3
"""
Script per hashare le password degli utenti nel database
"""
import os
import sys
from dotenv import load_dotenv
import pymysql
from werkzeug.security import generate_password_hash
from urllib.parse import urlparse

# Carica variabili d'ambiente
basedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(basedir, 'backend', '.env'))

# Parsing della DATABASE_URL
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("❌ DATABASE_URL non trovata nel file .env")
    sys.exit(1)

# Parse URL nel formato: mysql+pymysql://user:pass@host:port/dbname
db_url_pymysql = db_url.replace('mysql+pymysql://', 'mysql://')
parsed = urlparse(db_url_pymysql)

host = parsed.hostname
user = parsed.username
password = parsed.password
port = parsed.port or 3306
database = parsed.path.lstrip('/')

print(f"🔐 Hashando password degli utenti...")

try:
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port,
        database=database,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        ssl_verify_cert=False,
        ssl_verify_identity=False
    )
    
    cursor = connection.cursor()
    
    # Seleziona tutti gli utenti
    cursor.execute("SELECT ID, Password FROM Utente")
    utenti = cursor.fetchall()
    
    for utente in utenti:
        user_id = utente['ID']
        old_password = utente['Password']
        
        # Genera hash della password
        password_hash = generate_password_hash(old_password)
        
        # Aggiorna il database
        cursor.execute(
            "UPDATE Utente SET Password = %s WHERE ID = %s",
            (password_hash, user_id)
        )
        print(f"  ✓ Utente {user_id}: password hashata")
    
    connection.commit()
    
    print("\n✅ Tutte le password sono state hashate con successo!")
    print("\n📝 Credenziali di accesso:")
    print("   Email: mario.rossi@mail.com")
    print("   Password: pass123")
    
    cursor.close()
    connection.close()
    
except Exception as e:
    print(f"❌ Errore: {e}")
    sys.exit(1)
