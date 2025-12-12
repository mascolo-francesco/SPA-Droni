/* ========================================================================
   File: missioni.js
   Modulo: admin
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Missioni View - Mission management for admins
 */

const MissioniView = {
    currentPage: 1,
    perPage: 12,
    filters: {
        stato: ''
    },
    
    // Render missioni list
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestione Missioni</h1>
                    <p class="page-subtitle">Visualizza e gestisci le missioni di consegna</p>
                </div>
                <button class="btn btn-primary" onclick="MissioniView.showCreateModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuova Missione
                </button>
            </div>
            
            <div class="filters-bar">
                <div class="filter-group">
                    <select id="filter-stato" class="form-select">
                        <option value="">Tutti gli stati</option>
                        <option value="assegnata">Assegnata</option>
                        <option value="in_corso">In Corso</option>
                        <option value="completata">Completata</option>
                        <option value="annullata">Annullata</option>
                    </select>
                </div>
            </div>
            
            <div class="missioni-grid" id="missioni-grid">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <div id="missioni-pagination" class="pagination-wrapper"></div>
        `;
        
        this.setupFilters();
        await this.loadMissioni();
    },
    
    // Setup filters
    setupFilters() {
        const statoSelect = document.getElementById('filter-stato');
        
        statoSelect.addEventListener('change', (e) => {
            this.filters.stato = e.target.value;
            this.currentPage = 1;
            this.loadMissioni();
        });
    },
    
    // Load missioni
    async loadMissioni() {
        const gridContainer = document.getElementById('missioni-grid');
        const paginationContainer = document.getElementById('missioni-pagination');
        
        try {
            const params = {
                page: this.currentPage,
                per_page: this.perPage
            };
            if (this.filters.stato) params.stato = this.filters.stato;
            
            const response = await AdminAPI.getMissioni(params);
            const missioni = response.items || response;
            
            if (!missioni || missioni.length === 0) {
                gridContainer.innerHTML = Components.emptyState(
                    'Nessuna missione trovata',
                    this.filters.stato ? 'Prova a modificare i filtri' : 'Non ci sono missioni',
                    { text: 'Nuova Missione', action: 'MissioniView.showCreateModal()' }
                );
                paginationContainer.innerHTML = '';
                return;
            }
            
            gridContainer.innerHTML = missioni.map(m => this.renderMissioneCard(m)).join('');
            
            paginationContainer.innerHTML = Components.pagination(
                response.total || missioni.length,
                this.currentPage,
                this.perPage,
                (page) => {
                    this.currentPage = page;
                    this.loadMissioni();
                }
            );
            
        } catch (error) {
            console.error('Error loading missioni:', error);
            gridContainer.innerHTML = `
                <div class="error-state">
                    <p>Errore nel caricamento</p>
                    <button class="btn btn-secondary" onclick="MissioniView.loadMissioni()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render missione card
    renderMissioneCard(missione) {
        const statoClasses = {
            'assegnata': 'warning',
            'in_corso': 'primary',
            'completata': 'success',
            'annullata': 'danger'
        };
        
        const statoLabels = {
            'assegnata': 'Assegnata',
            'in_corso': 'In Corso',
            'completata': 'Completata',
            'annullata': 'Annullata'
        };
        
        const badgeClass = statoClasses[missione.stato] || 'secondary';
        const badgeText = statoLabels[missione.stato] || missione.stato;
        
        return `
            <div class="missione-card" onclick="AdminApp.navigate('missione/${missione.id}')">
                <div class="missione-card-header">
                    <span class="missione-id">#${missione.id}</span>
                    <span class="badge badge-${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="missione-card-body">
                    <div class="missione-detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        <span>Ordine #${missione.ordine_id || missione.ordine?.id || 'N/D'}</span>
                    </div>
                    
                    ${missione.pilota ? `
                        <div class="missione-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>${missione.pilota.nome} ${missione.pilota.cognome || ''}</span>
                        </div>
                    ` : ''}
                    
                    ${missione.drone ? `
                        <div class="missione-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            <span>${missione.drone.modello}</span>
                        </div>
                    ` : ''}
                    
                    ${missione.data_missione ? `
                        <div class="missione-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>${formatDateTime(missione.data_missione)}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${missione.valutazione ? `
                    <div class="missione-card-footer">
                        ${Components.ratingStars(missione.valutazione)}
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Render missione detail
    async renderDetail(container, missioneId) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Caricamento missione...</p>
            </div>
        `;
        
        try {
            const missione = await AdminAPI.getMissione(missioneId);
            
            const statoClasses = {
                'assegnata': 'warning',
                'in_corso': 'primary',
                'completata': 'success',
                'annullata': 'danger'
            };
            const badgeClass = statoClasses[missione.stato] || 'secondary';
            
            container.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <button class="btn-back" onclick="AdminApp.navigate('missioni')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <div>
                            <h1>Missione #${missione.id}</h1>
                            <span class="badge badge-${badgeClass} badge-lg">${missione.stato}</span>
                        </div>
                    </div>
                    <div class="page-actions">
                        ${missione.stato === 'assegnata' ? `
                            <button class="btn btn-primary" onclick="MissioniView.startMissione(${missione.id})">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Avvia Missione
                            </button>
                        ` : ''}
                        ${missione.stato === 'in_corso' ? `
                            <button class="btn btn-success" onclick="MissioniView.completeMissione(${missione.id})">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Completa Missione
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-card-header">
                            <h3>Dettagli Missione</h3>
                        </div>
                        <div class="detail-card-body">
                            <div class="detail-row">
                                <span class="detail-label">Ordine</span>
                                <span class="detail-value">
                                    <a href="#ordine/${missione.ordine_id}" onclick="AdminApp.navigate('ordine/${missione.ordine_id}'); return false;">
                                        #${missione.ordine_id}
                                    </a>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Data Missione</span>
                                <span class="detail-value">${formatDateTime(missione.data_missione)}</span>
                            </div>
                            ${missione.data_consegna ? `
                                <div class="detail-row">
                                    <span class="detail-label">Data Consegna</span>
                                    <span class="detail-value">${formatDateTime(missione.data_consegna)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <div class="detail-card-header">
                            <h3>Pilota Assegnato</h3>
                        </div>
                        <div class="detail-card-body">
                            ${missione.pilota ? `
                                <div class="detail-row">
                                    <span class="detail-label">Nome</span>
                                    <span class="detail-value">${missione.pilota.nome} ${missione.pilota.cognome || ''}</span>
                                </div>
                                ${missione.pilota.email ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Email</span>
                                        <span class="detail-value">${missione.pilota.email}</span>
                                    </div>
                                ` : ''}
                            ` : '<p class="text-muted">Nessun pilota assegnato</p>'}
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <div class="detail-card-header">
                            <h3>Drone Assegnato</h3>
                        </div>
                        <div class="detail-card-body">
                            ${missione.drone ? `
                                <div class="detail-row">
                                    <span class="detail-label">Modello</span>
                                    <span class="detail-value">${missione.drone.modello}</span>
                                </div>
                                ${missione.drone.autonomia ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Autonomia</span>
                                        <span class="detail-value">${missione.drone.autonomia} min</span>
                                    </div>
                                ` : ''}
                            ` : '<p class="text-muted">Nessun drone assegnato</p>'}
                        </div>
                    </div>
                    
                    ${missione.valutazione ? `
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <h3>Valutazione Cliente</h3>
                            </div>
                            <div class="detail-card-body">
                                <div class="detail-row">
                                    <span class="detail-label">Voto</span>
                                    <span class="detail-value">${Components.ratingStars(missione.valutazione)}</span>
                                </div>
                                ${missione.commento_valutazione ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Commento</span>
                                        <span class="detail-value">${missione.commento_valutazione}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading missione:', error);
            container.innerHTML = `
                <div class="error-state">
                    <h3>Missione non trovata</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="AdminApp.navigate('missioni')">
                        Torna alle missioni
                    </button>
                </div>
            `;
        }
    },
    
    // Show create missione modal
    async showCreateModal(ordineId = null) {
        // Load available resources
        let piloti = [], droni = [], ordini = [];
        
        try {
            [piloti, droni] = await Promise.all([
                AdminAPI.getPilotiDisponibili(),
                AdminAPI.getDroniDisponibili()
            ]);
            
            if (!ordineId) {
                const response = await AdminAPI.getOrdini({ stato: 'confermato' });
                ordini = response.items || response;
            }
        } catch (error) {
            showToast('Errore nel caricamento risorse', 'error');
            return;
        }
        
        const content = `
            <form id="missione-form">
                ${!ordineId ? `
                    <div class="form-group">
                        <label class="form-label">Ordine</label>
                        <select id="ordine-id" class="form-select" required>
                            <option value="">Seleziona ordine</option>
                            ${ordini.map(o => `
                                <option value="${o.id}">#${o.id} - ${o.indirizzo || 'N/D'}</option>
                            `).join('')}
                        </select>
                    </div>
                ` : `<input type="hidden" id="ordine-id" value="${ordineId}">`}
                
                <div class="form-group">
                    <label class="form-label">Pilota</label>
                    <select id="pilota-id" class="form-select" required>
                        <option value="">Seleziona pilota</option>
                        ${piloti.map(p => `
                            <option value="${p.id}">${p.nome} ${p.cognome || ''}</option>
                        `).join('')}
                    </select>
                    ${piloti.length === 0 ? '<span class="form-hint text-warning">Nessun pilota disponibile</span>' : ''}
                </div>
                
                <div class="form-group">
                    <label class="form-label">Drone</label>
                    <select id="drone-id" class="form-select" required>
                        <option value="">Seleziona drone</option>
                        ${droni.map(d => `
                            <option value="${d.id}">${d.modello}</option>
                        `).join('')}
                    </select>
                    ${droni.length === 0 ? '<span class="form-hint text-warning">Nessun drone disponibile</span>' : ''}
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Nuova Missione',
            content,
            confirmText: 'Crea Missione',
            onConfirm: async () => {
                const data = {
                    ordine_id: parseInt(document.getElementById('ordine-id').value),
                    id_pilota: parseInt(document.getElementById('pilota-id').value),
                    id_drone: parseInt(document.getElementById('drone-id').value)
                };
                
                if (!data.ordine_id || !data.id_pilota || !data.id_drone) {
                    showToast('Compila tutti i campi', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.createMissione(data);
                    showToast('Missione creata con successo', 'success');
                    
                    // Navigate to missions list
                    AdminApp.navigate('missioni');
                    this.loadMissioni();
                } catch (error) {
                    showToast(error.message || 'Errore nella creazione', 'error');
                }
            }
        });
    },
    
    // Start missione
    async startMissione(missioneId) {
        const confirmed = await Components.confirm(
            'Avviare la missione?',
            'La missione passerà allo stato "In Corso".'
        );
        
        if (!confirmed) return;
        
        try {
            await AdminAPI.updateMissione(missioneId, { stato: 'in_corso' });
            showToast('Missione avviata', 'success');
            this.renderDetail(document.getElementById('main-content'), missioneId);
        } catch (error) {
            showToast(error.message || 'Errore', 'error');
        }
    },
    
    // Complete missione
    async completeMissione(missioneId) {
        const confirmed = await Components.confirm(
            'Completare la missione?',
            'La missione verrà segnata come completata.'
        );
        
        if (!confirmed) return;
        
        try {
            await AdminAPI.updateMissione(missioneId, { stato: 'completata' });
            showToast('Missione completata', 'success');
            this.renderDetail(document.getElementById('main-content'), missioneId);
        } catch (error) {
            showToast(error.message || 'Errore', 'error');
        }
    }
};
