const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages/admin');
const filesToProcess = ['Publications.tsx', 'News.tsx', 'Members.tsx', 'Events.tsx', 'Editais.tsx', 'DeclaracoesAdmin.tsx'];

for (const file of filesToProcess) {
    let filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove "Search," or "Search" from lucide-react imports
    // We only want to remove it if it's imported from lucide-react
    content = content.replace(/import\s+\{([^}]*)Search,?\s*([^}]*)\}\s+from\s+'lucide-react';/g, (match, p1, p2) => {
        const newImports = (p1 + p2).replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
        if (newImports.trim().length === 0) return '';
        return `import { ${newImports.trim()} } from 'lucide-react';`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned imports in ${file}`);
}
