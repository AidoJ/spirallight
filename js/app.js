/**
 * Main App Initialization
 * Sets up the application when DOM is ready
 */

// Global state
let currentClientId = null;
let currentSessionId = null;

/**
 * Wait for Supabase library to load
 */
function waitForSupabase(maxAttempts = 10, delay = 100) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const checkSupabase = () => {
            attempts++;
            if (typeof supabase !== 'undefined') {
                resolve(true);
            } else if (attempts >= maxAttempts) {
                reject(new Error('Supabase library failed to load'));
            } else {
                setTimeout(checkSupabase, delay);
            }
        };
        checkSupabase();
    });
}

/**
 * Initialize the application
 */
// Check for intake form link IMMEDIATELY (before DOMContentLoaded)
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientToken = urlParams.get('client');
    
    if (clientToken && clientToken.trim() !== '') {
        console.log('=== INTAKE LINK DETECTED (PRE-DOM) ===');
        console.log('Client token:', clientToken);
        window.isIntakeFormMode = true;
        // Prevent normal app from loading
        window.skipNormalAppInit = true;
    }
})();

document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== DOMContentLoaded fired ===');
    console.log('Full URL:', window.location.href);
    console.log('isIntakeFormMode:', window.isIntakeFormMode);
    console.log('skipNormalAppInit:', window.skipNormalAppInit);
    
    // Check if this is a client intake link FIRST (before any initialization)
    // Check multiple ways to get the client parameter
    const urlParams = new URLSearchParams(window.location.search);
    const clientToken = urlParams.get('client') || urlParams.get('clientId') || new URLSearchParams(window.location.hash.substring(1)).get('client');
    console.log('Client token from URL:', clientToken);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);

    // If it's an intake form link, handle it differently
    if ((clientToken && clientToken.trim() !== '') || window.isIntakeFormMode) {
        const finalToken = clientToken || new URLSearchParams(window.location.search).get('client');
        console.log('=== CLIENT INTAKE LINK DETECTED ===');
        console.log('Client token:', finalToken);
        
        // Set a flag to prevent normal app initialization
        window.isIntakeFormMode = true;
        window.skipNormalAppInit = true;
        
        // IMMEDIATELY hide all views and navigation - do this FIRST with !important
        document.querySelectorAll('.view').forEach(v => {
            if (v.id !== 'clientIntakeView') {
                v.classList.remove('active');
                v.style.setProperty('display', 'none', 'important');
                v.style.setProperty('visibility', 'hidden', 'important');
                v.style.setProperty('opacity', '0', 'important');
            }
        });
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.style.setProperty('display', 'none', 'important');
            nav.style.setProperty('visibility', 'hidden', 'important');
        }
        console.log('All views and nav hidden with !important');
        
        // Wait for Supabase library to load
        try {
            await waitForSupabase();
            console.log('Supabase library loaded for intake form');
        } catch (error) {
            console.error('Failed to load Supabase library:', error);
            document.body.innerHTML = `
                <div style="padding: 3rem; text-align: center; font-family: 'Inter', sans-serif;">
                    <h1 style="color: var(--danger);">Loading Error</h1>
                    <p style="color: var(--text-secondary);">Failed to load required resources. Please check your internet connection and refresh.</p>
                </div>
            `;
            return;
        }

        // Initialize Supabase for intake form
        const initResult = initSupabase();
        console.log('Supabase init result:', initResult);
        
        if (!initResult || !supabaseClient) {
            document.body.innerHTML = `
                <div style="padding: 3rem; text-align: center; font-family: 'Inter', sans-serif;">
                    <h1 style="color: var(--danger);">Configuration Error</h1>
                    <p style="color: var(--text-secondary);">Unable to connect to database. Please contact your therapist.</p>
                </div>
            `;
            return;
        }

        // Show client intake form (skip normal app initialization)
        console.log('Calling showClientIntakeForm with token:', finalToken);
        await showClientIntakeForm(finalToken);
        console.log('showClientIntakeForm completed');
        
        // Prevent any further initialization - CRITICAL
        return; // Don't continue with normal app initialization
    }
    
    // If we got here and skipNormalAppInit is set, don't continue
    if (window.skipNormalAppInit) {
        console.log('Skipping normal app init - intake form mode');
        return;
    }
    
    // Set flag for normal app mode
    window.isIntakeFormMode = false;

    // Normal app initialization (not an intake form link)
    // Wait for Supabase library to load
    try {
        await waitForSupabase();
        console.log('Supabase library loaded');
    } catch (error) {
        console.error('Failed to load Supabase library:', error);
        document.body.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <h1>Loading Error</h1>
                <p>Failed to load Supabase library. Please check your internet connection.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
        return;
    }

    // Initialize Supabase
    const initResult = initSupabase();
    console.log('initSupabase result:', initResult);
    console.log('supabaseClient after init:', supabaseClient);
    
    if (!initResult) {
        document.body.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <h1>Configuration Error</h1>
                <p>Please configure Supabase in <code>js/config.js</code></p>
                <p>Make sure you've added your Supabase anon key.</p>
                <p>See <code>SETUP.md</code> for instructions.</p>
                <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
                    Current config: ${JSON.stringify(SUPABASE_CONFIG, null, 2)}
                </p>
                <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
                    Check the browser console (F12) for more details.
                </p>
            </div>
        `;
        return;
    }

    // Verify client is actually set
    if (!supabaseClient) {
        console.error('initSupabase returned true but supabaseClient is still null!');
        document.body.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <h1>Initialization Error</h1>
                <p>Supabase client failed to initialize. Please check the console for details.</p>
                <p>Try refreshing the page.</p>
            </div>
        `;
        return;
    }

    console.log('App initialized successfully. Supabase client ready.');

    // Double-check we're not in intake mode
    if (window.isIntakeFormMode || window.skipNormalAppInit) {
        console.log('Aborting normal app init - still in intake mode');
        return;
    }

    // Show clients view
    const clientsView = document.getElementById('clientsView');
    if (clientsView) {
        clientsView.classList.add('active');
    }

    // Normal app flow - Load clients immediately
    console.log('Loading clients...');
    await loadClients();
    console.log('Clients loaded, count:', clients.length);
    
    // Set default date for new sessions
    const sessionDate = document.getElementById('sessionDate');
    if (sessionDate) {
        sessionDate.valueAsDate = new Date();
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

