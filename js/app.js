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
document.addEventListener('DOMContentLoaded', async function() {
    // Check if this is a client intake link FIRST (before any initialization)
    const urlParams = new URLSearchParams(window.location.search);
    const clientToken = urlParams.get('client');

    // If it's an intake form link, handle it differently
    if (clientToken) {
        console.log('Client intake link detected:', clientToken);
        
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
        await showClientIntakeForm(clientToken);
        return; // Don't continue with normal app initialization
    }

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

    // Normal app flow
    {
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

