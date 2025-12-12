/* ========================================================================
   File: dashboard.js
   Modulo: admin
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Dashboard View - Admin dashboard with stats and overview
 */

const DashboardView = {
    // Render dashboard
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h1>Dashboard</h1>
                    <p class="page-subtitle">Panoramica del sistema</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="DashboardView.refresh()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"/>
                            <polyline points="1 20 1 14 7 14"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Aggiorna
                    </button>
                </div>
            </div>
            
            <div class="stats-grid" id="stats-grid">
                <div class="loading-skeleton">
                    <div class="skeleton-stat"></div>
                    <div class="skeleton-stat"></div>
                    <div class="skeleton-stat"></div>
                    <div class="skeleton-stat"></div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Ordini Recenti</h3>
                        <a href="#ordini" class="btn btn-ghost btn-sm" onclick="AdminApp.navigate('ordini')">
                            Vedi tutti
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </a>
                    </div>
                    <div class="card-body" id="recent-ordini">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Missioni in Corso</h3>
                        <a href="#missioni" class="btn btn-ghost btn-sm" onclick="AdminApp.navigate('missioni')">
                            Vedi tutte
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </a>
                    </div>
                    <div class="card-body" id="active-missioni">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadData();
    },
    
    // Load all dashboard data
    async loadData() {
        await Promise.all([
            this.loadStatistiche(),
            this.loadRecentOrdini(),
            this.loadActiveMissioni()
        ]);
    },
    
    // Refresh dashboard
    async refresh() {
        showToast('Aggiornamento in corso...', 'info');
        await this.loadData();
        showToast('Dashboard aggiornata', 'success');
    },
    
    // Load statistiche
    async loadStatistiche() {
        const container = document.getElementById('stats-grid');
        
        try {
            const stats = await AdminAPI.getStatistiche();
            this.renderStatsCards(container, stats);
        } catch (error) {
            console.error('Error loading stats:', error);
            container.innerHTML = `
                <div class="error-message">
                    Errore nel caricamento delle statistiche
                </div>
            `;
        }
    },
    
    // Render stats cards
    renderStatsCards(container, stats) {
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon stat-icon-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${stats.ordini_totali || 0}</span>
                    <span class="stat-label">Ordini Totali</span>
                </div>
                ${stats.ordini_oggi ? `<span class="stat-trend trend-up">+${stats.ordini_oggi} oggi</span>` : ''}
            </div>
            
            <div class="stat-card">
                <div class="stat-icon stat-icon-warning">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${stats.missioni_attive || 0}</span>
                    <span class="stat-label">Missioni Attive</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon stat-icon-success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${stats.droni_disponibili || 0}/${stats.droni_totali || 0}</span>
                    <span class="stat-label">Droni Disponibili</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon stat-icon-info">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${stats.piloti_disponibili || 0}/${stats.piloti_totali || 0}</span>
                    <span class="stat-label">Piloti Disponibili</span>
                </div>
            </div>
        `;
    },
    
    // Load recent ordini
    async loadRecentOrdini() {
        const container = document.getElementById('recent-ordini');
        
        try {
            const response = await AdminAPI.getOrdini({ per_page: 5 });
            const ordini = response.items || response;
            
            if (!ordini || ordini.length === 0) {
                container.innerHTML = Components.emptyState(
                    'Nessun ordine',
                    'Non ci sono ordini recenti',
                    null
                );
                return;
            }
            
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Stato</th>
                            <th>Data</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordini.map(ordine => this.renderOrdineRow(ordine)).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error loading ordini:', error);
            container.innerHTML = `
                <div class="error-message">Errore nel caricamento</div>
            `;
        }
    },
    
    // Render ordine row
    renderOrdineRow(ordine) {
        const statusBadge = getStatusBadge(ordine.stato);
        return `
            <tr>
                <td><span class="order-id">#${ordine.id}</span></td>
                <td>${ordine.cliente?.nome || ordine.utente?.email || 'N/D'}</td>
                <td><span class="badge badge-${statusBadge.class}">${statusBadge.text}</span></td>
                <td>${formatDate(ordine.data_ordine || ordine.creato_il)}</td>
                <td>
                    <button class="btn btn-ghost btn-sm" onclick="AdminApp.navigate('ordine/${ordine.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    },
    
    // Load active missioni
    async loadActiveMissioni() {
        const container = document.getElementById('active-missioni');
        
        try {
            const response = await AdminAPI.getMissioni({ stato: 'in_corso', per_page: 5 });
            const missioni = response.items || response;
            
            if (!missioni || missioni.length === 0) {
                container.innerHTML = Components.emptyState(
                    'Nessuna missione attiva',
                    'Non ci sono missioni in corso',
                    null
                );
                return;
            }
            
            container.innerHTML = `
                <div class="missioni-list">
                    ${missioni.map(missione => this.renderMissioneItem(missione)).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Error loading missioni:', error);
            container.innerHTML = `
                <div class="error-message">Errore nel caricamento</div>
            `;
        }
    },
    
    // Render missione item
    renderMissioneItem(missione) {
        return `
            <div class="missione-item" onclick="AdminApp.navigate('missione/${missione.id}')">
                <div class="missione-info">
                    <span class="missione-id">#${missione.id}</span>
                    <span class="missione-ordine">Ordine #${missione.ordine_id || missione.ordine?.id || 'N/D'}</span>
                </div>
                <div class="missione-details">
                    ${missione.pilota ? `
                        <span class="missione-pilota">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            ${missione.pilota.nome}
                        </span>
                    ` : ''}
                    ${missione.drone ? `
                        <span class="missione-drone">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            ${missione.drone.modello}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }
};
