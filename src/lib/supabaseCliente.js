import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseClaveAnonima = import.meta.env.VITE_SUPABASE_CLAVE_ANONIMA

if (!supabaseUrl || !supabaseClaveAnonima) {
  throw new Error('Faltan las variables de entorno de Supabase.')
}

export const supabase = createClient(supabaseUrl, supabaseClaveAnonima)
