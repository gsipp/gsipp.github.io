var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};
function filledCell(cell) {
    return cell !== '' && cell != null;
}
function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            var filteredData = jsonData.filter(row => row.some(filledCell));
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
            return csv;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}

// Sample JSON data for membros
const membros = [
    { name: "Membro 1", area: "Segurança Cibernética", level: "graduacao", linkedin: "#", lattes: "#" },
    { name: "Membro 2", area: "Criptografia", level: "mestrado", linkedin: "#", lattes: "#" },
    { name: "Membro 3", area: "Privacidade de Dados", level: "doutorado", linkedin: "#", lattes: "#" },
    { name: "Membro 4", area: "Segurança em Redes", level: "graduacao", linkedin: "#", lattes: "#" },
    { name: "Membro 5", area: "Identidade Digital", level: "mestrado", linkedin: "#", lattes: "#" },
    { name: "Membro 6", area: "Análise de Vulnerabilidades", level: "doutorado", linkedin: "#", lattes: "#" },
    { name: "Membro 7", area: "Segurança em IoT", level: "graduacao", linkedin: "#", lattes: "#" }
];

// Sample JSON data for TCC transmissions
const tccTransmissions = [
    {
        title: "TCC I - Laercio Levi Silva de Melo",
        student: "Laercio Levi Silva de Melo",
        date: "15/07/2025",
        description: "Defesa de TCC sobre segurança em dispositivos IoT.",
        youtubeLink: "https://www.youtube.com/embed/3m-ZQFiZVfs",
        tccLink: "#"
    },
    {
        title: "Defesa de TCC: Privacidade em Blockchain",
        student: "Nome do Estudante",
        date: "20/08/2025",
        description: "Apresentação sobre os desafios de privacidade em tecnologias blockchain.",
        youtubeLink: "https://www.youtube.com/embed/3m-ZQFiZVfs",
        tccLink: "#"
    }
];

// Pagination variables
const membrosPerPage = 6;
const noticiasPerPage = 3;
let membrosCurrentPage = 1;
let noticiasCurrentPage = 1;
let noticias = [];

// Fetch noticias from JSON file
async function fetchNoticias() {
    try {
        const response = await fetch('data/noticias.json');
        const data = await response.json();
        noticias = data.noticias;
        loadNoticias(noticiasCurrentPage);
    } catch (error) {
        console.error('Erro ao carregar noticias:', error);
        noticias = [];
        loadNoticias(noticiasCurrentPage);
    }
}

// Function to populate membros
function loadMembros(page) {
    const container = document.getElementById('membros-container');
    container.innerHTML = '';
    const start = (page - 1) * membrosPerPage;
    const end = start + membrosPerPage;
    const paginatedMembros = membros.slice(start, end);

    paginatedMembros.forEach(membro => {
        const membroCard = document.createElement('div');
        membroCard.className = 'bg-white p-8 rounded-xl shadow-lg card-hover relative';
        membroCard.innerHTML = `
            <span class="academic-tag tag-${membro.level} absolute top-4 right-4">
                <i class="fas fa-${membro.level === 'graduacao' ? 'graduation-cap' : membro.level === 'mestrado' ? 'book' : 'university'} mr-1"></i>
                ${membro.level.charAt(0).toUpperCase() + membro.level.slice(1)}
            </span>
            <img src="https://via.placeholder.com/150" alt="${membro.name}" class="w-36 h-36 rounded-full mx-auto border-4 border-blue-100 object-cover">
            <h3 class="text-2xl font-semibold text-center mt-6 text-gray-800">${membro.name}</h3>
            <p class="text-gray-600 text-center mt-2">Pesquisador em ${membro.area}</p>
            <div class="flex justify-center space-x-6 mt-4">
                <a href="${membro.linkedin}" class="text-blue-600 hover:text-blue-800 transition"><i class="fab fa-linkedin fa-lg"></i></a>
                <a href="${membro.lattes}" class="text-blue-600 hover:text-blue-800 transition">Lattes</a>
            </div>
        `;
        container.appendChild(membroCard);
    });

    document.getElementById('membros-page-info').textContent = `Página ${page} de ${Math.ceil(membros.length / membrosPerPage)}`;
    document.getElementById('membros-prev-page').disabled = page === 1;
    document.getElementById('membros-next-page').disabled = page === Math.ceil(membros.length / membrosPerPage);
}

// Function to populate TCC transmissions
function loadTccTransmissions() {
    const container = document.getElementById('tcc-container');
    container.innerHTML = '';
    tccTransmissions.forEach(tcc => {
        const tccCard = document.createElement('div');
        tccCard.className = 'tcc-card p-8 rounded-xl shadow-lg card-hover flex flex-col md:flex-row gap-6 relative';
        tccCard.innerHTML = `
            <div class="md:w-1/2">
                <iframe class="w-full h-48 md:h-64 rounded-lg" src="${tcc.youtubeLink}" title="${tcc.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
            <div class="md:w-1/2">
                <span class="status-tag absolute top-4 right-4"><i class="fas fa-film mr-1"></i>Encerrado</span>
                <h3 class="text-2xl font-semibold text-gray-800">${tcc.title}</h3>
                <p class="text-gray-600 mt-3"><strong>Discente:</strong> ${tcc.student}</p>
                <p class="text-gray-600"><strong>Data da Defesa:</strong> ${tcc.date}</p>
                <p class="text-gray-600 mt-3">${tcc.description}</p>
                <div class="flex space-x-4 mt-4">
                    <a href="${tcc.tccLink}" target="_blank" class="text-blue-600 hover:text-blue-800 font-semibold"><i class="fas fa-file-pdf mr-1"></i>Ler TCC</a>
                    <a href="${tcc.youtubeLink}" target="_blank" class="text-blue-600 hover:text-blue-800 font-semibold"><i class="fab fa-youtube mr-1"></i>Assistir no YouTube</a>
                </div>
            </div>
        `;
        container.appendChild(tccCard);
    });
}

// Function to populate notícias
function loadNoticias(page) {
    const container = document.getElementById('noticias-container');
    container.innerHTML = '';
    const start = (page - 1) * noticiasPerPage;
    const end = start + noticiasPerPage;
    const paginatedNoticias = noticias.slice(start, end);

    paginatedNoticias.forEach((noticia, index) => {
        const noticiaCard = document.createElement('div');
        noticiaCard.className = 'news-card p-8 rounded-xl shadow-lg card-hover flex flex-col md:flex-row gap-6';
        noticiaCard.innerHTML = `
            <img src="${noticia.image}" alt="${noticia.title}" class="w-full md:w-1/3 h-48 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="text-2xl font-semibold text-gray-800 mb-3">${noticia.title}</h3>
                <p class="text-gray-600 mb-2">Data: ${noticia.date}</p>
                <p class="text-gray-600">${noticia.description}</p>
            </div>
        `;
        noticiaCard.addEventListener('click', () => {
            window.location.href = `noticia.html?index=${start + index}`;
        });
        container.appendChild(noticiaCard);
    });

    document.getElementById('noticias-page-info').textContent = `Página ${page} de ${Math.ceil(noticias.length / noticiasPerPage)}`;
    document.getElementById('noticias-prev-page').disabled = page === 1;
    document.getElementById('noticias-next-page').disabled = page === Math.ceil(noticias.length / noticiasPerPage);
}

// Event listeners for pagination
document.getElementById('membros-prev-page').addEventListener('click', () => {
    if (membrosCurrentPage > 1) {
        membrosCurrentPage--;
        loadMembros(membrosCurrentPage);
    }
});

document.getElementById('membros-next-page').addEventListener('click', () => {
    if (membrosCurrentPage < Math.ceil(membros.length / membrosPerPage)) {
        membrosCurrentPage++;
        loadMembros(membrosCurrentPage);
    }
});

document.getElementById('noticias-prev-page').addEventListener('click', () => {
    if (noticiasCurrentPage > 1) {
        noticiasCurrentPage--;
        loadNoticias(noticiasCurrentPage);
    }
});

document.getElementById('noticias-next-page').addEventListener('click', () => {
    if (noticiasCurrentPage < Math.ceil(noticias.length / noticiasPerPage)) {
        noticiasCurrentPage++;
        loadNoticias(noticiasCurrentPage);
    }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Load initial content
document.addEventListener('DOMContentLoaded', () => {
    loadMembros(membrosCurrentPage);
    fetchNoticias();
    loadTccTransmissions();
});