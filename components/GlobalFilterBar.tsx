
import React, { useState } from 'react';
import { FilterState, SalesSource, Product, Customer } from '../types';
import { 
  X, Filter, Calendar, User, Globe, Package, Award, 
  ChevronDown, RotateCcw, Check, Search
} from 'lucide-react';

interface GlobalFilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  products: Product[];
  customers: Customer[];
  vipThreshold: number;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];
const TIERS: ('VIP' | 'Returning' | 'New')[] = ['VIP', 'Returning', 'New'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({ filters, setFilters, products, customers, vipThreshold }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'customer' | 'platform' | 'date' | 'product' | 'tier' | null>(null);

  const clearAll = () => {
    setFilters({
      customerHandles: [],
      platforms: [],
      dateRange: { start: '', end: '' },
      months: [],
      productNames: [],
      tiers: []
    });
  };

  const toggleItem = <T,>(list: T[], item: T, key: keyof FilterState) => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item)
      : [...list, item];
    setFilters({ ...filters, [key]: newList });
  };

  const hasActiveFilters = 
    filters.customerHandles.length > 0 || 
    filters.platforms.length > 0 || 
    filters.dateRange.start !== '' || 
    filters.months.length > 0 || 
    filters.productNames.length > 0 || 
    filters.tiers.length > 0;

  return (
    <div className="relative z-[150] mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`h-11 px-5 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all border ${
            isOpen ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
          }`}
        >
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-emerald-500 text-black rounded-full flex items-center justify-center text-[10px] font-black ml-1">
              !
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button 
            onClick={clearAll}
            className="h-11 px-5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all flex items-center gap-2 font-bold text-sm"
          >
            <RotateCcw size={14} />
            <span>Clear All</span>
          </button>
        )}

        {/* Active Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filters.platforms.map(p => (
            <FilterChip key={p} label={p} onRemove={() => toggleItem(filters.platforms, p, 'platforms')} />
          ))}
          {filters.tiers.map(t => (
            <FilterChip key={t} label={t} onRemove={() => toggleItem(filters.tiers, t, 'tiers')} />
          ))}
          {filters.dateRange.start && (
            <FilterChip label={`${filters.dateRange.start} → ${filters.dateRange.end || '...'}`} onRemove={() => setFilters({...filters, dateRange: {start: '', end: ''}})} />
          )}
          {filters.months.map(m => (
            <FilterChip key={m} label={MONTHS[m]} onRemove={() => toggleItem(filters.months, m, 'months')} />
          ))}
          {filters.productNames.map(p => (
            <FilterChip key={p} label={p} onRemove={() => toggleItem(filters.productNames, p, 'productNames')} />
          ))}
        </div>
      </div>

      {/* Filter Panel Overlay */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-full md:w-[600px] bg-[#111] border border-white/10 rounded-[32px] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Platform Selection */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} /> Sales Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map(source => (
                  <button 
                    key={source}
                    onClick={() => toggleItem(filters.platforms, source, 'platforms')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      filters.platforms.includes(source) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Selection */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Award size={12} /> Customer Tier
              </h4>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(tier => (
                  <button 
                    key={tier}
                    onClick={() => toggleItem(filters.tiers, tier, 'tiers')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      filters.tiers.includes(tier) ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Date Range
              </h4>
              <div className="flex items-center gap-3">
                <input 
                  type="date"
                  value={filters.dateRange.start}
                  onChange={e => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
                <span className="text-gray-600 text-xs">to</span>
                <input 
                  type="date"
                  value={filters.dateRange.end}
                  onChange={e => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Month Quick Select */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Month Selection
              </h4>
              <div className="grid grid-cols-4 gap-1">
                {MONTHS.map((m, i) => (
                  <button 
                    key={m}
                    onClick={() => toggleItem(filters.months, i, 'months')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      filters.months.includes(i) ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-gray-600'
                    }`}
                  >
                    {m.substr(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={12} /> Inventory Products
              </h4>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map(product => (
                  <button 
                    key={product.id}
                    onClick={() => toggleItem(filters.productNames, product.name, 'productNames')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      filters.productNames.includes(product.name) ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-white/5">
            <button 
              onClick={() => setIsOpen(false)}
              className="px-8 h-12 bg-white text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
            >
              Apply Filter Query
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterChip: React.FC<{ label: string, onRemove: () => void }> = ({ label, onRemove }) => (
  <div className="h-9 px-3 bg-white/10 border border-white/5 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">{label}</span>
    <button onClick={onRemove} className="text-gray-600 hover:text-white transition-colors">
      <X size={12} />
    </button>
  </div>
);

export default GlobalFilterBar;
