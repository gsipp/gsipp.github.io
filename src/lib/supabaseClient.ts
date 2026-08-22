import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error(
        '[GSIPP] ⚠️ Variáveis de ambiente do Supabase ausentes!\n' +
        'O site está rodando com configurações temporárias e os dados reais não serão carregados.\n' +
        'Por favor, adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nos Secrets do seu repositório GitHub (Settings > Secrets and variables > Actions).'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
