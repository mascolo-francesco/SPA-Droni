/* ========================================================================
   File: droni.js
   Modulo: admin
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Droni View - Drone management for admins
 */

const DroniView = {
    currentPage: 1,
    perPage: 12,
    filters: {
        stato: ''
    },
    
    // Render droni list
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestione Droni</h1>
                    <p class="page-subtitle">Visualizza e gestisci la flotta di droni</p>
                </div>
                <button class="btn btn-primary" onclick="DroniView.showCreateModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuovo Drone
                </button>
            </div>
            
            <div class="filters-bar">
                <div class="filter-group">
                    <select id="filter-stato" class="form-select">
                        <option value="">Tutti gli stati</option>
                        <option value="disponibile">Disponibile</option>
                        <option value="in_missione">In Missione</option>
                        <option value="manutenzione">In Manutenzione</option>
                    </select>
                </div>
            </div>
            
            <div class="droni-grid" id="droni-grid">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <div id="droni-pagination" class="pagination-wrapper"></div>
        `;
        
        this.setupFilters();
        await this.loadDroni();
    },
    
    // Setup filters
    setupFilters() {
        const statoSelect = document.getElementById('filter-stato');
        
        statoSelect.addEventListener('change', (e) => {
            this.filters.stato = e.target.value;
            this.currentPage = 1;
            this.loadDroni();
        });
    },
    
    // Load droni
    async loadDroni() {
        const gridContainer = document.getElementById('droni-grid');
        const paginationContainer = document.getElementById('droni-pagination');
        
        try {
            const params = {
                page: this.currentPage,
                per_page: this.perPage
            };
            if (this.filters.stato) params.stato = this.filters.stato;
            
            const response = await AdminAPI.getDroni(params);
            const droni = response.items || response;
            
            if (!droni || droni.length === 0) {
                gridContainer.innerHTML = Components.emptyState(
                    'Nessun drone trovato',
                    this.filters.stato ? 'Prova a modificare i filtri' : 'Aggiungi il primo drone alla flotta',
                    { text: 'Nuovo Drone', action: 'DroniView.showCreateModal()' }
                );
                paginationContainer.innerHTML = '';
                return;
            }
            
            gridContainer.innerHTML = droni.map(d => this.renderDroneCard(d)).join('');
            
            paginationContainer.innerHTML = Components.pagination(
                response.total || droni.length,
                this.currentPage,
                this.perPage,
                (page) => {
                    this.currentPage = page;
                    this.loadDroni();
                }
            );
            
        } catch (error) {
            console.error('Error loading droni:', error);
            gridContainer.innerHTML = `
                <div class="error-state">
                    <p>Errore nel caricamento</p>
                    <button class="btn btn-secondary" onclick="DroniView.loadDroni()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render drone card
    renderDroneCard(drone) {
        const statoClasses = {
            'disponibile': 'success',
            'in_missione': 'primary',
            'manutenzione': 'warning'
        };
        
        const statoLabels = {
            'disponibile': 'Disponibile',
            'in_missione': 'In Missione',
            'manutenzione': 'Manutenzione'
        };
        
        const badgeClass = statoClasses[drone.stato] || 'secondary';
        const badgeText = statoLabels[drone.stato] || drone.stato;
        
        return `
            <div class="drone-card">
                <div class="drone-card-header">
                    <div class="drone-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span class="badge badge-${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="drone-card-body">
                    <h3 class="drone-modello">${drone.modello}</h3>
                    
                    <div class="drone-specs">
                        ${drone.autonomia ? `
                            <div class="drone-spec">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/>
                                    <line x1="23" y1="13" x2="23" y2="11"/>
                                </svg>
                                <span>${drone.autonomia} min</span>
                            </div>
                        ` : ''}
                        ${drone.capacita_carico ? `
                            <div class="drone-spec">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="1" y="3" width="15" height="13"/>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                    <circle cx="5.5" cy="18.5" r="2.5"/>
                                    <circle cx="18.5" cy="18.5" r="2.5"/>
                                </svg>
                                <span>${drone.capacita_carico} kg</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="drone-card-footer">
                    <button class="btn btn-ghost btn-sm" onclick="DroniView.showEditModal(${JSON.stringify(drone).replace(/"/g, '&quot;')})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifica
                    </button>
                    <button class="btn btn-ghost btn-sm text-danger" onclick="DroniView.deleteDrone(${drone.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Elimina
                    </button>
                </div>
            </div>
        `;
    },
    
    // Show create modal
    showCreateModal() {
        const content = `
            <form id="drone-form">
                <div class="form-group">
                    <label class="form-label">Modello</label>
                    <input type="text" id="drone-modello" class="form-input" placeholder="Es. DJI Mavic 3" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Autonomia (minuti)</label>
                        <input type="number" id="drone-autonomia" class="form-input" placeholder="45" min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacità Carico (kg)</label>
                        <input type="number" id="drone-capacita" class="form-input" placeholder="2.5" min="0" step="0.1">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Stato</label>
                    <select id="drone-stato" class="form-select">
                        <option value="disponibile">Disponibile</option>
                        <option value="manutenzione">In Manutenzione</option>
                    </select>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Nuovo Drone',
            content,
            confirmText: 'Aggiungi',
            onConfirm: async () => {
                const data = {
                    modello: document.getElementById('drone-modello').value.trim(),
                    autonomia: parseInt(document.getElementById('drone-autonomia').value) || null,
                    capacita_carico: parseFloat(document.getElementById('drone-capacita').value) || null,
                    stato: document.getElementById('drone-stato').value
                };
                
                if (!data.modello) {
                    showToast('Inserisci il modello del drone', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.createDrone(data);
                    showToast('Drone aggiunto con successo', 'success');
                    this.loadDroni();
                } catch (error) {
                    showToast(error.message || 'Errore nella creazione', 'error');
                }
            }
        });
    },
    
    // Show edit modal
    showEditModal(drone) {
        const content = `
            <form id="drone-form">
                <div class="form-group">
                    <label class="form-label">Modello</label>
                    <input type="text" id="drone-modello" class="form-input" value="${drone.modello || ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Autonomia (minuti)</label>
                        <input type="number" id="drone-autonomia" class="form-input" value="${drone.autonomia || ''}" min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacità Carico (kg)</label>
                        <input type="number" id="drone-capacita" class="form-input" value="${drone.capacita_carico || ''}" min="0" step="0.1">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Stato</label>
                    <select id="drone-stato" class="form-select">
                        <option value="disponibile" ${drone.stato === 'disponibile' ? 'selected' : ''}>Disponibile</option>
                        <option value="in_missione" ${drone.stato === 'in_missione' ? 'selected' : ''}>In Missione</option>
                        <option value="manutenzione" ${drone.stato === 'manutenzione' ? 'selected' : ''}>In Manutenzione</option>
                    </select>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Modifica Drone',
            content,
            confirmText: 'Salva',
            onConfirm: async () => {
                const data = {
                    modello: document.getElementById('drone-modello').value.trim(),
                    autonomia: parseInt(document.getElementById('drone-autonomia').value) || null,
                    capacita_carico: parseFloat(document.getElementById('drone-capacita').value) || null,
                    stato: document.getElementById('drone-stato').value
                };
                
                if (!data.modello) {
                    showToast('Inserisci il modello del drone', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.updateDrone(drone.id, data);
                    showToast('Drone aggiornato con successo', 'success');
                    this.loadDroni();
                } catch (error) {
                    showToast(error.message || 'Errore nell\'aggiornamento', 'error');
                }
            }
        });
    },
    
    // Delete drone
    async deleteDrone(droneId) {
        const confirmed = await Components.confirm(
            'Eliminare questo drone?',
            'Questa azione non può essere annullata.'
        );
        
        if (!confirmed) return;
        
        try {
            await AdminAPI.deleteDrone(droneId);
            showToast('Drone eliminato', 'success');
            this.loadDroni();
        } catch (error) {
            showToast(error.message || 'Errore nell\'eliminazione', 'error');
        }
    }
};
