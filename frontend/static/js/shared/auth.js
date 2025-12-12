/* ========================================================================
   File: auth.js
   Modulo: shared
   DroneDelivery SPA - JavaScript Module
   ======================================================================== */

/**
 * Authentication Module
 */

const Auth = {
    // Current user
    user: null,
    
    // Initialize auth
    async init() {
        // Verify session with server first
        try {
            const res = await fetch('/api/auth/check');
            const data = await res.json();
            
            if (!data.authenticated) {
                this.user = null;
                localStorage.removeItem('user');
                return false;
            }
            
            // Update user from server response
            this.user = {
                id: data.user_id,
                nome: data.nome,
                ruolo: data.ruolo
            };
            localStorage.setItem('user', JSON.stringify(this.user));
            return true;
        } catch (err) {
            console.error('Auth check failed:', err);
            this.user = null;
            localStorage.removeItem('user');
            return false;
        }
    },
    
    // Check if logged in
    isLoggedIn() {
        return this.user !== null;
    },
    
    // Get current user
    getUser() {
        return this.user;
    },
    
    // Get user role
    getRole() {
        return this.user?.ruolo || null;
    },
    
    // Check if admin
    isAdmin() {
        return this.getRole() === 'admin';
    },
    
    // Login
    async login(email, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            this.user = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        }
        
        return { success: false, error: data.error || 'Login fallito' };
    },
    
    // Logout
    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout error:', err);
        }
        
        this.user = null;
        localStorage.removeItem('user');
        window.location.href = '/';
    },
    
    // Register
    async register(nome, email, password) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, password })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            this.user = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        }
        
        return { success: false, error: data.error || 'Registrazione fallita' };
    },
    
    // Require auth (redirect if not logged in)
    async requireAuth() {
        const isAuth = await this.init();
        if (!isAuth) {
            window.location.href = '/';
            return false;
        }
        return true;
    },
    
    // Require admin role
    async requireAdmin() {
        const isAuth = await this.requireAuth();
        if (!isAuth) return false;
        
        if (!this.isAdmin()) {
            window.location.href = '/cliente';
            return false;
        }
        return true;
    }
};
