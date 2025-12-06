
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  // Fallback para exibir erro na tela caso o React falhe totalmente
  console.error("Critical Boot Error:", error);
  rootElement.innerHTML = `
    <div style="color: red; padding: 20px; font-family: monospace; background: #111; height: 100vh;">
      <h1>CRITICAL SYSTEM FAILURE</h1>
      <p>O aplicativo não pôde ser iniciado.</p>
      <pre>${error?.message || JSON.stringify(error)}</pre>
      <br/>
      <p>Verifique suas Chaves de API no painel da Vercel.</p>
    </div>
  `;
}
