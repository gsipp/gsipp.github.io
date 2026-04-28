export const generateDeclarationHTML = (member: any, customTemplate?: string, settings?: any) => {
    const startDate = member.data_entrada ? new Date(member.data_entrada).toLocaleDateString('pt-BR') : 'DD/MM/AAAA';
    const endDate = member.data_saida ? new Date(member.data_saida).toLocaleDateString('pt-BR') : 'DD/MM/AAAA';
    const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Settings / Fallbacks
    const logoUfc = settings?.logo_ufc || 'https://www.crateus.ufc.br/wp-content/uploads/2021/04/logo-ufc-crateus-300x125.png';
    const logoGsipp = settings?.logo_gsipp || 'https://gsipp.github.io/logo-dark.png';
    const address = settings?.cabecalho_endereco || '07.272.636/0001-31\nCampus Universitário\nAvenida Professora Machadinha Lima, S/N -\nPríncipe Imperial, Crateús - CE, 63708-825';

    const matricula = member.matricula || '_______';
    const cpf = member.cpf || '___________';
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
        const end = member.data_saida ? new Date(member.data_saida) : new Date();
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
                    width: 180px; /* Reduzi de 220px */
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
                .print-button {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background-color: #0056b3;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                @media print {
                    .print-button { display: none; }
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

            <button class="print-button" onclick="window.print()">Imprimir Declaração</button>
            <script>
                // Pequeno atraso para garantir que as imagens carreguem antes de imprimir
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;
};
