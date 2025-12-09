/**
 * Reusable UI Components
 */

const Components = {
    // Modal component
    modal(options) {
        const { title, content, actions = [], onClose, confirmText, onConfirm, cancelText = 'Annulla' } = options;
        
        // Build footer actions - support both array style and confirmText/onConfirm style
        let footerHtml = '';
        if (actions.length) {
            footerHtml = `<div class="modal-footer">${actions.join('')}</div>`;
        } else if (confirmText && onConfirm) {
            footerHtml = `
                <div class="modal-footer">
                    <button class="btn" data-action="cancel">${escapeHtml(cancelText)}</button>
                    <button class="btn btn-primary" data-action="confirm">${escapeHtml(confirmText)}</button>
                </div>
            `;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${escapeHtml(title)}</h3>
                    <button class="modal-close" type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">${content}</div>
                ${footerHtml}
            </div>
        `;
        
        // Close handlers
        const close = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
            if (onClose) onClose();
        };
        
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        
        // Handle confirmText/onConfirm style buttons
        const cancelBtn = overlay.querySelector('[data-action="cancel"]');
        const confirmBtn = overlay.querySelector('[data-action="confirm"]');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', close);
        }
        
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', async () => {
                await onConfirm();
                close();
            });
        }
        
        document.body.appendChild(overlay);
        
        return { element: overlay, close };
    },
    
    // Confirm modal
    confirm(message, title = 'Conferma') {
        return new Promise((resolve) => {
            const modal = this.modal({
                title,
                content: `<p>${escapeHtml(message)}</p>`,
                actions: [
                    '<button class="btn" data-action="cancel">Annulla</button>',
                    '<button class="btn btn-primary" data-action="confirm">Conferma</button>'
                ]
            });
            
            modal.element.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                modal.close();
                resolve(false);
            });
            
            modal.element.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                modal.close();
                resolve(true);
            });
        });
    },
    
    // Empty state
    emptyState(title, message, action = null) {
        // Icona SVG generica (box vuota)
        const defaultIcon = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
        `;
        
        // Genera l'HTML dell'azione se presente
        let actionHtml = '';
        if (action && action.text && action.action) {
            actionHtml = `<button class="btn btn-primary" onclick="${escapeHtml(action.action)}">${escapeHtml(action.text)}</button>`;
        }
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${defaultIcon}</div>
                <h3 class="empty-state-title">${escapeHtml(title)}</h3>
                <p class="empty-state-text">${escapeHtml(message)}</p>
                ${actionHtml}
            </div>
        `;
    },
    
    // Pagination - supports both (currentPage, totalPages, onPageChange) and 
    // (totalItems, currentPage, perPage, onPageChange) signatures
    pagination(arg1, arg2, arg3, arg4) {
        let currentPage, totalPages, onPageChange;
        
        // Detect which signature is being used
        if (typeof arg3 === 'function') {
            // Old signature: (currentPage, totalPages, onPageChange)
            currentPage = arg1;
            totalPages = arg2;
            onPageChange = arg3;
        } else if (typeof arg4 === 'function') {
            // New signature: (totalItems, currentPage, perPage, onPageChange)
            const totalItems = arg1;
            currentPage = arg2;
            const perPage = arg3;
            onPageChange = arg4;
            totalPages = Math.ceil(totalItems / perPage);
        } else {
            return '';
        }
        
        if (totalPages <= 1) return '';
        
        const pages = [];
        const maxVisible = 5;
        
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        const container = document.createElement('div');
        container.className = 'pagination';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.disabled = currentPage === 1;
        prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>';
        prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
        container.appendChild(prevBtn);
        
        // Page numbers
        for (let i = start; i <= end; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => onPageChange(i));
            container.appendChild(btn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>';
        nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
        container.appendChild(nextBtn);
        
        return container;
    },
    
    // Rating stars (interactive)
    // Returns HTML string when used for display, DOM element when interactive
    ratingStars(value = 0, interactive = false, onChange = null) {
        // If not interactive, return HTML string for template interpolation
        if (!interactive) {
            let html = '<div class="rating-stars">';
            for (let i = 1; i <= 5; i++) {
                const filled = i <= value;
                html += `
                    <span class="rating-star ${filled ? 'active' : ''}">
                        <svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </span>
                `;
            }
            html += '</div>';
            return html;
        }
        
        // Interactive version - returns DOM element
        const container = document.createElement('div');
        container.className = 'rating-stars';
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `rating-star-btn ${i <= value ? 'active' : ''}`;
            btn.dataset.value = i;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="${i <= value ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            `;
            
            if (interactive) {
                btn.addEventListener('click', () => {
                    const newValue = parseInt(btn.dataset.value);
                    container.querySelectorAll('.rating-star-btn').forEach((b, idx) => {
                        b.classList.toggle('active', idx < newValue);
                        b.querySelector('svg').setAttribute('fill', idx < newValue ? 'currentColor' : 'none');
                    });
                    if (onChange) onChange(newValue);
                });
            }
            
            container.appendChild(btn);
        }
        
        return container;
    },
    
    // Loading spinner
    loader(size = 'md') {
        return `<div class="loader loader-${size}"></div>`;
    }
};
