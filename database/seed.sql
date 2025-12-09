-- ============================================
-- SCRIPT DI POPOLAMENTO DATABASE DRONI
-- ============================================
-- 5 Piloti, 10 Droni, 5 Utenti (Clienti)
-- 100 Prodotti specifici, 10 Ordini
-- 10 Missioni, Contenuti ordini e Tracce
-- ============================================

USE Droni;

-- ============================================
-- PILOTI (5)
-- ============================================
INSERT INTO Pilota (Nome, Cognome, Turno, Brevetto) VALUES
('Luca', 'Rossi', 'Mattina', 'A12345'),
('Marco', 'Bianchi', 'Pomeriggio', 'B23456'),
('Giulia', 'Verdi', 'Sera', 'C34567'),
('Anna', 'Neri', 'Mattina', 'D45678'),
('Paolo', 'Gialli', 'Pomeriggio', 'E56789');

-- ============================================
-- DRONI (10)
-- ============================================
INSERT INTO Drone (Modello, Capacita, Batteria) VALUES
('DJI Phantom 4', 2.50, 90),
('Parrot Anafi', 1.80, 75),
('DJI Mavic Air 2', 2.00, 85),
('Autel Evo II', 2.20, 70),
('Skydio 2', 1.90, 80),
('DJI Inspire 2', 3.00, 60),
('Yuneec Typhoon H', 2.60, 50),
('DJI Air 2S', 2.10, 95),
('PowerVision PowerEgg', 1.70, 65),
('Parrot Bebop 2', 1.60, 55);

-- ============================================
-- UTENTI CLIENTI (5)
-- ============================================
INSERT INTO Utente (Nome, Mail, Password, Ruolo) VALUES
('Mario Rossi', 'mario.rossi@mail.com', 'pass123', 'cliente'),
('Sara Bianchi', 'sara.bianchi@mail.com', 'pass123', 'cliente'),
('Giovanni Verdi', 'giovanni.verdi@mail.com', 'pass123', 'cliente'),
('Elena Neri', 'elena.neri@mail.com', 'pass123', 'cliente'),
('Francesco Gialli', 'francesco.gialli@mail.com', 'pass123', 'cliente');

-- ============================================
-- PRODOTTI (100)
-- ============================================
INSERT INTO Prodotto (nome, peso, categoria) VALUES
('Smartphone Samsung Galaxy A52', 0.185, 'Elettronica'),
('Cuffie Wireless Sony WH-1000XM4', 0.255, 'Elettronica'),
('Libro "Il Nome della Rosa" Umberto Eco', 0.580, 'Libri'),
('Zaino Scuola Estensibile', 0.850, 'Accessori'),
('Laptop Dell XPS 13', 1.340, 'Elettronica'),
('Power Bank 20000mAh', 0.365, 'Elettronica'),
('T-shirt Cotone Uomo', 0.220, 'Abbigliamento'),
('Orologio Digitale Casio', 0.165, 'Accessori'),
('Borsa Donna Pelle', 0.720, 'Accessori'),
('Scarpe Running Nike', 1.210, 'Calzature'),
('Mouse Wireless Logitech', 0.095, 'Elettronica'),
('Tastiera Meccanica RGB', 0.950, 'Elettronica'),
('Webcam Full HD 1080p', 0.185, 'Elettronica'),
('Cavo USB-C 2m', 0.045, 'Accessori'),
('Hub USB 7 porte', 0.280, 'Elettronica'),
('Scheda SD 128GB', 0.020, 'Elettronica'),
('Caricabatterie Rapido 65W', 0.180, 'Elettronica'),
('Custodia Tablet Universale', 0.350, 'Accessori'),
('Protezione Schermo Vetro', 0.030, 'Accessori'),
('Cover Silicone iPhone 14', 0.075, 'Accessori'),
('Jeans Blu Uomo', 0.650, 'Abbigliamento'),
('Felpa Sportiva Donna', 0.580, 'Abbigliamento'),
('Calzini Cotone Set 5 Paia', 0.150, 'Abbigliamento'),
('Cintura Pelle Marrone', 0.280, 'Accessori'),
('Sciarpa Lana Invernale', 0.320, 'Abbigliamento'),
('Cappotto Invernale Uomo', 2.100, 'Abbigliamento'),
('Occhiali da Sole UV400', 0.095, 'Accessori'),
('Zaino Fotografico', 1.200, 'Accessori'),
('Borraccia Termica 500ml', 0.450, 'Accessori'),
('Portafoglio RFID', 0.145, 'Accessori'),
('Libro "1984" George Orwell', 0.520, 'Libri'),
('Libro "Orgoglio e Pregiudizio" Jane Austen', 0.480, 'Libri'),
('Quaderno A4 200 Fogli', 0.380, 'Ufficio'),
('Penna Stilografica Parker', 0.035, 'Ufficio'),
('Set Matite Colorate 24 Pezzi', 0.420, 'Ufficio'),
('Evidenziatori Fluorescenti 4 Colori', 0.180, 'Ufficio'),
('Colla Stick 25g', 0.045, 'Ufficio'),
('Forbici Metallo', 0.195, 'Ufficio'),
('Nastro Adesivo Trasparente', 0.085, 'Ufficio'),
('Spillatrice Metallica', 0.320, 'Ufficio'),
('Staffe 26/6 Scatola 1000', 0.220, 'Ufficio'),
('Cartelle Sospese 10 Pezzi', 0.850, 'Ufficio'),
('Etichette Adesive A4', 0.095, 'Ufficio'),
('Post-it Gialli 100 Fogli', 0.055, 'Ufficio'),
('Correttore Bianchetto', 0.035, 'Ufficio'),
('Calendario da Parete 2025', 0.180, 'Ufficio'),
('Agenda Settimanale Nero', 0.280, 'Ufficio'),
('Lampada da Ufficio LED', 0.640, 'Illuminazione'),
('Lampada Tavolo Scrivania', 0.580, 'Illuminazione'),
('Bulb LED E27 11W', 0.065, 'Illuminazione'),
('Bulb LED GU10 5W', 0.050, 'Illuminazione'),
('Striscia LED RGB 5m', 0.420, 'Illuminazione'),
('Lampada Piantana', 2.100, 'Illuminazione'),
('Paralume Tessuto Bianco', 0.350, 'Illuminazione'),
('Accendino Ricaricabile USB', 0.120, 'Accessori'),
('Ombrello Pieghevole Nero', 0.380, 'Accessori'),
('Spazzolino Elettrico Sonic', 0.275, 'Igiene'),
('Dentifricio Menta 100ml', 0.145, 'Igiene'),
('Sapone Liquido 500ml', 0.520, 'Igiene'),
('Shampoo Delicato 250ml', 0.385, 'Igiene'),
('Balsamo Capelli 200ml', 0.310, 'Igiene'),
('Deodorante Spray 150ml', 0.210, 'Igiene'),
('Bagnoschiuma 300ml', 0.345, 'Igiene'),
('Asciugamano Spugna Cotone', 0.450, 'Casa'),
('Asciugamani Set 3 Pezzi', 1.200, 'Casa'),
('Lenzuola Cotone Bianche', 0.950, 'Casa'),
('Coperta Pile Calda', 1.850, 'Casa'),
('Cuscino Imbottitura Sintetica', 0.680, 'Casa'),
('Tappeto Soggiorno 120x180cm', 3.200, 'Casa'),
('Tovaglia Cotone Stampata', 0.520, 'Casa'),
('Tovaglioli Carta 100 Pezzi', 0.380, 'Casa'),
('Piatti Set 6 Pezzi', 1.950, 'Casa'),
('Bicchieri Vetro Set 6', 0.940, 'Casa'),
('Coltelli da Cucina Set', 0.850, 'Casa'),
('Padella Antiaderente 28cm', 1.240, 'Casa'),
('Pentola Acciaio Inox 5L', 2.150, 'Casa'),
('Mestolo Cucina Silicone', 0.185, 'Casa'),
('Spatola Metallo', 0.145, 'Casa'),
('Apriscatole Manuale', 0.195, 'Casa'),
('Grattugia Acciaio Inox', 0.280, 'Casa'),
('Tagliere Plastica', 0.420, 'Casa'),
('Pelapatate', 0.095, 'Casa'),
('Spremiagrumi Manuale', 0.380, 'Casa'),
('Termometro da Cucina', 0.065, 'Casa'),
('Bilancia Cucina Digitale', 0.890, 'Casa'),
('Spruzzatore Acqua Piante', 0.210, 'Giardino'),
('Guanti Giardinaggio', 0.135, 'Giardino'),
('Forbici Potatura', 0.320, 'Giardino'),
('Vanga Piccola', 1.840, 'Giardino'),
('Rastrello 10 Denti', 0.980, 'Giardino'),
('Corda Canapa 10m', 0.420, 'Giardino'),
('Concime Naturale 5kg', 2.100, 'Giardino'),
('Semi Pomodori Ciliegia', 0.035, 'Giardino'),
('Fertilizzante Liquido 1L', 0.980, 'Giardino'),
('Cartone Semina Biodegradabile', 0.180, 'Giardino'),
('Palla da Calcio Ufficiale', 0.450, 'Sport'),
('Racchetta Tennis Principianti', 0.385, 'Sport'),
('Palla da Tennis Set 3', 0.160, 'Sport'),
('Manubri Palestra 2x5kg', 10.500, 'Sport'),
('Corda per Saltare', 0.165, 'Sport'),
('Tappetino Yoga', 0.680, 'Sport'),
('Cintura Pesi Regolabile', 0.420, 'Sport');

-- ============================================
-- MISSIONI (10)
-- ============================================
INSERT INTO Missione (DataMissione, Ora, LatPrelievo, LongPrelievo, LatConsegna, LongConsegna, Valutazione, Commento, IdDrone, IdPilota, Stato) VALUES
('2025-11-19', '10:00', 45.4642, 9.1900, 45.4669, 9.1900, 8, 'Consegna puntuale', 1, 1, 'completata'),
('2025-11-19', '12:00', 45.4650, 9.1930, 45.4690, 9.1950, 9, 'Ottima gestione', 2, 2, 'completata'),
('2025-11-20', '09:30', 45.4700, 9.2000, 45.4720, 9.2050, 7, 'Leggero ritardo', 3, 3, 'completata'),
('2025-11-20', '14:00', 45.4730, 9.2080, 45.4750, 9.2100, 10, 'Eccellente', 4, 4, 'completata'),
('2025-11-21', '08:00', 45.4600, 9.1800, 45.4620, 9.1850, 6, NULL, 5, 5, 'completata'),
('2025-11-21', '16:00', 45.4640, 9.1880, 45.4665, 9.1920, 7, 'Buono', 6, 1, 'completata'),
('2025-11-22', '11:00', 45.4680, 9.1950, 45.4700, 9.1980, 5, 'Soddisfacente', 7, 2, 'completata'),
('2025-11-22', '13:00', 45.4710, 9.2030, 45.4730, 9.2050, 9, 'Perfetto', 8, 3, 'completata'),
('2025-11-23', '15:30', 45.4750, 9.2080, 45.4770, 9.2100, 8, 'Consegna OK', 9, 4, 'completata'),
('2025-11-23', '17:00', 45.4790, 9.2150, 45.4810, 9.2180, 7, 'Buono', 10, 5, 'completata');

-- ============================================
-- ORDINI (10)
-- ============================================
INSERT INTO Ordine (Tipo, PesoTotale, Orario, IndirizzoDestinazione, ID_Missione, ID_Utente) VALUES
('Standard', 1.35, '2025-11-19 10:05', 'Via Roma 45, Milano', 1, 1),
('Espresso', 0.90, '2025-11-19 12:10', 'Corso Como 12, Milano', 2, 2),
('Standard', 2.10, '2025-11-20 09:35', 'Piazza Duomo 8, Milano', 3, 3),
('Standard', 0.80, '2025-11-20 14:05', 'Via Torino 33, Milano', 4, 4),
('Espresso', 1.20, '2025-11-21 08:05', 'Via Manzoni 22, Milano', 5, 5),
('Standard', 1.75, '2025-11-21 16:10', 'Via Furini 7, Milano', 6, 1),
('Standard', 1.30, '2025-11-22 11:10', 'Via XX Settembre 15, Milano', 7, 2),
('Espresso', 0.95, '2025-11-22 13:15', 'Via Melchiorre Gioia 50, Milano', 8, 3),
('Standard', 1.60, '2025-11-23 15:35', 'Viale Monza 28, Milano', 9, 4),
('Espresso', 1.10, '2025-11-23 17:05', 'Via Volta 18, Milano', 10, 5);

-- ============================================
-- CONTIENE - ORDINE/PRODOTTO/QUANTITÀ
-- ============================================
INSERT INTO Contiene (ID_Prodotto, ID_Ordine, Quantità) VALUES
-- Ordine 1
(1, 1, 1),
(2, 1, 1),
-- Ordine 2
(3, 2, 2),
(5, 2, 1),
-- Ordine 3
(4, 3, 1),
(6, 3, 2),
(7, 3, 3),
-- Ordine 4
(8, 4, 1),
(9, 4, 1),
-- Ordine 5
(10, 5, 1),
(11, 5, 1),
(12, 5, 1),
-- Ordine 6
(13, 6, 1),
(14, 6, 2),
(15, 6, 1),
-- Ordine 7
(16, 7, 1),
(17, 7, 1),
(18, 7, 2),
-- Ordine 8
(19, 8, 3),
(20, 8, 1),
-- Ordine 9
(21, 9, 1),
(22, 9, 1),
(23, 9, 1),
-- Ordine 10
(24, 10, 1),
(25, 10, 1),
(26, 10, 1);

-- ============================================
-- TRACCIA - COORDINATE DRONI DURANTE MISSIONI
-- ============================================
INSERT INTO Traccia (ID_Drone, ID_Missione, Latitudine, Longitudine, TIMESTAMP) VALUES
-- Missione 1 - Drone 1
(1, 1, 45.4642, 9.1900, '2025-11-19 10:00:00'),
(1, 1, 45.4648, 9.1905, '2025-11-19 10:02:30'),
(1, 1, 45.4655, 9.1902, '2025-11-19 10:05:00'),
(1, 1, 45.4662, 9.1900, '2025-11-19 10:07:30'),
(1, 1, 45.4669, 9.1900, '2025-11-19 10:10:00'),
-- Missione 2 - Drone 2
(2, 2, 45.4650, 9.1930, '2025-11-19 12:00:00'),
(2, 2, 45.4660, 9.1935, '2025-11-19 12:03:00'),
(2, 2, 45.4670, 9.1940, '2025-11-19 12:06:00'),
(2, 2, 45.4680, 9.1945, '2025-11-19 12:09:00'),
(2, 2, 45.4690, 9.1950, '2025-11-19 12:12:00'),
-- Missione 3 - Drone 3
(3, 3, 45.4700, 9.2000, '2025-11-20 09:30:00'),
(3, 3, 45.4708, 9.2010, '2025-11-20 09:33:00'),
(3, 3, 45.4715, 9.2025, '2025-11-20 09:36:00'),
(3, 3, 45.4720, 9.2035, '2025-11-20 09:39:00'),
(3, 3, 45.4720, 9.2050, '2025-11-20 09:42:00'),
-- Missione 4 - Drone 4
(4, 4, 45.4730, 9.2080, '2025-11-20 14:00:00'),
(4, 4, 45.4738, 9.2085, '2025-11-20 14:02:30'),
(4, 4, 45.4745, 9.2090, '2025-11-20 14:05:00'),
(4, 4, 45.4750, 9.2095, '2025-11-20 14:07:30'),
(4, 4, 45.4750, 9.2100, '2025-11-20 14:10:00'),
-- Missione 5 - Drone 5
(5, 5, 45.4600, 9.1800, '2025-11-21 08:00:00'),
(5, 5, 45.4608, 9.1810, '2025-11-21 08:03:00'),
(5, 5, 45.4615, 9.1825, '2025-11-21 08:06:00'),
(5, 5, 45.4620, 9.1835, '2025-11-21 08:09:00'),
(5, 5, 45.4620, 9.1850, '2025-11-21 08:12:00'),
-- Missione 6 - Drone 6
(6, 6, 45.4640, 9.1880, '2025-11-21 16:00:00'),
(6, 6, 45.4648, 9.1890, '2025-11-21 16:02:30'),
(6, 6, 45.4655, 9.1905, '2025-11-21 16:05:00'),
(6, 6, 45.4660, 9.1912, '2025-11-21 16:07:30'),
(6, 6, 45.4665, 9.1920, '2025-11-21 16:10:00'),
-- Missione 7 - Drone 7
(7, 7, 45.4680, 9.1950, '2025-11-22 11:00:00'),
(7, 7, 45.4686, 9.1960, '2025-11-22 11:03:00'),
(7, 7, 45.4692, 9.1968, '2025-11-22 11:06:00'),
(7, 7, 45.4698, 9.1975, '2025-11-22 11:09:00'),
(7, 7, 45.4700, 9.1980, '2025-11-22 11:12:00'),
-- Missione 8 - Drone 8
(8, 8, 45.4710, 9.2030, '2025-11-22 13:00:00'),
(8, 8, 45.4717, 9.2035, '2025-11-22 13:02:30'),
(8, 8, 45.4723, 9.2040, '2025-11-22 13:05:00'),
(8, 8, 45.4727, 9.2045, '2025-11-22 13:07:30'),
(8, 8, 45.4730, 9.2050, '2025-11-22 13:10:00'),
-- Missione 9 - Drone 9
(9, 9, 45.4750, 9.2080, '2025-11-23 15:30:00'),
(9, 9, 45.4758, 9.2085, '2025-11-23 15:33:00'),
(9, 9, 45.4764, 9.2090, '2025-11-23 15:36:00'),
(9, 9, 45.4770, 9.2095, '2025-11-23 15:39:00'),
(9, 9, 45.4770, 9.2100, '2025-11-23 15:42:00'),
-- Missione 10 - Drone 10
(10, 10, 45.4790, 9.2150, '2025-11-23 17:00:00'),
(10, 10, 45.4798, 9.2158, '2025-11-23 17:03:00'),
(10, 10, 45.4804, 9.2165, '2025-11-23 17:06:00'),
(10, 10, 45.4810, 9.2175, '2025-11-23 17:09:00'),
(10, 10, 45.4810, 9.2180, '2025-11-23 17:12:00');

-- ============================================
-- FINE SCRIPT DI POPOLAMENTO
-- ============================================
-- Totale inserti:
-- Piloti: 5
-- Droni: 10
-- Utenti: 5
-- Prodotti: 100
-- Missioni: 10
-- Ordini: 10
-- Contiene: 26 record (relazioni prodotto-ordine)
-- Traccia: 50 record (coordinate GPS droni)
