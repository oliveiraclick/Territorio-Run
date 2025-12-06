
// Configuração Centralizada v7.0
// Sistema aprimorado com suporte a localStorage e variáveis de ambiente

export interface AppConfig {
  supabaseUrl: string;
  supabaseKey: string;
  geminiApiKey: string;
}

// Chaves para localStorage
const STORAGE_KEYS = {
  SUPABASE_URL: 'territory_run_supabase_url',
  SUPABASE_KEY: 'territory_run_supabase_key',
  GEMINI_API_KEY: 'territory_run_gemini_key',
};

// Função auxiliar segura para acessar variáveis de ambiente
const getEnv = () => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env;
    }
    return {};
  } catch (e) {
    return {};
  }
};

// Função para obter valor do localStorage de forma segura
const getFromStorage = (key: string): string => {
  try {
    return localStorage.getItem(key) || '';
  } catch (e) {
    return '';
  }
};

// Função para salvar no localStorage de forma segura
const saveToStorage = (key: string, value: string): void => {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('[Config] Erro ao salvar no localStorage:', e);
  }
};

const env = getEnv();

// Classe de configuração com métodos dinâmicos
class ConfigManager {
  private _supabaseUrl: string;
  private _supabaseKey: string;
  private _geminiApiKey: string;

  constructor() {
    // Prioridade: localStorage > variáveis de ambiente
    this._supabaseUrl = getFromStorage(STORAGE_KEYS.SUPABASE_URL) || env.VITE_SUPABASE_URL || '';
    this._supabaseKey = getFromStorage(STORAGE_KEYS.SUPABASE_KEY) || env.VITE_SUPABASE_KEY || '';
    this._geminiApiKey = getFromStorage(STORAGE_KEYS.GEMINI_API_KEY) || env.VITE_API_KEY || '';
  }

  // Getters
  get supabaseUrl(): string {
    return this._supabaseUrl;
  }

  get supabaseKey(): string {
    return this._supabaseKey;
  }

  get apiKey(): string {
    return this._geminiApiKey;
  }

  // Métodos de validação
  hasSupabaseKeys(): boolean {
    return !!this._supabaseUrl && !!this._supabaseKey;
  }

  hasAiKey(): boolean {
    return !!this._geminiApiKey;
  }

  isFullyConfigured(): boolean {
    return this.hasSupabaseKeys() && this.hasAiKey();
  }

  // Métodos para atualizar configurações
  setSupabaseUrl(url: string): void {
    this._supabaseUrl = url;
    saveToStorage(STORAGE_KEYS.SUPABASE_URL, url);
  }

  setSupabaseKey(key: string): void {
    this._supabaseKey = key;
    saveToStorage(STORAGE_KEYS.SUPABASE_KEY, key);
  }

  setGeminiApiKey(key: string): void {
    this._geminiApiKey = key;
    saveToStorage(STORAGE_KEYS.GEMINI_API_KEY, key);
  }

  // Método para atualizar todas as configurações de uma vez
  updateConfig(newConfig: Partial<AppConfig>): void {
    if (newConfig.supabaseUrl !== undefined) {
      this.setSupabaseUrl(newConfig.supabaseUrl);
    }
    if (newConfig.supabaseKey !== undefined) {
      this.setSupabaseKey(newConfig.supabaseKey);
    }
    if (newConfig.geminiApiKey !== undefined) {
      this.setGeminiApiKey(newConfig.geminiApiKey);
    }
  }

  // Método para obter todas as configurações
  getConfig(): AppConfig {
    return {
      supabaseUrl: this._supabaseUrl,
      supabaseKey: this._supabaseKey,
      geminiApiKey: this._geminiApiKey,
    };
  }

  // Método para limpar todas as configurações
  clearConfig(): void {
    this._supabaseUrl = '';
    this._supabaseKey = '';
    this._geminiApiKey = '';
    
    try {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
      localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    } catch (e) {
      console.error('[Config] Erro ao limpar localStorage:', e);
    }
  }

  // Método para obter status de configuração
  getConfigStatus(): {
    supabase: 'configured' | 'missing';
    gemini: 'configured' | 'missing';
    overall: 'complete' | 'partial' | 'empty';
  } {
    const hasSupabase = this.hasSupabaseKeys();
    const hasGemini = this.hasAiKey();

    let overall: 'complete' | 'partial' | 'empty' = 'empty';
    if (hasSupabase && hasGemini) {
      overall = 'complete';
    } else if (hasSupabase || hasGemini) {
      overall = 'partial';
    }

    return {
      supabase: hasSupabase ? 'configured' : 'missing',
      gemini: hasGemini ? 'configured' : 'missing',
      overall,
    };
  }
}

// Exportar instância singleton
export const config = new ConfigManager();
