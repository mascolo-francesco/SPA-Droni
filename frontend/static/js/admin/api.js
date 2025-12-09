/**
 * Admin API Module - API wrapper for admin endpoints
 */

const AdminAPI = {
    baseUrl: '/api',
    
    // Generic request handler
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        };
        
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Errore di rete' }));
            throw new Error(error.message || `Errore ${response.status}`);
        }
        
        return response.json();
    },
    
    // Statistiche
    async getStatistiche() {
        return this.request('/stats/overview');
    },
    
    // Ordini
    async getOrdini(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/ordini${query ? `?${query}` : ''}`);
    },
    
    async getOrdine(id) {
        return this.request(`/ordini/${id}`);
    },
    
    async updateOrdineStato(id, stato) {
        return this.request(`/ordini/${id}`, {
            method: 'PUT',
            body: { stato }
        });
    },
    
    // Missioni
    async getMissioni(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/missioni${query ? `?${query}` : ''}`);
    },
    
    async getMissione(id) {
        return this.request(`/missioni/${id}`);
    },
    
    async createMissione(data) {
        return this.request('/missioni', {
            method: 'POST',
            body: data
        });
    },
    
    async updateMissione(id, data) {
        return this.request(`/missioni/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    
    // Droni
    async getDroni(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/droni${query ? `?${query}` : ''}`);
    },
    
    async getDrone(id) {
        return this.request(`/droni/${id}`);
    },
    
    async createDrone(data) {
        return this.request('/droni', {
            method: 'POST',
            body: data
        });
    },
    
    async updateDrone(id, data) {
        return this.request(`/droni/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    
    async deleteDrone(id) {
        return this.request(`/droni/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getDroniDisponibili() {
        return this.request('/droni/disponibili');
    },
    
    // Piloti
    async getPiloti(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/piloti${query ? `?${query}` : ''}`);
    },
    
    async getPilota(id) {
        return this.request(`/piloti/${id}`);
    },
    
    async createPilota(data) {
        return this.request('/piloti', {
            method: 'POST',
            body: data
        });
    },
    
    async updatePilota(id, data) {
        return this.request(`/piloti/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    
    async deletePilota(id) {
        return this.request(`/piloti/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getPilotiDisponibili() {
        return this.request('/piloti/disponibili');
    },
    
    // Prodotti
    async getProdotti(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/prodotti${query ? `?${query}` : ''}`);
    },
    
    async getProdotto(id) {
        return this.request(`/prodotti/${id}`);
    },
    
    async createProdotto(data) {
        return this.request('/prodotti', {
            method: 'POST',
            body: data
        });
    },
    
    async updateProdotto(id, data) {
        return this.request(`/prodotti/${id}`, {
            method: 'PUT',
            body: data
        });
    },
    
    async deleteProdotto(id) {
        return this.request(`/prodotti/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getCategorie() {
        return this.request('/prodotti/categorie');
    }
};
