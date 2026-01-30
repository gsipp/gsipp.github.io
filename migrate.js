import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials (URL or SERVICE_ROLE_KEY) in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    console.log('🚀 Starting migration...');

    // 1. Migrate Noticias
    try {
        const noticiasPath = path.join(__dirname, 'legacy', 'data', 'noticias.json');
        if (fs.existsSync(noticiasPath)) {
            const noticiasData = JSON.parse(fs.readFileSync(noticiasPath, 'utf-8'));
            const noticias = noticiasData.noticias.map(n => ({
                titulo: n.title,
                slug: n.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                resumo: n.description,
                conteudo: n.description, // Initial content same as description
                data_publicacao: (() => {
                    // Convert DD/MM/AAAA to IOS date
                    const parts = n.date.split('/');
                    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
                })(),
                imagem_capa_url: n.image
            }));

            const { error } = await supabase.from('noticias').insert(noticias);
            if (error) console.error('❌ Error migrating noticias:', error);
            else console.log(`✅ Migrated ${noticias.length} noticias.`);
        } else {
            console.log('⚠️ noticias.json not found.');
        }
    } catch (e) {
        console.error('❌ Error processing noticias:', e);
    }

    // 2. Migrate Membros & TCCs (Extract from JS file using Regex)
    try {
        const jsPath = path.join(__dirname, 'legacy', 'js', 'index.js');
        if (fs.existsSync(jsPath)) {
            const jsContent = fs.readFileSync(jsPath, 'utf-8');

            // Extract Membros
            const membrosMatch = jsContent.match(/const membros = (\[[\s\S]*?\]);/);
            if (membrosMatch) {
                // Dangerous eval, but safe for this specific known context
                // Need to quote keys to make it valid JSON if they aren't
                // But legacy file has invalid JSON keys (no quotes). 
                // We will use Function constructor or simple parsing if possible.
                // Let's try to make it valid JSON or use new Function
                const membrosRaw = new Function('return ' + membrosMatch[1])();

                const membros = membrosRaw.map((m, index) => ({
                    nome: m.name,
                    cargo: m.level === 'graduacao' ? 'Discente (Graduação)' :
                        m.level === 'mestrado' ? 'Discente (Mestrado)' :
                            m.level === 'doutorado' ? 'Discente (Doutorado)' : 'Pesquisador',
                    area_pesquisa: m.area,
                    linkedin_url: m.linkedin,
                    lattes_url: m.lattes,
                    ordem: index
                }));

                const { error } = await supabase.from('membros').insert(membros);
                if (error) console.error('❌ Error migrating membros:', error);
                else console.log(`✅ Migrated ${membros.length} membros.`);
            }

            // Extract TCCs (Eventos)
            const tccMatch = jsContent.match(/const tccTransmissions = (\[[\s\S]*?\]);/);
            if (tccMatch) {
                const tccsRaw = new Function('return ' + tccMatch[1])();
                const eventos = tccsRaw.map(t => ({
                    titulo: t.title,
                    descricao: `${t.description} \n\nDiscente: ${t.student}`,
                    data_evento: (() => {
                        const parts = t.date.split('/');
                        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
                    })(),
                    link_inscricao: t.youtubeLink, // Using youtube link as main link
                    local: 'YouTube'
                }));

                const { error } = await supabase.from('eventos').insert(eventos);
                if (error) console.error('❌ Error migrating TCCs to eventos:', error);
                else console.log(`✅ Migrated ${eventos.length} TCCs to eventos.`);
            }

        } else {
            console.log('⚠️ legacy/js/index.js not found.');
        }
    } catch (e) {
        console.error('❌ Error processing JS file:', e);
    }
}

migrate();
