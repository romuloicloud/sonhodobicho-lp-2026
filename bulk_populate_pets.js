/**
 * Sonho do Bicho - Bulk Populator v2.0
 * Integração: leads_pets (1) -> pets_comunidade (N)
 * Schema Minimalista
 * AllowMultiple: true
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const URL_SUPABASE = process.env.SUPABASE_URL || 'https://orzrtshvgmtmzfkezaae.supabase.co';
const KEY_SUPABASE = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NzQwMzQ3MDgsImV4cCI6MjA4OTYxMDcwOH0.TOUjyM0VLno_0KXsL_c6YBwdnczzsnn5ltTd2-OZhHA';

const supabase = createClient(URL_SUPABASE, KEY_SUPABASE);

// Simulando protetores massivos pelo país
const SEED_PROTETORES = [
    { nome: 'ONG Patinhas de Anjo', ig: '@patinhasanjo', uf: 'SP', pets_qty: 3 },
    { nome: 'Projeto Casa Quente', ig: '@casaquente_mg', uf: 'MG', pets_qty: 2 },
    { nome: 'Rio Animal Guard', ig: '@rioanimal', uf: 'RJ', pets_qty: 4 },
    { nome: 'Abrigo dos Filhos', ig: '@abrigofilhos', uf: 'RS', pets_qty: 1 },
];

const NOMES_CÃES = ['Rex', 'Bolinha', 'Caramelo', 'Pipoca', 'Bidu', 'Luna', 'Thor', 'Marley'];
const NOMES_GATOS = ['Frajola', 'Mingau', 'Salem', 'Garfield', 'Simba', 'Nina', 'Luna'];
const FOTOS_MOCK = [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=400',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=400'
];

async function initPopulator() {
    console.log("[INICIANDO] Bulk Populator: Echopop3...");
    console.log("-> Engajando tabelas Mestre: leads_protetores -> pets_mapa");

    try {
        for (const protetor of SEED_PROTETORES) {
            console.log(`\n👨‍🌾 Criando Protetor: ${protetor.nome} (${protetor.uf})`);
            
            // 1. Inserir Lead
            const { data: leadData, error: leadErr } = await supabase
                .from('leads_pets')
                .insert([{
                    nome_protetor: protetor.nome,
                    instagram_handle: protetor.ig,
                    whatsapp: '+55 11 99999-9999',
                    total_pets_cadastrados: protetor.pets_qty,
                    estado_uf: protetor.uf
                }])
                .select('id').single();

            if (leadErr) throw leadErr;
            const pid = leadData.id;

            // 2. Mult-Insert em massa (Allow Multiple Entries = true)
            for (let i = 0; i < protetor.pets_qty; i++) {
                const isCat = Math.random() > 0.5;
                const especie = isCat ? 'Gato' : 'Cão';
                const arrNames = isCat ? NOMES_GATOS : NOMES_CÃES;
                const nomePet = arrNames[Math.floor(Math.random() * arrNames.length)];
                const fotoRnd = FOTOS_MOCK[Math.floor(Math.random() * FOTOS_MOCK.length)];

                const { error: petErr } = await supabase
                    .from('pets_comunidade')
                    .insert([{
                        lead_id: pid,
                        nome_pet: nomePet + " " + i,
                        foto_url: fotoRnd,
                        especie: especie
                    }]);

                if (petErr) throw petErr;
                console.log(`  🐾 [Subido] ${especie}: ${nomePet}`);
            }
        }
        
        console.log("\n🚀 OPERAÇÃO BULK CONCLUÍDA: A Audiência explodiu!");

    } catch (e) {
        console.error("ERRO FATAL:", e.message);
    }
}

// Iniciar a contagem 
if (URL_SUPABASE !== 'SUOTA_URL') {
    initPopulator();
} else {
    console.warn("MOCK INTERROMPIDO: Configure a URL do seu BD Echopop no arquivo .env !");
}
