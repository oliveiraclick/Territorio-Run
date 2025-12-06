# Territory Run - Conquista

Um jogo de conquista de território baseado em geolocalização com tema cyberpunk. Corra pelo mundo real e conquiste territórios virtuais!

## 🚀 Início Rápido

### Instalação

```bash
npm install
npm run dev
```

### ⚙️ Configuração

O Territory Run oferece **duas formas** de configurar as chaves de API necessárias:

#### Método 1: Interface Visual (Recomendado)

1. Inicie o aplicativo
2. Clique no ícone de **⚙️ Configurações** no canto superior direito
3. Insira suas chaves de API:
   - **Supabase URL**: URL do seu projeto Supabase
   - **Supabase Anon Key**: Chave anônima do Supabase
   - **Gemini API Key**: Chave da API do Google Gemini
4. Clique em **💾 Salvar**
5. Use **🔌 Testar Conexão** para verificar se o Supabase está funcionando

As configurações são salvas automaticamente no navegador (localStorage) e persistem entre sessões.

#### Método 2: Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-anonima-aqui
VITE_API_KEY=sua-chave-gemini-aqui
```

**Nota**: Configurações da interface visual têm prioridade sobre variáveis de ambiente.

### 🔑 Obtendo as Chaves

#### Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie a **URL** e a **anon/public key**

#### Google Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie a chave gerada

## 🎮 Como Jogar

1. **Permitir GPS**: Autorize o acesso à localização
2. **Iniciar Corrida**: Clique no botão de play
3. **Correr**: Movimente-se pelo mundo real
4. **Conquistar**: Pare a corrida para reivindicar o território
5. **Nomear**: Dê um nome ao seu território conquistado

## 🛠️ Tecnologias

- **React + TypeScript**
- **Vite**
- **Leaflet** (mapas)
- **Supabase** (backend)
- **Google Gemini AI** (geração de conteúdo)

## 📱 PWA

O aplicativo funciona como Progressive Web App e pode ser instalado no dispositivo móvel.
