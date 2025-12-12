/* ========================================================================
   File: ordini.js
   Modulo: cliente
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Ordini Module - Order list and detail rendering
 */

const OrdiniView = {
    currentPage: 1,
    perPage: 10,
    filters: {
        stato: '',
        search: ''
    },
    
    // Render ordini list page
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>I Miei Ordini</h1>
                    <p class="page-subtitle">Gestisci e traccia i tuoi ordini</p>
                </div>
                <button class="btn btn-primary" onclick="ClienteApp.navigate('nuovo-ordine')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuovo Ordine
                </button>
            </div>
            
            <div class="filters-bar">
                <div class="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="search-ordini" placeholder="Cerca ordini...">
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
            
            <div id="ordini-list" class="ordini-grid">
                <div class="loading-skeleton">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            </div>
            
            <div id="ordini-pagination" class="pagination-wrapper"></div>
        `;
        
        // Setup event listeners
        this.setupFilters();
        
        // Load ordini
        await this.loadOrdini();
    },
    
    // Setup filter listeners
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
    
    // Load ordini from API
    async loadOrdini() {
        const listContainer = document.getElementById('ordini-list');
        const paginationContainer = document.getElementById('ordini-pagination');
        
        try {
            const params = {
                page: this.currentPage,
                per_page: this.perPage
            };
            
            if (this.filters.stato) params.stato = this.filters.stato;
            
            const response = await ClienteAPI.getOrdini(params);
            
            if (!response.items || response.items.length === 0) {
                listContainer.innerHTML = Components.emptyState(
                    'Nessun ordine trovato',
                    this.filters.stato || this.filters.search
                        ? 'Prova a modificare i filtri di ricerca'
                        : 'Inizia creando il tuo primo ordine',
                    !this.filters.stato && !this.filters.search
                        ? { text: 'Nuovo Ordine', action: "ClienteApp.navigate('nuovo-ordine')" }
                        : null
                );
                paginationContainer.innerHTML = '';
                return;
            }
            
            // Filter by search locally (API might not support it)
            let ordini = response.items;
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                ordini = ordini.filter(o => 
                    o.id.toString().includes(search) ||
                    (o.indirizzo && o.indirizzo.toLowerCase().includes(search))
                );
            }
            
            listContainer.innerHTML = ordini.map(ordine => this.renderOrdineCard(ordine)).join('');
            
            // Render pagination
            paginationContainer.innerHTML = Components.pagination(
                response.total,
                this.currentPage,
                this.perPage,
                (page) => {
                    this.currentPage = page;
                    this.loadOrdini();
                }
            );
            
        } catch (error) {
            console.error('Error loading ordini:', error);
            listContainer.innerHTML = `
                <div class="error-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Errore nel caricamento</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="OrdiniView.loadOrdini()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render single ordine card
    renderOrdineCard(ordine) {
        const statusBadge = getStatusBadge(ordine.stato);
        const canTrack = ['confermato', 'in_consegna'].includes(ordine.stato);
        const canRate = ordine.stato === 'consegnato' && !ordine.valutato;
        
        return `
            <div class="ordine-card" onclick="ClienteApp.navigate('ordine/${ordine.id}')">
                <div class="ordine-card-header">
                    <span class="ordine-id">#${ordine.id}</span>
                    <span class="badge badge-${statusBadge.class}">${statusBadge.text}</span>
                </div>
                
                <div class="ordine-card-body">
                    <div class="ordine-info">
                        <div class="ordine-info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>${ordine.indirizzo || 'Indirizzo non specificato'}</span>
                        </div>
                        <div class="ordine-info-row">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>${formatDateTime(ordine.data_ordine || ordine.creato_il)}</span>
                        </div>
                        ${ordine.totale ? `
                            <div class="ordine-info-row">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="1" x2="12" y2="23"/>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                                <span>${formatCurrency(ordine.totale)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="ordine-card-footer">
                    ${canTrack ? `
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); ClienteApp.navigate('tracking/${ordine.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                            </svg>
                            Traccia
                        </button>
                    ` : ''}
                    ${canRate ? `
                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); ClienteApp.navigate('valutazione/${ordine.missione_id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Valuta
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // Render ordine detail page
    async renderDetail(container, ordineId) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Caricamento ordine...</p>
            </div>
        `;
        
        try {
            const ordine = await ClienteAPI.getOrdine(ordineId);
            
            const statusBadge = getStatusBadge(ordine.stato);
            const canTrack = ['confermato', 'in_consegna'].includes(ordine.stato);
            const canRate = ordine.stato === 'consegnato' && ordine.missione && !ordine.missione.valutazione;
            
            container.innerHTML = `
                <div class="page-header">
                    <div class="page-title">
                        <button class="btn-back" onclick="ClienteApp.navigate('ordini')">
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
                        ${canTrack ? `
                            <button class="btn btn-primary" onclick="ClienteApp.navigate('tracking/${ordine.id}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                                </svg>
                                Traccia Consegna
                            </button>
                        ` : ''}
                        ${canRate ? `
                            <button class="btn btn-secondary" onclick="ClienteApp.navigate('valutazione/${ordine.missione.id}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                                Valuta
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-card-header">
                            <h3>Dettagli Ordine</h3>
                        </div>
                        <div class="detail-card-body">
                            <div class="detail-row">
                                <span class="detail-label">Data Ordine</span>
                                <span class="detail-value">${formatDateTime(ordine.data_ordine || ordine.creato_il)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Indirizzo Consegna</span>
                                <span class="detail-value">${ordine.indirizzo || 'Non specificato'}</span>
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
                                <h3>Informazioni Consegna</h3>
                            </div>
                            <div class="detail-card-body">
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
                                ${ordine.missione.data_consegna ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Consegnato il</span>
                                        <span class="detail-value">${formatDateTime(ordine.missione.data_consegna)}</span>
                                    </div>
                                ` : ''}
                                ${ordine.missione.valutazione ? `
                                    <div class="detail-row">
                                        <span class="detail-label">Valutazione</span>
                                        <span class="detail-value">
                                            ${Components.ratingStars(ordine.missione.valutazione)}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${ordine.timeline ? `
                    <div class="detail-card timeline-card">
                        <div class="detail-card-header">
                            <h3>Cronologia</h3>
                        </div>
                        <div class="detail-card-body">
                            <div class="timeline">
                                ${ordine.timeline.map((event, index) => `
                                    <div class="timeline-item ${index === 0 ? 'active' : ''}">
                                        <div class="timeline-marker"></div>
                                        <div class="timeline-content">
                                            <span class="timeline-title">${event.titolo}</span>
                                            <span class="timeline-time">${formatDateTime(event.data)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            `;
            
        } catch (error) {
            console.error('Error loading ordine:', error);
            container.innerHTML = `
                <div class="error-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Ordine non trovato</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="ClienteApp.navigate('ordini')">
                        Torna agli ordini
                    </button>
                </div>
            `;
        }
    }
};
