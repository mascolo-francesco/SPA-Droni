/* ========================================================================
   File: app.js
   Modulo: admin
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Admin App - Main entry point
 */

const AdminApp = {
    router: null,
    
    // Initialize app
    async init() {
        // Check authentication
        const isAuth = await Auth.requireAdmin();
        
        if (!isAuth) {
            return;
        }
        
        // Get current user
        const user = Auth.getUser();
        
        // Verify user exists
        if (!user) {
            console.error('User data invalid');
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
        const userName = user?.nome || user?.email || 'Admin';
        
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        const dropdownNameEl = document.getElementById('dropdown-user-name');
        const dropdownEmailEl = document.getElementById('dropdown-user-email');
        
        if (userNameEl) userNameEl.textContent = userName;
        if (userEmailEl) userEmailEl.textContent = user.email;
        if (dropdownNameEl) dropdownNameEl.textContent = userName;
        if (dropdownEmailEl) dropdownEmailEl.textContent = user.email;
    },
    
    // Setup router
    setupRouter() {
        this.router = new Router('main-content');
        
        // Dashboard
        this.router.addRoute('dashboard', async (container) => {
            this.setActiveNav('dashboard');
            await DashboardView.render(container);
        });
        
        // Ordini
        this.router.addRoute('ordini', async (container) => {
            this.setActiveNav('ordini');
            await OrdiniAdminView.render(container);
        });
        
        this.router.addRoute('ordine/:id', async (container, params) => {
            this.setActiveNav('ordini');
            await OrdiniAdminView.renderDetail(container, params.id);
        });
        
        // Missioni
        this.router.addRoute('missioni', async (container) => {
            this.setActiveNav('missioni');
            await MissioniView.render(container);
        });
        
        this.router.addRoute('missione/:id', async (container, params) => {
            this.setActiveNav('missioni');
            await MissioniView.renderDetail(container, params.id);
        });
        
        // Droni
        this.router.addRoute('droni', async (container) => {
            this.setActiveNav('droni');
            await DroniView.render(container);
        });
        
        // Piloti
        this.router.addRoute('piloti', async (container) => {
            this.setActiveNav('piloti');
            await PilotiView.render(container);
        });
        
        // Prodotti
        this.router.addRoute('prodotti', async (container) => {
            this.setActiveNav('prodotti');
            await ProdottiView.render(container);
        });
        
        // Default route
        this.router.setDefault('dashboard');
    },
    
    // Setup navigation
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
    AdminApp.init();
});
