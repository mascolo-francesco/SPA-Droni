/**
 * Prodotti View - Product management for admins
 */

const ProdottiView = {
    currentPage: 1,
    perPage: 16,
    filters: {
        categoria: '',
        search: ''
    },
    categorie: [],
    
    // Render prodotti list
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Gestione Prodotti</h1>
                    <p class="page-subtitle">Visualizza e gestisci il catalogo prodotti</p>
                </div>
                <button class="btn btn-primary" onclick="ProdottiView.showCreateModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuovo Prodotto
                </button>
            </div>
            
            <div class="filters-bar">
                <div class="search-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="search-prodotti" placeholder="Cerca prodotti...">
                </div>
                <div class="filter-group">
                    <select id="filter-categoria" class="form-select">
                        <option value="">Tutte le categorie</option>
                    </select>
                </div>
            </div>
            
            <div class="prodotti-grid" id="prodotti-grid">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            </div>
            
            <div id="prodotti-pagination" class="pagination-wrapper"></div>
        `;
        
        await this.loadCategorie();
        this.setupFilters();
        await this.loadProdotti();
    },
    
    // Load categorie
    async loadCategorie() {
        try {
            this.categorie = await AdminAPI.getCategorie();
            const select = document.getElementById('filter-categoria');
            
            this.categorie.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categorie:', error);
        }
    },
    
    // Setup filters
    setupFilters() {
        const searchInput = document.getElementById('search-prodotti');
        const categoriaSelect = document.getElementById('filter-categoria');
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadProdotti();
            }, 300);
        });
        
        categoriaSelect.addEventListener('change', (e) => {
            this.filters.categoria = e.target.value;
            this.currentPage = 1;
            this.loadProdotti();
        });
    },
    
    // Load prodotti
    async loadProdotti() {
        const gridContainer = document.getElementById('prodotti-grid');
        const paginationContainer = document.getElementById('prodotti-pagination');
        
        try {
            const params = {
                page: this.currentPage,
                per_page: this.perPage
            };
            if (this.filters.categoria) params.categoria = this.filters.categoria;
            
            const response = await AdminAPI.getProdotti(params);
            let prodotti = response.items || response;
            
            // Filter by search locally
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                prodotti = prodotti.filter(p =>
                    p.nome.toLowerCase().includes(search) ||
                    (p.descrizione && p.descrizione.toLowerCase().includes(search))
                );
            }
            
            if (!prodotti || prodotti.length === 0) {
                gridContainer.innerHTML = Components.emptyState(
                    'Nessun prodotto trovato',
                    this.filters.search || this.filters.categoria 
                        ? 'Prova a modificare i filtri' 
                        : 'Aggiungi il primo prodotto',
                    { text: 'Nuovo Prodotto', action: 'ProdottiView.showCreateModal()' }
                );
                paginationContainer.innerHTML = '';
                return;
            }
            
            gridContainer.innerHTML = prodotti.map(p => this.renderProdottoCard(p)).join('');
            
            paginationContainer.innerHTML = Components.pagination(
                response.total || prodotti.length,
                this.currentPage,
                this.perPage,
                (page) => {
                    this.currentPage = page;
                    this.loadProdotti();
                }
            );
            
        } catch (error) {
            console.error('Error loading prodotti:', error);
            gridContainer.innerHTML = `
                <div class="error-state">
                    <p>Errore nel caricamento</p>
                    <button class="btn btn-secondary" onclick="ProdottiView.loadProdotti()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render prodotto card
    renderProdottoCard(prodotto) {
        return `
            <div class="prodotto-card prodotto-card-admin">
                <div class="prodotto-card-body">
                    <div class="prodotto-header">
                        <h3 class="prodotto-nome">${prodotto.nome}</h3>
                        ${prodotto.categoria ? `
                            <span class="prodotto-categoria">${prodotto.categoria}</span>
                        ` : ''}
                    </div>
                    
                    ${prodotto.descrizione ? `
                        <p class="prodotto-desc">${prodotto.descrizione}</p>
                    ` : ''}
                    
                    <div class="prodotto-price">
                        ${formatCurrency(prodotto.prezzo)}
                    </div>
                    
                    ${prodotto.disponibile !== undefined ? `
                        <span class="badge badge-${prodotto.disponibile ? 'success' : 'secondary'} badge-sm">
                            ${prodotto.disponibile ? 'Disponibile' : 'Non disponibile'}
                        </span>
                    ` : ''}
                </div>
                
                <div class="prodotto-card-footer">
                    <button class="btn btn-ghost btn-sm" onclick="ProdottiView.showEditModal(${JSON.stringify(prodotto).replace(/"/g, '&quot;')})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifica
                    </button>
                    <button class="btn btn-ghost btn-sm text-danger" onclick="ProdottiView.deleteProdotto(${prodotto.id})">
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
            <form id="prodotto-form">
                <div class="form-group">
                    <label class="form-label">Nome Prodotto</label>
                    <input type="text" id="prodotto-nome" class="form-input" placeholder="Es. Pizza Margherita" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <textarea id="prodotto-descrizione" class="form-textarea" rows="3" placeholder="Descrizione del prodotto..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Prezzo</label>
                        <input type="number" id="prodotto-prezzo" class="form-input" placeholder="9.99" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" id="prodotto-categoria" class="form-input" list="categorie-list" placeholder="Seleziona o crea">
                        <datalist id="categorie-list">
                            ${this.categorie.map(c => `<option value="${c}">`).join('')}
                        </datalist>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-checkbox">
                        <input type="checkbox" id="prodotto-disponibile" checked>
                        <span>Disponibile per la vendita</span>
                    </label>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Nuovo Prodotto',
            content,
            confirmText: 'Aggiungi',
            onConfirm: async () => {
                const data = {
                    nome: document.getElementById('prodotto-nome').value.trim(),
                    descrizione: document.getElementById('prodotto-descrizione').value.trim() || null,
                    prezzo: parseFloat(document.getElementById('prodotto-prezzo').value),
                    categoria: document.getElementById('prodotto-categoria').value.trim() || null,
                    disponibile: document.getElementById('prodotto-disponibile').checked
                };
                
                if (!data.nome) {
                    showToast('Inserisci il nome del prodotto', 'warning');
                    return;
                }
                
                if (isNaN(data.prezzo) || data.prezzo < 0) {
                    showToast('Inserisci un prezzo valido', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.createProdotto(data);
                    showToast('Prodotto aggiunto con successo', 'success');
                    
                    // Refresh categorie if new one was added
                    if (data.categoria && !this.categorie.includes(data.categoria)) {
                        this.categorie.push(data.categoria);
                    }
                    
                    this.loadProdotti();
                } catch (error) {
                    showToast(error.message || 'Errore nella creazione', 'error');
                }
            }
        });
    },
    
    // Show edit modal
    showEditModal(prodotto) {
        const content = `
            <form id="prodotto-form">
                <div class="form-group">
                    <label class="form-label">Nome Prodotto</label>
                    <input type="text" id="prodotto-nome" class="form-input" value="${prodotto.nome || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrizione</label>
                    <textarea id="prodotto-descrizione" class="form-textarea" rows="3">${prodotto.descrizione || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Prezzo</label>
                        <input type="number" id="prodotto-prezzo" class="form-input" value="${prodotto.prezzo || ''}" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" id="prodotto-categoria" class="form-input" list="categorie-list" value="${prodotto.categoria || ''}">
                        <datalist id="categorie-list">
                            ${this.categorie.map(c => `<option value="${c}">`).join('')}
                        </datalist>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-checkbox">
                        <input type="checkbox" id="prodotto-disponibile" ${prodotto.disponibile !== false ? 'checked' : ''}>
                        <span>Disponibile per la vendita</span>
                    </label>
                </div>
            </form>
        `;
        
        Components.modal({
            title: 'Modifica Prodotto',
            content,
            confirmText: 'Salva',
            onConfirm: async () => {
                const data = {
                    nome: document.getElementById('prodotto-nome').value.trim(),
                    descrizione: document.getElementById('prodotto-descrizione').value.trim() || null,
                    prezzo: parseFloat(document.getElementById('prodotto-prezzo').value),
                    categoria: document.getElementById('prodotto-categoria').value.trim() || null,
                    disponibile: document.getElementById('prodotto-disponibile').checked
                };
                
                if (!data.nome) {
                    showToast('Inserisci il nome del prodotto', 'warning');
                    return;
                }
                
                if (isNaN(data.prezzo) || data.prezzo < 0) {
                    showToast('Inserisci un prezzo valido', 'warning');
                    return;
                }
                
                try {
                    await AdminAPI.updateProdotto(prodotto.id, data);
                    showToast('Prodotto aggiornato con successo', 'success');
                    this.loadProdotti();
                } catch (error) {
                    showToast(error.message || 'Errore nell\'aggiornamento', 'error');
                }
            }
        });
    },
    
    // Delete prodotto
    async deleteProdotto(prodottoId) {
        const confirmed = await Components.confirm(
            'Eliminare questo prodotto?',
            'Questa azione non può essere annullata.'
        );
        
        if (!confirmed) return;
        
        try {
            await AdminAPI.deleteProdotto(prodottoId);
            showToast('Prodotto eliminato', 'success');
            this.loadProdotti();
        } catch (error) {
            showToast(error.message || 'Errore nell\'eliminazione', 'error');
        }
    }
};
