import type { ReactNode } from 'react';

export interface AdminTableColumn {
    label: string;
    className?: string;
}

interface AdminTableProps {
    headers: (string | AdminTableColumn)[];
    children: ReactNode;
}

export default function AdminTable({ headers, children }: AdminTableProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {headers.map((header, index) => {
                                const label = typeof header === 'string' ? header : header.label;
                                const customClass = typeof header === 'string' ? '' : (header.className || '');
                                const alignRight = label.toLowerCase().trim() === 'ações' || customClass.includes('text-right');
                                
                                return (
                                    <th 
                                        key={index} 
                                        className={`px-6 py-3 font-medium text-slate-500 ${alignRight && !customClass.includes('text-right') ? 'text-right' : ''} ${customClass}`.trim()}
                                    >
                                        {label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
