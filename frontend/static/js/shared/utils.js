/**
 * Shared Utilities
 */

// API Base URL
const API_BASE = '/api';

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Format datetime
function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format time
function formatTime(timeStr) {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
}

// Format weight
function formatWeight(weight) {
    if (weight === null || weight === undefined) return '-';
    return `${parseFloat(weight).toFixed(2)} kg`;
}

// Format currency
function formatCurrency(value) {
    if (value === null || value === undefined) return '€ 0.00';
    return `€ ${parseFloat(value).toFixed(2)}`;
}

// Get status badge info object
function getStatusBadge(status) {
    const statusMap = {
        'richiesto': { text: 'Richiesto', class: '' },
        'in_attesa': { text: 'In Attesa', class: '' },
        'confermato': { text: 'Confermato', class: 'accent' },
        'assegnato': { text: 'Assegnato', class: 'accent' },
        'programmata': { text: 'Programmata', class: 'accent' },
        'in_consegna': { text: 'In Consegna', class: 'warning' },
        'in_corso': { text: 'In Corso', class: 'warning' },
        'consegnato': { text: 'Consegnato', class: 'success' },
        'completata': { text: 'Completata', class: 'success' },
        'annullata': { text: 'Annullata', class: 'danger' },
        'annullato': { text: 'Annullato', class: 'danger' }
    };
    
    return statusMap[status] || { text: status || 'N/D', class: '' };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show toast notification
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5s
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Show loading overlay
function showLoading(container) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loader loader-lg"></div>';
    container.style.position = 'relative';
    container.appendChild(overlay);
    return overlay;
}

// Hide loading overlay
function hideLoading(overlay) {
    if (overlay) overlay.remove();
}

// Confirm dialog
function confirmAction(message) {
    return new Promise((resolve) => {
        if (confirm(message)) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get user initial
function getUserInitial(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
}

// Parse query string
function parseQueryString() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Build query string
function buildQueryString(params) {
    return Object.entries(params)
        .filter(([_, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
}
