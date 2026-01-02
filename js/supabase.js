/**
 * Supabase Service Layer
 * Handles all database operations
 */

// Initialize Supabase client
let supabaseClient = null;

/**
 * Initialize Supabase client
 */
function initSupabase() {
    console.log('Initializing Supabase...');
    console.log('SUPABASE_CONFIG:', SUPABASE_CONFIG);
    console.log('supabase library available:', typeof supabase !== 'undefined');

    if (!SUPABASE_CONFIG) {
        console.error('SUPABASE_CONFIG is not defined');
        return false;
    }

    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('Supabase configuration missing. Please set up config.js');
        console.error('Current config:', SUPABASE_CONFIG);
        if (typeof showToast !== 'undefined') {
            showToast('Please configure Supabase in js/config.js - Add your anon key', 'error');
        }
        return false;
    }

    if (SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.error('Supabase anon key not configured. Please add your anon key to js/config.js');
        if (typeof showToast !== 'undefined') {
            showToast('Please add your Supabase anon key to js/config.js', 'error');
        }
        return false;
    }

    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure to include the Supabase script in index.html');
        if (typeof showToast !== 'undefined') {
            showToast('Supabase library not loaded', 'error');
        }
        return false;
    }

    try {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase client initialized successfully');
        console.log('Client object:', supabaseClient);
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        console.error('Error details:', error.message, error.stack);
        if (typeof showToast !== 'undefined') {
            showToast('Failed to connect to database: ' + error.message, 'error');
        }
        return false;
    }
}

/**
 * Ensure Supabase client is initialized
 */
function ensureInitialized() {
    if (!supabaseClient) {
        console.error('Supabase client is null. Attempting to re-initialize...');
        console.error('SUPABASE_CONFIG:', SUPABASE_CONFIG);
        console.error('supabase library available:', typeof supabase !== 'undefined');
        
        // Try to re-initialize
        if (typeof supabase !== 'undefined' && SUPABASE_CONFIG && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            try {
                supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                console.log('Re-initialized Supabase client successfully');
                return { error: null };
            } catch (error) {
                console.error('Failed to re-initialize:', error);
            }
        }
        
        const error = new Error('Supabase client not initialized. Please check your configuration and refresh the page.');
        console.error(error);
        console.error('Stack trace:', new Error().stack);
        return { error };
    }
    return { error: null };
}

/**
 * Client Operations
 */
const ClientService = {
    /**
     * Get all clients
     */
    async getAll() {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const { data, error } = await supabaseClient
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching clients:', error);
            return { data: null, error };
        }
    },

    /**
     * Get a single client by ID
     */
    async getById(id) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const { data, error } = await supabaseClient
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching client:', error);
            return { data: null, error };
        }
    },

    /**
     * Create a new client
     */
    async create(clientData) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            // Map camelCase to snake_case for database
            const dbData = {
                name: clientData.name,
                age: clientData.age || null,
                dob: clientData.dob || null,
                email: clientData.email || null,
                phone: clientData.phone || null,
                address: clientData.address || null,
                city: clientData.city || null,
                postal: clientData.postal || null,
                occupation: clientData.occupation || null,
                referred_by: clientData.referredBy || null,
                md: clientData.md || null
            };

            const { data, error } = await supabaseClient
                .from('clients')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating client:', error);
            return { data: null, error };
        }
    },

    /**
     * Update an existing client
     */
    async update(id, clientData) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const dbData = {
                name: clientData.name,
                age: clientData.age || null,
                dob: clientData.dob || null,
                email: clientData.email || null,
                phone: clientData.phone || null,
                address: clientData.address || null,
                city: clientData.city || null,
                postal: clientData.postal || null,
                occupation: clientData.occupation || null,
                referred_by: clientData.referredBy || null,
                md: clientData.md || null
            };

            const { data, error } = await supabaseClient
                .from('clients')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating client:', error);
            return { data: null, error };
        }
    },

    /**
     * Delete a client
     */
    async delete(id) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { error: initCheck.error };

        try {
            const { error } = await supabaseClient
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting client:', error);
            return { error };
        }
    },

    /**
     * Search clients
     */
    async search(query) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const { data, error } = await supabaseClient
                .from('clients')
                .select('*')
                .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error searching clients:', error);
            return { data: null, error };
        }
    }
};

/**
 * Session Operations
 */
const SessionService = {
    /**
     * Get all sessions for a client
     */
    async getByClientId(clientId) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const { data, error } = await supabaseClient
                .from('sessions')
                .select('*')
                .eq('client_id', clientId)
                .order('date', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return { data: null, error };
        }
    },

    /**
     * Get a single session by ID
     */
    async getById(id) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const { data, error } = await supabaseClient
                .from('sessions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching session:', error);
            return { data: null, error };
        }
    },

    /**
     * Create a new session
     */
    async create(sessionData) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const dbData = {
                client_id: sessionData.clientId,
                date: sessionData.date,
                status: sessionData.status || 'approved',
                practitioner: sessionData.practitioner || null,
                complaints: sessionData.complaints || [],
                aggravates: sessionData.aggravates || null,
                swelling: sessionData.swelling || null,
                injury_site: sessionData.injurySite || null,
                medications: sessionData.medications || [],
                healthcare: sessionData.healthcare || [],
                therapies: sessionData.therapies || [],
                implants: sessionData.implants || null,
                injuries: sessionData.injuries || [],
                operations: sessionData.operations || [],
                exercise: sessionData.exercise || null,
                bowen_history: sessionData.bowenHistory || null,
                additional: sessionData.additional || null,
                notes: sessionData.notes || null
            };

            const { data, error } = await supabaseClient
                .from('sessions')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error creating session:', error);
            return { data: null, error };
        }
    },

    /**
     * Update an existing session
     */
    async update(id, sessionData) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const dbData = {
                date: sessionData.date,
                status: sessionData.status || 'approved',
                practitioner: sessionData.practitioner || null,
                complaints: sessionData.complaints || [],
                aggravates: sessionData.aggravates || null,
                swelling: sessionData.swelling || null,
                injury_site: sessionData.injurySite || null,
                medications: sessionData.medications || [],
                healthcare: sessionData.healthcare || [],
                therapies: sessionData.therapies || [],
                implants: sessionData.implants || null,
                injuries: sessionData.injuries || [],
                operations: sessionData.operations || [],
                exercise: sessionData.exercise || null,
                bowen_history: sessionData.bowenHistory || null,
                additional: sessionData.additional || null,
                notes: sessionData.notes || null
            };

            const { data, error } = await supabaseClient
                .from('sessions')
                .update(dbData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating session:', error);
            return { data: null, error };
        }
    },

    /**
     * Delete a session
     */
    async delete(id) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { error: initCheck.error };

        try {
            const { error } = await supabaseClient
                .from('sessions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('Error deleting session:', error);
            return { error };
        }
    },

    /**
     * Update session status
     */
    async updateStatus(id, status) {
        const initCheck = ensureInitialized();
        if (initCheck.error) return { data: null, error: initCheck.error };

        try {
            const { data, error } = await supabaseClient
                .from('sessions')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating session status:', error);
            return { data: null, error };
        }
    }
};

