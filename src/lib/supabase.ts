import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados. Preencha o arquivo .env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ANEXOS_BUCKET = 'manutencao-anexos';
