/**
 * Main App Initialization
 * Sets up the application when DOM is ready
 */

// Global state
let currentClientId = null;
let currentSessionId = null;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Supabase
    if (!initSupabase()) {
        document.body.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <h1>Configuration Error</h1>
                <p>Please configure Supabase in <code>js/config.js</code></p>
                <p>See <code>SETUP.md</code> for instructions.</p>
            </div>
        `;
        return;
    }

    // Check if this is a client intake link
    const urlParams = new URLSearchParams(window.location.search);
    const clientToken = urlParams.get('client');

    if (clientToken) {
        // Show client intake form (if implemented)
        // showClientIntakeForm(clientToken);
        showToast('Client intake form feature coming soon', 'info');
        showView('clients');
    } else {
        // Load clients and set default date
        await loadClients();
        const sessionDate = document.getElementById('sessionDate');
        if (sessionDate) {
            sessionDate.valueAsDate = new Date();
        }
    }

    // Auto-calculate age from DOB
    const clientDob = document.getElementById('clientDob');
    if (clientDob) {
        clientDob.addEventListener('change', function() {
            const dob = new Date(this.value);
            if (isNaN(dob.getTime())) return;

            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            const clientAge = document.getElementById('clientAge');
            if (clientAge) {
                clientAge.value = age;
            }
        });
    }

    // Set up search with debouncing
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', searchClients);
    }
});

