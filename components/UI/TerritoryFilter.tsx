import React from 'react';
import { Filter, User, Users, Globe } from 'lucide-react';

interface TerritoryFilterProps {
    currentFilter: 'all' | 'mine' | 'others';
    onFilterChange: (filter: 'all' | 'mine' | 'others') => void;
}

const TerritoryFilter: React.FC<TerritoryFilterProps> = ({ currentFilter, onFilterChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const filters = [
        { value: 'all' as const, label: 'Todos', icon: Globe, color: 'blue' },
        { value: 'mine' as const, label: 'Meus', icon: User, color: 'green' },
        { value: 'others' as const, label: 'Outros', icon: Users, color: 'orange' },
    ];

    const currentFilterData = filters.find(f => f.value === currentFilter) || filters[0];
    const CurrentIcon = currentFilterData.icon;

    return (
        <div className="relative">
            {/* Botão Principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg border-2 transition-all backdrop-blur-md ${currentFilter === 'all' ? 'bg-blue-500/90 border-blue-600' :
                        currentFilter === 'mine' ? 'bg-green-500/90 border-green-600' :
                            'bg-orange-500/90 border-orange-600'
                    }`}
                title="Filtrar Territórios"
            >
                <Filter size={18} className="text-white" />
                <CurrentIcon size={18} className="text-white" />
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                    {currentFilterData.label}
                </span>
            </button>

            {/* Menu Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay para fechar ao clicar fora */}
                    <div
                        className="fixed inset-0 z-[399]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full mt-2 right-0 z-[400] bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            const isActive = currentFilter === filter.value;

                            return (
                                <button
                                    key={filter.value}
                                    onClick={() => {
                                        onFilterChange(filter.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${isActive
                                            ? `bg-${filter.color}-500 text-white`
                                            : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
                                    <span className="text-sm font-semibold">{filter.label}</span>
                                    {isActive && (
                                        <span className="ml-auto text-xs">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default TerritoryFilter;
