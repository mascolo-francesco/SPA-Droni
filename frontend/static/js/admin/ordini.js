/* ========================================================================
   File: ordini.js
   Modulo: admin
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Ordini Admin View - Order management for admins
 */

const OrdiniAdminView = {
    currentPage: 1,
    perPage: 15,
    filters: {
        stato: '',
        search: ''
    },
    
    // Render ordini list
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestione Ordini</h1>
                    <p class="page-subtitle">Visualizza e gestisci tutti gli ordini</p>
                </div>
            </div>
            
            <div class="filters-bar">
                <div class="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="search-ordini" placeholder="Cerca per ID o cliente...">
                </div>
                <div class="filter-group">
                    <select id="filter-stato" class="form-select">
                        <option value="">Tutti gli stati</option>
                        <option value="in_attesa">In Attesa</option>
                        <option value="confermato">Confermato</option>
                        <option value="in_consegna">In Consegna</option>
                        <option value="consegnato">Consegnato</option>
                        <option value="annullato">Annullato</option>
                    </select>
                </div>
            </div>
            
            <div class="table-container" id="ordini-table">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <div id="ordini-pagination" class="pagination-wrapper"></div>
        `;
        
        this.setupFilters();
        await this.loadOrdini();
    },
    
    // Setup filters
    setupFilters() {
        const searchInput = document.getElementById('search-ordini');
        const statoSelect = document.getElementById('filter-stato');
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadOrdini();
            }, 300);
        });
        
        statoSelect.addEventListener('change', (e) => {
            this.filters.stato = e.target.value;
            this.currentPage = 1;
            this.loadOrdini();
        });
    },
    
    // Load ordini
    async loadOrdini() {
        const tableContainer = document.getElementById('ordini-table');
        const paginationContainer = document.getElementById('ordini-pagination');
        
        try {
            const params = {
                page: this.currentPage,
                per_page: this.perPage
            };
            if (this.filters.stato) params.stato = this.filters.stato;
            
            const response = await AdminAPI.getOrdini(params);
            const ordini = response.items || response;
            
            if (!ordini || ordini.length === 0) {
                tableContainer.innerHTML = Components.emptyState(
                    'Nessun ordine trovato',
                    'Prova a modificare i filtri di ricerca',
                    null
                );
                paginationContainer.innerHTML = '';
                return;
            }
            
            // Filter by search locally
            let filtered = ordini;
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                filtered = ordini.filter(o =>
                    o.id.toString().includes(search) ||
                    (o.cliente?.nome && o.cliente.nome.toLowerCase().includes(search)) ||
                    (o.utente?.email && o.utente.email.toLowerCase().includes(search))
                );
            }
            
            tableContainer.innerHTML = `
                <table class="data-table data-table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Indirizzo</th>
                            <th>Stato</th>
                            <th>Data</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(ordine => this.renderOrdineRow(ordine)).join('')}
                    </tbody>
                </table>
            `;
            
            paginationContainer.innerHTML = Components.pagination(
                response.total || filtered.length,
                this.currentPage,
                this.perPage,
                (page) => {
                    this.currentPage = page;
                    this.loadOrdini();
                }
            );
            
        } catch (error) {
            console.error('Error loading ordini:', error);
            tableContainer.innerHTML = `
                <div class="error-state">
                    <p>Errore nel caricamento degli ordini</p>
                    <button class="btn btn-secondary" onclick="OrdiniAdminView.loadOrdini()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render ordine row
    renderOrdineRow(ordine) {
        const statusBadge = getStatusBadge(ordine.stato);
        return `
            <tr onclick="AdminApp.navigate('ordine/${ordine.id}')" style="cursor: pointer;">
                <td><span class="order-id">#${ordine.id}</span></td>
                <td>${ordine.cliente?.nome || ordine.utente?.email || 'N/D'}</td>
                <td class="truncate" style="max-width: 200px;">${ordine.indirizzo || 'N/D'}</td>
                <td><span class="badge badge-${statusBadge.class}">${statusBadge.text}</span></td>
                <td>${formatDateTime(ordine.data_ordine || ordine.creato_il)}</td>
                <td>
                    <div class="table-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-ghost btn-sm" onclick="OrdiniAdminView.showStatusModal(${ordine.id}, '${ordine.stato}')" title="Cambia stato">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },
    
    // Render ordine detail
    async renderDetail(container, ordineId) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Caricamento ordine...</p>
            </div>
        `;
        
        try {
            const ordine = await AdminAPI.getOrdine(ordineId);
            const statusBadge = getStatusBadge(ordine.stato);
            
            container.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <button class="btn-back" onclick="AdminApp.navigate('ordini')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <div>
                            <h1>Ordine #${ordine.id}</h1>
                            <span class="badge badge-${statusBadge.class} badge-lg">${statusBadge.text}</span>
                        </div>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="OrdiniAdminView.showStatusModal(${ordine.id}, '${ordine.stato}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Cambia Stato
                        </button>
                        ${!ordine.missione && ordine.stato !== 'annullato' ? `
                            <button class="btn btn-primary" onclick="MissioniView.showCreateModal(${ordine.id})">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                                </svg>
                                Assegna Missione
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-card-header">
                            <h3>Informazioni Ordine</h3>
                        </div>
                        <div class="detail-card-body">
                            <div class="detail-row">
                                <span class="detail-label">Cliente</span>
                                <span class="detail-value">${ordine.cliente?.nome || ordine.utente?.email || 'N/D'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Indirizzo</span>
                                <span class="detail-value">${ordine.indirizzo || 'N/D'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Data Ordine</span>
                                <span class="detail-value">${formatDateTime(ordine.data_ordine || ordine.creato_il)}</span>
                            </div>
                            ${ordine.note ? `
                                <div class="detail-row">
                                    <span class="detail-label">Note</span>
                                    <span class="detail-value">${ordine.note}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${ordine.prodotti && ordine.prodotti.length > 0 ? `
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <h3>Prodotti</h3>
                            </div>
                            <div class="detail-card-body">
                                <div class="products-list">
                                    ${ordine.prodotti.map(p => `
                                        <div class="product-item">
                                            <div class="product-info">
                                                <span class="product-name">${p.nome}</span>
                                                <span class="product-qty">x${p.quantita}</span>
                                            </div>
                                            <span class="product-price">${formatCurrency(p.prezzo * p.quantita)}</span>
                                        </div>
                                    `).join('')}
                                </div>
                                ${ordine.totale ? `
                                    <div class="products-total">
                                        <span>Totale</span>
                                        <span>${formatCurrency(ordine.totale)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${ordine.missione ? `
                        <div class="detail-card">
                            <div class="detail-card-header">
                                <h3>Missione Associata</h3>
                            </div>
                            <div class="detail-card-body">
                                <div class="detail-row">
                                    <span class="detail-label">ID Missione</span>
                                    <span class="detail-value">
                                        <a href="#missione/${ordine.missione.id}" onclick="AdminApp.navigate('missione/${ordine.missione.id}'); return false;">
                                            #${ordine.missione.id}
                                        </a>
                                    </span>
                                </div>
                                ${ordine.missione.pilota ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Pilota</span>
                                        <span class="detail-value">${ordine.missione.pilota.nome} ${ordine.missione.pilota.cognome}</span>
                                    </div>
                                ` : ''}
                                ${ordine.missione.drone ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Drone</span>
                                        <span class="detail-value">${ordine.missione.drone.modello}</span>
                                    </div>
                                ` : ''}
                                ${ordine.missione.valutazione ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Valutazione</span>
                                        <span class="detail-value">${Components.ratingStars(ordine.missione.valutazione)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading ordine:', error);
            container.innerHTML = `
                <div class="error-state">
                    <h3>Ordine non trovato</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="AdminApp.navigate('ordini')">
                        Torna agli ordini
                    </button>
                </div>
            `;
        }
    },
    
    // Show status change modal
    showStatusModal(ordineId, currentStato) {
        const stati = [
            { value: 'in_attesa', label: 'In Attesa' },
            { value: 'confermato', label: 'Confermato' },
            { value: 'in_consegna', label: 'In Consegna' },
            { value: 'consegnato', label: 'Consegnato' },
            { value: 'annullato', label: 'Annullato' }
        ];
        
        const content = `
            <form id="status-form">
                <div class="form-group">
                    <label class="form-label">Nuovo Stato</label>
                    <select id="nuovo-stato" class="form-select" required>
                        ${stati.map(s => `
                            <option value="${s.value}" ${s.value === currentStato ? 'selected' : ''}>
                                ${s.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Cambia Stato Ordine',
            content,
            confirmText: 'Aggiorna',
            onConfirm: async () => {
                const nuovoStato = document.getElementById('nuovo-stato').value;
                
                try {
                    await AdminAPI.updateOrdineStato(ordineId, nuovoStato);
                    showToast('Stato aggiornato con successo', 'success');
                    
                    // Refresh current view
                    const currentHash = window.location.hash.slice(1);
                    if (currentHash.startsWith('ordine/')) {
                        this.renderDetail(document.getElementById('main-content'), ordineId);
                    } else {
                        this.loadOrdini();
                    }
                } catch (error) {
                    showToast(error.message || 'Errore nell\'aggiornamento', 'error');
                }
            }
        });
    }
};
