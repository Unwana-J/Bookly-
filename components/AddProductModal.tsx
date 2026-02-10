
import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { X, Package, DollarSign, Database, Tag, FileText, Check, Plus, Trash2, TrendingDown } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Omit<Product, 'id' | 'totalSales'>) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([]);
  const [variantInput, setVariantInput] = useState({ name: '', stock: 0 });

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    category: 'Fashion',
    description: ''
  });

  const addVariant = () => {
    if (!variantInput.name.trim()) return;
    setVariants([...variants, { ...variantInput }]);
    setVariantInput({ name: '', stock: 0 });
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalStock = hasVariants 
      ? variants.reduce((sum, v) => sum + v.stock, 0) 
      : formData.stock;

    onAdd({
      ...formData,
      stock: finalStock,
      variants: hasVariants ? variants.map(v => ({ ...v, id: Math.random().toString(36).substr(2, 5) })) : undefined
    });

    // Reset
    setFormData({ name: '', price: 0, costPrice: 0, stock: 0, category: 'Fashion', description: '' });
    setVariants([]);
    setHasVariants(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="text-blue-400" />
            New Product Entry
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-bold"
              placeholder="e.g. Classic Silk Scarf"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <DollarSign size={10} /> Sell Price
              </label>
              <input 
                type="number" 
                required
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-mono font-bold text-emerald-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <TrendingDown size={10} /> Cost Price
              </label>
              <input 
                type="number" 
                required
                value={formData.costPrice}
                onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-mono font-bold text-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all font-bold"
            >
              <option value="Fashion">Fashion</option>
              <option value="Food">Food & Bev</option>
              <option value="Electronics">Consumer Tech</option>
              <option value="Services">Professional Services</option>
              <option value="Home">Home & Decor</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 px-1">
            <span className="text-sm font-bold text-gray-300">Enable Product Variants?</span>
            <button 
              type="button"
              onClick={() => setHasVariants(!hasVariants)}
              className={`w-12 h-6 rounded-full relative transition-colors ${hasVariants ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hasVariants ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {!hasVariants ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Database size={10} /> Initial Stock
              </label>
              <input 
                type="number" 
                required
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-white transition-all"
              />
            </div>
          ) : (
            <div className="space-y-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Variant Inventory</label>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="XL / Blue"
                  value={variantInput.name}
                  onChange={e => setVariantInput({...variantInput, name: e.target.value})}
                  className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Qty"
                  value={variantInput.stock}
                  onChange={e => setVariantInput({...variantInput, stock: parseInt(e.target.value) || 0})}
                  className="w-20 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs outline-none"
                />
                <button 
                  type="button" 
                  onClick={addVariant}
                  className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 text-xs">
                    <span className="font-bold">{v.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono">Qty: {v.stock}</span>
                      <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <FileText size={10} /> Description
            </label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full h-24 p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-white transition-all text-sm resize-none font-medium"
              placeholder="Tell us about the item..."
            />
          </div>

          <button 
            type="submit"
            className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center space-x-2 mt-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            <Check size={20} />
            <span>Create Product</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
