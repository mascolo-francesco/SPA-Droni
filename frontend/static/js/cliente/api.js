/* ========================================================================
   File: api.js
   Modulo: cliente
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Cliente API Module
 */

const ClienteAPI = {
    // Base fetch with error handling
    async request(endpoint, options = {}) {
        const url = `/api${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        const res = await fetch(url, config);
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.error || 'Errore API');
        }
        
        return data;
    },
    
    // Ordini
    async getOrdini(params = {}) {
        const qs = buildQueryString(params);
        return this.request(`/ordini${qs ? '?' + qs : ''}`);
    },
    
    async getOrdine(id) {
        return this.request(`/ordini/${id}`);
    },
    
    async getTracking(ordineId) {
        return this.request(`/ordini/${ordineId}/tracking`);
    },
    
    async createOrdine(data) {
        return this.request('/ordini', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // Missioni
    async getMissione(id) {
        return this.request(`/missioni/${id}`);
    },
    
    async addValutazione(missioneId, data) {
        return this.request(`/missioni/${missioneId}/valutazione`, {
            method: 'POST',
            body: JSON.stringify({ 
                valutazione: data.voto, 
                commento: data.commento 
            })
        });
    },
    
    // Prodotti
    async getProdotti(params = {}) {
        const qs = buildQueryString(params);
        return this.request(`/prodotti${qs ? '?' + qs : ''}`);
    },
    
    async searchProdotti(query) {
        return this.request(`/prodotti/search?q=${encodeURIComponent(query)}`);
    },
    
    async getCategorie() {
        return this.request('/prodotti/categorie');
    }
};
