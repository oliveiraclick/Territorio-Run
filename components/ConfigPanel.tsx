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
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '2px solid #00ff88',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        ⚙️ Configurações
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '2px solid #ff4444',
                            color: '#ff4444',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ff4444';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#ff4444';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Status Geral */}
                <div style={{
                    background: configStatus.overall === 'complete'
                        ? 'rgba(0, 255, 136, 0.1)'
                        : configStatus.overall === 'partial'
                            ? 'rgba(255, 200, 0, 0.1)'
                            : 'rgba(255, 68, 68, 0.1)',
                    border: `2px solid ${configStatus.overall === 'complete'
                            ? '#00ff88'
                            : configStatus.overall === 'partial'
                                ? '#ffc800'
                                : '#ff4444'
                        }`,
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '25px',
                }}>
                    <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
                        Status da Configuração
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                        {configStatus.overall === 'complete' && '✅ Totalmente Configurado'}
                        {configStatus.overall === 'partial' && '⚠️ Parcialmente Configurado'}
                        {configStatus.overall === 'empty' && '❌ Não Configurado'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                        Supabase: {configStatus.supabase === 'configured' ? '✅' : '❌'} |
                        Gemini AI: {configStatus.gemini === 'configured' ? '✅' : '❌'}
                    </div>
                </div>

                {/* Supabase Section */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                        fontSize: '18px',
                        color: '#00ff88',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        🗄️ Supabase
                    </h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>
                            URL do Projeto
                        </label>
                        <input
                            type="text"
                            value={supabaseUrl}
                            onChange={(e) => { setSupabaseUrl(e.target.value); handleChange(); }}
                            placeholder="https://seu-projeto.supabase.co"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '2px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#00ff88'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>
                            Chave Anônima (anon key)
                        </label>
                        <input
                            type="password"
                            value={supabaseKey}
                            onChange={(e) => { setSupabaseKey(e.target.value); handleChange(); }}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '2px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#00ff88'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
                        />
                    </div>

                    <button
                        onClick={handleTestConnection}
                        disabled={!supabaseUrl || !supabaseKey || connectionStatus === 'testing'}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: connectionStatus === 'success'
                                ? '#00ff88'
                                : connectionStatus === 'error'
                                    ? '#ff4444'
                                    : 'linear-gradient(90deg, #00d4ff, #00ff88)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: (!supabaseUrl || !supabaseKey || connectionStatus === 'testing') ? 'not-allowed' : 'pointer',
                            opacity: (!supabaseUrl || !supabaseKey || connectionStatus === 'testing') ? 0.5 : 1,
                            transition: 'all 0.3s',
                        }}
                    >
                        {connectionStatus === 'testing' ? '🔄 Testando...' : '🔌 Testar Conexão'}
                    </button>
                </div>

                {/* Gemini AI Section */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                        fontSize: '18px',
                        color: '#00d4ff',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        🤖 Gemini AI
                    </h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '14px' }}>
                            API Key
                        </label>
                        <input
                            type="password"
                            value={geminiKey}
                            onChange={(e) => { setGeminiKey(e.target.value); handleChange(); }}
                            placeholder="AIzaSy..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '2px solid #333',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#00d4ff'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
                        />
                    </div>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '2px solid #00ff88',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        color: '#fff',
                        fontSize: '14px',
                        textAlign: 'center',
                    }}>
                        {statusMessage}
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                }}>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: hasChanges
                                ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
                                : '#333',
                            border: 'none',
                            borderRadius: '8px',
                            color: hasChanges ? '#000' : '#666',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: hasChanges ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s',
                        }}
                    >
                        💾 Salvar
                    </button>

                    <button
                        onClick={handleClear}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'transparent',
                            border: '2px solid #ff4444',
                            borderRadius: '8px',
                            color: '#ff4444',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ff4444';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#ff4444';
                        }}
                    >
                        🗑️ Limpar
                    </button>
                </div>

                {/* Info */}
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(0, 212, 255, 0.05)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#aaa',
                    lineHeight: '1.6',
                }}>
                    <strong style={{ color: '#00d4ff' }}>💡 Dica:</strong> As configurações são salvas localmente no navegador.
                    Você também pode usar variáveis de ambiente (.env.local) como alternativa.
                </div>
            </div>
        </div>
    );
};
