const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=')));

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']?.trim();
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']?.trim();

if (!supabaseUrl || !supabaseKey) {
    console.error('URL or Key missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // Try to insert a dummy order and see what it returns, or just describe table if possible
    // Supabase JS doesn't have a direct describe, but we can check columns of a returned object
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns:', data.length > 0 ? Object.keys(data[0]) : 'Empty table');
    }
}

checkSchema();
