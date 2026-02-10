import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  AlertCircle,
  TrendingDown,
  RefreshCw,
  Box,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onOpenAddProduct?: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, onOpenAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestock = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: p.stock + amount } : p
    ));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Inventory Vault</h1>
          <p className="text-[#64748B] mt-1 font-medium italic">Stock availability syncs automatically with confirmed sales.</p>
        </div>
        <button 
          onClick={() => onOpenAddProduct?.()}
          className="h-12 px-6 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center space-x-2 hover:opacity-90 active:scale-95 transition-all shadow-xl"
        >
          <Plus size={20} />
          <span>New Product</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={20} />
          <input 
            type="text" 
            placeholder="Search catalog..."
            className="w-full h-14 pl-12 pr-4 bg-white border border-[#0F172A]/10 rounded-2xl focus:border-[#2DD4BF] outline-none transition-all font-medium text-[#0F172A]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Grid: Adaptive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const isLow = product.stock < 5;
          const isExpanded = expandedId === product.id;

          return (
            <div 
              key={product.id} 
              className={`cyber-border rounded-[32px] p-6 flex flex-col h-full relative transition-all duration-300 card-shadow hover-lift ${!isLow ? 'available-cue' : 'booked-cue'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#F0FDF4] rounded-2xl text-[#2DD4BF] border border-[#2DD4BF]/10">
                  <Box size={24} />
                </div>
                <button className="text-[#64748B] hover:text-[#0F172A]"><MoreVertical size={20} /></button>
              </div>

              <div className="flex-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#64748B] block mb-1">
                  {product.category}
                </span>
                <h3 className="text-xl font-black leading-tight text-[#0F172A] mb-2">{product.name}</h3>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-2xl font-mono font-black text-[#0F172A]">${product.price}</span>
                  <span className="px-2 py-0.5 bg-[#F0FDF4] border border-[#2DD4BF]/10 rounded text-[9px] font-black text-[#2DD4BF] uppercase">Unit Price</span>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-[#64748B] uppercase tracking-widest mb-1">Stock</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-black ${isLow ? 'text-red-500' : 'text-[#0F172A]'}`}>
                        {product.stock}
                      </span>
                      {isLow && <AlertCircle size={16} className="text-red-500" />}
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-[#64748B] uppercase tracking-widest mb-1">Volume</p>
                    <p className="text-xl font-black text-[#2DD4BF]">{product.totalSales}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRestock(product.id, 10)}
                    className="flex-1 h-12 bg-white border border-[#0F172A]/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F0FDF4] hover:border-[#2DD4BF] transition-all"
                  >
                    <RefreshCw size={16} />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
              
              {isLow && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 py-1.5 px-3 rounded-full flex items-center justify-center space-x-2">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Low Inventory Alert</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;