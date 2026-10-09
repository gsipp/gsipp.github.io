import { Search } from 'lucide-react';

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
        <div className={`relative flex-1 ${className}`}>
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
