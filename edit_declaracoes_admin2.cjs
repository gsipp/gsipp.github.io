const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/admin/DeclaracoesAdmin.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { Link }')) {
    content = content.replace(
        /import { Search, Printer, Trash2, Loader2 } from 'lucide-react';/,
        `import { Search, Printer, Trash2, Loader2, Plus } from 'lucide-react';\nimport { Link } from 'react-router-dom';`
    );
}

content = content.replace(
    /className="relative flex-1 sm:w-64"/,
    `className="relative flex-1 sm:w-80"`
);

if (!content.includes('<Link to="/gestao-gsipp/membros"')) {
    content = content.replace(
        /<\/div>\s*<\/header>/,
        `</div>
                    <Link
                        to="/gestao-gsipp/membros"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Nova Declaração
                    </Link>
                </div>
            </header>`
    );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Button and width added to DeclaracoesAdmin.tsx');
