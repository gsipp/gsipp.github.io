const fs = require('fs');
const path = require('path');

// 1. Create the component
const componentPath = path.join(__dirname, 'src/components/admin/AdminSearch.tsx');
const componentCode = `import { Search } from 'lucide-react';

interface AdminSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function AdminSearch({ 
    value, 
    onChange, 
    placeholder = "Buscar...", 
    className = "sm:w-64" 
}: AdminSearchProps) {
    return (
        <div className={\`relative flex-1 \${className}\`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
            />
        </div>
    );
}
`;
fs.writeFileSync(componentPath, componentCode, 'utf8');
console.log('Created AdminSearch.tsx');

const pagesDir = path.join(__dirname, 'src/pages/admin');
const filesToProcess = [
    { file: 'Publications.tsx', placeholder: 'Buscar publicação...' },
    { file: 'News.tsx', placeholder: 'Buscar notícia...' },
    { file: 'Members.tsx', placeholder: 'Buscar membro...' },
    { file: 'Events.tsx', placeholder: 'Buscar evento...' },
    { file: 'Editais.tsx', placeholder: 'Buscar edital...' },
    { file: 'DeclaracoesAdmin.tsx', placeholder: 'Buscar por nome, CPF ou código...', className: 'sm:w-80' }
];

for (const { file, placeholder, className } of filesToProcess) {
    let filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add import if missing
    if (!content.includes('AdminSearch')) {
        content = content.replace(
            /(import [^\n]+lucide-react[^\n]+)/,
            `$1\nimport AdminSearch from '../../components/admin/AdminSearch';`
        );
    }

    // Replace old search block
    const searchBlockRegex = /<div className="relative flex-1 sm:w-\d+">[\s\S]*?<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-slate-400" \/>[\s\S]*?<input[\s\S]*?type="text"[\s\S]*?placeholder="([^"]+)"[\s\S]*?value=\{searchTerm\}[\s\S]*?onChange=\{\(e\) => setSearchTerm\(e.target.value\)\}[\s\S]*?className="w-full pl-9 pr-4 py-2 text-sm rounded-[^"]+"[\s\S]*?\/>[\s\S]*?<\/div>/;

    const classProp = className ? ` className="${className}"` : '';
    const newComponent = `<AdminSearch
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="${placeholder}"${classProp}
                        />`;

    content = content.replace(searchBlockRegex, newComponent);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
