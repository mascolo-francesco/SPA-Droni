# Product Context - DroneDelivery SPA

## Perché Esiste Questo Progetto

DroneDelivery risponde all'esigenza di gestire un servizio di consegne sperimentali via drone in ambito urbano. L'azienda necessita di:

1. **Trasparenza per i clienti**: Sapere in ogni momento dove si trova il proprio pacco
2. **Controllo operativo**: I gestori devono monitorare flotta, piloti e missioni
3. **Tracciabilità completa**: Ogni movimento del drone viene registrato con coordinate GPS

## Problemi che Risolve

### Per i Clienti
| Problema | Soluzione |
|----------|-----------|
| "Dove è il mio pacco?" | Mappa interattiva con posizione live del drone |
| "Quando arriva?" | Stato ordine sempre visibile |
| "Come è andata?" | Sistema di valutazione post-consegna |

### Per gli Operatori
| Problema | Soluzione |
|----------|-----------|
| Gestione flotta dispersa | Dashboard centralizzata con tutti i droni |
| Assegnazione missioni | Sistema automatico che considera carico e autonomia |
| Analisi performance | Statistiche e KPI in tempo reale |

## Come Dovrebbe Funzionare

### Flusso Cliente

```
Login → Dashboard Ordini → Nuovo Ordine → Tracking Live → Valutazione
                ↓
         Dettaglio Ordine
                ↓
         Mappa con Percorso
```

### Flusso Admin

```
Login → Dashboard KPI → Gestione Entità
              ↓              ↓
         Statistiche    Droni/Piloti/Ordini/Missioni/Prodotti
```

## Esperienza Utente Target

### Cliente (SPA Cliente)
- **Semplicità**: Massimo 3 click per qualsiasi operazione
- **Real-time**: Aggiornamenti automatici senza refresh
- **Mobile-first**: Usabile da smartphone durante l'attesa

### Admin (SPA Admin)
- **Efficienza**: Vista tabellare con azioni rapide
- **Completezza**: Tutte le info necessarie in una schermata
- **Navigazione**: Tab per passare velocemente tra sezioni

## Aspettative di Design

Il design segue il tema **Industrial-Tech Minimal**:

- **Scuro**: Background `#1C1C1E` per ridurre affaticamento
- **Contrasto elevato**: Testo bianco su fondo scuro
- **Accenti blu**: Primary `#0A84FF` per azioni importanti
- **Icone Lucide**: Linguaggio visivo coerente e moderno
- **Spaziatura generosa**: Griglia 8px per ordine visivo

## Metriche di Successo UX

1. **Time to First Interaction**: < 2 secondi
2. **Task Completion Rate**: > 95% per ordine/tracking
3. **Errori di Navigazione**: 0 (routing chiaro)
4. **Accessibilità**: WCAG 2.1 AA compliant
