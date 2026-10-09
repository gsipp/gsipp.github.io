// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateDeclarationHTML = (member: Record<string, any>, customTemplate?: string, settings?: Record<string, any>, codigoVerificacao?: string) => {
    void codigoVerificacao; // Impede erro TS6133 de compilação
    // Utilitário para formatar datas YYYY-MM-DD com segurança de fuso horário
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'DD/MM/AAAA';
        const [year, month, day] = dateStr.split('-');
        if (year && month && day) return `${day}/${month}/${year}`;
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const todayStr = new Date().toISOString().split('T')[0];
    // Prioridade: Data de Declaração (custom) -> Data de Saída -> Hoje (se for ativo e não informou)
    const effectiveEndDate = member.data_declaracao || member.data_saida || todayStr;
    const startDate = formatDate(member.data_entrada);
    const endDate = formatDate(effectiveEndDate);
    
    // Data de emissão (rodapé)
    let issueDate = new Date();
    if (member.data_declaracao) {
        const [y, m, d] = member.data_declaracao.split('-');
        if (y && m && d) issueDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    const currentDate = issueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Settings / Fallbacks
    const logoUfc = settings?.logo_ufc || 'https://www.crateus.ufc.br/wp-content/uploads/2021/04/logo-ufc-crateus-300x125.png';
    const logoGsipp = settings?.logo_gsipp || 'https://gsipp.github.io/logo-dark.png';
    const address = settings?.cabecalho_endereco || '07.272.636/0001-31\nCampus Universitário\nAvenida Professora Machadinha Lima, S/N -\nPríncipe Imperial, Crateús - CE, 63708-825';

    const matricula = member.matricula || '_______';
    const curso = member.curso || '_____________________';
    const cargaHoraria = member.carga_horaria || '__';
    const orientador = member.orientador || 'Antonio Emerson Barros Tomaz';

    // Máscara de CPF
    const formatCPF = (v: string) => {
        v = v.replace(/\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return v;
    };

    const cpfFormatted = member.cpf ? formatCPF(member.cpf) : '___________';

    // Cálculo automático de horas
    let calculatedTotalHours = member.total_horas;
    if (!calculatedTotalHours && member.data_entrada && member.carga_horaria) {
        const start = new Date(member.data_entrada);
        let end = new Date();
        if (effectiveEndDate) {
            const [y, m, d] = effectiveEndDate.split('-');
            if (y && m && d) end = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        }
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeks = diffDays / 7;
        const weeklyHours = parseInt(member.carga_horaria.replace(/\D/g, '')) || 0;
        calculatedTotalHours = Math.round(weeks * weeklyHours).toString();
    }

    const totalHoras = calculatedTotalHours || '___';

    let content = `
        Declaramos, para os devidos fins, que <strong>${member.nome}</strong>,
        matrícula <strong>${matricula}</strong>, CPF <strong>${cpfFormatted}</strong>, 
        estudante do curso de <strong>${curso}</strong>, participou como voluntário do 
        <strong>Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade (GSIPP)</strong> 
        da Universidade Federal do Ceará - Campus de Crateús, no período de <strong>${startDate}</strong> a <strong>${endDate}</strong>, 
        com carga horária semanal de <strong>${cargaHoraria} horas</strong>, sob a orientação do 
        ${orientador}, totalizando <strong>${totalHoras} horas</strong> ao longo do período.
    `;

    if (customTemplate) {
        content = customTemplate
            .replace(/{{nome}}/g, `<strong>${member.nome}</strong>`)
            .replace(/{{matricula}}/g, `<strong>${matricula}</strong>`)
            .replace(/{{cpf}}/g, `<strong>${cpfFormatted}</strong>`)
            .replace(/{{curso}}/g, `<strong>${curso}</strong>`)
            .replace(/{{data_inicio}}/g, `<strong>${startDate}</strong>`)
            .replace(/{{data_fim}}/g, `<strong>${endDate}</strong>`)
            .replace(/{{carga_horaria}}/g, `<strong>${cargaHoraria}</strong>`)
            .replace(/{{orientador}}/g, orientador)
            .replace(/{{total_horas}}/g, `<strong>${totalHoras}</strong>`);
    }

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Declaração - ${member.nome}</title>
            <style>
                @page { 
                    margin: 0; /* Remove cabeçalhos e rodapés do navegador (data, título, url) */
                    size: auto;
                }
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    line-height: 1.5; 
                    color: #000;
                    margin: 2.5cm; /* Adiciona a margem de volta apenas ao conteúdo */
                    padding: 0;
                }
                .header-table {
                    width: 100%;
                    margin-bottom: 50px;
                    border-collapse: collapse;
                }
                .header-table td {
                    vertical-align: middle;
                    padding: 0 10px;
                }
                .logo-ufc {
                    width: 120px; /* Reduzi de 220px */
                }
                .logo-gsipp {
                    width: 145px; /* Reduzi de 150px */
                }
                .header-center {
                    text-align: left;
                    font-size: 9pt; /* Reduzi levemente de 10pt */
                    line-height: 1.3;
                    white-space: pre-line;
                }
                .title { 
                    font-size: 18pt; 
                    font-weight: bold; 
                    text-align: center; 
                    margin-top: 80px;
                    margin-bottom: 80px; 
                    text-transform: uppercase; 
                    letter-spacing: 2px;
                }
                .content { 
                    font-size: 13pt; 
                    text-align: justify; 
                    margin-bottom: 80px; 
                    text-indent: 1.5cm;
                    line-height: 1.8;
                }
                .content strong {
                    font-weight: bold;
                }
                .signature-block { 
                    text-align: center; 
                    margin-top: 100px; 
                    font-size: 12pt;
                    line-height: 1.4;
                }
                .signature-block p {
                    margin: 2px 0;
                }
                .action-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    padding: 15px 25px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }
                .print-button {
                    background-color: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 24px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .print-button:hover {
                    background-color: #1d4ed8;
                }
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 2.5cm; } /* Garante que a margem funcione na impressão */
                }
            </style>
        </head>
        <body>
            <table class="header-table">
                <tr>
                    <td style="width: 25%;">
                        <img src="${logoUfc}" alt="UFC Logo" class="logo-ufc" />
                    </td>
                    <td style="width: 50%;" class="header-center">
                        ${address}
                    </td>
                    <td style="width: 25%; text-align: right;">
                        <img src="${logoGsipp}" alt="GSIPP Logo" class="logo-gsipp" style="margin-left: auto; display: block;" />
                    </td>
                </tr>
            </table>

            <div class="title">DECLARAÇÃO</div>

            <div class="content">
                ${content}
            </div>

            <div style="text-align: center; margin-top: 60px; margin-bottom: 60px; font-size: 12pt;">
                Crateús, ${currentDate}.
            </div>

            <div class="signature-block">
                <p>${orientador}</p>
                <p>Professor do Magistério Superior</p>
                <p>Universidade Federal do Ceará — Campus de Crateús</p>
                <p>Coordenador do Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade (GSIPP)</p>
            </div>

            ${/* footer de verificação oculto temporariamente a pedido do usuário
            codigoVerificacao ? \`
            <div style="text-align: center; font-size: 10pt; color: #555; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px;">
                Para verificar a autenticidade desta declaração, acesse <strong>gsipp.com.br/validar</strong><br>
                Código de Verificação: <strong>\${codigoVerificacao}</strong>
            </div>
            \` : */ ''}

            <div class="action-bar no-print">
                <div style="flex: 1;">
                    <strong>Dica para baixar em PDF:</strong> Ao clicar no botão ao lado, mude o Destino (ou Impressora) para <b>"Salvar como PDF"</b>.
                </div>
                <button class="print-button" onclick="window.print()">Baixar PDF / Imprimir</button>
            </div>

            <script>
                // Remover o onload print automático para o usuário ler a dica
            </script>
        </body>
        </html>
    `;
};
