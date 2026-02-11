
import React, { useState, useMemo } from 'react';
import { Product, SalesSource, ExtractedSale, BusinessProfile, Customer, PaymentMethod } from '../types';
import { X, Check, MessageCircle, Instagram, Facebook, Store, Phone, Globe, Sparkles, Banknote, Wallet } from 'lucide-react';

export interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Product[];
  onConfirm: (saleData: ExtractedSale) => void;
  businessProfile?: BusinessProfile | null;
  customers?: Customer[];
}

const PLATFORMS: { value: SalesSource; label: string }[] = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Phone Call', label: 'Phone Call' },
  { value: 'Other', label: 'Other' },
];

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, inventory, onConfirm, businessProfile }) => {
  const [formData, setFormData] = useState({
    customerHandle: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    source: 'Walk-in' as SalesSource,
    paymentMethod: 'Cash/Transfer' as PaymentMethod
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const suggestions = useMemo(() => {
    return inventory.filter(p => p.stock > 0).sort((a, b) => b.totalSales - a.totalSales).slice(0, 3);
  }, [inventory]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerHandle) e.handle = "Handle required";
    if (!formData.productName) e.product = "Product required";
    if (formData.quantity <= 0) e.qty = "Must be > 0";
    if (formData.unitPrice < 0) e.price = "Invalid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const confirmedSale: ExtractedSale = {
      intent: 'sale',
      orderType: 'single',
      confidence: 'high',
      customers: [{
        handle: formData.customerHandle.startsWith('@') ? formData.customerHandle : `@${formData.customerHandle}`,
        platform: formData.source,
        paymentMethod: formData.paymentMethod,
        items: [{
          productName: formData.productName,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice
        }],
        orderTotal: formData.unitPrice * formData.quantity
      }]
    };

    onConfirm(confirmedSale);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#0F172A]">Manual Sale</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Customer Handle *</label>
              <input
                type="text"
                value={formData.customerHandle}
                onChange={e => setFormData({ ...formData, customerHandle: e.target.value })}
                className={`w-full h-14 bg-white border ${errors.handle ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 text-[#0F172A] outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 font-bold`}
                placeholder="@handle"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source Platform</label>
              <select
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value as SalesSource })}
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 text-[#0F172A] outline-none focus:border-[#2DD4BF]"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Quick Select</label>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map(p => (
                <button
                  key={p.id} type="button"
                  onClick={() => setFormData({ ...formData, productName: p.name, unitPrice: p.price })}
                  className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${formData.productName === p.name ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#0F172A]' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-[#2DD4BF]/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-[#2DD4BF]" />
                    <span className="text-xs font-bold">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono">${p.price}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type product name..."
              value={formData.productName}
              onChange={e => setFormData({ ...formData, productName: e.target.value })}
              className={`w-full h-14 bg-white border ${errors.product ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 text-[#0F172A] font-bold outline-none focus:border-[#2DD4BF]`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Quantity</label>
              <input
                type="number" min="1"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className={`w-full h-14 bg-white border ${errors.qty ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 text-[#0F172A] font-bold outline-none focus:border-[#2DD4BF]`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Unit Price</label>
              <input
                type="number" min="0"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className={`w-full h-14 bg-white border ${errors.price ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 text-emerald-600 font-black outline-none focus:border-[#2DD4BF]`}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'Cash/Transfer' })}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'Cash/Transfer' ? 'bg-[#0F172A] border-[#0F172A] text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Banknote size={16} />
                <span className="text-[10px] font-black uppercase">External Account</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'Bookly Wallet' })}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'Bookly Wallet' ? 'bg-[#2DD4BF] border-[#2DD4BF] text-[#0F172A]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Wallet size={16} />
                <span className="text-[10px] font-black uppercase text-left">Bookly Account</span>
              </button>
            </div>
          </div>

          <button type="submit" className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl mt-4 shadow-xl active:scale-95 transition-all outline-none focus:scale-105">Log Entry</button>
        </form>
      </div>
    </div>
  );
};

export default ManualEntryModal;
