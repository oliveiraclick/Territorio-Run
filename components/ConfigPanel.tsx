import React, { useState, useEffect } from 'react';
import { config } from '../config';
import { checkSupabaseConnection } from '../services/supabaseClient';

interface ConfigPanelProps {
    onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ onClose }) => {
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Carregar configurações atuais
        const currentConfig = config.getConfig();
        setSupabaseUrl(currentConfig.supabaseUrl);
        setSupabaseKey(currentConfig.supabaseKey);
        setGeminiKey(currentConfig.geminiApiKey);
    }, []);

    const handleSave = () => {
        config.updateConfig({
            supabaseUrl,
            supabaseKey,
            geminiApiKey: geminiKey,
        });
        setHasChanges(false);
        setStatusMessage('✅ Configurações salvas com sucesso!');
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleTestConnection = async () => {
        setConnectionStatus('testing');
        setStatusMessage('🔄 Testando conexão...');

        try {
            // Salvar temporariamente para testar
            config.updateConfig({
                supabaseUrl,
                supabaseKey,
            });

            const result = await checkSupabaseConnection();

            if (result.status === 'online') {
                setConnectionStatus('success');
                setStatusMessage('✅ Conexão com Supabase estabelecida!');
            } else if (result.status === 'missing_keys') {
                setConnectionStatus('error');
                setStatusMessage('❌ Chaves do Supabase não configuradas');
            } else {
                setConnectionStatus('error');
                setStatusMessage(`❌ Erro: ${result.message || 'Falha na conexão'}`);
            }
        } catch (error: any) {
            setConnectionStatus('error');
            setStatusMessage(`❌ Erro: ${error.message}`);
        }

        setTimeout(() => {
            setConnectionStatus('idle');
            setStatusMessage('');
        }, 5000);
    };

    const handleClear = () => {
        if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
            config.clearConfig();
            setSupabaseUrl('');
            setSupabaseKey('');
            setGeminiKey('');
            setHasChanges(false);
            setStatusMessage('🗑️ Configurações limpas');
            setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    const handleChange = () => {
        setHasChanges(true);
    };

    const configStatus = config.getConfigStatus();

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-lg flex items-center justify-center p-5">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-blue-500 p-6 flex items-center justify-between z-10 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-black text-white">
                            ⚙️ Configurações
                        </h2>
                        <p className="text-white/80 text-sm mt-1">Configure suas integrações</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50">
                    {/* Status Geral */}
                    <div className={`p-4 rounded-xl border-2 ${configStatus.overall === 'complete'
                            ? 'bg-green-50 border-green-400'
                            : configStatus.overall === 'partial'
                                ? 'bg-yellow-50 border-yellow-400'
                                : 'bg-red-50 border-red-400'
                        }`}>
                        <div className="text-sm text-gray-600 mb-2">
                            Status da Configuração
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                            {configStatus.overall === 'complete' && '✅ Totalmente Configurado'}
                            {configStatus.overall === 'partial' && '⚠️ Parcialmente Configurado'}
                            {configStatus.overall === 'empty' && '❌ Não Configurado'}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                            Supabase: {configStatus.supabase === 'configured' ? '✅' : '❌'} |
                            Gemini AI: {configStatus.gemini === 'configured' ? '✅' : '❌'}
                        </div>
                    </div>

                    {/* Supabase Section */}
                    <div>
                        <h3 className="text-lg font-black text-blue-600 mb-4 flex items-center gap-2">
                            🗄️ Supabase
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    URL do Projeto
                                </label>
                                <input
                                    type="text"
                                    value={supabaseUrl}
                                    onChange={(e) => { setSupabaseUrl(e.target.value); handleChange(); }}
                                    placeholder="https://seu-projeto.supabase.co"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Chave Anônima (anon key)
                                </label>
                                <input
                                    type="password"
                                    value={supabaseKey}
                                    onChange={(e) => { setSupabaseKey(e.target.value); handleChange(); }}
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleTestConnection}
                                disabled={!supabaseUrl || !supabaseKey || connectionStatus === 'testing'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${connectionStatus === 'success'
                                        ? 'bg-green-500 text-white'
                                        : connectionStatus === 'error'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg'
                                    } ${(!supabaseUrl || !supabaseKey || connectionStatus === 'testing') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {connectionStatus === 'testing' ? '🔄 Testando...' : '🔌 Testar Conexão'}
                            </button>
                        </div>
                    </div>

                    {/* Gemini AI Section */}
                    <div>
                        <h3 className="text-lg font-black text-orange-600 mb-4 flex items-center gap-2">
                            🤖 Gemini AI
                        </h3>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                API Key
                            </label>
                            <input
                                type="password"
                                value={geminiKey}
                                onChange={(e) => { setGeminiKey(e.target.value); handleChange(); }}
                                placeholder="AIzaSy..."
                                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-800 focus:border-orange-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Status Message */}
                    {statusMessage && (
                        <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 text-center text-gray-800 font-bold">
                            {statusMessage}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className={`flex-1 py-4 rounded-xl font-bold transition-all ${hasChanges
                                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white hover:shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            💾 Salvar
                        </button>

                        <button
                            onClick={handleClear}
                            className="flex-1 py-4 rounded-xl font-bold bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                            🗑️ Limpar
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700">
                        <strong className="text-blue-600">💡 Dica:</strong> As configurações são salvas localmente no navegador.
                        Você também pode usar variáveis de ambiente (.env.local) como alternativa.
                    </div>
                </div>
            </div>
        </div>
    );
};
