
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Variável para armazenar a instância
let supabaseInstance: any = null;

const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: null, error: { message: "Modo Offline" } }),
    insert: () => ({ data: null, error: { message: "Modo Offline" } }),
    update: () => ({ data: null, error: { message: "Modo Offline" } }),
    eq: () => ({ single: () => ({ data: null, error: null }) })
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: null, error: { message: "Offline" } }),
    signInWithPassword: async () => ({ data: null, error: { message: "Offline" } })
  }
});

// Inicialização Segura
try {
  if (config.hasSupabaseKeys()) {
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: true }
    });
  } else {
    console.log("[System] Chaves Supabase ausentes. Iniciando Mock.");
    supabaseInstance = createMockClient();
  }
} catch (error) {
  console.error("[System] Falha crítica ao criar cliente Supabase:", error);
  supabaseInstance = createMockClient();
}

export const supabase = supabaseInstance;

export const checkSupabaseConnection = async (): Promise<{status: 'online' | 'offline' | 'missing_keys', message?: string}> => {
  if (!config.hasSupabaseKeys()) {
    return { status: 'missing_keys' };
  }
  
  try {
    // Tenta um ping leve
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    // PGRST116 significa que a query rodou mas não achou dados (o que é OK, significa que conectou)
    if (!error || error.code === 'PGRST116') {
      return { status: 'online' };
    }
    
    return { status: 'offline', message: error.message };
  } catch (e: any) {
    return { status: 'offline', message: e.message };
  }
};
