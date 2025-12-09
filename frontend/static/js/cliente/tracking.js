/**
 * Tracking Module - Live tracking with polling
 */

const TrackingView = {
    map: null,
    ordineId: null,
    pollingInterval: null,
    pollingDelay: 3000, // 3 seconds
    lastUpdate: null,
    
    // Render tracking page
    async render(container, ordineId) {
        this.ordineId = ordineId;
        
        container.innerHTML = `
            <div class="tracking-layout">
                <aside class="tracking-sidebar">
                    <div class="tracking-header">
                        <button class="btn-back" onclick="ClienteApp.navigate('ordine/${ordineId}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                        <div>
                            <h2>Tracking Ordine</h2>
                            <span class="tracking-order-id">#${ordineId}</span>
                        </div>
                    </div>
                    
                    <div id="tracking-info" class="tracking-info">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                    
                    <div class="tracking-actions">
                        <button class="btn btn-secondary btn-block" onclick="TrackingView.centerOnDrone()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            Centra su Drone
                        </button>
                        <button class="btn btn-ghost btn-block" onclick="TrackingView.refreshTracking()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            Aggiorna
                        </button>
                    </div>
                </aside>
                
                <main class="tracking-map-container">
                    <div id="tracking-map" class="tracking-map"></div>
                    
                    <div class="tracking-status-bar" id="tracking-status-bar">
                        <div class="status-indicator live">
                            <span class="status-dot"></span>
                            <span>In attesa...</span>
                        </div>
                        <span class="last-update" id="last-update"></span>
                    </div>
                </main>
            </div>
        `;
        
        // Initialize map
        setTimeout(() => {
            this.map = Mappa.init('tracking-map');
            this.loadTracking();
        }, 100);
    },
    
    // Load tracking data
    async loadTracking() {
        try {
            const data = await ClienteAPI.getTracking(this.ordineId);
            
            // Update map
            this.map.setTracking(data);
            
            // Update info panel
            this.updateInfoPanel(data);
            
            // Update status bar
            this.updateStatusBar(data);
            
            // Start polling if in progress
            if (data.stato === 'in_consegna' || data.stato === 'in_corso') {
                this.startPolling();
            } else {
                this.stopPolling();
            }
            
        } catch (error) {
            console.error('Error loading tracking:', error);
            document.getElementById('tracking-info').innerHTML = `
                <div class="tracking-error">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p>Impossibile caricare il tracking</p>
                    <button class="btn btn-secondary btn-sm" onclick="TrackingView.loadTracking()">
                        Riprova
                    </button>
                </div>
            `;
        }
    },
    
    // Update info panel
    updateInfoPanel(data) {
        const infoContainer = document.getElementById('tracking-info');
        const statusBadge = getStatusBadge(data.stato);
        
        infoContainer.innerHTML = `
            <div class="tracking-status">
                <span class="badge badge-${statusBadge.class} badge-lg">${statusBadge.text}</span>
            </div>
            
            ${data.eta ? `
                <div class="tracking-eta">
                    <div class="eta-label">Tempo stimato di arrivo</div>
                    <div class="eta-value">${data.eta}</div>
                </div>
            ` : ''}
            
            <div class="tracking-details">
                ${data.drone ? `
                    <div class="tracking-detail-item">
                        <div class="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <span class="detail-title">Drone</span>
                            <span class="detail-text">${data.drone.modello || 'N/D'}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${data.pilota ? `
                    <div class="tracking-detail-item">
                        <div class="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <span class="detail-title">Pilota</span>
                            <span class="detail-text">${data.pilota.nome} ${data.pilota.cognome}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${data.distanza ? `
                    <div class="tracking-detail-item">
                        <div class="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="19" x2="12" y2="5"/>
                                <polyline points="5 12 12 5 19 12"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <span class="detail-title">Distanza</span>
                            <span class="detail-text">${data.distanza}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${data.altitudine ? `
                    <div class="tracking-detail-item">
                        <div class="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
                                <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                                <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
                                <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
                                <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
                                <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
                                <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/>
                                <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <span class="detail-title">Altitudine</span>
                            <span class="detail-text">${data.altitudine}m</span>
                        </div>
                    </div>
                ` : ''}
                
                ${data.velocita ? `
                    <div class="tracking-detail-item">
                        <div class="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="detail-content">
                            <span class="detail-title">Velocità</span>
                            <span class="detail-text">${data.velocita} km/h</span>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${data.pickup && data.destinazione ? `
                <div class="tracking-route">
                    <div class="route-point route-pickup">
                        <div class="route-marker"></div>
                        <div class="route-info">
                            <span class="route-label">Ritiro</span>
                            <span class="route-address">${data.pickup.indirizzo || 'Punto di ritiro'}</span>
                        </div>
                    </div>
                    <div class="route-line"></div>
                    <div class="route-point route-destination">
                        <div class="route-marker"></div>
                        <div class="route-info">
                            <span class="route-label">Consegna</span>
                            <span class="route-address">${data.destinazione.indirizzo || 'Destinazione'}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    },
    
    // Update status bar
    updateStatusBar(data) {
        const statusBar = document.getElementById('tracking-status-bar');
        const lastUpdateEl = document.getElementById('last-update');
        
        const isLive = data.stato === 'in_consegna' || data.stato === 'in_corso';
        
        statusBar.querySelector('.status-indicator').className = `status-indicator ${isLive ? 'live' : 'idle'}`;
        statusBar.querySelector('.status-indicator span:last-child').textContent = isLive ? 'Live' : 'Completato';
        
        this.lastUpdate = new Date();
        lastUpdateEl.textContent = `Ultimo aggiornamento: ${formatTime(this.lastUpdate)}`;
    },
    
    // Start polling for updates
    startPolling() {
        if (this.pollingInterval) return;
        
        this.pollingInterval = setInterval(async () => {
            try {
                const data = await ClienteAPI.getTracking(this.ordineId);
                
                // Update drone position
                if (data.posizione_attuale) {
                    this.map.updateDronePosition(
                        data.posizione_attuale.lat,
                        data.posizione_attuale.lng
                    );
                    
                    // Add to route
                    this.map.addRoutePoint(
                        data.posizione_attuale.lat,
                        data.posizione_attuale.lng
                    );
                }
                
                // Update info panel
                this.updateInfoPanel(data);
                
                // Update status bar
                this.updateStatusBar(data);
                
                // Stop polling if completed
                if (data.stato !== 'in_consegna' && data.stato !== 'in_corso') {
                    this.stopPolling();
                    showToast('Consegna completata!', 'success');
                }
                
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, this.pollingDelay);
    },
    
    // Stop polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },
    
    // Center map on drone
    centerOnDrone() {
        if (this.map) {
            this.map.centerOnDrone();
        }
    },
    
    // Manual refresh
    async refreshTracking() {
        await this.loadTracking();
        showToast('Tracking aggiornato', 'success');
    },
    
    // Cleanup on leave
    destroy() {
        this.stopPolling();
        if (this.map && this.map.map) {
            this.map.map.remove();
        }
        this.map = null;
        this.ordineId = null;
    }
};
