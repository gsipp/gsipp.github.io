import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface DropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[] | string[];
    icon?: React.ReactNode;
    placeholder?: string;
    className?: string;
}

export default function Dropdown({ value, onChange, options, icon, placeholder = "Selecione...", className = "" }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Normalize options
    const normalizedOptions: Option[] = options.map(opt => 
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-4 pr-4 py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {icon && <span className="text-slate-500 flex-shrink-0">{icon}</span>}
                    <span className="font-bold text-sm truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-3 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {normalizedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    value === option.value 
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span className="truncate">{option.label}</span>
                                {value === option.value && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
