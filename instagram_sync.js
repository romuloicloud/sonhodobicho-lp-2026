require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const HANDLE = process.env.IG_HANDLE || '@sonhodobicho';
const MODE = process.env.ANALYSIS_MODE || 'launch_15days';

async function analyzeInstagram() {
    console.log(`[GRAPH API] Iniciando Sincronização de Token Mestre para ${HANDLE}...`);
    console.log(`[MODE] ${MODE}`);

    if (!ACCESS_TOKEN) {
        console.error("❌ Token não encontrado no .env");
        return;
    }

    try {
        // 1. Descobrir a Página do Facebook conectada ao Token
        console.log("-> 1. Obtendo Páginas do Facebook vinculadas...");
        const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${ACCESS_TOKEN}`;
        const { data: pagesData } = await axios.get(pagesUrl);

        if (!pagesData.data || pagesData.data.length === 0) {
            throw new Error("Nenhuma Página do Facebook encontrada para este Token.");
        }

        // Pega a primeira página comercial
        const pageId = pagesData.data[0].id;
        console.log(`-> Página FB ID [${pageId}] localizada.`);

        // 2. Descobrir o Instagram Business Account ID atrelado à Página
        console.log("-> 2. Resolvendo Instagram Business ID vinculado...");
        const igAccountUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${ACCESS_TOKEN}`;
        const { data: igAccData } = await axios.get(igAccountUrl);

        if (!igAccData.instagram_business_account) {
            throw new Error("Esta Página do FB não possui uma conta do Instagram Business conectada.");
        }

        const igAccountId = igAccData.instagram_business_account.id;
        console.log(`-> 🎯 Instagram Business Account ID: ${igAccountId}`);

        // 3. Fetching Basic Info (Profile Data)
        console.log("-> 3. Coletando Demografia da Audiência...");
        const profileUrl = `https://graph.facebook.com/v19.0/${igAccountId}?fields=username,profile_picture_url,followers_count,media_count&access_token=${ACCESS_TOKEN}`;
        const { data: profile } = await axios.get(profileUrl);

        console.log(`\n=========================================`);
        console.log(`🐾 PERFIL OFICIAL: @${profile.username}`);
        console.log(`📈 Tropa de Seguidores: ${profile.followers_count.toLocaleString('pt-BR')} (Alvo Confirmado)`);
        console.log(`📸 Total de Publicações Originais: ${profile.media_count}`);
        console.log(`=========================================\n`);

        console.log(`[LAUNCH_15DAYS PLAN]`);
        console.log(`- Base engajada: ${Math.floor(profile.followers_count * 0.05).toLocaleString('pt-BR')} doadores/protetores ativos (estimativa de 5% reach organico).`);
        console.log(`- Urgência Tática: Disparar Posts/Reels chamando p/ 'Acesso Antecipado' via Landing Page.`);
        console.log(`- Ação Pronta: O App conectará esses guardiões ao Mapa Nacional do Supabase amanhã.`);

    } catch (error) {
        console.error("\n❌ Falha Fatal na Sincronização Graph API:");
        if (error.response) {
            console.error(error.response.data.error.message || error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

analyzeInstagram();
