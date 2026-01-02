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
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('Supabase configuration missing. Please set up config.js');
        showToast('Please configure Supabase in js/config.js', 'error');
        return false;
    }

    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure to include the Supabase script in index.html');
        showToast('Supabase library not loaded', 'error');
        return false;
    }

    try {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        showToast('Failed to connect to database', 'error');
        return false;
    }
}

/**
 * Client Operations
 */
const ClientService = {
    /**
     * Get all clients
     */
    async getAll() {
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

