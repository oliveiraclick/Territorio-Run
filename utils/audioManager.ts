export const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR'; // Português do Brasil
        utterance.rate = 1.1; // Um pouco mais rápido / dinâmico
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Tentar encontrar uma voz mais "robótica" ou grave se possível (depende do navegador)
        const voices = window.speechSynthesis.getVoices();
        // Preferência por vozes Google ou Microsoft em PT-BR
        const preferredVoice = voices.find(v => v.lang.includes('pt-BR') && (v.name.includes('Google') || v.name.includes('Luciana')));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        (window.speechSynthesis as any).click = () => { }; // Fix para chrome mobile as vezes
        window.speechSynthesis.speak(utterance);
    }
};

export const playSoundEffect = (type: 'start' | 'conquest' | 'alert') => {
    // Poderíamos usar arquivos de áudio reais aqui (mp3), 
    // mas por enquanto apenas TTS para não depender de assets externos
    // Futuramente: new Audio('/sounds/start.mp3').play();
};
