/* ========================================================================
   File: app.js
   Modulo: cliente
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Cliente App - Main entry point
 */

const ClienteApp = {
    router: null,
    currentView: null,
    
    // Initialize app
    async init() {
        // Check authentication
        const isAuth = await Auth.requireAuth();
        
        if (!isAuth) {
            return;
        }
        
        // Get current user
        const user = Auth.getUser();
        
        // Verify user exists and has role
        if (!user || !user.ruolo) {
            console.error('User data invalid:', user);
            showToast('Errore dati utente', 'error');
            Auth.logout();
            return;
        }
        
        // Verify user is cliente - if admin, redirect to admin panel
        if (user.ruolo === 'admin') {
            window.location.href = '/admin';
            return;
        }
        
        if (user.ruolo !== 'cliente') {
            showToast('Accesso non autorizzato', 'error');
            Auth.logout();
            return;
        }
        
        // Update user info in header
        this.updateUserInfo(user);
        
        // Setup router
        this.setupRouter();
        
        // Setup navigation
        this.setupNavigation();
        
        // Start router
        this.router.start();
    },
    
    // Update user info in header
    updateUserInfo(user) {
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        
        if (userNameEl) {
            userNameEl.textContent = user.nome || user.email;
        }
        if (userEmailEl) {
            userEmailEl.textContent = user.email;
        }
    },
    
    // Setup router
    setupRouter() {
        this.router = new Router('main-content');
        
        // Define routes
        this.router.addRoute('ordini', async (container) => {
            this.setActiveNav('ordini');
            await OrdiniView.render(container);
        });
        
        this.router.addRoute('ordine/:id', async (container, params) => {
            this.setActiveNav('ordini');
            await OrdiniView.renderDetail(container, params.id);
        });
        
        this.router.addRoute('nuovo-ordine', async (container) => {
            this.setActiveNav('ordini');
            await NuovoOrdineView.render(container);
        });
        
        this.router.addRoute('tracking/:id', async (container, params) => {
            this.setActiveNav('ordini');
            // Cleanup previous tracking
            if (this.currentView === 'tracking') {
                TrackingView.destroy();
            }
            this.currentView = 'tracking';
            await TrackingView.render(container, params.id);
        });
        
        this.router.addRoute('valutazione/:id', async (container, params) => {
            this.setActiveNav('ordini');
            await ValutazioneView.render(container, params.id);
        });
        
        // Default route
        this.router.setDefault('ordini');
    },
    
    // Setup navigation listeners
    setupNavigation() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await Auth.logout();
                window.location.href = '/';
            });
        }
        
        // User menu toggle
        const userMenuBtn = document.querySelector('.user-menu-btn');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
            });
            
            document.addEventListener('click', () => {
                userDropdown.classList.remove('active');
            });
        }
        
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    },
    
    // Set active navigation item
    setActiveNav(route) {
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            if (item.dataset.route === route) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    // Navigate to route
    navigate(route) {
        // Cleanup current view if needed
        if (this.currentView === 'tracking' && !route.startsWith('tracking/')) {
            TrackingView.destroy();
            this.currentView = null;
        }
        
        this.router.navigate(route);
        
        // Close mobile menu
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ClienteApp.init();
});
