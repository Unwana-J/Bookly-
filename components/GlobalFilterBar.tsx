
import React, { useState } from 'react';
import { FilterState, SalesSource, Product, Customer, TransactionStatus } from '../types';
import {
  X, Filter, Calendar, User, Globe, Package, Award,
  ChevronDown, RotateCcw, Check, Search, CreditCard
} from 'lucide-react';

interface GlobalFilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  products: Product[];
  customers: Customer[];
  vipThreshold: number;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];
const STATUSES: TransactionStatus[] = ['paid', 'unpaid', 'confirmed', 'cancelled'];
const TIERS: ('VIP' | 'Returning' | 'New')[] = ['VIP', 'Returning', 'New'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({ filters, setFilters, products, customers, vipThreshold }) => {
  const [isOpen, setIsOpen] = useState(false);

  const clearAll = () => {
    setFilters({
      customerHandles: [],
      platforms: [],
      status: [],
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
    filters.status.length > 0 ||
    filters.dateRange.start !== '' ||
    filters.months.length > 0 ||
    filters.productNames.length > 0 ||
    filters.tiers.length > 0;

  return (
    <div className="relative z-[150] mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-11 px-5 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all border ${isOpen ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
        >
          <Filter size={16} />
          <span>Filter Ledger</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-emerald-500 text-black rounded-full flex items-center justify-center text-[10px] font-black ml-1 animate-pulse">
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
            <span>Reset</span>
          </button>
        )}

        {/* Active Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filters.platforms.map(p => (
            <FilterChip key={p} label={p} onRemove={() => toggleItem(filters.platforms, p, 'platforms')} />
          ))}
          {filters.status.map(s => (
            <FilterChip key={s} label={s} onRemove={() => toggleItem(filters.status, s, 'status')} />
          ))}
          {filters.tiers.map(t => (
            <FilterChip key={t} label={t} onRemove={() => toggleItem(filters.tiers, t, 'tiers')} />
          ))}
          {filters.dateRange.start && (
            <FilterChip label={`${filters.dateRange.start} → ${filters.dateRange.end || '...'}`} onRemove={() => setFilters({ ...filters, dateRange: { start: '', end: '' } })} />
          )}
          {filters.months.map(m => (
            <FilterChip key={m} label={MONTHS[m]} onRemove={() => toggleItem(filters.months, m, 'months')} />
          ))}
          {filters.productNames.map(p => (
            <FilterChip key={p} label={p} onRemove={() => toggleItem(filters.productNames, p, 'productNames')} />
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-14 left-0 w-full md:w-[640px] bg-[#111] border border-white/10 rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} /> Source Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map(source => (
                  <button
                    key={source}
                    onClick={() => toggleItem(filters.platforms, source, 'platforms')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${filters.platforms.includes(source) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} /> Payment Health
              </h4>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleItem(filters.status, status, 'status')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${filters.status.includes(status) ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Award size={12} /> Buyer Tiers
              </h4>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(tier => (
                  <button
                    key={tier}
                    onClick={() => toggleItem(filters.tiers, tier, 'tiers')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${filters.tiers.includes(tier) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Month Log
              </h4>
              <div className="grid grid-cols-4 gap-1">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => toggleItem(filters.months, i, 'months')}
                    className={`py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${filters.months.includes(i) ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-gray-600'
                      }`}
                  >
                    {m.substr(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={12} /> Specific Product
              </h4>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => toggleItem(filters.productNames, product.name, 'productNames')}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${filters.productNames.includes(product.name) ? 'bg-white/10 border-white text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
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
              className="px-12 h-14 bg-white text-black font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Apply Filter State
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
