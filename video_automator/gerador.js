const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Injetando o Motor do FFmpeg sem precisar instalar no Windows!
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// 1. Vasculhar a pasta Downloads do Comandante
const downloadsFolder = path.join(process.env.USERPROFILE, 'Downloads');
const files = fs.readdirSync(downloadsFolder)
    .filter(f => f.startsWith('WhatsApp Video') && f.endsWith('.mp4'))
    .map(name => ({name, time: fs.statSync(path.join(downloadsFolder, name)).mtime.getTime()}))
    .sort((a, b) => b.time - a.time);

if (files.length === 0) {
    console.error("❌ Nenhum 'WhatsApp Video' encontrado na pasta Downloads.");
    process.exit(1);
}

const inputFile = path.join(downloadsFolder, files[0].name);
const outputFile = path.join(__dirname, 'REELS_PRONTO.mp4');

console.log(`🤖 Sonar Ativado! Capturou o vídeo mais recente: ${files[0].name}`);
console.log(`🎬 Iniciando Montagem... Aplicando Filtros Cinemáticos (9:16, Velocidade 1.25x)`);

// 2. Aplicar a Magia da Edição Direto no Processador
ffmpeg(inputFile)
    .videoFilters([
        {
            // Força a proporção 9:16 (Story/Reels perfeito)
            filter: 'scale',
            options: '1080:1920:force_original_aspect_ratio=decrease'
        },
        {
            // Preenche o fundo com preto elegante caso o recorte não bata 100%
            filter: 'pad',
            options: '1080:1920:(ow-iw)/2:(oh-ih)/2:color=black'
        },
        {
            // Acelera a parte visual em 1.25x (Dinâmico, prende a atenção)
            filter: 'setpts',
            options: '0.8*PTS'
        }
    ])
    // Acelera o áudio nativo para não perder sincronia
    .audioFilters('atempo=1.25')
    .on('progress', function(progress) {
        if(progress.percent) {
            process.stdout.write(`⏳ Renderizando: ${Math.floor(progress.percent)}%\r`);
        }
    })
    .on('end', () => {
        console.log(`\n\n✅ SUCESSO ABSOLUTO, COMANDANTE! `);
        console.log(`🚀 Vídeo final gerado e pronto para o post na pasta: \n${outputFile}\n`);
    })
    .on('error', (err) => console.error('\n❌ Erro Crítico no FFmpeg:', err))
    .save(outputFile);
