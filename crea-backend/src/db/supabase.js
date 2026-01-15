const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use a placeholder if not set, to avoid crashing immediately, 
// but warn the user.
if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase URL or Service Role Key is missing in .env');
}

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);

module.exports = supabase;
