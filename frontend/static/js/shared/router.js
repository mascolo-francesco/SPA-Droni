/**
 * Simple Hash-Based Router
 * Supporta container rendering, route dinamiche e navigazione SPA
 */

class Router {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.routes = {};
        this.defaultRoute = null;
        this.currentRoute = null;
        this.beforeHooks = [];
        
        window.addEventListener('hashchange', () => this.handleRoute());
    }
    
    // Get container element
    getContainer() {
        if (!this.container) {
            this.container = document.getElementById(this.containerId);
        }
        return this.container;
    }
    
    // Register route with handler that receives (container, params)
    addRoute(path, handler) {
        this.routes[path] = handler;
        return this;
    }
    
    // Legacy method - alias for addRoute
    on(path, handler) {
        return this.addRoute(path, handler);
    }
    
    // Set default route
    setDefault(path) {
        this.defaultRoute = path;
        return this;
    }
    
    // Before route change hook
    before(callback) {
        this.beforeHooks.push(callback);
        return this;
    }
    
    // Navigate to route
    navigate(path) {
        window.location.hash = path;
    }
    
    // Get current path from hash
    getPath() {
        const hash = window.location.hash.slice(1) || '';
        return hash.split('?')[0] || this.defaultRoute || '';
    }
    
    // Get query params
    getParams() {
        const hash = window.location.hash.slice(1) || '';
        const queryString = hash.split('?')[1] || '';
        const params = new URLSearchParams(queryString);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
    
    // Handle route change
    async handleRoute() {
        let path = this.getPath();
        const queryParams = this.getParams();
        
        // Use default route if path is empty
        if (!path && this.defaultRoute) {
            path = this.defaultRoute;
            // Update hash without triggering another handleRoute
            window.history.replaceState(null, '', '#' + path);
        }
        
        // Run before hooks
        for (const hook of this.beforeHooks) {
            const shouldContinue = await hook(path, queryParams);
            if (shouldContinue === false) return;
        }
        
        // Find matching route
        let handler = this.routes[path];
        let routeParams = {};
        
        // Check for dynamic routes (e.g., ordine/:id)
        if (!handler) {
            for (const [routePath, routeHandler] of Object.entries(this.routes)) {
                const match = this.matchRoute(routePath, path);
                if (match) {
                    handler = routeHandler;
                    routeParams = match;
                    break;
                }
            }
        }
        
        // 404 fallback
        if (!handler) {
            handler = this.routes['*'] || ((container) => {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>Pagina non trovata</h3>
                        <p>La pagina richiesta non esiste.</p>
                    </div>
                `;
            });
        }
        
        // Get container
        const container = this.getContainer();
        if (!container) {
            console.error('Router container not found:', this.containerId);
            return;
        }
        
        // Show loading state
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Caricamento...</p>
            </div>
        `;
        
        // Update active nav links
        this.updateNavLinks(path);
        
        // Execute handler with container and merged params
        this.currentRoute = path;
        try {
            await handler(container, { ...queryParams, ...routeParams });
        } catch (error) {
            console.error('Route handler error:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Errore</h3>
                    <p>Si è verificato un errore nel caricamento della pagina.</p>
                </div>
            `;
        }
    }
    
    // Match dynamic route (e.g., ordine/:id matches ordine/123)
    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        
        if (routeParts.length !== actualParts.length) return null;
        
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                const paramName = routeParts[i].slice(1);
                params[paramName] = actualParts[i];
            } else if (routeParts[i] !== actualParts[i]) {
                return null;
            }
        }
        
        return params;
    }
    
    // Update nav link active states
    updateNavLinks(path) {
        document.querySelectorAll('[data-route]').forEach(link => {
            const route = link.dataset.route;
            if (path === route || path.startsWith(route + '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Start router
    start() {
        // Handle initial route
        this.handleRoute();
    }
}
