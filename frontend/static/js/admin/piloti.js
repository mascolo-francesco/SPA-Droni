/* ========================================================================
   File: piloti.js
   Modulo: admin
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Piloti View - Pilot management for admins
 */

const PilotiView = {
    currentPage: 1,
    perPage: 12,
    filters: {
        stato: ''
    },
    
    // Render piloti list
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestione Piloti</h1>
                    <p class="page-subtitle">Visualizza e gestisci i piloti</p>
                </div>
                <button class="btn btn-primary" onclick="PilotiView.showCreateModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuovo Pilota
                </button>
            </div>
            
            <div class="filters-bar">
                <div class="filter-group">
                    <select id="filter-stato" class="form-select">
                        <option value="">Tutti gli stati</option>
                        <option value="disponibile">Disponibile</option>
                        <option value="in_missione">In Missione</option>
                        <option value="non_disponibile">Non Disponibile</option>
                    </select>
                </div>
            </div>
            
            <div class="piloti-grid" id="piloti-grid">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <div id="piloti-pagination" class="pagination-wrapper"></div>
        `;
        
        this.setupFilters();
        await this.loadPiloti();
    },
    
    // Setup filters
    setupFilters() {
        const statoSelect = document.getElementById('filter-stato');
        
        statoSelect.addEventListener('change', (e) => {
            this.filters.stato = e.target.value;
            this.currentPage = 1;
            this.loadPiloti();
        });
    },
    
    // Load piloti
    async loadPiloti() {
        const gridContainer = document.getElementById('piloti-grid');
        const paginationContainer = document.getElementById('piloti-pagination');
        
        try {
            const params = {
                page: this.currentPage,
                per_page: this.perPage
            };
            if (this.filters.stato) params.stato = this.filters.stato;
            
            const response = await AdminAPI.getPiloti(params);
            const piloti = response.items || response;
            
            if (!piloti || piloti.length === 0) {
                gridContainer.innerHTML = Components.emptyState(
                    'Nessun pilota trovato',
                    this.filters.stato ? 'Prova a modificare i filtri' : 'Aggiungi il primo pilota',
                    { text: 'Nuovo Pilota', action: 'PilotiView.showCreateModal()' }
                );
                paginationContainer.innerHTML = '';
                return;
            }
            
            gridContainer.innerHTML = piloti.map(p => this.renderPilotaCard(p)).join('');
            
            paginationContainer.innerHTML = Components.pagination(
                response.total || piloti.length,
                this.currentPage,
                this.perPage,
                (page) => {
                    this.currentPage = page;
                    this.loadPiloti();
                }
            );
            
        } catch (error) {
            console.error('Error loading piloti:', error);
            gridContainer.innerHTML = `
                <div class="error-state">
                    <p>Errore nel caricamento</p>
                    <button class="btn btn-secondary" onclick="PilotiView.loadPiloti()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render pilota card
    renderPilotaCard(pilota) {
        const statoClasses = {
            'disponibile': 'success',
            'in_missione': 'primary',
            'non_disponibile': 'secondary'
        };
        
        const statoLabels = {
            'disponibile': 'Disponibile',
            'in_missione': 'In Missione',
            'non_disponibile': 'Non Disponibile'
        };
        
        const badgeClass = statoClasses[pilota.stato] || 'secondary';
        const badgeText = statoLabels[pilota.stato] || pilota.stato;
        
        return `
            <div class="pilota-card">
                <div class="pilota-card-header">
                    <div class="pilota-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <span class="badge badge-${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="pilota-card-body">
                    <h3 class="pilota-nome">${pilota.nome} ${pilota.cognome || ''}</h3>
                    
                    ${pilota.email ? `
                        <div class="pilota-email">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>${pilota.email}</span>
                        </div>
                    ` : ''}
                    
                    <div class="pilota-stats">
                        ${pilota.missioni_completate !== undefined ? `
                            <div class="pilota-stat">
                                <span class="stat-value">${pilota.missioni_completate}</span>
                                <span class="stat-label">Missioni</span>
                            </div>
                        ` : ''}
                        ${pilota.valutazione_media !== undefined ? `
                            <div class="pilota-stat">
                                <span class="stat-value">${pilota.valutazione_media.toFixed(1)}</span>
                                <span class="stat-label">Rating</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="pilota-card-footer">
                    <button class="btn btn-ghost btn-sm" onclick="PilotiView.showEditModal(${JSON.stringify(pilota).replace(/"/g, '&quot;')})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifica
                    </button>
                    <button class="btn btn-ghost btn-sm text-danger" onclick="PilotiView.deletePilota(${pilota.id})">
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
            <form id="pilota-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome</label>
                        <input type="text" id="pilota-nome" class="form-input" placeholder="Nome" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cognome</label>
                        <input type="text" id="pilota-cognome" class="form-input" placeholder="Cognome">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="pilota-email" class="form-input" placeholder="email@esempio.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Telefono</label>
                    <input type="tel" id="pilota-telefono" class="form-input" placeholder="+39 333 1234567">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Stato</label>
                    <select id="pilota-stato" class="form-select">
                        <option value="disponibile">Disponibile</option>
                        <option value="non_disponibile">Non Disponibile</option>
                    </select>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Nuovo Pilota',
            content,
            confirmText: 'Aggiungi',
            onConfirm: async () => {
                const data = {
                    nome: document.getElementById('pilota-nome').value.trim(),
                    cognome: document.getElementById('pilota-cognome').value.trim() || null,
                    email: document.getElementById('pilota-email').value.trim() || null,
                    telefono: document.getElementById('pilota-telefono').value.trim() || null,
                    stato: document.getElementById('pilota-stato').value
                };
                
                if (!data.nome) {
                    showToast('Inserisci il nome del pilota', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.createPilota(data);
                    showToast('Pilota aggiunto con successo', 'success');
                    this.loadPiloti();
                } catch (error) {
                    showToast(error.message || 'Errore nella creazione', 'error');
                }
            }
        });
    },
    
    // Show edit modal
    showEditModal(pilota) {
        const content = `
            <form id="pilota-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome</label>
                        <input type="text" id="pilota-nome" class="form-input" value="${pilota.nome || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cognome</label>
                        <input type="text" id="pilota-cognome" class="form-input" value="${pilota.cognome || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="pilota-email" class="form-input" value="${pilota.email || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Telefono</label>
                    <input type="tel" id="pilota-telefono" class="form-input" value="${pilota.telefono || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Stato</label>
                    <select id="pilota-stato" class="form-select">
                        <option value="disponibile" ${pilota.stato === 'disponibile' ? 'selected' : ''}>Disponibile</option>
                        <option value="in_missione" ${pilota.stato === 'in_missione' ? 'selected' : ''}>In Missione</option>
                        <option value="non_disponibile" ${pilota.stato === 'non_disponibile' ? 'selected' : ''}>Non Disponibile</option>
                    </select>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Modifica Pilota',
            content,
            confirmText: 'Salva',
            onConfirm: async () => {
                const data = {
                    nome: document.getElementById('pilota-nome').value.trim(),
                    cognome: document.getElementById('pilota-cognome').value.trim() || null,
                    email: document.getElementById('pilota-email').value.trim() || null,
                    telefono: document.getElementById('pilota-telefono').value.trim() || null,
                    stato: document.getElementById('pilota-stato').value
                };
                
                if (!data.nome) {
                    showToast('Inserisci il nome del pilota', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.updatePilota(pilota.id, data);
                    showToast('Pilota aggiornato con successo', 'success');
                    this.loadPiloti();
                } catch (error) {
                    showToast(error.message || 'Errore nell\'aggiornamento', 'error');
                }
            }
        });
    },
    
    // Delete pilota
    async deletePilota(pilotaId) {
        const confirmed = await Components.confirm(
            'Eliminare questo pilota?',
            'Questa azione non può essere annullata.'
        );
        
        if (!confirmed) return;
        
        try {
            await AdminAPI.deletePilota(pilotaId);
            showToast('Pilota eliminato', 'success');
            this.loadPiloti();
        } catch (error) {
            showToast(error.message || 'Errore nell\'eliminazione', 'error');
        }
    }
};
