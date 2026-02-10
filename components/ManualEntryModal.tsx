import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Product, SalesSource, ExtractedSale, BusinessProfile, Customer } from '../types';
import { analyzeIntentAndExtract } from '../services/geminiService';
import { 
  X, 
  Camera, 
  User, 
  Package, 
  DollarSign, 
  Calendar, 
  Tag, 
  Check, 
  Loader2,
  Layers,
  MessageCircle,
  Instagram,
  Facebook,
  Store,
  Phone,
  Globe,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Product[];
  onConfirm: (saleData: ExtractedSale) => void;
  businessProfile?: BusinessProfile | null;
  customers?: Customer[];
}

const PLATFORMS: { value: SalesSource; label: string; icon: React.ReactNode }[] = [
  { value: 'WhatsApp', label: 'WhatsApp', icon: <MessageCircle size={16} className="text-green-500" /> },
  { value: 'Instagram', label: 'Instagram', icon: <Instagram size={16} className="text-pink-500" /> },
  { value: 'Facebook', label: 'Facebook', icon: <Facebook size={16} className="text-blue-500" /> },
  { value: 'Walk-in', label: 'Walk-in', icon: <Store size={16} className="text-amber-500" /> },
  { value: 'Phone Call', label: 'Phone Call', icon: <Phone size={16} className="text-blue-400" /> },
  { value: 'Other', label: 'Other', icon: <Globe size={16} className="text-gray-400" /> },
];

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, inventory, onConfirm, businessProfile, customers }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerHandle: '',
    productName: '',
    variant: '',
    quantity: 1,
    priceEstimate: 0,
    source: 'Walk-in' as SalesSource,
    date: new Date().toISOString().split('T')[0]
  });

  const selectedProduct = useMemo(() => inventory.find(p => p.name === formData.productName), [formData.productName, inventory]);

  const suggestions = useMemo(() => {
    // Basic suggestion: Top items in stock
    return inventory
      .filter(p => p.stock > 0)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 3);
  }, [inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.customerHandle) return alert("Required fields missing.");
    
    const confirmedSale: ExtractedSale = {
      intent: 'sale',
      orderType: 'single',
      confidence: 'high',
      customers: [{
        handle: formData.customerHandle.startsWith('@') ? formData.customerHandle : `@${formData.customerHandle}`,
        platform: formData.source,
        items: [{
          productName: formData.productName,
          quantity: formData.quantity,
          variant: formData.variant,
          unitPrice: formData.priceEstimate / (formData.quantity || 1)
        }],
        orderTotal: formData.priceEstimate
      }]
    };

    onConfirm(confirmedSale);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <h2 className="text-2xl font-bold text-white">Manual Sales Entry</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={24} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer Handle *</label>
              <input 
                type="text" required
                value={formData.customerHandle}
                onChange={e => setFormData({...formData, customerHandle: e.target.value})}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none"
                placeholder="@handle"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Platform *</label>
              <select 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value as SalesSource})}
                className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl px-5 text-white outline-none"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Product *</label>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map(p => (
                <button 
                  key={p.id} type="button"
                  onClick={() => setFormData({...formData, productName: p.name, priceEstimate: p.price * formData.quantity})}
                  className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${formData.productName === p.name ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-white' : 'bg-white/5 border-white/5 text-slate-400'}`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-[#2DD4BF]" />
                    <span className="text-xs font-bold">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono">${p.price}</span>
                </button>
              ))}
            </div>
            <select 
              value={formData.productName}
              onChange={e => {
                const p = inventory.find(prod => prod.name === e.target.value);
                setFormData({...formData, productName: e.target.value, priceEstimate: (p?.price || 0) * formData.quantity});
              }}
              className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl px-5 text-white outline-none mt-2"
            >
              <option value="">Other Products...</option>
              {inventory.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quantity</label>
              <input 
                type="number" min="1"
                value={formData.quantity}
                onChange={e => {
                  const q = parseInt(e.target.value) || 1;
                  setFormData({...formData, quantity: q, priceEstimate: (selectedProduct?.price || 0) * q});
                }}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Final Price</label>
              <input 
                type="number"
                value={formData.priceEstimate}
                onChange={e => setFormData({...formData, priceEstimate: parseFloat(e.target.value) || 0})}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-[#2DD4BF] font-black"
              />
            </div>
          </div>

          <button type="submit" className="w-full h-16 bg-white text-black font-black rounded-3xl mt-4">Save Sale Entry</button>
        </form>
      </div>
    </div>
  );
};

export default ManualEntryModal;