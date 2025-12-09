#!/usr/bin/env python3
"""
Script per inizializzare il database con schema e seed data
"""
import os
import sys
from dotenv import load_dotenv
import pymysql
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
# Converti a formato pymysql: mysql://user:pass@host:port/dbname
db_url_pymysql = db_url.replace('mysql+pymysql://', 'mysql://')
parsed = urlparse(db_url_pymysql)

host = parsed.hostname
user = parsed.username
password = parsed.password
port = parsed.port or 3306
database = parsed.path.lstrip('/')

print(f"📊 Connessione al database: {host}:{port}/{database}")

try:
    # Connessione al database
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
    
    # Leggi e esegui schema.sql
    print("\n📝 Esecuzione schema.sql...")
    schema_path = os.path.join(basedir, 'database', 'schema.sql')
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = f.read()
    
    # Esegui ogni statement dello schema
    for statement in schema.split(';'):
        statement = statement.strip()
        if statement:
            try:
                cursor.execute(statement)
                print(f"  ✓ {statement[:60]}...")
            except Exception as e:
                print(f"  ⚠️  {statement[:60]}... → {str(e)[:100]}")
    
    connection.commit()
    
    # Leggi e esegui seed.sql
    print("\n🌱 Esecuzione seed.sql...")
    seed_path = os.path.join(basedir, 'database', 'seed.sql')
    with open(seed_path, 'r', encoding='utf-8') as f:
        seed = f.read()
    
    # Esegui ogni statement del seed
    for statement in seed.split(';'):
        statement = statement.strip()
        if statement:
            try:
                cursor.execute(statement)
                print(f"  ✓ Inserito/aggiornato")
            except Exception as e:
                if 'duplicate' not in str(e).lower():
                    print(f"  ⚠️  {str(e)[:100]}")
    
    connection.commit()
    
    print("\n✅ Database inizializzato con successo!")
    
    cursor.close()
    connection.close()
    
except pymysql.Error as e:
    print(f"❌ Errore di connessione: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Errore: {e}")
    sys.exit(1)
