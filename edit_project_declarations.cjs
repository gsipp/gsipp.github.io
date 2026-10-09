const fs = require('fs');
const path = require('path');

// 1. Add generateDeclarationProjectHTML to DeclarationTemplate.ts
const templatePath = path.join(__dirname, 'src/utils/DeclarationTemplate.ts');
let templateContent = fs.readFileSync(templatePath, 'utf8');

const projectFunction = `
export const generateDeclarationProjectHTML = (data: Record<string, any>, settings?: Record<string, any>) => {
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'DD/MM/AAAA';
        const [year, month, day] = dateStr.split('-');
        if (year && month && day) return \`\${day}/\${month}/\${year}\`;
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const startDate = formatDate(data.data_inicio);
    const endDate = formatDate(data.data_fim);
    
    // Data de emissão (hoje)
    const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Settings / Fallbacks
    const logoUfc = settings?.logo_ufc || 'https://www.crateus.ufc.br/wp-content/uploads/2021/04/logo-ufc-crateus-300x125.png';
    const logoGsipp = settings?.logo_gsipp || 'https://gsipp.github.io/logo-dark.png';
    const address = settings?.cabecalho_endereco || '07.272.636/0001-31\\nCampus Universitário\\nAvenida Professora Machadinha Lima, S/N -\\nPríncipe Imperial, Crateús - CE, 63708-825';

    // Máscara de CPF
    const formatCPF = (v: string) => {
        v = v.replace(/\\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\\d{3})(\\d)/, "$1.$2");
        v = v.replace(/(\\d{3})(\\d)/, "$1.$2");
        v = v.replace(/(\\d{3})(\\d{1,2})$/, "$1-$2");
        return v;
    };

    const cpfFormatted = data.cpf ? formatCPF(data.cpf) : '___________';
    
    const fomentoText = data.orgao_fomento ? \` financiado pelo(a) <strong>\${data.orgao_fomento}</strong>,\` : '';

    let content = \`
        Declaramos, para os devidos fins, que <strong>\${data.nome}</strong>,
        matrícula <strong>\${data.matricula}</strong>, CPF <strong>\${cpfFormatted}</strong>, 
        estudante do curso de <strong>\${data.curso}</strong>, participou como <strong>\${data.funcao}</strong> 
        no Projeto de Pesquisa intitulado <strong>"\${data.titulo_projeto}"</strong>\${fomentoText}
        vinculado ao <strong>Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade (GSIPP)</strong> 
        da Universidade Federal do Ceará - Campus de Crateús, no período de <strong>\${startDate}</strong> a <strong>\${endDate}</strong>, 
        com carga horária semanal de <strong>\${data.carga_horaria} horas</strong>, sob a orientação do 
        \${data.orientador}, totalizando <strong>\${data.total_horas} horas</strong> ao longo do período.
    \`;

    return \`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Declaração de Projeto - \${data.nome}</title>
            <style>
                @page { margin: 0; size: auto; }
                body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; color: #000; margin: 2.5cm; padding: 0; }
                .header-table { width: 100%; margin-bottom: 50px; border-collapse: collapse; }
                .header-table td { vertical-align: middle; padding: 0 10px; }
                .logo-ufc { width: 120px; }
                .logo-gsipp { width: 145px; }
                .header-center { text-align: left; font-size: 9pt; line-height: 1.3; white-space: pre-line; }
                .title { font-size: 18pt; font-weight: bold; text-align: center; margin-top: 80px; margin-bottom: 80px; text-transform: uppercase; letter-spacing: 2px; }
                .content { font-size: 13pt; text-align: justify; margin-bottom: 80px; text-indent: 1.5cm; line-height: 1.8; }
                .content strong { font-weight: bold; }
                .signature-block { text-align: center; margin-top: 100px; font-size: 12pt; line-height: 1.4; }
                .signature-block p { margin: 2px 0; }
                .action-bar { position: fixed; bottom: 0; left: 0; right: 0; background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 15px 25px; display: flex; align-items: center; justify-content: space-between; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05); z-index: 1000; }
                .print-button { background-color: #2563eb; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
                .print-button:hover { background-color: #1d4ed8; }
                @media print { .no-print { display: none !important; } body { margin: 2.5cm; } }
            </style>
        </head>
        <body>
            <table class="header-table">
                <tr>
                    <td style="width: 25%;">
                        <img src="\${logoUfc}" alt="UFC Logo" class="logo-ufc" />
                    </td>
                    <td style="width: 50%;" class="header-center">
                        \${address}
                    </td>
                    <td style="width: 25%; text-align: right;">
                        <img src="\${logoGsipp}" alt="GSIPP Logo" class="logo-gsipp" style="margin-left: auto; display: block;" />
                    </td>
                </tr>
            </table>
            <div class="title">DECLARAÇÃO</div>
            <div class="content">
                \${content}
            </div>
            <div style="text-align: center; margin-top: 60px; margin-bottom: 60px; font-size: 12pt;">
                Crateús, \${currentDate}.
            </div>
            <div class="signature-block">
                <p>\${data.orientador}</p>
                <p>Professor do Magistério Superior</p>
                <p>Universidade Federal do Ceará — Campus de Crateús</p>
                <p>Coordenador do Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade (GSIPP)</p>
            </div>
            <div class="action-bar no-print">
                <div style="flex: 1;">
                    <strong>Dica para baixar em PDF:</strong> Ao clicar no botão ao lado, mude o Destino (ou Impressora) para <b>"Salvar como PDF"</b>.
                </div>
                <button class="print-button" onclick="window.print()">Baixar PDF / Imprimir</button>
            </div>
        </body>
        </html>
    \`;
};
`;

if (!templateContent.includes('generateDeclarationProjectHTML')) {
    fs.writeFileSync(templatePath, templateContent + '\n' + projectFunction, 'utf8');
    console.log('Updated DeclarationTemplate.ts');
}

// 2. Create Modal Component
const modalPath = path.join(__dirname, 'src/components/admin/GerarDeclaracaoProjetoModal.tsx');
const modalContent = `import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { generateDeclarationProjectHTML } from '../../utils/DeclarationTemplate';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function GerarDeclaracaoProjetoModal({ isOpen, onClose }: Props) {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        curso: 'Ciência da Computação',
        matricula: '',
        titulo_projeto: '',
        funcao: 'Bolsista de Iniciação Científica',
        orgao_fomento: 'FUNCAP',
        orientador: 'Antonio Emerson Barros Tomaz',
        carga_horaria: '12',
        total_horas: '',
        data_inicio: '',
        data_fim: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const html = generateDeclarationProjectHTML(formData, {});
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        } else {
            alert('Por favor, permita popups neste site.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Gerar Declaração de Projeto</h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Nome do Aluno(a)</label>
                                    <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">CPF</label>
                                    <input required type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Curso</label>
                                    <input required type="text" name="curso" value={formData.curso} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Matrícula</label>
                                    <input required type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Título do Projeto de Pesquisa</label>
                                <input required type="text" name="titulo_projeto" value={formData.titulo_projeto} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Função (Ex: Bolsista, Voluntário)</label>
                                    <input required type="text" name="funcao" value={formData.funcao} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Órgão de Fomento (Opcional)</label>
                                    <input type="text" name="orgao_fomento" value={formData.orgao_fomento} onChange={handleChange} placeholder="Ex: FUNCAP, CNPq" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Orientador</label>
                                <input required type="text" name="orientador" value={formData.orientador} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Horas/Semana</label>
                                    <input required type="number" name="carga_horaria" value={formData.carga_horaria} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Total de Horas</label>
                                    <input required type="number" name="total_horas" value={formData.total_horas} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Data Início</label>
                                    <input required type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Data Fim</label>
                                    <input required type="date" name="data_fim" value={formData.data_fim} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer">
                                    <FileText className="w-4 h-4" /> Gerar PDF
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
`;
fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('Created GerarDeclaracaoProjetoModal.tsx');

// 3. Add to DeclaracoesAdmin.tsx
const adminPath = path.join(__dirname, 'src/pages/admin/DeclaracoesAdmin.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

if (!adminContent.includes('GerarDeclaracaoProjetoModal')) {
    adminContent = adminContent.replace(
        /import ConfirmModal from '\.\.\/\.\.\/components\/admin\/ConfirmModal';/,
        `import ConfirmModal from '../../components/admin/ConfirmModal';\nimport GerarDeclaracaoProjetoModal from '../../components/admin/GerarDeclaracaoProjetoModal';`
    );

    // add state for modal
    adminContent = adminContent.replace(
        /const \[confirmDelete, setConfirmDelete\] = useState<string \| null>\(null\);/,
        `const [confirmDelete, setConfirmDelete] = useState<string | null>(null);\n    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);`
    );

    // change "Nova Declaração" button and add new one
    const headerReplacement = `<div className="flex w-full sm:w-auto gap-3">
                    <AdminSearch
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Buscar por nome, CPF ou código..." className="sm:w-80"
                        />
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
                    >
                        <FileText className="w-4 h-4" /> Projeto Pesquisa
                    </button>
                    <Link
                        to="/gestao-gsipp/membros"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Membro
                    </Link>
                </div>`;
    adminContent = adminContent.replace(/<div className="flex w-full sm:w-auto gap-3">[\s\S]*?<\/div>/, headerReplacement);

    // include modal component at the end
    adminContent = adminContent.replace(
        /<\/div>\n    \);\n}/,
        `    <GerarDeclaracaoProjetoModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />\n        </div>\n    );\n}`
    );

    // also add FileText to import from lucide-react if missing
    if (!adminContent.includes('FileText')) {
        adminContent = adminContent.replace(/import { Printer, Trash2, Loader2, Plus } from 'lucide-react';/, `import { Printer, Trash2, Loader2, Plus, FileText } from 'lucide-react';`);
    }

    fs.writeFileSync(adminPath, adminContent, 'utf8');
    console.log('Updated DeclaracoesAdmin.tsx');
}
