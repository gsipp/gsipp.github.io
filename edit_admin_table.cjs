const fs = require('fs');
const path = require('path');

// 1. Create the component
const componentPath = path.join(__dirname, 'src/components/admin/AdminTable.tsx');
const componentCode = `import { ReactNode } from 'react';

export interface AdminTableColumn {
    label: string;
    className?: string;
}

interface AdminTableProps {
    headers: (string | AdminTableColumn)[];
    children: ReactNode;
}

export default function AdminTable({ headers, children }: AdminTableProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {headers.map((header, index) => {
                                const label = typeof header === 'string' ? header : header.label;
                                const customClass = typeof header === 'string' ? '' : (header.className || '');
                                const alignRight = label.toLowerCase().trim() === 'ações' || customClass.includes('text-right');
                                
                                return (
                                    <th 
                                        key={index} 
                                        className={\`px-6 py-3 font-medium text-slate-500 \${alignRight && !customClass.includes('text-right') ? 'text-right' : ''} \${customClass}\`.trim()}
                                    >
                                        {label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
`;
fs.writeFileSync(componentPath, componentCode, 'utf8');
console.log('Created AdminTable.tsx');

// Pages to process
const pagesDir = path.join(__dirname, 'src/pages/admin');
const filesToProcess = [
    { 
        file: 'Publications.tsx', 
        headersStr: `['Publicação', 'Tipo', 'Ano', 'Ações']`
    },
    { 
        file: 'News.tsx', 
        headersStr: `['Notícia', 'Data Publicação', 'Status', 'Ações']`
    },
    { 
        file: 'Members.tsx', 
        headersStr: `['Membro', 'Vínculo/Cargo', 'Entrada', 'Ações']`
    },
    { 
        file: 'Events.tsx', 
        headersStr: `['Evento', 'Data/Local', 'Tipo', 'Ações']`
    },
    { 
        file: 'Editais.tsx', 
        headersStr: `[{ label: 'Título e Descrição', className: 'w-1/2' }, 'Período', 'Status', 'Ações']`
    },
    { 
        file: 'DeclaracoesAdmin.tsx', 
        headersStr: `['Data Emissão', 'Nome do Membro', 'CPF', 'Código de Verificação', 'Ações']`
    }
];

for (const { file, headersStr } of filesToProcess) {
    let filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if missing
    if (!content.includes('AdminTable')) {
        content = content.replace(
            /import AdminSearch from '[^']+';/,
            `$&
import AdminTable from '../../components/admin/AdminTable';`
        );
    }

    // Identify the table block
    // It usually starts with <div className="bg-white... rounded... border... shadow... overflow-hidden">
    // and ends with </div></div> inside a ternary or direct return.
    
    // We will use a regex to replace from <div className="bg-white ... overflow-hidden... to <tbody ...> 
    // And from </tbody> to </table></div></div>

    // regex for the opening part:
    // matches <div className="bg-white ...> \s* <div className="overflow-x-auto"> \s* <table ...> \s* <thead ...> \s* <tr> \s* <th ...>...</th> \s* </tr> \s* </thead> \s* <tbody ...>
    const openingRegex = /<div className="bg-white[^>]*?overflow-hidden[^>]*?>\s*<div className="overflow-x-auto">\s*<table className="w-full text-left text-sm whitespace-nowrap">\s*<thead[^>]*?>\s*<tr[^>]*?>[\s\S]*?<\/tr>\s*<\/thead>\s*<tbody[^>]*?>/g;
    
    // regex for closing part:
    const closingRegex = /<\/tbody>\s*<\/table>\s*<\/div>\s*<\/div>/g;

    // We only want to replace the first occurrence (main table) if there are multiple (like history in Events)
    // Wait, Events has a history table.
    // If it has multiple, we might break the second table if we just use a global replace for closing tags.
    
    // Let's do it carefully with substring or a safer regex for the first table.
    let opened = false;
    let closed = false;

    content = content.replace(openingRegex, (match, offset) => {
        if (!opened) {
            opened = true;
            return `<AdminTable headers={${headersStr}}>`;
        }
        return match; // return original if it's the second table
    });

    content = content.replace(closingRegex, (match, offset) => {
        if (!closed) {
            closed = true;
            return `</AdminTable>`;
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
