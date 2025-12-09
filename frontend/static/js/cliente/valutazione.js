/**
 * Valutazione Module - Rating missions
 */

const ValutazioneView = {
    missioneId: null,
    rating: 0,
    
    // Render valutazione page
    async render(container, missioneId) {
        this.missioneId = missioneId;
        this.rating = 0;
        
        container.innerHTML = `
            <div class="valutazione-layout">
                <div class="valutazione-card">
                    <div class="valutazione-header">
                        <h2>Valuta la Consegna</h2>
                        <p>La tua opinione ci aiuta a migliorare il servizio</p>
                    </div>
                    
                    <div id="valutazione-content">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadMissione();
    },
    
    // Load missione data
    async loadMissione() {
        const contentContainer = document.getElementById('valutazione-content');
        
        try {
            const missione = await ClienteAPI.getMissione(this.missioneId);
            
            // Check if already rated
            if (missione.valutazione) {
                contentContainer.innerHTML = `
                    <div class="valutazione-completed">
                        <div class="completed-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h3>Già valutato</h3>
                        <p>Hai già valutato questa consegna</p>
                        <div class="existing-rating">
                            ${Components.ratingStars(missione.valutazione)}
                        </div>
                        <button class="btn btn-secondary" onclick="ClienteApp.navigate('ordini')">
                            Torna agli Ordini
                        </button>
                    </div>
                `;
                return;
            }
            
            contentContainer.innerHTML = `
                <div class="valutazione-summary">
                    ${missione.ordine ? `
                        <div class="summary-item">
                            <span class="summary-label">Ordine</span>
                            <span class="summary-value">#${missione.ordine.id}</span>
                        </div>
                    ` : ''}
                    ${missione.pilota ? `
                        <div class="summary-item">
                            <span class="summary-label">Pilota</span>
                            <span class="summary-value">${missione.pilota.nome} ${missione.pilota.cognome}</span>
                        </div>
                    ` : ''}
                    ${missione.drone ? `
                        <div class="summary-item">
                            <span class="summary-label">Drone</span>
                            <span class="summary-value">${missione.drone.modello}</span>
                        </div>
                    ` : ''}
                    ${missione.data_consegna ? `
                        <div class="summary-item">
                            <span class="summary-label">Consegnato il</span>
                            <span class="summary-value">${formatDateTime(missione.data_consegna)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <form id="valutazione-form" class="valutazione-form" onsubmit="ValutazioneView.submit(event)">
                    <div class="rating-section">
                        <label class="rating-label">Come valuti la consegna?</label>
                        <div class="star-rating" id="star-rating">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <button type="button" class="star-btn" data-value="${i}" onclick="ValutazioneView.setRating(${i})">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </button>
                            `).join('')}
                        </div>
                        <span class="rating-text" id="rating-text">Seleziona una valutazione</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="commento" class="form-label">Commento (opzionale)</label>
                        <textarea 
                            id="commento" 
                            class="form-textarea" 
                            rows="4" 
                            placeholder="Racconta la tua esperienza..."
                        ></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-ghost" onclick="ClienteApp.navigate('ordini')">
                            Annulla
                        </button>
                        <button type="submit" class="btn btn-primary" id="submit-btn" disabled>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Invia Valutazione
                        </button>
                    </div>
                </form>
            `;
            
        } catch (error) {
            console.error('Error loading missione:', error);
            contentContainer.innerHTML = `
                <div class="valutazione-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Errore</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="ClienteApp.navigate('ordini')">
                        Torna agli Ordini
                    </button>
                </div>
            `;
        }
    },
    
    // Set rating value
    setRating(value) {
        this.rating = value;
        
        const starButtons = document.querySelectorAll('.star-btn');
        const ratingText = document.getElementById('rating-text');
        const submitBtn = document.getElementById('submit-btn');
        
        starButtons.forEach((btn, index) => {
            if (index < value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        const texts = [
            'Seleziona una valutazione',
            'Pessimo',
            'Scarso',
            'Discreto',
            'Buono',
            'Eccellente'
        ];
        
        ratingText.textContent = texts[value] || texts[0];
        submitBtn.disabled = value === 0;
    },
    
    // Submit valutazione
    async submit(event) {
        event.preventDefault();
        
        if (this.rating === 0) {
            showToast('Seleziona una valutazione', 'warning');
            return;
        }
        
        const submitBtn = document.getElementById('submit-btn');
        const commento = document.getElementById('commento').value.trim();
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div class="spinner spinner-sm"></div>
            Invio in corso...
        `;
        
        try {
            await ClienteAPI.addValutazione(this.missioneId, {
                voto: this.rating,
                commento: commento || null
            });
            
            showToast('Valutazione inviata con successo!', 'success');
            
            // Show success state
            document.getElementById('valutazione-content').innerHTML = `
                <div class="valutazione-success">
                    <div class="success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <h3>Grazie per la tua valutazione!</h3>
                    <p>Il tuo feedback ci aiuta a migliorare il servizio</p>
                    <div class="submitted-rating">
                        ${Components.ratingStars(this.rating)}
                    </div>
                    <button class="btn btn-primary" onclick="ClienteApp.navigate('ordini')">
                        Torna agli Ordini
                    </button>
                </div>
            `;
            
        } catch (error) {
            console.error('Error submitting valutazione:', error);
            showToast(error.message || 'Errore nell\'invio della valutazione', 'error');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Invia Valutazione
            `;
        }
    }
};
