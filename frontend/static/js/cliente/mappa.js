/**
 * Mappa Module - Leaflet Integration
 */

const Mappa = {
    map: null,
    droneMarker: null,
    pickupMarker: null,
    destinationMarker: null,
    routeLine: null,
    completedLine: null,
    
    // Icons
    icons: {
        drone: null,
        pickup: null,
        destination: null
    },
    
    // Initialize map
    init(containerId) {
        // Create map
        this.map = L.map(containerId, {
            zoomControl: false
        }).setView([45.4642, 9.19], 13);
        
        // Add tile layer (dark theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
        
        // Add zoom control on right
        L.control.zoom({ position: 'topright' }).addTo(this.map);
        
        // Create custom icons
        this.createIcons();
        
        return this;
    },
    
    // Create custom icons
    createIcons() {
        // Drone icon
        this.icons.drone = L.divIcon({
            className: 'drone-marker in-flight',
            html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        // Pickup icon
        this.icons.pickup = L.divIcon({
            className: 'marker-pickup',
            html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        // Destination icon
        this.icons.destination = L.divIcon({
            className: 'marker-destination',
            html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    },
    
    // Set tracking data
    setTracking(data) {
        // Clear existing
        this.clear();
        
        if (!data) return;
        
        const { pickup, destinazione, percorso, posizione_attuale, stato } = data;
        
        // Add pickup marker
        if (pickup && pickup.lat && pickup.lng) {
            this.pickupMarker = L.marker([pickup.lat, pickup.lng], {
                icon: this.icons.pickup
            }).addTo(this.map);
            
            this.pickupMarker.bindPopup(`
                <div class="popup-content">
                    <div class="popup-title">Punto di Ritiro</div>
                </div>
            `);
        }
        
        // Add destination marker
        if (destinazione && destinazione.lat && destinazione.lng) {
            this.destinationMarker = L.marker([destinazione.lat, destinazione.lng], {
                icon: this.icons.destination
            }).addTo(this.map);
            
            this.destinationMarker.bindPopup(`
                <div class="popup-content">
                    <div class="popup-title">Destinazione</div>
                </div>
            `);
        }
        
        // Add route line
        if (percorso && percorso.length > 0) {
            const coords = percorso.map(p => [p.lat, p.lng]);
            
            // Completed path
            this.completedLine = L.polyline(coords, {
                color: '#30D158',
                weight: 4,
                opacity: 0.8
            }).addTo(this.map);
            
            // Remaining path (dashed)
            if (destinazione && destinazione.lat && posizione_attuale) {
                const remaining = [
                    [posizione_attuale.lat, posizione_attuale.lng],
                    [destinazione.lat, destinazione.lng]
                ];
                
                this.routeLine = L.polyline(remaining, {
                    color: '#0A84FF',
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '10, 10'
                }).addTo(this.map);
            }
        }
        
        // Add drone marker
        if (posizione_attuale && posizione_attuale.lat) {
            this.droneMarker = L.marker(
                [posizione_attuale.lat, posizione_attuale.lng],
                { icon: this.icons.drone }
            ).addTo(this.map);
            
            this.droneMarker.bindPopup(`
                <div class="popup-content">
                    <div class="popup-title">Drone in Volo</div>
                    <div class="popup-detail">
                        <span class="popup-detail-label">Stato</span>
                        <span class="popup-detail-value">${stato || 'In corso'}</span>
                    </div>
                </div>
            `);
        }
        
        // Fit bounds
        this.fitBounds();
    },
    
    // Update drone position
    updateDronePosition(lat, lng) {
        if (this.droneMarker) {
            this.droneMarker.setLatLng([lat, lng]);
        } else {
            this.droneMarker = L.marker([lat, lng], {
                icon: this.icons.drone
            }).addTo(this.map);
        }
    },
    
    // Add point to route
    addRoutePoint(lat, lng) {
        if (this.completedLine) {
            const latlngs = this.completedLine.getLatLngs();
            latlngs.push([lat, lng]);
            this.completedLine.setLatLngs(latlngs);
        }
    },
    
    // Fit bounds to show all markers
    fitBounds() {
        const bounds = [];
        
        if (this.pickupMarker) bounds.push(this.pickupMarker.getLatLng());
        if (this.destinationMarker) bounds.push(this.destinationMarker.getLatLng());
        if (this.droneMarker) bounds.push(this.droneMarker.getLatLng());
        
        if (bounds.length > 0) {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    },
    
    // Center on drone
    centerOnDrone() {
        if (this.droneMarker) {
            this.map.setView(this.droneMarker.getLatLng(), 15);
        }
    },
    
    // Clear all markers and lines
    clear() {
        if (this.droneMarker) {
            this.map.removeLayer(this.droneMarker);
            this.droneMarker = null;
        }
        if (this.pickupMarker) {
            this.map.removeLayer(this.pickupMarker);
            this.pickupMarker = null;
        }
        if (this.destinationMarker) {
            this.map.removeLayer(this.destinationMarker);
            this.destinationMarker = null;
        }
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }
        if (this.completedLine) {
            this.map.removeLayer(this.completedLine);
            this.completedLine = null;
        }
    },
    
    // Resize map
    resize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }
};
