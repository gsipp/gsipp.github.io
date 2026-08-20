import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8">
            <SEO title="Página Não Encontrada | GSIPP" />
            <p className="text-8xl font-black text-gray-200 mb-4">404</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
            <p className="text-gray-500 mb-6">A URL que você acessou não existe ou foi movida.</p>
            <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                Voltar para o início
            </Link>
        </div>
    );
};

export default NotFound;
