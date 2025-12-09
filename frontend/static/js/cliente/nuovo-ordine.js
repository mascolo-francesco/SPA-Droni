/**
 * Nuovo Ordine Module - Create new order
 */

const NuovoOrdineView = {
    cart: [],
    indirizzo: '',
    note: '',
    selectedCategoria: '',
    
    // Render nuovo ordine page
    async render(container) {
        this.cart = [];
        this.indirizzo = '';
        this.note = '';
        this.selectedCategoria = '';
        
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <button class="btn-back" onclick="ClienteApp.navigate('ordini')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <div>
                        <h1>Nuovo Ordine</h1>
                        <p class="page-subtitle">Seleziona i prodotti e inserisci l'indirizzo di consegna</p>
                    </div>
                </div>
            </div>
            
            <div class="nuovo-ordine-layout">
                <div class="prodotti-section">
                    <div class="section-header">
                        <h2>Prodotti Disponibili</h2>
                        <div class="prodotti-filters">
                            <div class="search-box">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input type="text" id="search-prodotti" placeholder="Cerca prodotti...">
                            </div>
                            <select id="filter-categoria" class="form-select">
                                <option value="">Tutte le categorie</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="prodotti-grid" class="prodotti-grid">
                        <div class="loading-skeleton">
                            <div class="skeleton-card"></div>
                            <div class="skeleton-card"></div>
                            <div class="skeleton-card"></div>
                            <div class="skeleton-card"></div>
                        </div>
                    </div>
                </div>
                
                <aside class="cart-section">
                    <div class="cart-card">
                        <div class="cart-header">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="9" cy="21" r="1"/>
                                    <circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>
                                Carrello
                            </h3>
                            <span class="cart-count" id="cart-count">0</span>
                        </div>
                        
                        <div class="cart-items" id="cart-items">
                            <div class="cart-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="9" cy="21" r="1"/>
                                    <circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>
                                <p>Il carrello è vuoto</p>
                            </div>
                        </div>
                        
                        <div class="cart-form" id="cart-form" style="display: none;">
                            <div class="form-group">
                                <label for="indirizzo" class="form-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    Indirizzo di Consegna
                                </label>
                                <input 
                                    type="text" 
                                    id="indirizzo" 
                                    class="form-input" 
                                    placeholder="Via, numero civico, città..."
                                    required
                                >
                            </div>
                            <div class="form-group">
                                <label for="note" class="form-label">Note (opzionale)</label>
                                <textarea 
                                    id="note" 
                                    class="form-textarea" 
                                    rows="2" 
                                    placeholder="Istruzioni per la consegna..."
                                ></textarea>
                            </div>
                        </div>
                        
                        <div class="cart-footer">
                            <div class="cart-total">
                                <span>Totale</span>
                                <span id="cart-total">€ 0.00</span>
                            </div>
                            <button 
                                class="btn btn-primary btn-block" 
                                id="checkout-btn" 
                                disabled
                                onclick="NuovoOrdineView.checkout()"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                                </svg>
                                Conferma Ordine
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        `;
        
        // Setup listeners
        this.setupFilters();
        
        // Load data
        await Promise.all([
            this.loadCategorie(),
            this.loadProdotti()
        ]);
    },
    
    // Setup filter listeners
    setupFilters() {
        const searchInput = document.getElementById('search-prodotti');
        const categoriaSelect = document.getElementById('filter-categoria');
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.loadProdotti(e.target.value, this.selectedCategoria);
            }, 300);
        });
        
        categoriaSelect.addEventListener('change', (e) => {
            this.selectedCategoria = e.target.value;
            this.loadProdotti(searchInput.value, this.selectedCategoria);
        });
        
        // Address input
        document.getElementById('indirizzo').addEventListener('input', (e) => {
            this.indirizzo = e.target.value;
            this.updateCheckoutButton();
        });
        
        document.getElementById('note').addEventListener('input', (e) => {
            this.note = e.target.value;
        });
    },
    
    // Load categories
    async loadCategorie() {
        try {
            const categorie = await ClienteAPI.getCategorie();
            const select = document.getElementById('filter-categoria');
            
            categorie.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categorie:', error);
        }
    },
    
    // Load prodotti
    async loadProdotti(search = '', categoria = '') {
        const grid = document.getElementById('prodotti-grid');
        
        try {
            let prodotti;
            if (search) {
                prodotti = await ClienteAPI.searchProdotti(search);
            } else {
                const params = {};
                if (categoria) params.categoria = categoria;
                prodotti = await ClienteAPI.getProdotti(params);
            }
            
            // Handle response format (could be array or paginated object)
            const items = Array.isArray(prodotti) ? prodotti : (prodotti.items || []);
            
            if (items.length === 0) {
                grid.innerHTML = Components.emptyState(
                    'Nessun prodotto trovato',
                    'Prova a modificare i criteri di ricerca',
                    null
                );
                return;
            }
            
            grid.innerHTML = items.map(prodotto => this.renderProdottoCard(prodotto)).join('');
            
        } catch (error) {
            console.error('Error loading prodotti:', error);
            grid.innerHTML = `
                <div class="error-state">
                    <p>Errore nel caricamento dei prodotti</p>
                    <button class="btn btn-secondary btn-sm" onclick="NuovoOrdineView.loadProdotti()">Riprova</button>
                </div>
            `;
        }
    },
    
    // Render single prodotto card
    renderProdottoCard(prodotto) {
        const inCart = this.cart.find(p => p.id === prodotto.id);
        const qty = inCart ? inCart.quantita : 0;
        
        return `
            <div class="prodotto-card ${qty > 0 ? 'in-cart' : ''}">
                <div class="prodotto-info">
                    <h4 class="prodotto-nome">${prodotto.nome}</h4>
                    ${prodotto.descrizione ? `<p class="prodotto-desc">${prodotto.descrizione}</p>` : ''}
                    ${prodotto.categoria ? `<span class="prodotto-categoria">${prodotto.categoria}</span>` : ''}
                </div>
                <div class="prodotto-footer">
                    <span class="prodotto-prezzo">${formatCurrency(prodotto.prezzo)}</span>
                    <div class="prodotto-actions">
                        ${qty > 0 ? `
                            <button class="btn-qty" onclick="NuovoOrdineView.updateQuantity(${prodotto.id}, -1)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </button>
                            <span class="qty-value">${qty}</span>
                        ` : ''}
                        <button class="btn-qty btn-add" onclick="NuovoOrdineView.addToCart(${JSON.stringify(prodotto).replace(/"/g, '&quot;')})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Add prodotto to cart
    addToCart(prodotto) {
        const existing = this.cart.find(p => p.id === prodotto.id);
        
        if (existing) {
            existing.quantita++;
        } else {
            this.cart.push({
                ...prodotto,
                quantita: 1
            });
        }
        
        this.updateCart();
        this.loadProdotti(
            document.getElementById('search-prodotti').value,
            this.selectedCategoria
        );
    },
    
    // Update quantity
    updateQuantity(prodottoId, delta) {
        const item = this.cart.find(p => p.id === prodottoId);
        
        if (item) {
            item.quantita += delta;
            
            if (item.quantita <= 0) {
                this.cart = this.cart.filter(p => p.id !== prodottoId);
            }
        }
        
        this.updateCart();
        this.loadProdotti(
            document.getElementById('search-prodotti').value,
            this.selectedCategoria
        );
    },
    
    // Update cart UI
    updateCart() {
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        const cartForm = document.getElementById('cart-form');
        
        const totalItems = this.cart.reduce((sum, p) => sum + p.quantita, 0);
        const totalPrice = this.cart.reduce((sum, p) => sum + (p.prezzo * p.quantita), 0);
        
        cartCount.textContent = totalItems;
        cartTotal.textContent = formatCurrency(totalPrice);
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>Il carrello è vuoto</p>
                </div>
            `;
            cartForm.style.display = 'none';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.nome}</span>
                        <span class="cart-item-price">${formatCurrency(item.prezzo)} x ${item.quantita}</span>
                    </div>
                    <div class="cart-item-actions">
                        <button class="btn-qty-sm" onclick="NuovoOrdineView.updateQuantity(${item.id}, -1)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <span>${item.quantita}</span>
                        <button class="btn-qty-sm" onclick="NuovoOrdineView.updateQuantity(${item.id}, 1)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
            cartForm.style.display = 'block';
        }
        
        this.updateCheckoutButton();
    },
    
    // Update checkout button state
    updateCheckoutButton() {
        const btn = document.getElementById('checkout-btn');
        const indirizzo = document.getElementById('indirizzo').value.trim();
        
        btn.disabled = this.cart.length === 0 || !indirizzo;
    },
    
    // Checkout
    async checkout() {
        const btn = document.getElementById('checkout-btn');
        const indirizzo = document.getElementById('indirizzo').value.trim();
        const note = document.getElementById('note').value.trim();
        
        if (this.cart.length === 0) {
            showToast('Aggiungi almeno un prodotto al carrello', 'warning');
            return;
        }
        
        if (!indirizzo) {
            showToast('Inserisci l\'indirizzo di consegna', 'warning');
            return;
        }
        
        btn.disabled = true;
        btn.innerHTML = `
            <div class="spinner spinner-sm"></div>
            Elaborazione...
        `;
        
        try {
            const ordineData = {
                indirizzo,
                note: note || null,
                prodotti: this.cart.map(p => ({
                    id: p.id,
                    quantita: p.quantita
                }))
            };
            
            const result = await ClienteAPI.createOrdine(ordineData);
            
            showToast('Ordine creato con successo!', 'success');
            
            // Navigate to order detail
            ClienteApp.navigate(`ordine/${result.id}`);
            
        } catch (error) {
            console.error('Error creating ordine:', error);
            showToast(error.message || 'Errore nella creazione dell\'ordine', 'error');
            
            btn.disabled = false;
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Conferma Ordine
            `;
        }
    }
};
