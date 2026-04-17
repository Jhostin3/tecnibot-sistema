import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseClaveAnonima = import.meta.env.VITE_SUPABASE_CLAVE_ANONIMA

export const supabase = createClient(
  supabaseUrl || 'https://proyecto-pendiente.supabase.co',
  supabaseClaveAnonima || 'clave-anonima-pendiente',
)
