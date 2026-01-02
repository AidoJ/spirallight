/**
 * Client Management
 * Handles all client-related operations using Supabase
 */

let clients = [];
let currentClientId = null;

/**
 * Load all clients from Supabase
 */
async function loadClients() {
    // Don't load clients if we're in intake form mode
    if (window.isIntakeFormMode) {
        console.log('loadClients blocked - intake form mode active');
        return;
    }
    
    const clientList = document.getElementById('clientList');
    if (!clientList) return;

    showLoading(clientList);

    try {
        const { data, error } = await ClientService.getAll();

        if (error) {
            throw error;
        }

        clients = data || [];
        displayClients();
    } catch (error) {
        console.error('Error loading clients:', error);
        showToast('Failed to load clients. Please try again.', 'error');
        clientList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Error loading clients</h3>
                <p>${error.message || 'Please check your connection and try again.'}</p>
                <button class="btn btn-primary" onclick="loadClients()" style="margin-top: 1rem;">
                    Retry
                </button>
            </div>
        `;
    }
}

/**
 * Display clients in the list
 */
function displayClients(filtered = null) {
    const clientList = document.getElementById('clientList');
    if (!clientList) return;

    const clientsToShow = filtered || clients;

    if (clientsToShow.length === 0) {
        clientList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <h3>No clients found</h3>
                <p>Add your first client to get started</p>
                <button class="btn btn-primary" onclick="showView('newClient')" style="margin-top: 1rem;">
                    <span>+</span> Add New Client
                </button>
            </div>
        `;
        return;
    }

    // Show clients immediately (don't wait for session counts)
    clientList.innerHTML = clientsToShow.map(client => {
        const initials = getInitials(client.name);
        return `
            <div class="client-card" onclick="viewClient('${client.id}')">
                <div class="client-card-header">
                    <div style="display: flex; gap: 1rem; flex: 1; min-width: 0;">
                        <div class="client-avatar">${initials}</div>
                        <div class="client-info">
                            <div class="client-name">${escapeHtml(client.name)}</div>
                            <div class="client-meta">
                                ${client.email ? `<span class="client-meta-item">📧 ${escapeHtml(client.email)}</span>` : ''}
                                ${client.phone ? `<span class="client-meta-item">📞 ${escapeHtml(client.phone)}</span>` : ''}
                                ${client.age ? `<span class="client-meta-item">👤 ${client.age} years</span>` : ''}
                            </div>
                            <div style="margin-top: 0.5rem;">
                                <span class="badge badge-primary" id="session-count-${client.id}">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Load session counts asynchronously and update badges
    clientsToShow.forEach(async (client) => {
        try {
            const { data: sessions } = await SessionService.getByClientId(client.id);
            const sessionCount = sessions?.length || 0;
            const badge = document.getElementById(`session-count-${client.id}`);
            if (badge) {
                badge.textContent = `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`;
            }
        } catch (error) {
            console.error(`Error loading sessions for client ${client.id}:`, error);
            const badge = document.getElementById(`session-count-${client.id}`);
            if (badge) {
                badge.textContent = '0 sessions';
            }
        }
    });
}

/**
 * Search clients
 */
const searchClients = debounce(async function() {
    const searchBox = document.getElementById('searchBox');
    if (!searchBox) return;

    const query = searchBox.value.trim();

    if (!query) {
        displayClients();
        return;
    }

    const clientList = document.getElementById('clientList');
    showLoading(clientList);

    try {
        const { data, error } = await ClientService.search(query);

        if (error) {
            throw error;
        }

        clients = data || [];
        displayClients();
    } catch (error) {
        console.error('Error searching clients:', error);
        showToast('Search failed. Please try again.', 'error');
        displayClients();
    }
}, 300);

/**
 * Save client (create or update)
 */
async function saveClient(e) {
    e.preventDefault();

    // Check if Supabase is initialized
    if (typeof supabaseClient === 'undefined' || supabaseClient === null) {
        console.error('Supabase client not initialized. Attempting to initialize...');
        if (typeof initSupabase === 'function') {
            const initialized = initSupabase();
            if (!initialized) {
                showToast('Database not ready. Please refresh the page and try again.', 'error');
                return;
            }
        } else {
            showToast('Database not ready. Please refresh the page.', 'error');
            return;
        }
    }

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        const clientData = {
            name: document.getElementById('clientName').value,
            age: document.getElementById('clientAge').value || null,
            dob: document.getElementById('clientDob').value || null,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value,
            address: document.getElementById('clientAddress').value || null,
            city: document.getElementById('clientCity').value || null,
            postal: document.getElementById('clientPostal').value || null,
            occupation: document.getElementById('clientOccupation').value || null,
            referredBy: document.getElementById('clientReferredBy').value || null,
            md: document.getElementById('clientMD').value || null
        };

        const clientId = document.getElementById('clientId').value;
        let result;

        if (clientId) {
            // Update existing client
            result = await ClientService.update(clientId, clientData);
        } else {
            // Create new client
            result = await ClientService.create(clientData);
        }

        if (result.error) {
            throw result.error;
        }

        showToast('Client saved successfully!', 'success');
        resetClientForm();
        await loadClients();
        showView('clients');
    } catch (error) {
        console.error('Error saving client:', error);
        const errorMessage = error.message || 'Failed to save client. Please try again.';
        showToast(errorMessage, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

/**
 * Reset client form
 */
function resetClientForm() {
    const form = document.getElementById('clientForm');
    if (form) form.reset();
    
    const clientId = document.getElementById('clientId');
    if (clientId) clientId.value = '';
    
    const title = document.getElementById('clientFormTitle');
    if (title) title.textContent = 'Add New Client';
}

/**
 * Edit current client
 */
async function editCurrentClient() {
    if (!currentClientId) return;

    try {
        const { data: client, error } = await ClientService.getById(currentClientId);

        if (error) {
            throw error;
        }

        if (!client) {
            showToast('Client not found', 'error');
            return;
        }

        // Map database fields to form fields
        document.getElementById('clientFormTitle').textContent = 'Edit Client';
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientName').value = client.name || '';
        document.getElementById('clientAge').value = client.age || '';
        document.getElementById('clientDob').value = client.dob || '';
        document.getElementById('clientEmail').value = client.email || '';
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientAddress').value = client.address || '';
        document.getElementById('clientCity').value = client.city || '';
        document.getElementById('clientPostal').value = client.postal || '';
        document.getElementById('clientOccupation').value = client.occupation || '';
        document.getElementById('clientReferredBy').value = client.referred_by || '';
        document.getElementById('clientMD').value = client.md || '';

        showView('newClient');
    } catch (error) {
        console.error('Error loading client:', error);
        showToast('Failed to load client details', 'error');
    }
}

/**
 * Delete current client
 */
async function deleteCurrentClient() {
    if (!currentClientId) return;

    if (!confirm('Are you sure you want to delete this client? This will also delete all associated sessions.')) {
        return;
    }

    try {
        const { error } = await ClientService.delete(currentClientId);

        if (error) {
            throw error;
        }

        showToast('Client deleted successfully!', 'success');
        await loadClients();
        showView('clients');
        currentClientId = null;
    } catch (error) {
        console.error('Error deleting client:', error);
        showToast('Failed to delete client. Please try again.', 'error');
    }
}

/**
 * View client details
 */
async function viewClient(id) {
    currentClientId = id;

    try {
        const { data: client, error: clientError } = await ClientService.getById(id);

        if (clientError || !client) {
            throw clientError || new Error('Client not found');
        }

        const { data: allSessions, error: sessionsError } = await SessionService.getByClientId(id);

        if (sessionsError) {
            console.error('Error loading sessions:', sessionsError);
        }

        const sessions = allSessions || [];
        
        // Filter pending sessions (submitted by clients, awaiting therapist approval)
        const pendingSessions = sessions.filter(s => s.status === 'pending')
            .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
        
        // Filter approved sessions (approved by therapist or created by therapist)
        const approvedSessions = sessions.filter(s => s.status === 'approved' || !s.status)
            .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
        
        console.log(`Client ${client.name}: ${pendingSessions.length} pending, ${approvedSessions.length} approved sessions`);

        document.getElementById('clientDetailName').textContent = client.name;

        const detailContent = document.getElementById('clientDetailContent');
        if (detailContent) {
            detailContent.innerHTML = `
                <div class="detail-grid">
                    <div class="detail-card">
                        <h3 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 600;">Contact Information</h3>
                        <div class="detail-row">
                            <div class="detail-label">Email</div>
                            <div class="detail-value">${escapeHtml(client.email || 'N/A')}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Phone</div>
                            <div class="detail-value">${escapeHtml(client.phone || 'N/A')}</div>
                        </div>
                        ${client.address || client.city || client.postal ? `
                        <div class="detail-row">
                            <div class="detail-label">Address</div>
                            <div class="detail-value">${escapeHtml([client.address, client.city, client.postal].filter(Boolean).join(', ') || 'N/A')}</div>
                        </div>` : ''}
                    </div>
                    <div class="detail-card">
                        <h3 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 600;">Personal Information</h3>
                        ${client.age ? `
                        <div class="detail-row">
                            <div class="detail-label">Age</div>
                            <div class="detail-value">${client.age} years</div>
                        </div>` : ''}
                        ${client.dob ? `
                        <div class="detail-row">
                            <div class="detail-label">Date of Birth</div>
                            <div class="detail-value">${formatDate(client.dob)}</div>
                        </div>` : ''}
                        ${client.occupation ? `
                        <div class="detail-row">
                            <div class="detail-label">Occupation</div>
                            <div class="detail-value">${escapeHtml(client.occupation)}</div>
                        </div>` : ''}
                        ${client.referred_by ? `
                        <div class="detail-row">
                            <div class="detail-label">Referred By</div>
                            <div class="detail-value">${escapeHtml(client.referred_by)}</div>
                        </div>` : ''}
                        ${client.md ? `
                        <div class="detail-row">
                            <div class="detail-label">M.D.</div>
                            <div class="detail-value">${escapeHtml(client.md)}</div>
                        </div>` : ''}
                    </div>
                </div>

                <div class="detail-card" style="margin-top: 1rem; background: linear-gradient(135deg, rgba(0, 170, 187, 0.1) 0%, rgba(51, 200, 213, 0.1) 100%); border: 2px dashed var(--primary);">
                    <h3 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 600; color: var(--primary);">📧 Client Intake Link</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
                        Send this link to ${escapeHtml(client.name)} so they can fill out their intake form before their appointment.
                    </p>
                    <button class="btn btn-primary" onclick="generateClientLink()">
                        📋 Generate & Copy Link
                    </button>
                </div>
            `;
        }

        // Display sessions
        if (pendingSessions.length > 0) {
            displayPendingSessions(pendingSessions);
        }
        displaySessions(approvedSessions);

        showView('clientDetail');
    } catch (error) {
        console.error('Error loading client:', error);
        showToast('Failed to load client details', 'error');
    }
}

/**
 * Generate client intake link
 */
function generateClientLink() {
    if (!currentClientId) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?client=${currentClientId}`;

    navigator.clipboard.writeText(link).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Link copied to clipboard!', 'success');
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

