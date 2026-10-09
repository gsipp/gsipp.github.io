const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'README.md');
let content = fs.readFileSync(filePath, 'utf8');

// Update Features
content = content.replace(
    /\* \*\*Notícias & Eventos:\*\* Atualizações recentes e calendário de eventos\./,
    `* **Notícias & Eventos:** Atualizações recentes e calendário de eventos.
* **Editais:** Divulgação de oportunidades e vagas.
* **Validação de Documentos:** Sistema público (/validar) para verificação de autenticidade de declarações via código exclusivo.`
);

content = content.replace(
    /\* Adição, edição e remoção de Membros, Publicações, Notícias e Eventos\./,
    `* Adição, edição e remoção de Membros, Publicações, Notícias, Eventos e Editais.
  * **Módulo de Declarações:** Geração automatizada de declarações em PDF com código de verificação antifraude integrado.`
);

// Add Docs section
content = content.replace(
    /## 💻 Tecnologias Utilizadas/,
    `## 📚 Documentação Técnica

Consulte a documentação aprofundada para entender a estrutura do banco de dados e a arquitetura do sistema:
- [Arquitetura e Banco de Dados (ARCHITECTURE.md)](./ARCHITECTURE.md)

---

## 💻 Tecnologias Utilizadas`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('README.md updated.');
