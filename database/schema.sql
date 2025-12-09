-- ============================================
-- SCHEMA DATABASE DRONI
-- ============================================

CREATE DATABASE IF NOT EXISTS Droni;
USE Droni;

-- ============================================
-- TABELLE BASE (Pilota, Drone, Utente, Prodotto)
-- ============================================

CREATE TABLE Pilota (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    Cognome VARCHAR(100),
    Turno VARCHAR(50),
    Brevetto VARCHAR(50)
);

CREATE TABLE Drone (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Modello VARCHAR(100),
    Capacita DECIMAL(10,2),
    Batteria INT
);

CREATE TABLE Utente (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    Mail VARCHAR(100),
    Password VARCHAR(255),
    Ruolo VARCHAR(50)
);

CREATE TABLE Prodotto (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    peso DECIMAL(10,2),
    categoria VARCHAR(50)
);

-- ============================================
-- TABELLA MISSIONE
-- ============================================
CREATE TABLE Missione (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DataMissione DATE,
    Ora TIME,
    LatPrelievo DECIMAL(10,8),
    LongPrelievo DECIMAL(11,8),
    LatConsegna DECIMAL(10,8),
    LongConsegna DECIMAL(11,8),
    Valutazione INT,
    Commento VARCHAR(255),
    IdDrone INT,
    IdPilota INT,
    Stato VARCHAR(50),
    FOREIGN KEY (IdDrone) REFERENCES Drone(ID),
    FOREIGN KEY (IdPilota) REFERENCES Pilota(ID)
);

-- ============================================
-- TABELLA ORDINE
-- ============================================
CREATE TABLE Ordine (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(50),
    PesoTotale DECIMAL(10,2),
    Orario DATETIME,
    IndirizzoDestinazione VARCHAR(255),
    ID_Missione INT,
    ID_Utente INT,
    FOREIGN KEY (ID_Missione) REFERENCES Missione(ID),
    FOREIGN KEY (ID_Utente) REFERENCES Utente(ID)
);

-- ============================================
-- TABELLA CONTIENE (ORDINE-PRODOTTO)
-- ============================================
CREATE TABLE Contiene (
    ID_Prodotto INT,
    ID_Ordine INT,
    Quantità INT,
    PRIMARY KEY (ID_Prodotto, ID_Ordine),
    FOREIGN KEY (ID_Prodotto) REFERENCES Prodotto(ID),
    FOREIGN KEY (ID_Ordine) REFERENCES Ordine(ID)
);

-- ============================================
-- TABELLA TRACCIA (COORDINATE DRONI)
-- ============================================
CREATE TABLE Traccia (
    ID_Drone INT,
    ID_Missione INT,
    Latitudine DECIMAL(10,8),
    Longitudine DECIMAL(11,8),
    TIMESTAMP DATETIME,
    PRIMARY KEY (ID_Drone, ID_Missione, TIMESTAMP),
    FOREIGN KEY (ID_Drone) REFERENCES Drone(ID),
    FOREIGN KEY (ID_Missione) REFERENCES Missione(ID)
);
