const axios = require('axios');

const URL = 'https://orzrtshvgmtmzfkezaae.supabase.co/rest/v1/leads_pets?select=*';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yenJ0c2h2Z210bXpma2V6YWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzQ3MDgsImV4cCI6MjA4OTYxMDcwOH0.TOUjyM0VLno_0KXsL_c6YBwdnczzsnn5ltTd2-OZhHA';

async function testConnection() {
    try {
        console.log("Iniciando varredura no Gateway PostgREST...");
        const response = await axios.get(URL, {
            headers: {
                'apikey': KEY,
                'Authorization': `Bearer ${KEY}`
            }
        });
        console.log("✅ STATUS 200: Sucesso!");
        console.log(response.data);
    } catch (error) {
        console.error("❌ FALHA ENCONTRADA:");
        if (error.response) {
            console.error("Status Http:", error.response.status);
            console.error("Payload do Erro:", error.response.data);
            console.error("Headers de Retorno:", error.response.headers);
        } else {
            console.error(error.message);
        }
    }
}

testConnection();
